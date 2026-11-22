import {useState} from 'react';
import {ChevronLeft,ChevronRight} from 'lucide-react';
import {AnchoredPicker} from './anchored-picker';

const dayFormat = new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',year:'numeric'});
const monthFormat = new Intl.DateTimeFormat('ru-RU',{month:'long',year:'numeric'});
const moscow = new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'});
const weekdays = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

function calendarDate(value:string) {
  const [year,month,day] = value.split('-').map(Number);
  return new Date(year,month-1,day);
}

export function MeetingDate({value,onChange}:{value:string;onChange:(value:string)=>void}) {
  const parts = Object.fromEntries(moscow.formatToParts(new Date()).map(part=>[part.type,part.value]));
  const today = [parts.year,parts.month,parts.day].join('-');
  const current = calendarDate(today);
  const [month,setMonth] = useState(() => new Date(current.getFullYear(),current.getMonth(),1));
  const year = month.getFullYear();
  const number = month.getMonth();
  const offset = (month.getDay()+6)%7;
  const days = new Date(year,number+1,0).getDate();

  return <AnchoredPicker label="Желаемая дата" value={value ? dayFormat.format(calendarDate(value)) : undefined}
    placeholder="Выберите дату" className="meeting-date" onOpen={()=>{
      const date=calendarDate(value || today);
      setMonth(new Date(date.getFullYear(),date.getMonth(),1));
    }}>{close => <div className="meeting-calendar">
      <div className="calendar-heading">
        <button type="button" disabled={year===current.getFullYear() && number===current.getMonth()}
          aria-label="Предыдущий месяц" onClick={()=>setMonth(new Date(year,number-1,1))}><ChevronLeft size={17}/></button>
        <strong aria-live="polite">{monthFormat.format(month)}</strong>
        <button type="button" aria-label="Следующий месяц" onClick={()=>setMonth(new Date(year,number+1,1))}><ChevronRight size={17}/></button>
      </div>
      <div className="calendar-days">
        {weekdays.map(day=><span key={day}>{day}</span>)}
        {Array.from({length:offset},(_,i)=><span key={'empty-'+i} aria-hidden="true"/>)}
        {Array.from({length:days},(_,i)=>{
          const day=i+1;
          const date=new Date(year,number,day);
          const iso=[year,String(number+1).padStart(2,'0'),String(day).padStart(2,'0')].join('-');
          return <button type="button" key={day} disabled={iso<today} aria-label={dayFormat.format(date)}
            aria-pressed={iso===value} aria-current={iso===today?'date':undefined} onClick={()=>{onChange(iso);close();}}>{day}</button>;
        })}
      </div>
      {value && <button className="calendar-clear" type="button" onClick={()=>{onChange('');close();}}>Убрать дату</button>}
    </div>}</AnchoredPicker>;
}
