<?php
function os5_enabled(): bool {
    global $config;
    return ($config['os5_enabled'] ?? false) === true && !!one("SELECT 1 FROM sqlite_master WHERE type='table' AND name='os5_deals'");
}
function os5_atomic(callable $block): mixed {
    global $db;
    $db->exec('BEGIN IMMEDIATE');
    try {
        $result=$block();
        $db->exec('COMMIT');
        return $result;
    } catch (Throwable $error) {
        $db->exec('ROLLBACK');
        throw $error;
    }
}
function os5_audit(string $entity,string $id,string $action,array $detail=[]): void {
    global $user;
    query('INSERT INTO os5_audit(actor_id,entity,entity_id,action,detail,created) VALUES(?,?,?,?,?,?)',
        [$user['id'],$entity,$id,$action,json_encode((object)$detail,JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),stamp()]);
}
function os5_get(string $table,string $id): array {
    $row=one("SELECT * FROM $table WHERE id=?",[$id]);
    if (!$row) bad('Запись не найдена',404);
    return $row;
}
function os5_string(mixed $value,string $field,int $max=200): string {
    if (!is_string($value)||!trim($value)||mb_strlen(trim($value))>$max) bad('Проверьте поле «'.$field.'»');
    return trim($value);
}
function os5_choice(mixed $value,array $options): string {
    if (!in_array($value,$options,true)) bad('Проверьте выбранное значение');
    return $value;
}
function os5_amount(mixed $value,int $max=10000000000): int {
    if (!is_int($value)||$value<1||$value>$max) bad('Сумму укажите целым числом в копейках');
    return $value;
}
function os5_date(mixed $value): string {
    if (!is_string($value)||!preg_match('/^(\d{4})-(\d{2})-(\d{2})$/D',$value,$m)||!checkdate((int)$m[2],(int)$m[3],(int)$m[1])) bad('Укажите действительную дату');
    return $value;
}
function os5_pdf(mixed $value): array {
    if (!is_string($value)||strlen($value)>699052) bad('Укажите PDF не больше 512 КБ');
    $bytes=base64_decode($value,true);
    if (!$bytes||strlen($bytes)>524288||base64_encode($bytes)!==$value||!str_starts_with($bytes,'%PDF-')||!str_ends_with(rtrim($bytes),'%%EOF')) bad('Некорректный PDF');
    return [$value,hash('sha256',$bytes)];
}
function os5_download(string $encoded,string $filename): never {
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="'.$filename.'"');
    header('Cache-Control: private, no-store');
    header('X-Content-Type-Options: nosniff');
    echo base64_decode($encoded,true);
    exit;
}
function os5_prices(): array {
    $data=json_decode(base64_decode(OS5_PRICEBOOK,true),true,512,JSON_THROW_ON_ERROR);
    $content=one("SELECT data FROM content WHERE id='public'");
    $overrides=json_decode($content['data']??'{}',true)['prices']??[];
    $prices=[];
    foreach ($data as $item) {
        $value=$overrides[$item['code']]??null;
        if (is_string($value)&&preg_match('/^\d{1,8}(?:\.\d{1,2})?$/D',$value)&&(float)$value>0) $item['minor']=(int)round((float)$value*100);
        $prices[$item['code']]=$item;
    }
    return $prices;
}
function os5_project(string $id): array {
    global $user;
    $data=one('SELECT p.id,p.title,p.client_id,p.created,c.name AS client_name FROM os5_projects p
      JOIN os5_clients c ON c.id=p.client_id WHERE p.id=? AND (CAST(? AS INTEGER)=1 OR (CAST(? AS INTEGER)=1 AND p.owner_id=?) OR EXISTS
      (SELECT 1 FROM os5_memberships m WHERE m.project_id=p.id AND m.user_id=?))',
      [$id,(int)($user['role']==='admin'),(int)($user['role']==='manager'),$user['id'],$user['id']]);
    if (!$data) bad('Запись не найдена',404);
    return $data;
}
function os5_dispatch(string $path,string $method,array $body): never {
    global $user;
    if ($path==='/api/os5/status'&&$method==='GET') reply(['enabled'=>os5_enabled()]);
    if (!os5_enabled()) bad('CRM 5.0 ещё не включена',503);
    signedin();
    [,,, $section,$id,$action,$sub]=array_pad(explode('/',$path),7,null);
    $owner=$user['role']==='admin';
    $manager=$user['role']==='manager';
    if ($section==='maintenance') {
        $today=(new DateTimeImmutable('now',new DateTimeZone('Europe/Moscow')))->format('Y-m-d');
        $period=substr($today,0,7).'-01';
        if (!$id&&$method==='GET') reply(['items'=>many('
          SELECT m.*,p.title AS project_title,c.name AS client_name,
            (SELECT COALESCE(SUM(w.minutes),0) FROM os5_maintenance_work w WHERE w.plan_id=m.id AND w.worked_on>=? AND w.worked_on<=?) AS used_minutes
          FROM os5_maintenance_plans m JOIN os5_projects p ON p.id=m.project_id
          JOIN os5_clients c ON c.id=p.client_id WHERE CAST(? AS INTEGER)=1 OR (CAST(? AS INTEGER)=1 AND p.owner_id=?) OR
            (CAST(? AS INTEGER)=0 AND EXISTS(SELECT 1 FROM os5_memberships a WHERE a.project_id=p.id AND a.user_id=?))
          ORDER BY m.active DESC,m.created DESC',
          [$period,$today,(int)$owner,(int)$manager,$user['id'],(int)$manager,$user['id']])]);
        if (!$owner&&!$manager) bad('Требуются права сотрудника',403);
        $minutes=static function(mixed $value,int $max): int {
            if (!is_int($value)||$value<1||$value>$max) bad('Укажите допустимое целое число минут');
            return $value;
        };
        if (!$id&&$method==='POST') {
            if (!$owner) bad('Требуются права владельца',403);
            $project=os5_project(os5_string($body['projectId']??null,'Проект'));
            $title=os5_string($body['title']??null,'Название услуги');
            $limit=$minutes($body['monthlyMinutes']??null,44640);
            $key=uid();
            os5_atomic(function()use($key,$project,$title,$limit){
                query('INSERT INTO os5_maintenance_plans(id,project_id,title,monthly_minutes,created) VALUES (?,?,?,?,?)',
                    [$key,$project['id'],$title,$limit,stamp()]);
                os5_audit('maintenance',$key,'created',['projectId'=>$project['id']]);
            });
            reply(['id'=>$key],201);
        }
        if ($id) {
            $plan=os5_get('os5_maintenance_plans',$id);
            if ($manager&&!one('SELECT id FROM os5_projects WHERE id=? AND owner_id=?',[$plan['project_id'],$user['id']])) bad('Запись не найдена',404);
            if (!$action&&$method==='GET') reply(['work'=>many('SELECT w.*,u.name AS actor_name
              FROM os5_maintenance_work w LEFT JOIN users u ON u.id=w.actor_id WHERE w.plan_id=?
              ORDER BY w.worked_on DESC,w.created DESC',[$id])]);
            if (!$action&&$method==='PUT') {
                if (!$owner) bad('Требуются права владельца',403);
                $active=$body['active']??null;
                if (!is_bool($active)) bad('Укажите состояние обслуживания');
                os5_atomic(function()use($id,$active){
                    query('UPDATE os5_maintenance_plans SET active=? WHERE id=?',[(int)$active,$id]);
                    os5_audit('maintenance',$id,$active?'resumed':'paused');
                });
                reply(['ok'=>true]);
            }
            if ($action==='work'&&$method==='POST') {
                $workedOn=os5_date($body['workedOn']??null);
                if ($workedOn>$today) bad('Дата работ не может быть в будущем');
                $key=uid();
                query('INSERT INTO os5_maintenance_work(id,plan_id,actor_id,worked_on,minutes,note,created)
                  SELECT ?,id,?,?,?,?,? FROM os5_maintenance_plans WHERE id=? AND active=1
                  AND (CAST(? AS INTEGER)=1 OR EXISTS(SELECT 1 FROM os5_projects p WHERE p.id=project_id AND p.owner_id=?))',
                  [$key,$user['id'],$workedOn,$minutes($body['minutes']??null,1440),os5_string($body['note']??null,'Выполненные работы',2000),stamp(),$id,(int)$owner,$user['id']]);
                if (!one('SELECT id FROM os5_maintenance_work WHERE id=?',[$key])) bad('Обслуживание приостановлено или доступ изменился',409);
                reply(['id'=>$key],201);
            }
        }
        bad('Запись не найдена',404);
    }
    if (in_array($section,['profile','alert-settings'],true)&&!$id) {
        $key='os5:'.$section.':'.$user['id'];
        $previous=json_decode(one('SELECT data FROM content WHERE id=?',[$key])['data']??'{}',true,512,JSON_THROW_ON_ERROR);
        if ($method==='GET') reply(['settings'=>(object)$previous]);
        if ($method==='PUT'&&$section==='profile') {
            $name=os5_string($body['name']??null,'Имя',80);
            $settings=['phone'=>txt($body['phone']??'',60),'tz'=>os5_choice($body['tz']??null,['Europe/Moscow','Europe/Kaliningrad','Europe/Stockholm'])];
            os5_atomic(function()use($name,$key,$settings,$user){
                query('UPDATE users SET name=? WHERE id=?',[$name,$user['id']]);
                query('INSERT INTO content(id,data) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data',
                    [$key,json_encode($settings,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR)]);
            });
            reply(['settings'=>$settings]);
        }
        if ($method==='PUT') {
            $setting=os5_choice($body['key']??null,['inapp_leads','inapp_tasks','inapp_payments','inapp_renewals','email_leads','email_project','email_renewals','email_services','email_news']);
            $enabled=$body['enabled']??null;
            if (!is_bool($enabled)) bad('Укажите состояние уведомления');
            $settings=[...$previous,$setting=>$enabled];
            query('INSERT INTO content(id,data) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET data=json_set(content.data,?,json(?))',
                [$key,json_encode($settings,JSON_THROW_ON_ERROR),'$.'.$setting,$enabled?'true':'false']);
            reply(['settings'=>$settings]);
        }
    }
    if ($section==='preferences'&&!$id) {
        if ($method==='GET') reply(['preferences'=>one('SELECT theme,accent,layout,density FROM os5_preferences WHERE user_id=?',[$user['id']])?:null]);
        if ($method==='PUT') {
            $validated=[];
            foreach (['theme'=>['light','dark'],'accent'=>['blue','mint','violet','graphite'],'layout'=>['left','top','right','bottom'],'density'=>['comfortable','compact']] as $key=>$options)
                $validated[$key]=os5_choice($body[$key]??null,$options);
            query('INSERT INTO os5_preferences VALUES (?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET theme=excluded.theme,accent=excluded.accent,layout=excluded.layout,density=excluded.density',
                [$user['id'],...array_values($validated)]);
            reply(['preferences'=>$validated]);
        }
    }
    if ($section==='projects') {
        if (!$id&&$method==='GET') reply(['projects'=>many('SELECT p.id,p.title,p.created,c.name AS client_name,
            (SELECT COUNT(*) FROM os5_milestones m WHERE m.project_id=p.id AND m.approved_at IS NOT NULL) AS completed_count
            FROM os5_projects p JOIN os5_clients c ON c.id=p.client_id
            WHERE CAST(? AS INTEGER)=1 OR (CAST(? AS INTEGER)=1 AND p.owner_id=?) OR EXISTS(SELECT 1 FROM os5_memberships m WHERE m.project_id=p.id AND m.user_id=?) ORDER BY p.created DESC',[(int)$owner,(int)$manager,$user['id'],$user['id']])]);
        if ($id) {
            $project=os5_project($id);
            if ($method==='GET'&&!$action) reply(['project'=>$project,
                'milestones'=>many('SELECT position,title,ready_at,approved_at FROM os5_milestones WHERE project_id=? ORDER BY position',[$id]),
                'infrastructure'=>many('SELECT id,kind,title,provider,renewed_until,payer FROM os5_infrastructure WHERE project_id=? ORDER BY renewed_until',[$id]),
                'support'=>many('SELECT id,kind,subject,body,created,resolved_at FROM os5_support WHERE project_id=? ORDER BY created DESC',[$id]),
                'documents'=>$manager?[]:many('SELECT i.id,i.number,i.issued_at FROM os5_invoices i JOIN os5_projects p ON p.invoice_id=i.id WHERE p.id=? AND i.revoked_at IS NULL',[$id]),
            ]);
            if ($method==='POST'&&$action==='support') {
                $key=uid();$kind=os5_choice($body['kind']??null,['question','defect','change']);
                $subject=os5_string($body['subject']??null,'Тема');$message=os5_string($body['body']??null,'Описание',6000);
                os5_atomic(function()use($key,$kind,$subject,$message,$id,$user){
                    query('INSERT INTO os5_support(id,project_id,author_id,kind,subject,body,created) VALUES (?,?,?,?,?,?,?)',[$key,$id,$user['id'],$kind,$subject,$message,stamp()]);
                    os5_audit('project',$id,'support-created',['ticketId'=>$key,'kind'=>$kind]);
                });
                reply(['id'=>$key],201);
            }
            if ($action==='milestones'&&preg_match('/^[1-6]$/D',$sub??'')&&in_array($method,['POST','PUT'],true)) {
                if ($method==='PUT') admin(); else if ($owner||$manager) bad('Согласование доступно представителю заказчика',403);
                $position=(int)$sub;
                os5_atomic(function()use($id,$position,$method){
                    if ($method==='PUT') {
                        $changed=query('UPDATE os5_milestones SET ready_at=? WHERE project_id=? AND position=? AND ready_at IS NULL',[stamp(),$id,$position])->rowCount();
                    } else {
                        $changed=query('UPDATE os5_milestones SET approved_at=? WHERE project_id=? AND position=? AND ready_at IS NOT NULL AND approved_at IS NULL
                            AND NOT EXISTS(SELECT 1 FROM os5_milestones WHERE project_id=? AND position<? AND approved_at IS NULL)',[stamp(),$id,$position,$id,$position])->rowCount();
                        if (!$changed&&!one('SELECT 1 FROM os5_milestones WHERE project_id=? AND position=? AND approved_at IS NOT NULL',[$id,$position]))
                            bad('Этап ещё не передан на согласование или не завершены предыдущие этапы',409);
                    }
                    if ($changed) os5_audit('project',$id,$method==='PUT'?'milestone-ready':'milestone-acknowledgement',['position'=>$position]);
                });
                reply(['ok'=>true]);
            }
            if ($action==='memberships'&&in_array($method,['POST','DELETE'],true)) {
                admin();
                if ($method==='POST') {
                    $target=os5_string($body['userId']??null,'ID пользователя');
                    $basis=os5_string($body['basis']??null,'Основание подтверждения',1200);
                    if (!one("SELECT 1 FROM users WHERE id=? AND role='client'",[$target])) bad('Запись не найдена',404);
                    os5_atomic(function()use($id,$target,$basis,$user){
                        if (query('INSERT INTO os5_memberships VALUES(?,?,?,?,?) ON CONFLICT(project_id,user_id) DO NOTHING',[$id,$target,$user['id'],$basis,stamp()])->rowCount())
                            os5_audit('project',$id,'membership-granted',['userId'=>$target,'basis'=>$basis]);
                    });
                } elseif ($sub) os5_atomic(function()use($id,$sub){
                    if(query('DELETE FROM os5_memberships WHERE project_id=? AND user_id=?',[$id,$sub])->rowCount())os5_audit('project',$id,'membership-revoked',['userId'=>$sub]);
                });
                else bad('Укажите пользователя');
                reply(['ok'=>true]);
            }
            if ($method==='POST'&&$action==='infrastructure') {
                admin();$key=uid();$kind=os5_choice($body['kind']??null,['domain','hosting']);$payer=os5_choice($body['payer']??null,['client','agency']);
                $title=os5_string($body['title']??null,'Название');$provider=os5_string($body['provider']??null,'Поставщик');$until=os5_date($body['renewedUntil']??null);
                os5_atomic(function()use($key,$id,$kind,$title,$provider,$until,$payer){
                    query('INSERT INTO os5_infrastructure VALUES(?,?,?,?,?,?,?,?)',[$key,$id,$kind,$title,$provider,$until,$payer,stamp()]);
                    os5_audit('project',$id,'infrastructure-added',['id'=>$key]);
                });
                reply(['id'=>$key],201);
            }
        }
    }
    if ($section==='support'&&$id&&$action==='messages') {
        $ticket=os5_get('os5_support',$id);
        os5_project($ticket['project_id']);
        if ($method==='GET') reply(['messages'=>many('SELECT m.id,u.name AS author,m.body,m.created FROM os5_support_messages m
            JOIN users u ON u.id=m.sender_id WHERE m.ticket_id=? ORDER BY m.created,m.id',[$id])]);
        if ($method==='POST') {
            $key=uid();$message=os5_string($body['body']??null,'Сообщение',6000);
            os5_atomic(function()use($key,$id,$message,$user){
                query('INSERT INTO os5_support_messages VALUES(?,?,?,?,?)',[$key,$id,$user['id'],$message,stamp()]);
                os5_audit('support',$id,'message-added',['id'=>$key]);
            });
            reply(['id'=>$key],201);
        }
    }
    if ($section==='invoices'&&$id&&$action==='pdf'&&$method==='GET') {
        if (!$owner&&!one('SELECT 1 FROM os5_projects p JOIN os5_memberships m ON m.project_id=p.id WHERE p.invoice_id=? AND m.user_id=?',[$id,$user['id']])) bad('Запись не найдена',404);
        $row=one('SELECT number,pdf FROM os5_invoices WHERE id=? AND issued_at IS NOT NULL AND revoked_at IS NULL',[$id]);
        if (!$row) bad('Запись не найдена',404);
        os5_download($row['pdf'],$row['number'].'.pdf');
    }
    if (($owner||$manager)&&$method==='GET'&&!$id&&$section==='staff')
        reply(['items'=>many("SELECT id,name FROM users WHERE role IN ('admin','manager') ORDER BY name,id")]);
    if (($owner||$manager)&&$method==='GET'&&!$id&&$section==='requests') {
        reply(['items'=>many("SELECT l.id,l.user_id,l.name,l.contact,l.service,l.description,l.status,l.created,
          d.id AS deal_id,p.name AS partner_name,w.stage,w.responsible_id,u.name AS responsible_name,COALESCE(w.version,0) AS version,
          EXISTS(SELECT 1 FROM content c WHERE c.id='consent:'||l.id) AS consent_recorded
          FROM leads l LEFT JOIN os5_lead_workflow w ON w.lead_id=l.id LEFT JOIN users u ON u.id=w.responsible_id
          LEFT JOIN os5_deals d ON d.request_id=l.id LEFT JOIN os5_referrals r ON r.request_id=l.id
          LEFT JOIN os5_partners p ON p.id=r.partner_id WHERE CAST(? AS INTEGER)=1 OR w.responsible_id=? ORDER BY l.created DESC",[(int)$owner,$user['id']])]);
    }
    if (($owner||$manager)&&$method==='POST'&&$section==='requests'&&$id&&in_array($action,['assign','stage'],true)) {
        os5_atomic(function()use($id,$owner,$user,$action,$body){
            os5_get('leads',$id);
            $state=one('SELECT * FROM os5_lead_workflow WHERE lead_id=?',[$id]);
            $responsible=$state['responsible_id']??null;
            if (!$owner&&$responsible!==$user['id']) bad('Запись не найдена',404);
            $assigning=$action==='assign';
            if ($assigning&&$responsible!==$user['id']&&!($owner&&!$responsible))
                bad('Передать лид может только его ответственный',403);
            $oldStage=$state['stage']??'new';
            $stage=$assigning?$oldStage:os5_choice($body['stageId']??null,['new','contact','qualified','closed']);
            $target=$assigning?os5_string($body['userId']??null,'Ответственный'):$responsible;
            if ($assigning&&!one("SELECT 1 FROM users WHERE id=? AND role IN ('admin','manager')",[$target]))
                bad('Выберите сотрудника');
            if (!$assigning&&one('SELECT 1 FROM os5_deals WHERE request_id=?',[$id])) bad('Лид уже переведён в сделку',409);
            $version=(int)($state['version']??0);
            if (($body['version']??null)!==$version) bad('Карточка изменилась. Обновите воронку',409);
            query("INSERT INTO os5_lead_workflow(lead_id,responsible_id,stage,version) VALUES(?,?,?,1)
                ON CONFLICT(lead_id) DO UPDATE SET responsible_id=excluded.responsible_id,stage=excluded.stage,version=os5_lead_workflow.version+1",[$id,$target,$stage]);
            os5_audit('request',$id,$assigning?'assigned':'stage',$assigning?['from'=>$responsible,'to'=>$target]:['from'=>$oldStage,'to'=>$stage]);
        });
        reply(['ok'=>true]);
    }
    if (($owner||$manager)&&$method==='POST'&&$section==='support'&&$id&&$action==='resolve') {
        $resolved=$body['resolved']??null;
        if (!is_bool($resolved)) bad('Укажите статус обращения');
        os5_atomic(function()use($id,$resolved){
            $ticket=os5_get('os5_support',$id);
            os5_project($ticket['project_id']);
            query('UPDATE os5_support SET resolved_at=? WHERE id=?',[$resolved?stamp():null,$id]);
            os5_audit('support',$id,$resolved?'resolved':'reopened');
        });
        reply(['ok'=>true]);
    }
    if ($manager&&$method==='GET'&&!$id) {
        if ($section==='stages') reply(['items'=>many('SELECT * FROM os5_stages ORDER BY position,id')]);
        if ($section==='deals') reply(['items'=>many('SELECT d.id,d.title,d.stage_id,d.version,d.owner_id,d.request_id,d.created,c.name AS client_name,p.id AS project_id
             FROM os5_deals d JOIN os5_clients c ON c.id=d.client_id LEFT JOIN os5_projects p ON p.deal_id=d.id
             WHERE d.owner_id=? AND d.archived_at IS NULL ORDER BY d.created DESC',[$user['id']])]);
        if ($section==='support') reply(['items'=>many('SELECT s.id,s.project_id,s.kind,s.subject,s.body,s.created,s.resolved_at
            FROM os5_support s JOIN os5_projects p ON p.id=s.project_id WHERE p.owner_id=? ORDER BY s.created DESC',[$user['id']])]);
        if ($section==='infrastructure') reply(['items'=>many('SELECT i.* FROM os5_infrastructure i JOIN os5_projects p ON p.id=i.project_id
            WHERE p.owner_id=? ORDER BY i.renewed_until,i.id',[$user['id']])]);
    }
    if ($manager&&$method==='POST'&&$section==='deals'&&$id&&$action==='stage') {
        $target=os5_get('os5_stages',os5_string($body['stageId']??null,'Этап'));
        os5_atomic(function()use($id,$target,$body,$user){
            $deal=os5_get('os5_deals',$id);
            if ($deal['owner_id']!==$user['id']||$deal['archived_at']) bad('Запись не найдена',404);
            if ($target['id']==='won'||$deal['stage_id']==='won') bad('Успех фиксируется конвертацией в проект',409);
            if ((int)$deal['version']!==($body['version']??null)) bad('Сделка уже изменилась',409);
            query('UPDATE os5_deals SET stage_id=?,version=version+1 WHERE id=?',[$target['id'],$id]);
            os5_audit('deal',$id,'stage',['from'=>$deal['stage_id'],'to'=>$target['id']]);
        });
        reply(['ok'=>true]);
    }
    if ($manager&&$method==='POST'&&$section==='deals'&&$id&&$action==='assign') os5_owner_action($method,$section,$id,$action,$body);
    admin();
    if ($section==='requests'&&!$action&&(($method==='POST'&&!$id)||($method==='PUT'&&$id))) {
        $args=[os5_string($body['name']??null,'Имя',80),os5_string($body['contact']??null,'Контакт',200),
            os5_string($body['service']??null,'Услуга',100),os5_string($body['description']??null,'Описание',5000)];
        if ($id) {
            os5_get('leads',$id);
            os5_atomic(function()use($args,$id){
                query('UPDATE leads SET name=?,contact=?,service=?,description=? WHERE id=?',[...$args,$id]);
                os5_audit('request',$id,'updated');
            });
            reply(['ok'=>true]);
        }
        if (($body['consent']??false)!==true) bad('Подтвердите согласие клиента на обработку данных');
        $key=uid();$created=stamp();
        $consent=['recordId'=>$key,'purpose'=>'inquiry','version'=>'2026-11-16.1','accepted'=>true,'created'=>$created,'source'=>'staff-recorded','actor'=>$user['id']];
        os5_atomic(function()use($key,$created,$args,$consent){
            query('INSERT INTO leads(id,name,contact,service,description,created) VALUES(?,?,?,?,?,?)',[$key,...$args,$created]);
            query('INSERT INTO content(id,data) VALUES(?,?)',['consent:'.$key,json_encode($consent,JSON_THROW_ON_ERROR)]);
            os5_audit('request',$key,'created');
        });
        reply(['id'=>$key],201);
    }
    if ($method==='GET'&&!$id) {
        $lists=[
            'clients'=>'SELECT * FROM os5_clients WHERE archived_at IS NULL ORDER BY created DESC',
            'deals'=>'SELECT d.*,c.name AS client_name,p.id AS project_id FROM os5_deals d JOIN os5_clients c ON c.id=d.client_id LEFT JOIN os5_projects p ON p.deal_id=d.id WHERE d.archived_at IS NULL ORDER BY d.created DESC',
            'stages'=>'SELECT * FROM os5_stages ORDER BY position,id',
            'briefs'=>'SELECT b.*,d.title AS deal_title FROM os5_briefs b JOIN os5_deals d ON d.id=b.deal_id ORDER BY b.created DESC',
            'quotes'=>'SELECT q.*,d.title AS deal_title FROM os5_quotes q JOIN os5_deals d ON d.id=q.deal_id ORDER BY q.created DESC',
            'invoices'=>'SELECT i.id,i.deal_id,i.number,i.total,i.start_min,i.created,i.issued_at,i.pdf_hash,i.revoked_at,d.title AS deal_title,
                (SELECT COUNT(*) FROM os5_signatures s WHERE s.invoice_id=i.id AND s.reviewed_at IS NOT NULL) AS reviewed,
                COALESCE((SELECT SUM(p.amount) FROM os5_payments p WHERE p.invoice_id=i.id AND p.verified_at IS NOT NULL),0) AS paid
                FROM os5_invoices i JOIN os5_deals d ON d.id=i.deal_id ORDER BY i.created DESC',
            'payments'=>'SELECT p.*,i.number FROM os5_payments p JOIN os5_invoices i ON i.id=p.invoice_id ORDER BY p.created DESC',
            'tasks'=>'SELECT * FROM os5_tasks ORDER BY done_at ASC,due_on ASC,created DESC',
            'support'=>'SELECT * FROM os5_support ORDER BY created DESC',
            'infrastructure'=>'SELECT * FROM os5_infrastructure ORDER BY renewed_until',
            'users'=>'SELECT id,name,email,role,created FROM users ORDER BY created DESC',
            'archive'=>"SELECT id,name AS title,archived_at,'client' AS kind FROM os5_clients WHERE archived_at IS NOT NULL
                UNION ALL SELECT id,title,archived_at,'deal' FROM os5_deals WHERE archived_at IS NOT NULL ORDER BY archived_at DESC",
            'audit'=>'SELECT seq,actor_id,entity,entity_id,action,detail,created FROM os5_audit ORDER BY seq DESC LIMIT 100',
            'partners'=>'SELECT p.*,(SELECT COUNT(*) FROM os5_referrals r WHERE r.partner_id=p.id) AS referrals FROM os5_partners p ORDER BY p.created DESC',
            'mail'=>'SELECT * FROM os5_mail_drafts ORDER BY updated_at DESC',
        ];
        if (isset($lists[$section])) reply(['items'=>many($lists[$section])]);
        if ($section==='org') reply(['organization'=>json_decode(one('SELECT data FROM os5_org WHERE id=1')['data']??'null',true)]);
        if ($section==='prices') reply(['items'=>array_values(os5_prices())]);
        if ($section==='notifications') reply(['items'=>many('SELECT l.id,l.name,l.service,l.created,r.created AS read_at FROM leads l LEFT JOIN os5_request_reads r
            ON r.request_id=l.id AND r.user_id=? ORDER BY l.created DESC LIMIT 200',[$user['id']])]);
        if (in_array($section,['overview','analytics'],true)) reply(['counts'=>one("SELECT
            (SELECT COUNT(*) FROM leads) AS requests,(SELECT COUNT(*) FROM os5_clients WHERE archived_at IS NULL) AS clients,
            (SELECT COUNT(*) FROM os5_deals WHERE archived_at IS NULL AND stage_id NOT IN ('won','lost')) AS deals,
            (SELECT COUNT(*) FROM os5_projects) AS projects,(SELECT COUNT(*) FROM os5_tasks WHERE done_at IS NULL) AS open_tasks,
            (SELECT COALESCE(SUM(total),0) FROM os5_invoices WHERE issued_at IS NOT NULL AND revoked_at IS NULL) AS billed,
            (SELECT COALESCE(SUM(amount),0) FROM os5_payments WHERE verified_at IS NOT NULL) AS received"),'attribution'=>'unconfigured']);
    }
    os5_owner_action($method,$section,$id,$action,$body);
}
function os5_owner_action(string $method,?string $section,?string $id,?string $action,array $body): never {
    global $user;
    if ($method==='GET'&&$id&&!$action) {
        if ($section==='clients') reply(['client'=>os5_get('os5_clients',$id),
            'deals'=>many('SELECT id,title,stage_id FROM os5_deals WHERE client_id=? ORDER BY created DESC',[$id]),
            'projects'=>many('SELECT id,title FROM os5_projects WHERE client_id=? ORDER BY created DESC',[$id])]);
        if ($section==='deals') {
            $deal=os5_get('os5_deals',$id);
            reply(['deal'=>$deal,'client'=>os5_get('os5_clients',$deal['client_id']),
                'request'=>$deal['request_id']?os5_get('leads',$deal['request_id']):null,
                'project'=>one('SELECT id,title FROM os5_projects WHERE deal_id=?',[$id])?:null,
                'invoices'=>many('SELECT id,number,issued_at,revoked_at FROM os5_invoices WHERE deal_id=? ORDER BY created DESC',[$id]),
                'activity'=>many("SELECT action,created FROM os5_audit WHERE entity='deal' AND entity_id=? ORDER BY seq DESC",[$id])]);
        }
        if ($section==='invoices') {
            $invoice=os5_get('os5_invoices',$id);unset($invoice['pdf']);
            $deal=os5_get('os5_deals',$invoice['deal_id']);
            reply(['invoice'=>$invoice,'quote'=>os5_get('os5_quotes',$invoice['quote_id']),'client'=>os5_get('os5_clients',$deal['client_id']),
             'signatures'=>many('SELECT id,source_hash,pdf_hash,created,reviewed_at,review_basis FROM os5_signatures WHERE invoice_id=?',[$id])]);
        }
    }
    if ($section==='org'&&$method==='PUT'&&!$id) {
        $values=[];
        foreach (['name','taxId','registration','address','signatory','bank','bik','account','correspondent','tax','templateApproval'] as $key)
            $values[$key]=txt($body[$key]??'',400);
        os5_atomic(function()use($values){
            query('INSERT INTO os5_org VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,updated_at=excluded.updated_at',
                [json_encode($values,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR),stamp()]);
            os5_audit('organization','1','updated');
        });
        reply(['ok'=>true]);
    }
    if ($section==='clients'&&!$action&&(($method==='POST'&&!$id)||($method==='PUT'&&$id))) {
        $kind=os5_choice($body['kind']??null,['person','entrepreneur','company']);
        $name=os5_string($body['name']??null,'Имя или наименование');
        $email=strtolower(txt($body['email']??'',200))?:null;
        $raw=txt($body['phone']??'',60);$phone=preg_replace('/\D/','',$raw)?:null;
        if (strlen($phone??'')===11&&preg_match('/^[78]/',$phone)) $phone='7'.substr($phone,1);
        $tax=txt($body['taxId']??'',30)?:null;
        if ($email&&!filter_var($email,FILTER_VALIDATE_EMAIL)) bad('Проверьте email');
        if ($raw&&(strlen($phone??'')<10||strlen($phone??'')>15)) bad('Проверьте телефон');
        if ($kind!=='person'&&!$tax) bad('Для организации или ИП требуется ИНН');
        if ($tax&&!preg_match($kind==='company'?'/^\d{10}$/D':'/^\d{12}$/D',$tax)) bad('Проверьте ИНН');
        if (!$email&&!$phone&&!$tax) bad('Укажите хотя бы один идентификатор контрагента');
        $details=[];
        foreach (['address','signatory','authority','registration','kpp'] as $key) $details[$key]=txt($body[$key]??'',400);
        $result=os5_atomic(function()use($id,$kind,$name,$email,$phone,$tax,$details){
            if ($id) os5_get('os5_clients',$id);
            $match=many('SELECT id FROM os5_clients WHERE (email=? OR phone=? OR tax_id=?) AND id<>?',[$email,$phone,$tax,$id??'']);
            if (count($match)===1) return ['id'=>$match[0]['id'],'existing'=>true];
            if (count($match)>1) bad('Контакты совпали у нескольких карточек. Проверьте контрагентов вручную',409);
            if ($id) {
                query('UPDATE os5_clients SET kind=?,name=?,email=?,phone=?,tax_id=?,details=? WHERE id=?',
                    [$kind,$name,$email,$phone,$tax,json_encode($details,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR),$id]);
                os5_audit('client',$id,'updated');
                return ['id'=>$id,'existing'=>false];
            }
            $key=uid();
            query('INSERT INTO os5_clients(id,kind,name,email,phone,tax_id,details,created) VALUES(?,?,?,?,?,?,?,?)',
                [$key,$kind,$name,$email,$phone,$tax,json_encode($details,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR),stamp()]);
            os5_audit('client',$key,'created');
            return ['id'=>$key,'existing'=>false];
        });
        reply($result,$result['existing']?409:($id?200:201));
    }
    if ($method==='POST'&&(($section==='deals'&&!$id)||($section==='requests'&&$id&&$action==='convert'))) {
        $source=$section==='requests'?os5_get('leads',$id):null;
        $result=os5_atomic(function()use($source,$body,$user){
            $requestId=$source['id']??null;
            $old=$requestId?one('SELECT id FROM os5_deals WHERE request_id=?',[$requestId]):null;
            if ($old) return ['id'=>$old['id'],'existing'=>true];
            $client=os5_get('os5_clients',os5_string($body['clientId']??null,'Клиент'));
            if ($client['archived_at']) bad('Восстановите клиента перед созданием сделки',409);
            $title=os5_string(($body['title']??'')?:($source['service']??null),'Название сделки');
            $key=uid();
            $assigned=$requestId?one('SELECT responsible_id FROM os5_lead_workflow WHERE lead_id=?',[$requestId]):null;
            query("INSERT INTO os5_deals(id,request_id,client_id,owner_id,stage_id,title,created) VALUES(?,?,?,?,'new',?,?)",
                [$key,$requestId,$client['id'],$assigned['responsible_id']??$user['id'],$title,stamp()]);
            os5_audit('deal',$key,'created');
            return ['id'=>$key,'existing'=>false];
        });
        reply($result,$result['existing']?200:201);
    }
    if ($method==='POST'&&$id&&$section==='users'&&$action==='role') {
        $role=os5_choice($body['role']??null,['client','manager']);
        $basis=os5_string($body['basis']??null,'Основание изменения роли',1200);
        os5_atomic(function()use($id,$role,$basis){
            $account=os5_get('users',$id);
            if ($account['role']==='admin') bad('Роль владельца нельзя менять из CRM',403);
            if ($role==='manager'&&one('SELECT 1 FROM os5_memberships WHERE user_id=?',[$id])) bad('Для менеджера используйте отдельную учётную запись',409);
            if ($role==='client'&&(one('SELECT 1 FROM os5_lead_workflow WHERE responsible_id=?',[$id])||one('SELECT 1 FROM os5_deals WHERE owner_id=? AND archived_at IS NULL',[$id])||one('SELECT 1 FROM os5_projects WHERE owner_id=?',[$id])))
                bad('Сначала переназначьте записи менеджера',409);
            query('UPDATE users SET role=? WHERE id=?',[$role,$id]);
            query('DELETE FROM sessions WHERE user_id=?',[$id]);
            os5_audit('user',$id,'role-changed',['role'=>$role,'basis'=>$basis]);
        });
        reply(['ok'=>true]);
    }
    if ($method==='POST'&&$id&&$section==='deals'&&$action==='assign') {
        $target=os5_string($body['userId']??null,'Ответственный');
        os5_atomic(function()use($id,$target,$body,$user){
            $deal=os5_get('os5_deals',$id);
            if ($user['role']!=='admin'&&$deal['owner_id']!==$user['id']) bad('Запись не найдена',404);
            if (!one("SELECT 1 FROM users WHERE id=? AND role IN ('admin','manager')",[$target])) bad('Запись не найдена',404);
            if ($deal['stage_id']==='won'||$deal['archived_at']) bad('Передача завершённой сделки не поддерживается',409);
            if (isset($body['version'])&&$body['version']!==(int)$deal['version']) bad('Сделка уже изменилась',409);
            query('UPDATE os5_deals SET owner_id=?,version=version+1 WHERE id=?',[$target,$id]);
            os5_audit('deal',$id,'assigned',['ownerId'=>$target]);
        });
        reply(['ok'=>true]);
    }
    if ($section==='stages'&&$method==='POST'&&!$id) {
        $title=os5_string($body['title']??null,'Название этапа',70);$key=uid();
        os5_atomic(function()use($key,$title){
            query('INSERT INTO os5_stages SELECT ?,?,COALESCE(MAX(position),0)+10,0 FROM os5_stages',[$key,$title]);
            os5_audit('stage',$key,'created');
        });
        reply(['id'=>$key],201);
    }
    if ($section==='stages'&&$method==='DELETE'&&$id) {
        os5_atomic(function()use($id){
            $row=os5_get('os5_stages',$id);
            if ($row['terminal']||$id==='new'||one('SELECT 1 FROM os5_deals WHERE stage_id=?',[$id])) bad('Этап защищён или содержит сделки',409);
            query('DELETE FROM os5_stages WHERE id=?',[$id]);os5_audit('stage',$id,'deleted');
        });
        reply(['ok'=>true]);
    }
    if ($section==='stages'&&$method==='PUT'&&$id) {
        os5_get('os5_stages',$id);
        $title=os5_string($body['title']??null,'Название этапа',70);
        os5_atomic(function()use($title,$id){
            query('UPDATE os5_stages SET title=? WHERE id=?',[$title,$id]);
            os5_audit('stage',$id,'renamed');
        });
        reply(['ok'=>true]);
    }
    if ($section==='deals'&&$method==='PUT'&&$id&&!$action) {
        $row=os5_get('os5_deals',$id);$title=os5_string($body['title']??null,'Название сделки');
        if ($row['archived_at']||$row['version']!==($body['version']??null)) bad('Сделка уже изменилась или архивирована',409);
        os5_atomic(function()use($title,$id,$row){
            if (!query('UPDATE os5_deals SET title=?,version=version+1 WHERE id=? AND version=?',[$title,$id,$row['version']])->rowCount())
                bad('Сделка уже изменилась',409);
            os5_audit('deal',$id,'updated');
        });
        reply(['ok'=>true]);
    }
    if ($section==='deals'&&$method==='POST'&&$id&&$action==='stage') {
        $target=os5_get('os5_stages',os5_string($body['stageId']??null,'Этап'));
        os5_atomic(function()use($id,$target,$body){
            $deal=os5_get('os5_deals',$id);
            if ($target['id']==='won'||$deal['stage_id']==='won'||$deal['archived_at']) bad('Успех фиксируется конвертацией в проект',409);
            if ((int)$deal['version']!==($body['version']??null)) bad('Сделка уже изменилась. Обновите карточку',409);
            query('UPDATE os5_deals SET stage_id=?,version=version+1 WHERE id=? AND version=?',[$target['id'],$id,$deal['version']]);
            os5_audit('deal',$id,'stage',['from'=>$deal['stage_id'],'to'=>$target['id']]);
        });
        reply(['ok'=>true]);
    }
    if ($section==='briefs'&&$method==='POST'&&!$id) {
        $deal=os5_get('os5_deals',os5_string($body['dealId']??null,'Сделка'));
        $scope=os5_string($body['scope']??null,'Объём работ',8000);$key=uid();
        os5_atomic(function()use($deal,$scope,$key,$user){
            query('INSERT INTO os5_briefs(id,deal_id,revision,scope,author_id,created)
                SELECT ?,?,COALESCE(MAX(revision),0)+1,?,?,? FROM os5_briefs WHERE deal_id=?',
                [$key,$deal['id'],$scope,$user['id'],stamp(),$deal['id']]);os5_audit('brief',$key,'created');
        });
        reply(['id'=>$key],201);
    }
    if ($section==='briefs'&&$method==='POST'&&$id&&$action==='approve') {
        os5_get('os5_briefs',$id);$basis=os5_string($body['basis']??null,'Основание согласования',1200);
        os5_atomic(function()use($id,$basis,$user){
            if(query('UPDATE os5_briefs SET approved_at=?,approved_by=? WHERE id=? AND approved_at IS NULL',[stamp(),$user['id'],$id])->rowCount())
                os5_audit('brief',$id,'approved',['basis'=>$basis]);
        });
        reply(['ok'=>true]);
    }
    if ($section==='quotes'&&$method==='POST'&&!$id) {
        $brief=os5_get('os5_briefs',os5_string($body['briefId']??null,'Бриф'));
        if (!$brief['approved_at']) bad('Сначала согласуйте бриф',409);
        $input=$body['lines']??null;
        if (!is_array($input)||!array_is_list($input)||!count($input)||count($input)>30) bad('Добавьте позиции из прайса');
        $prices=os5_prices();$lines=[];$total=0;
        foreach ($input as $line) {
            $code=$line['code']??null;$item=is_string($code)?($prices[$code]??null):null;
            if (!$item||$item['period']!=='once') bad('Выберите разовую позицию из утверждённого прайса');
            if (isset($lines[$code])) bad('Объедините повторяющиеся позиции в одной строке');
            $qty=os5_amount($line['quantity']??null,1000);
            $lines[$code]=['code'=>$code,'name'=>$item['name'],'scope'=>$item['scope'],'quantity'=>$qty,'unitAmount'=>$item['minor']];
            $total+=$qty*$item['minor'];
        }
        os5_amount($total);$key=uid();
        os5_atomic(function()use($brief,$lines,$total,$key){
            query('INSERT INTO os5_quotes SELECT ?,?,?,COALESCE(MAX(revision),0)+1,?,?,? FROM os5_quotes WHERE deal_id=?',
                [$key,$brief['deal_id'],$brief['id'],json_encode(array_values($lines),JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR),$total,stamp(),$brief['deal_id']]);
            os5_audit('quote',$key,'created');
        });
        reply(['id'=>$key,'total'=>$total],201);
    }
    if ($section==='invoices'&&$method==='POST'&&!$id) {
        $quote=os5_get('os5_quotes',os5_string($body['quoteId']??null,'Смета'));$key=uid();
        $min=isset($body['startMinor'])&&$body['startMinor']!==''?os5_amount($body['startMinor'],(int)$quote['total']):(int)$quote['total'];
        $terms=txt($body['terms']??'',2000);
        if ($min<(int)$quote['total']&&mb_strlen($terms)<12) bad('Для частичной оплаты зафиксируйте график платежей');
        $number='IC-'.substr(stamp(),0,4).'-'.$key;
        os5_atomic(function()use($key,$quote,$number,$min,$terms){
            query('INSERT INTO os5_invoices(id,deal_id,quote_id,number,total,start_min,terms,created) VALUES(?,?,?,?,?,?,?,?)',
                [$key,$quote['deal_id'],$quote['id'],$number,$quote['total'],$min,$terms,stamp()]);
            os5_audit('invoice',$key,'draft-created');
        });
        reply(['id'=>$key,'number'=>$number],201);
    }
    if ($section==='invoices'&&$method==='POST'&&$id&&$action==='issue') {
        $invoice=os5_get('os5_invoices',$id);
        if ($invoice['issued_at']||$invoice['revoked_at']) bad('Счёт-договор уже выпускался или отозван',409);
        $org=json_decode(one('SELECT data FROM os5_org WHERE id=1')['data']??'{}',true);
        foreach (['name','address','signatory','bank','tax','templateApproval'] as $key) if(empty($org[$key])) bad('Заполните банк, налоговый статус и реквизиты. Укажите согласование шаблона',409);
        foreach (['bik'=>'/^[0-9]{9}$/D','account'=>'/^[0-9]{20}$/D','correspondent'=>'/^[0-9]{20}$/D','taxId'=>'/^\d{10}(?:\d{2})?$/D','registration'=>'/^\d{13}(?:\d{2})?$/D'] as $key=>$pattern)
            if(!preg_match($pattern,$org[$key]??'')) bad('Проверьте реквизиты организации',409);
        $deal=os5_get('os5_deals',$invoice['deal_id']);$client=os5_get('os5_clients',$deal['client_id']);
        $info=json_decode($client['details'],true);
        if (empty($info['address'])||($client['kind']==='entrepreneur'&&!preg_match('/^\d{15}$/D',$info['registration']??''))||
            ($client['kind']==='company'&&(!preg_match('/^\d{13}$/D',$info['registration']??'')||!preg_match('/^\d{9}$/D',$info['kpp']??'')||empty($info['signatory'])||empty($info['authority']))))
              bad('Заполните реквизиты заказчика по его типу',409);
        if (($body['reviewed']??false)!==true) bad('Подтвердите сверку PDF со сметой, графиком и реквизитами');
        [$pdf,$hash]=os5_pdf($body['pdf']??null);
        $quote=os5_get('os5_quotes',$invoice['quote_id']);$brief=os5_get('os5_briefs',$quote['brief_id']);
        $snapshot=json_encode(['number'=>$invoice['number'],'org'=>$org,'client'=>$client,'quote'=>$quote,'brief'=>$brief,'total'=>$invoice['total'],
            'startMinor'=>$invoice['start_min'],'terms'=>$invoice['terms']],JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
        os5_atomic(function()use($id,$pdf,$hash,$snapshot){
            if (!query('UPDATE os5_invoices SET issued_at=?,snapshot=?,pdf=?,pdf_hash=? WHERE id=? AND issued_at IS NULL AND revoked_at IS NULL',
                [stamp(),$snapshot,$pdf,$hash,$id])->rowCount()) bad('Счёт-договор изменился',409);
            os5_audit('invoice',$id,'issued',['sha256'=>$hash]);
        });
        reply(['ok'=>true,'sha256'=>$hash]);
    }
    if ($section==='invoices'&&$method==='POST'&&$id&&$action==='revoke') {
        $basis=os5_string($body['basis']??null,'Основание отзыва',1600);os5_get('os5_invoices',$id);
        os5_atomic(function()use($id,$basis){
            if(query('UPDATE os5_invoices SET revoked_at=? WHERE id=? AND revoked_at IS NULL',[stamp(),$id])->rowCount()) os5_audit('invoice',$id,'revoked',['basis'=>$basis]);
        });
        reply(['ok'=>true]);
    }
    if ($section==='invoices'&&$method==='POST'&&$id&&$action==='signed') {
        $invoice=os5_get('os5_invoices',$id);
        if (!$invoice['issued_at']||$invoice['revoked_at']) bad('Сначала выпустите счёт-договор',409);
        [$pdf,$hash]=os5_pdf($body['pdf']??null);$key=uid();
        if ($hash===$invoice['pdf_hash']) bad('Загрузите отдельный подписанный экземпляр');
        os5_atomic(function()use($id,$invoice,$key,$pdf,$hash){
            query('INSERT INTO os5_signatures(id,invoice_id,source_hash,pdf,pdf_hash,created) VALUES(?,?,?,?,?,?)',
                [$key,$id,$invoice['pdf_hash'],$pdf,$hash,stamp()]);
            os5_audit('invoice',$id,'signature-evidence-uploaded',['signatureId'=>$key,'sha256'=>$hash]);
        });
        reply(['id'=>$key],201);
    }
    if ($section==='signatures'&&$id) {
        $signature=os5_get('os5_signatures',$id);
        if ($method==='GET'&&$action==='pdf') os5_download($signature['pdf'],'signed-evidence.pdf');
        if ($method==='POST'&&$action==='review') {
            if (($body['bothParties']??false)!==true) bad('Подтвердите проверку подписей обеих сторон');
            $basis=os5_string($body['basis']??null,'Основание проверки',1800);
            os5_atomic(function()use($id,$signature,$basis,$user){
                if(query('UPDATE os5_signatures SET reviewed_at=?,reviewed_by=?,review_basis=? WHERE id=? AND reviewed_at IS NULL',
                    [stamp(),$user['id'],$basis,$id])->rowCount()) os5_audit('invoice',$signature['invoice_id'],'signatures-reviewed',['signatureId'=>$id,'basis'=>$basis]);
            });
            reply(['ok'=>true]);
        }
    }
    if ($section==='payments'&&$method==='POST'&&!$id) {
        $invoice=os5_get('os5_invoices',os5_string($body['invoiceId']??null,'Счёт-договор'));
        if (!$invoice['issued_at']||$invoice['revoked_at']) bad('Можно сверять только действующий счёт-договор',409);
        $reference=strtolower(os5_string($body['reference']??null,'Банковский идентификатор'));
        $proof=os5_string($body['proof']??null,'Документ или запись выписки',1800);
        $value=os5_amount($body['amount']??null);
        $refund=empty($body['refundOf'])?null:os5_string($body['refundOf'],'Платёж для возврата');
        if ($refund&&!one('SELECT 1 FROM os5_payments WHERE id=? AND invoice_id=? AND amount>0 AND verified_at IS NOT NULL',[$refund,$invoice['id']]))
            bad('Для возврата выберите подтверждённое поступление по этому счёту');
        $key=uid();$date=os5_date($body['occurredOn']??null);
        os5_atomic(function()use($key,$invoice,$reference,$proof,$value,$refund,$date){
            query('INSERT INTO os5_payments(id,invoice_id,bank_ref,amount,refund_of,proof,occurred_on,created) VALUES(?,?,?,?,?,?,?,?)',
                [$key,$invoice['id'],$reference,$refund?-$value:$value,$refund,$proof,$date,stamp()]);
            os5_audit('payment',$key,'recorded');
        });
        reply(['id'=>$key],201);
    }
    if ($section==='payments'&&$method==='POST'&&$id&&$action==='verify') {
        $payment=os5_get('os5_payments',$id);
        if ($payment['verified_at']) reply(['ok'=>true,'existing'=>true]);
        $basis=os5_string($body['basis']??null,'Основание сверки',1800);
        os5_atomic(function()use($id,$basis,$user){
            if(query('UPDATE os5_payments SET verified_at=?,verified_by=? WHERE id=? AND verified_at IS NULL',
                [stamp(),$user['id'],$id])->rowCount()) os5_audit('payment',$id,'verified',['basis'=>$basis]);
        });
        reply(['ok'=>true]);
    }
    if ($section==='deals'&&$method==='POST'&&$id&&$action==='project') {
        $result=os5_atomic(function()use($id,$user){
            $old=one('SELECT id FROM os5_projects WHERE deal_id=?',[$id]);
            if ($old) return ['id'=>$old['id'],'existing'=>true];
            $deal=os5_get('os5_deals',$id);
            $invoice=one('SELECT id,pdf_hash,start_min FROM os5_invoices WHERE deal_id=? AND issued_at IS NOT NULL AND revoked_at IS NULL',[$id]);
            if (!$invoice) bad('Выпустите действующий счёт-договор',409);
            if (!one('SELECT 1 FROM os5_signatures WHERE invoice_id=? AND source_hash=? AND reviewed_at IS NOT NULL',[$invoice['id'],$invoice['pdf_hash']]))
                bad('Требуется проверка двусторонней подписи',409);
            $net=one('SELECT COALESCE(SUM(amount),0) AS paid FROM os5_payments WHERE invoice_id=? AND verified_at IS NOT NULL',[$invoice['id']]);
            if ($net['paid']<$invoice['start_min']) bad('Сумма подтверждённых поступлений пока недостаточна',409);
            $key=uid();
            query('INSERT INTO os5_projects VALUES(?,?,?,?,?,?,?,?)',[$key,$id,$deal['client_id'],$invoice['id'],$deal['owner_id'],$user['id'],$deal['title'],stamp()]);
            return ['id'=>$key,'existing'=>false];
        });
        reply($result,$result['existing']?200:201);
    }
    os5_owner_other($method,$section,$id,$action,$body);
}
function os5_owner_other(string $method,?string $section,?string $id,?string $action,array $body): never {
    global $user;
    if ($section==='infrastructure'&&$method==='PUT'&&$id) {
        os5_get('os5_infrastructure',$id);$until=os5_date($body['renewedUntil']??null);
        os5_atomic(function()use($id,$until){
            query('UPDATE os5_infrastructure SET renewed_until=? WHERE id=?',[$until,$id]);
            os5_audit('infrastructure',$id,'renewal-updated',['until'=>$until]);
        });
        reply(['ok'=>true]);
    }
    if ($section==='tasks'&&$method==='POST'&&!$id) {
        $deal=os5_get('os5_deals',os5_string($body['dealId']??null,'Сделка'));
        $title=os5_string($body['title']??null,'Задача');$due=empty($body['dueOn'])?null:os5_date($body['dueOn']);$key=uid();
        os5_atomic(function()use($deal,$key,$title,$due){
            query('INSERT INTO os5_tasks(id,deal_id,title,due_on,created) VALUES(?,?,?,?,?)',[$key,$deal['id'],$title,$due,stamp()]);
            os5_audit('deal',$deal['id'],'task-created',['taskId'=>$key]);
        });
        reply(['id'=>$key],201);
    }
    if ($section==='tasks'&&$method==='POST'&&$id&&$action==='done') {
        os5_get('os5_tasks',$id);
        $done=($body['done']??true)!==false;
        os5_atomic(function()use($id,$done){
            query('UPDATE os5_tasks SET done_at=? WHERE id=?',[$done?stamp():null,$id]);
            os5_audit('task',$id,$done?'done':'reopened');
        });
        reply(['ok'=>true]);
    }
    if ($section==='tasks'&&$method==='PUT'&&$id&&!$action) {
        os5_get('os5_tasks',$id);
        $title=os5_string($body['title']??null,'Задача');
        $due=empty($body['dueOn'])?null:os5_date($body['dueOn']);
        os5_atomic(function()use($title,$due,$id){
            query('UPDATE os5_tasks SET title=?,due_on=? WHERE id=?',[$title,$due,$id]);
            os5_audit('task',$id,'updated');
        });
        reply(['ok'=>true]);
    }
    if (in_array($section,['clients','deals'],true)&&$method==='POST'&&$id&&in_array($action,['archive','restore'],true)) {
        $table=$section==='deals'?'os5_deals':'os5_clients';
        os5_get($table,$id);
        os5_atomic(function()use($section,$table,$id,$action){
            query("UPDATE $table SET archived_at=? WHERE id=?",[$action==='archive'?stamp():null,$id]);
            os5_audit($section,$id,$action);
        });
        reply(['ok'=>true]);
    }
    if ($section==='partners'&&$method==='POST'&&!$id) {
        $name=os5_string($body['name']??null,'Имя партнёра');$code=strtolower(os5_string($body['code']??null,'Код',40));$key=uid();
        if (!preg_match('/^[a-z0-9][a-z0-9-]{2,39}$/D',$code)) bad('Для кода используйте 3–40 латинских букв, цифр или дефисов');
        os5_atomic(function()use($key,$name,$code){
            query('INSERT INTO os5_partners(id,name,code,created) VALUES(?,?,?,?)',[$key,$name,$code,stamp()]);os5_audit('partner',$key,'created');
        });
        reply(['id'=>$key],201);
    }
    if ($section==='partners'&&$method==='POST'&&$id&&$action==='toggle') {
        os5_get('os5_partners',$id);$active=$body['active']??null;
        if (!is_bool($active)) bad('Укажите статус партнёра');
        os5_atomic(function()use($id,$active){
            query('UPDATE os5_partners SET active=? WHERE id=?',[(int)$active,$id]);os5_audit('partner',$id,'status',['active'=>$active]);
        });
        reply(['ok'=>true]);
    }
    if ($section==='notifications'&&$method==='POST'&&$id&&$action==='read') {
        os5_get('leads',$id);
        query('INSERT INTO os5_request_reads VALUES(?,?,?) ON CONFLICT(user_id,request_id) DO NOTHING',[$user['id'],$id,stamp()]);
        reply(['ok'=>true]);
    }
    if ($section==='mail'&&(($method==='POST'&&!$id)||($method==='PUT'&&$id&&!$action))) {
        $recipient=os5_string($body['recipient']??null,'Получатель');$subject=os5_string($body['subject']??null,'Тема');
        $message=os5_string($body['body']??null,'Сообщение',9000);
        if (!filter_var($recipient,FILTER_VALIDATE_EMAIL)) bad('Проверьте email получателя');
        $key=$id?:uid();
        os5_atomic(function()use($id,$key,$recipient,$subject,$message,$user){
            if ($id) {
                os5_get('os5_mail_drafts',$id);
                query('UPDATE os5_mail_drafts SET recipient=?,subject=?,body=?,updated_at=? WHERE id=?',[$recipient,$subject,$message,stamp(),$id]);
            } else query('INSERT INTO os5_mail_drafts(id,author_id,recipient,subject,body,created,updated_at) VALUES(?,?,?,?,?,?,?)',
                [$key,$user['id'],$recipient,$subject,$message,stamp(),stamp()]);
            os5_audit('mail',$key,$id?'draft-updated':'draft-created');
        });
        reply($id?['ok'=>true]:['id'=>$key],$id?200:201);
    }
    bad('Запись не найдена',404);
}
function os5_error(PDOException $error): never {
    $message=$error->getMessage();
    if (str_contains($message,'os5_project_gate')) bad('Условия конвертации изменились. Проверьте подписи, оплату и согласованный объём.',409);
    if (str_contains($message,'os5_refund_limit')) bad('Возврат превышает подтверждённый остаток платежа',409);
    if (str_contains($message,'os5_invoice_revoke_guard')) bad('Счёт связан с подписью, платёжной записью или проектом',409);
    if (str_contains($message,'constraint')||str_contains($message,'os5_')) bad('Запись конфликтует с сохранёнными данными',409);
    reply(['error'=>'Операция CRM недоступна'],500);
}
