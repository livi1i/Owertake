import {leadStages,S,ui,get} from './model.js';

export function mayAssignLead(lead) {
  return lead.ownerId===S.user.id || (!lead.ownerId&&S.user.role==='admin');
}

export function pipelineView(view,type) {
  const {esc,icon,head,btn,tag,table}=view;
  const isLead=type==='requests';
  const isOwner=S.user.role==='admin';
  const stages=isLead?leadStages:S.dealStages.map(stage=>({...stage,locked:stage.id==='won'}));
  const selected=ui.tab||'Канбан';
  const records=S[type].filter(row=>!isLead||ui.leadFilter==='all'||
    (ui.leadFilter==='mine'?row.ownerId===S.user.id:!row.ownerId));
  const labelFor=row=>isLead?(row.service||row.name):row.title;
  const clientFor=row=>isLead?row.name:row.clientName||get('clients',row.clientId)?.name||'';
  const personFor=row=>row.ownerName||get('staff',row.ownerId)?.name||'Без ответственного';
  const detailType=isLead?'request':'deal';
  const canMove=row=>!stages.some(stage=>stage.id===row.stage&&stage.locked);
  const actions=row=>btn('Открыть','detail:'+detailType+':'+row.id,'soft sm')+
    (canMove(row)?btn('Перенести','chooseStage:'+type+':'+row.id,'sm'):'');
  const filters=isLead&&isOwner?'<label class="pipeline-filter">Ответственный <select name="leadFilter" class="select">'+
    [['all','Все лиды'],['mine','Мои лиды'],['unassigned','Без ответственного']].map(([value,label])=>
      '<option value="'+value+'" '+(value===ui.leadFilter?'selected':'')+'>'+label+'</option>').join('')+'</select></label>':'';
  const tools='<div class="pipeline-toolbar"><div class="tabs" aria-label="Вид воронки">'+
    ['Канбан','Список','Статистика'].map(name=>'<button type="button" data-action="tab" data-value="'+name+'" aria-pressed="'+(selected===name)+'" class="'+(selected===name?'active':'')+'">'+name+'</button>').join('')+
    '</div>'+filters+(isLead?'':btn('Настроить этапы','stageEditor:deals','soft sm'))+'</div>';
  const body=selected==='Список'?'<div class="card pipeline-list">'+table(
    [isLead?'Лид':'Сделка','Клиент','Ответственный','Этап','Действия'],
    records.map(row=>'<tr><td><b>'+esc(labelFor(row))+'</b></td><td>'+esc(clientFor(row))+'</td><td>'+esc(personFor(row))+
      '</td><td>'+tag(stages.find(stage=>stage.id===row.stage)?.label||'—')+'</td><td><div class="pipeline-actions">'+actions(row)+'</div></td></tr>'))+'</div>'
    :selected==='Статистика'?'<div class="metric-grid">'+stages.map(stage=>view.metric(esc(stage.label),'Карточек на этапе',records.filter(row=>row.stage===stage.id).length,isLead?'inbox':'deal')).join('')+'</div>'
    :'<div class="kanban pipeline-board" tabindex="0" aria-label="'+(isLead?'Воронка лидов':'Воронка сделок')+'">'+stages.map(stage=>{
      const rows=records.filter(row=>row.stage===stage.id);
      return '<section class="lane pipeline-lane" data-pipeline="'+type+'" data-stage="'+esc(stage.id)+'" data-locked="'+!!stage.locked+
        '"><div class="lane-head"><h2>'+esc(stage.label)+'</h2>'+tag(rows.length,'gray')+'</div>'+
        (rows.map(row=>'<article class="deal-card pipeline-card" draggable="'+canMove(row)+'" data-drag-type="'+type+
          '" data-drag-id="'+row.id+'"><h3>'+esc(labelFor(row))+'</h3><p>'+esc(clientFor(row))+
          '</p><div class="pipeline-person">'+icon('person','sm')+'<span>'+esc(personFor(row))+
          '</span></div><div class="pipeline-actions">'+actions(row)+'</div></article>').join('')||'<p class="pipeline-empty">Нет карточек</p>')+'</section>';
    }).join('')+'</div>';
  return head(isLead?'Лиды':'Сделки',isLead?'Распределяйте заявки и ведите их до сделки.':'Ведите согласование, договор и оплату по этапам.',
    isLead?btn(icon('plus')+' Новый лид','add:request','primary'):btn(icon('plus')+' Новая сделка','add:deal','primary'))+
    tools+body+(isLead?'':'<div class="notice">'+icon('shield')+' Проект создаётся после проверки подписей и оплаты. '+btn('Условия перехода','flowInfo','soft sm')+'</div>');
}
