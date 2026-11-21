import { ArrowUpRight, ArrowRight, Headphones, Sparkles } from "lucide-react";
export function ExtraWebsitePage({ index }: { index: number }) {
  if (index === 3)
    return (
      <>
        <div className="design-nav">
          <b>
            MONO<span>®</span>
          </b>
          <span>ОБЪЕКТЫ　 КОЛЛЕКЦИЯ　↗</span>
        </div>
        <div className="mono-body">
          <span className="design-kicker">OBJECTS WITH A POINT OF VIEW.</span>
          <h3>
            Меньше вещей
            <br />
            <em>Больше смысла</em>
          </h3>
          <div className="mono-chair">
            <i />
            <b />
            <span />
            <em />
          </div>
          <span className="mono-edition">
            EDITION 04
            <br />
            DESIGNED TO STAY.
          </span>
          <div className="extra-bottom">
            <span>Форма следует за чувством.</span>
            <ArrowUpRight size={20} />
          </div>
        </div>
      </>
    );
  if (index === 4)
    return (
      <>
        <div className="design-nav">
          <b>
            echo
            <Headphones size={17} />
          </b>
          <span>КОЛЛЕКЦИЯ　 ЗВУК　↗</span>
        </div>
        <div className="echo-body">
          <span className="design-kicker">FEEL EVERY FREQUENCY.</span>
          <h3>
            Слушай
            <br />
            <em>Чувствуй</em>
          </h3>
          <div className="echo-headphones">
            <i />
            <b />
            <span />
            <em />
          </div>
          <div className="echo-wave">
            {Array.from({ length: 22 }, (_, i) => (
              <i
                key={i}
                style={{ height: 10 + Math.sin(i * 0.9) ** 2 * 37 + "px" }}
              />
            ))}
          </div>
          <div className="extra-bottom">
            <span>Твой мир. Твой звук.</span>
            <ArrowUpRight size={20} />
          </div>
        </div>
      </>
    );
  return (
    <>
      <div className="design-nav">
        <b>
          lumi
          <Sparkles size={14} />
        </b>
        <span>СВЕТ　 ИСТОРИЯ　↗</span>
      </div>
      <div className="lumi-body">
        <span className="design-kicker">A SOFTER WAY TO LIVE.</span>
        <h3>
          Свет, который
          <br />
          <em>остаётся</em>
        </h3>
        <div className="lumi-lamp">
          <i />
          <b />
          <span />
          <em />
        </div>
        <div className="extra-bottom">
          <span>Создайте своё настроение.</span>
          <ArrowRight size={20} />
        </div>
      </div>
    </>
  );
}
