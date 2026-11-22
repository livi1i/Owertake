import {useEffect,useRef,useState,type CSSProperties,type ReactNode} from 'react';

export function Reveal({children,className='',delay=0}:{children:ReactNode;className?:string;delay?:number}) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen,setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current || !('IntersectionObserver' in window)) {
      setSeen(true);
      return;
    }
    const node = ref.current;
    node.dataset.revealReady = "true";
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setSeen(true);
        observer.disconnect();
      }
    },{threshold:.12});
    observer.observe(node);
    return () => { observer.disconnect(); delete node.dataset.revealReady; };
  },[]);
  return <div ref={ref} className={`section-reveal ${className}`} data-visible={seen || undefined} style={{'--reveal-delay':`${delay}ms`} as CSSProperties}>{children}</div>;
}
