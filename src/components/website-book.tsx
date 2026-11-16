import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { WebsitePage, names } from "./website-pages";
import { nextBookPage, bookLayers } from "./book-model";
import { BorderBeam } from "./magicui/border-beam";
export { WebsitePage } from "./website-pages";
type Turn = { from: number; to: number };
const marks = ["AURA", "ORBIT", "F/ORM", "MONO", "ECHO", "LUMI"];
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
    locked = useRef(false);
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
    if (reduced) {
      setPage(target);
      return;
    }
    locked.current = true;
    setTurn({ from: page, to: target });
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
  const layers = turn ? bookLayers(turn.from, turn.to) : null;
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
      <div
        className="book-scene"
        role="img"
        aria-busy={!!turn}
        aria-label={
          "Перелистывающиеся концепции сайтов. Сейчас: " +
          names[turn?.to ?? page]
        }
      >
        <div className="book-spread stable-book">
          <div className="book-base" />
          <div className="book-stationary">
            <WebsitePage index={layers?.base ?? page} />
          </div>
          {turn && layers && (
            <motion.div
              key={turn.from + "-" + turn.to}
              className="book-turning-sheet"
              initial={{
                rotateY: layers.forward ? 0 : -112,
                opacity: layers.forward ? 1 : 0,
              }}
              animate={{
                rotateY: layers.forward ? -112 : 0,
                opacity: layers.forward ? [1, 1, 0] : [0, 1, 1],
              }}
              transition={{
                duration: 1.9,
                ease: [0.45, 0, 0.18, 1],
                opacity: {
                  duration: 1.9,
                  times: layers.forward ? [0, 0.8, 1] : [0, 0.2, 1],
                },
              }}
              onAnimationComplete={finish}
            >
              <div className="leaf-front">
                <WebsitePage index={layers.sheet} />
              </div>
              <div className={"leaf-back leaf-back-" + layers.sheet}>
                <span>OVERTAKE®</span>
                <span>{marks[layers.sheet]}</span>
                <small>DESIGNED TO GO FURTHER.</small>
              </div>
              <motion.div
                className="page-turn-shade"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.24, 0] }}
                transition={{ duration: 1.9, times: [0, 0.5, 1] }}
              />
            </motion.div>
          )}
        </div>
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
