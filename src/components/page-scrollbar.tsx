import { useEffect, useRef, useState } from "react";
export function PageScrollbar() {
  const [metrics, setMetrics] = useState({
    top: 0,
    height: 0,
    position: 0,
    max: 0,
    hidden: true,
  });
  const metricsRef = useRef(metrics),
    drag = useRef<{ y: number; scroll: number } | null>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const height = innerHeight,
        full = document.documentElement.scrollHeight,
        max = Math.max(0, full - height),
        thumb = Math.max(36, (height * height) / full);
      const next = {
        top: max ? (scrollY / max) * (height - thumb) : 0,
        height: thumb,
        position: Math.round(scrollY),
        max,
        hidden: !max || document.body.style.overflow === "hidden",
      };
      metricsRef.current = next;
      setMetrics(next);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(document.body);
    const mutation = new MutationObserver(schedule);
    mutation.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    });
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    update();
    return () => {
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      resize.disconnect();
      mutation.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);
  if (metrics.hidden) return null;
  return (
    <div className="page-scrollbar">
      <div
        role="scrollbar"
        aria-label="Прокрутка страницы"
        aria-controls="root"
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={metrics.max}
        aria-valuenow={metrics.position}
        tabIndex={0}
        className="page-scrollbar-thumb"
        style={{
          height: metrics.height,
          transform: `translateY(${metrics.top}px)`,
        }}
        onPointerDown={(e) => {
          drag.current = { y: e.clientY, scroll: scrollY };
          e.currentTarget.setPointerCapture(e.pointerId);
          e.preventDefault();
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const m = metricsRef.current;
          window.scrollTo({
            top:
              drag.current.scroll +
              ((e.clientY - drag.current.y) /
                Math.max(1, innerHeight - m.height)) *
                m.max,
            behavior: "instant",
          });
        }}
        onPointerUp={(e) => {
          drag.current = null;
          e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
        onKeyDown={(e) => {
          const steps: Record<string, number> = {
            ArrowDown: 80,
            ArrowUp: -80,
            PageDown: innerHeight * 0.8,
            PageUp: -innerHeight * 0.8,
          };
          let target: number;
          if (e.key === "Home") target = 0;
          else if (e.key === "End") target = metrics.max;
          else if (e.key in steps) target = scrollY + steps[e.key];
          else return;
          e.preventDefault();
          window.scrollTo({ top: target, behavior: "instant" });
        }}
      />
    </div>
  );
}
