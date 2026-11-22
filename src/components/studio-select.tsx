import {useId,useRef,useState} from 'react';
import {Check,ChevronDown,Search,X} from 'lucide-react';

type Choice = {value:string;label:string;hint?:string};
type Group = {label?:string;choices:Choice[]};

export function StudioSelect({label,value,onChange,groups,name,placeholder='Выберите вариант'}:{
  label:string;value:string;onChange:(value:string)=>void;groups:Group[];name?:string;placeholder?:string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [query,setQuery] = useState('');
  const current = groups.flatMap(group => group.choices).find(choice => choice.value===value);
  const searchable = groups.reduce((count,group) => count+group.choices.length,0)>12;
  const term = query.trim().toLocaleLowerCase('ru');
  const visible = groups.map(group => ({...group,choices:term ? group.choices.filter(choice =>
    [choice.label,choice.hint,group.label].some(text => text?.toLocaleLowerCase('ru').includes(term))
  ) : group.choices})).filter(group => group.choices.length);

  return <div className="studio-choice">
    <span className="studio-choice-label" id={id+'-label'}>{label}</span>
    {name && <input name={name} value={value} type="hidden"/>}
    <button className="studio-choice-trigger" type="button" aria-labelledby={id+'-label '+id+'-value'}
      aria-haspopup="dialog" aria-controls={id} onClick={() => { setQuery(''); dialog.current?.showModal(); }}>
      <span id={id+'-value'}>{current?.label || placeholder}</span><ChevronDown size={18} aria-hidden="true"/>
    </button>
    <dialog ref={dialog} id={id} className="studio-choice-dialog" aria-labelledby={id+'-title'}
      onClick={event => { if (event.target===event.currentTarget) dialog.current?.close(); }}>
      <div className="studio-choice-inner">
        <header><h2 id={id+'-title'}>{label}</h2><button type="button" autoFocus={!searchable} aria-label="Закрыть выбор"
          onClick={() => dialog.current?.close()}><X size={19}/></button>
          {searchable && <label className="studio-choice-search"><Search size={17}/><input type="search" placeholder="Найти услугу"
            aria-label="Найти услугу" autoFocus value={query} onChange={event => setQuery(event.target.value)}/></label>}
        </header>
        <div className="studio-choice-list">
          {!visible.length && <p role="status">По этому запросу ничего не найдено.</p>}
          {visible.map((group,index) => <section key={group.label || index}>
            {group.label && <h3>{group.label}</h3>}
            {group.choices.map(choice => <button type="button" key={choice.value} aria-pressed={choice.value===value}
              onClick={() => { onChange(choice.value); dialog.current?.close(); }}>
              <span>{choice.label}{choice.hint && <small>{choice.hint}</small>}</span>
              {choice.value===value && <Check size={18} aria-hidden="true"/>}
            </button>)}
          </section>)}
        </div>
      </div>
    </dialog>
  </div>;
}
