import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  Pause,
  Play,
  Command,
  Activity,
} from "lucide-react";
import { BorderBeam } from "./magicui/border-beam";

const names = [
  "AURA — архитектура пространства",
  "ORBIT — цифровой банкинг",
  "FORM — культура движения",
];
export function WebsitePage({ index }: { index: number }) {
  return (
    <div className={"website-design design-" + index}>
      <div className="design-browser">
        <span>
          <i />
          <i />
          <i />
        </span>
        <span>{["aura.studio", "orbit.finance", "form.club"][index]}</span>
        <ArrowUpRight size={10} />
      </div>
      {index === 0 ? (
        <>
          <div className="design-nav">
            <b>
              AURA<span>®</span>
            </b>
            <span>ПРОЕКТЫ　 СТУДИЯ　↗</span>
          </div>
          <div className="aura-body">
            <span className="design-kicker">ARCHITECTURE OF TOMORROW</span>
            <h3>
              За пределами
              <br />
              <em>привычного.</em>
            </h3>
            <div className="architecture">
              <div className="arch-building b-one" />
              <div className="arch-building b-two" />
              <div className="arch-building b-three" />
              <span className="arch-sun" />
              <div className="arch-floor" />
            </div>
            <div className="aura-footer">
              <span>
                Пространства,
                <br />
                которые меняют взгляд.
              </span>
              <span className="design-round">
                <ArrowUpRight size={19} />
              </span>
            </div>
          </div>
        </>
      ) : index === 1 ? (
        <>
          <div className="design-nav">
            <b>
              <Command size={17} /> orbit
            </b>
            <span>ПРОДУКТ　 О НАС　↗</span>
          </div>
          <div className="orbit-body">
            <span className="design-kicker">YOUR MONEY. YOUR UNIVERSE.</span>
            <h3>
              Финансы.
              <br />
              <em>Без границ.</em>
            </h3>
            <p>Больше свободы для больших идей.</p>
            <div className="finance-art">
              <div className="finance-orbit" />
              <div className="finance-orbit second" />
              <div className="bank-card">
                <span>
                  orbit <ArrowUpRight size={12} />
                </span>
                <b>● ● ● ●　 2048</b>
                <small>YOUR NEXT CHAPTER</small>
              </div>
              <span className="bank-spark">✳</span>
            </div>
            <div className="design-pill">
              Открыть новые возможности <ArrowUpRight size={12} />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="design-nav">
            <b>F/ORM</b>
            <span>ПРОСТРАНСТВО　 ТРЕНИРОВКИ</span>
          </div>
          <div className="form-body">
            <span className="design-kicker">MOVE DIFFERENT.</span>
            <h3>
              В твоём
              <br />
              <em>ритме.</em>
            </h3>
            <div className="form-ribbon">
              <i />
              <i />
              <i />
            </div>
            <div className="form-stamp">
              <Activity size={20} />
              <span>
                BODY.
                <br />
                MIND.
                <br />
                BALANCE.
              </span>
            </div>
            <div className="form-bottom">
              <span>
                Не просто движение.
                <br />
                Новый способ чувствовать.
              </span>
              <span className="design-round">
                <ArrowUpRight size={20} />
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
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
    [visible, setVisible] = useState(true);
  const sequence = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const fn = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, []);
  useEffect(() => {
    if (reduced || paused || globalPaused || !visible || !inView) return;
    const steps = [0, 1, 2, 1];
    timer.current = setTimeout(() => {
      sequence.current = (sequence.current + 1) % steps.length;
      setPage(steps[sequence.current]);
    }, 4200);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [page, paused, globalPaused, reduced, visible, inView]);
  const move = (n: number) => {
    setPaused(true);
    setPage((p) => Math.max(0, Math.min(2, p + n)));
  };
  return (
    <div
      ref={ref}
      className={"website-book " + (!inView || paused ? "motion-paused" : "")}
    >
      <div className="book-aura" />
      <div className="book-ellipse" />
      <div className="book-annotation">
        <span className="live-dot" /> ИДЕИ ОБРЕТАЮТ ФОРМУ
      </div>
      <div
        className="book-scene"
        role="img"
        aria-label={
          "Перелистывающиеся концепции сайтов. Сейчас: " + names[page]
        }
      >
        <div className="book-spread">
          {[2, 1, 0].map((i) => (
            <motion.div
              key={i}
              className="book-leaf"
              initial={false}
              animate={{ rotateY: i < page ? -88 : 0, z: (3 - i) * 3 }}
              transition={{
                duration: reduced ? 0 : 1.65,
                ease: [0.22, 0.7, 0.16, 1],
              }}
              style={{ zIndex: 3 - i }}
            >
              <div className="leaf-front">
                <WebsitePage index={i} />
              </div>
              <div className={"leaf-back leaf-back-" + i}>
                <span>OVERTAKE®</span>
                <span>{["AURA", "ORBIT", "F/ORM"][i]}</span>
                <small>DESIGNED TO GO FURTHER.</small>
              </div>
            </motion.div>
          ))}
          <div className="book-base" />
        </div>
      </div>
      <div className="book-controls">
        <div>
          <span className="book-counter">
            0{page + 1}
            <i>/ 03</i>
          </span>
          <span className="book-name">
            {names[page]}
            <small>Авторские дизайн-концепции</small>
          </span>
        </div>
        <div className="book-buttons">
          <button
            aria-label="Предыдущий концепт"
            disabled={page === 0}
            onClick={() => move(-1)}
          >
            <ArrowLeft size={15} />
          </button>
          <button
            aria-label="Следующий концепт"
            disabled={page === 2}
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
