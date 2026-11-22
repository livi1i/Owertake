import {useState} from 'react';
import {Check,Search} from 'lucide-react';
import {AnchoredPicker} from './anchored-picker';

type Choice = {value:string;label:string;hint?:string};
type Group = {label?:string;choices:Choice[]};

export function StudioSelect({label,value,onChange,groups,name,placeholder='Выберите вариант'}:{
  label:string;value:string;onChange:(value:string)=>void;groups:Group[];name?:string;placeholder?:string;
}) {
  const [query,setQuery] = useState('');
  const current = groups.flatMap(group => group.choices).find(choice => choice.value===value);
  const searchable = groups.reduce((count,group) => count+group.choices.length,0)>12;
  const term = query.trim().toLocaleLowerCase('ru');
  const visible = groups.map(group => ({...group,choices:term ? group.choices.filter(choice =>
    [choice.label,choice.hint,group.label].some(text => text?.toLocaleLowerCase('ru').includes(term))
  ) : group.choices})).filter(group => group.choices.length);

  return <>
    {name && <input name={name} value={value} type="hidden"/>}
    <AnchoredPicker label={label} value={current?.label} placeholder={placeholder} onOpen={()=>setQuery('')}>{close => <>
        {searchable && <label className="studio-choice-search"><Search size={17}/><input type="search" placeholder="Найти услугу"
          aria-label="Найти услугу" value={query} onChange={event => setQuery(event.target.value)}/></label>}
        <div className="studio-choice-list">
          {!visible.length && <p role="status">По этому запросу ничего не найдено.</p>}
          {visible.map((group,index) => <section key={group.label || index}>
            {group.label && <h3>{group.label}</h3>}
            {group.choices.map(choice => <button type="button" key={choice.value} aria-pressed={choice.value===value}
              onClick={() => { onChange(choice.value); close(); }}>
              <span>{choice.label}{choice.hint && <small>{choice.hint}</small>}</span>
              {choice.value===value && <Check size={18} aria-hidden="true"/>}
            </button>)}
          </section>)}
        </div>
    </>}</AnchoredPicker>
  </>;
}
