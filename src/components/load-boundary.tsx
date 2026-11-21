import React from 'react';
export class LoadBoundary extends React.Component<{children:React.ReactNode},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){if(this.state.failed)return <main className="catalog-page" id="main"><div className="catalog-empty"><span className="catalog-kicker">OVERTAKE</span><h1>Не удалось загрузить страницу</h1><p>Проверьте соединение и попробуйте открыть её заново.</p><button className="btn purple" onClick={()=>location.reload()}>Перезагрузить страницу</button><a href="/" className="catalog-home-link" style={{marginLeft:20}}>На главную →</a></div></main>;return this.props.children;}
}
