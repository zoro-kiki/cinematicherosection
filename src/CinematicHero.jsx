import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

import heroBg from "./assets/hero-bg.jpg";
import flowersLeft from "./assets/flowers-left.png";
import flowersRight from "./assets/flowers-right.png";

gsap.registerPlugin(ScrollTrigger);

// Curated bento composition (responsive: 3x8 on mobile, 12x6 on desktop)
const ART_TILES = [
  { src: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=1200&q=85", cls: "t-a" },
  { src: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=1600&q=85", cls: "t-b" },
  { src: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=900&q=85",  cls: "t-c" },
  { src: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=900&q=85",   cls: "t-d" },
  { src: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1000&q=85", cls: "t-e" },
  { src: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=1600&q=85", cls: "t-f" },
  { src: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1000&q=85", cls: "t-g" },
  { src: "https://images.unsplash.com/photo-1490604001847-b712b0c2f967?w=1200&q=85", cls: "t-h" },
  { src: "https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=900&q=85",  cls: "t-i" },
];

export default function CinematicHero() {
  const root = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });
    let raf = 0;
    const tick = (time) => {
      lenis.raf(time);
      ScrollTrigger.update();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: ".hero-scope",
          start: "top top",
          end: "+=400%",
          pin: ".hero-stage",
          scrub: 1.2,
          anticipatePin: 1,
        },
      });

      // PHASE 1 — cinematic zoom through flowers
      tl.to(".bg-layer", { scale: 1.6, ease: "none" }, 0);
      tl.to(".vignette", { opacity: 0.95 }, 0);
      tl.to(".flowers-left",  { xPercent: -80, scale: 1.4, opacity: 0, rotate: -6 }, 0);
      tl.to(".flowers-right", { xPercent:  80, scale: 1.4, opacity: 0, rotate:  6 }, 0);
      tl.to(".petal", { y: 220, opacity: 0, stagger: 0.03 }, 0);

      // PHASE 2 — dim & reveal gallery stage
      tl.to(".bg-layer", { opacity: 0.25, scale: 1.7, ease: "none" }, 0.5);
      tl.to(".vignette", { opacity: 0.4 }, 0.5);
      tl.fromTo(
        ".gallery-stage",
        { opacity: 0, scale: 1.08 },
        { opacity: 1, scale: 1, duration: 0.15, ease: "power2.out" },
        0.5,
      );

      // PHASE 3 — sequential tile reveal
      const tiles = gsap.utils.toArray(".gallery-tile");
      tiles.forEach((el, i) => {
        const pos = 0.62 + (i / tiles.length) * 0.35;
        tl.fromTo(
          el,
          { opacity: 0, y: 40, scale: 0.92 },
          { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "power3.out" },
          pos,
        );
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="hero-scope">
      <section className="hero-stage">
        <div className="bg-layer gpu">
          <img src={heroBg} alt="Magical forest archway revealing a pastel sunset" draggable={false} />
          <div className="bg-gradient" />
        </div>

        <div className="vignette" />
        <div className="bloom" />

        <header className="hero-header">
          <div className="mark">✦</div>
        </header>

        <img src={flowersLeft}  alt="" aria-hidden draggable={false} className="flowers-left  gpu" />
        <img src={flowersRight} alt="" aria-hidden draggable={false} className="flowers-right gpu" />

        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="petal gpu"
            style={{
              left: `${(i * 73) % 100}%`,
              top: `${(i * 41) % 90}%`,
              width: `${5 + (i % 4) * 2}px`,
              height: `${5 + (i % 4) * 2}px`,
              background:
                i % 2
                  ? "radial-gradient(circle, rgba(248,232,200,0.85), transparent 70%)"
                  : "radial-gradient(circle, rgba(244,220,190,0.8), transparent 70%)",
            }}
          />
        ))}

        <div className="gallery-stage">
          <div className="gallery-grid">
            {ART_TILES.map((tile, i) => (
              <figure key={i} className={`gallery-tile gpu ${tile.cls}`}>
                <img src={tile.src} alt="" aria-hidden draggable={false} loading="lazy" />
                <div className="tile-overlay" />
              </figure>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
