import { useRef } from "react";
import { useInView } from "framer-motion";
import { ArrowUpRight, Check, Send, Code2, Heart, Plus } from "lucide-react";
export function ServiceMotion({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  return (
    <div
      ref={ref}
      className={
        "service-animation animation-" + index + (inView ? " is-playing" : "")
      }
      aria-hidden="true"
    >
      <div className="service-art-grid" />
      {index === 0 ? (
        <div className="mini-site">
          <div className="mini-site-bar">
            <i />
            <i />
            <i />
            <span>your-next.site</span>
          </div>
          <div className="mini-site-content">
            <span>ВЫХОДИТЕ ЗА РАМКИ</span>
            <b>
              Новый взгляд.
              <br />
              <em>Новые возможности.</em>
            </b>
            <div className="mini-site-shape" />
            <i className="mini-site-cta" />
            <span className="site-cursor">
              <ArrowUpRight size={18} />
            </span>
          </div>
        </div>
      ) : index === 1 ? (
        <div className="bot-animation">
          <span className="bot-avatar">
            <Send size={20} />
          </span>
          <div className="bot-line">
            Хочу записаться <small>12:04</small>
          </div>
          <div className="bot-line response">
            Уже нашёл время для вас.
            <Check size={14} />
          </div>
          <div className="bot-typing">
            <i />
            <i />
            <i />
          </div>
        </div>
      ) : index === 2 ? (
        <div className="kanban-art">
          <div>
            <span>НОВАЯ</span>
            <i />
            <i />
          </div>
          <div>
            <span>В РАБОТЕ</span>
            <i />
          </div>
          <div>
            <span>ГОТОВО</span>
            <i />
          </div>
          <span className="deal-card">
            <b>Новый проект</b>
            <small>Всё под контролем</small>
            <Check size={13} />
          </span>
        </div>
      ) : index === 3 ? (
        <div className="app-assembly">
          <div className="app-piece p-one">
            <i />
            <i />
            <i />
          </div>
          <div className="app-piece p-two">
            <b>Ваш продукт</b>
            <span>Всё начинается с идеи</span>
            <div className="assembly-bars">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="app-piece p-three">
            <Check size={18} />
            <span>Готов к запуску</span>
          </div>
          <span className="assembly-cross">
            <Plus size={30} />
          </span>
        </div>
      ) : index === 4 ? (
        <div className="social-art">
          <div className="social-post back-post">
            <span>
              YOUR
              <br />
              BRAND.
            </span>
          </div>
          <div className="social-post front-post">
            <span>
              Есть
              <br />
              <em>что сказать.</em>
            </span>
            <Heart size={17} />
          </div>
          <span className="social-heart">
            <Heart size={18} fill="currentColor" /> На одной волне
          </span>
        </div>
      ) : (
        <div className="code-art">
          <div>
            <i />
            <i />
            <i />
            <span>overtake / your-idea</span>
          </div>
          <pre>
            <span>const</span> nextLevel = {"{"}
            <br />
            　idea: <em>"ваша"</em>,<br />
            　solution: <em>"наше"</em>,<br />
            　possibilities: <b>Infinity</b>
            <br />
            {"}"};
          </pre>
          <span className="code-success">
            <Code2 size={14} /> Идея → продукт <Check size={13} />
          </span>
        </div>
      )}
    </div>
  );
}
export function SectionSign({
  number,
  label,
}: {
  number: string;
  label: string;
}) {
  return (
    <div className="section-sign">
      <span className="section-sign-number">
        {number}
        <i>↗</i>
      </span>
      <span className="section-sign-label">
        {label}
        <small>
          {
            (
              {
                "01": "IDEAS INTO IMPACT",
                "02": "DESIGNED TO GO FURTHER",
                "03": "FROM VISION TO REALITY",
                "04": "PEOPLE BEHIND THE PRODUCT",
              } as Record<string, string>
            )[number]
          }
        </small>
      </span>
      <span className="section-sign-line" />
    </div>
  );
}
