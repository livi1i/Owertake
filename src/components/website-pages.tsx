import {
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  Pause,
  Play,
  Command,
  Activity,
} from "lucide-react";
import { ExtraWebsitePage } from "./extra-website-pages";

export const names = [
  "AURA — архитектура пространства",
  "ORBIT — цифровой банкинг",
  "FORM — культура движения",
  "MONO — предметы с характером",
  "ECHO — территория звука",
  "LUMI — атмосфера света",
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
        <span>
          {
            [
              "aura.studio",
              "orbit.finance",
              "form.club",
              "mono.objects",
              "echo.audio",
              "lumi.light",
            ][index]
          }
        </span>
        <ArrowUpRight size={10} />
      </div>
      {index >= 3 ? (
        <ExtraWebsitePage index={index} />
      ) : index === 0 ? (
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
