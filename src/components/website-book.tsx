import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { WebsitePage, names } from "./website-pages";
import { nextBookPage } from "./book-model";
import { BorderBeam } from "./magicui/border-beam";
import "./showcase.css";
export { WebsitePage } from "./website-pages";
type Turn = { from: number; to: number };

export function WebsiteBook({
  globalPaused = false,
}: {
  globalPaused?: boolean;
}) {
  const reduced = useReducedMotion(),
    ref = useRef<HTMLDivElement>(null),
    inView = useInView(ref, { amount: 0.2 });
  const [page, setPage] = useState(0),
    [paused, setPaused] = useState(false),
    [visible, setVisible] = useState(true),
    [turn, setTurn] = useState<Turn | null>(null);
  const direction = useRef(1),
    locked = useRef(false), focusWidget = useRef(false), widget = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  const startTurn = (target: number) => {
    if (
      locked.current ||
      target === page ||
      target < 0 ||
      target >= names.length
    )
      return;
    direction.current = target > page ? 1 : -1;
    if (reduced || globalPaused) {
      setPage(target);
      return;
    }
    locked.current = true;
    setTurn({ from: page, to: target });
    setPage(target);
  };
  useEffect(() => {
    if (reduced || paused || globalPaused || !visible || !inView || turn)
      return;
    const timer = setTimeout(() => {
      const next = nextBookPage(page, direction.current, names.length);
      startTurn(next.page);
    }, 4300);
    return () => clearTimeout(timer);
  }, [page, paused, globalPaused, reduced, visible, inView, turn]);
  const move = (step: number) => {
    setPaused(true);
    startTurn(page + step);
  };

  const finish = () => {
    if (!turn) return;
    setPage(turn.to);
    setTurn(null);
    locked.current = false;
  };
  return (
    <div ref={ref} className="website-book">
      <div className="book-aura" />
      <div className="book-ellipse" />
      <div className="book-annotation">
        <span className="live-dot" /> ИДЕИ ОБРЕТАЮТ ФОРМУ
      </div>
      <div className="book-scene showcase-stage" aria-busy={!!turn}>
        <AnimatePresence mode="wait" initial={false} custom={direction.current}>
          <motion.button ref={widget} key={page} className="showcase-frame" type="button"
            aria-label={"Показать следующий сайт. Сейчас: "+names[page]}
            custom={direction.current}
            variants={{enter:(d:number)=>({x:55*d,opacity:0,scale:.97}),visible:{x:0,opacity:1,scale:1},exit:(d:number)=>({x:-90*d,opacity:0,scale:.96})}}
            initial="enter" animate="visible" exit="exit"
            transition={{duration:reduced||globalPaused?0:.58,ease:[.22,.75,.2,1]}}
            onAnimationComplete={definition=>{if(definition==='visible'){finish();if(focusWidget.current){widget.current?.focus({preventScroll:true});focusWidget.current=false;}}}}
            onClick={()=>{focusWidget.current=true;setPaused(true);startTurn(page===names.length-1?0:page+1);}}
            disabled={!!turn}>
            <WebsitePage index={page}/>
          </motion.button>
        </AnimatePresence>
      </div>
      <div className="book-controls">
        <div>
          <span className="book-counter">
            {String((turn?.to ?? page) + 1).padStart(2, "0")}
            <i>/ {String(names.length).padStart(2, "0")}</i>
          </span>
          <span className="book-name">
            {names[turn?.to ?? page]}
            <small>Авторские дизайн-концепции</small>
          </span>
        </div>
        <div className="book-buttons">
          <button
            aria-label="Предыдущий концепт"
            disabled={page === 0 || !!turn}
            onClick={() => move(-1)}
          >
            <ArrowLeft size={15} />
          </button>
          <button
            aria-label="Следующий концепт"
            disabled={page === names.length - 1 || !!turn}
            onClick={() => move(1)}
          >
            <ArrowRight size={15} />
          </button>
          <button
            aria-label={
              paused ? "Продолжить анимацию" : "Приостановить анимацию"
            }
            aria-pressed={paused}
            onClick={() => setPaused(!paused)}
          >
            {paused ? <Play size={13} /> : <Pause size={13} />}
          </button>
        </div>
        <BorderBeam
          colorFrom="#a78bfa"
          colorTo="#67d9ef"
          duration={12}
          size={70}
        />
      </div>
    </div>
  );
}
