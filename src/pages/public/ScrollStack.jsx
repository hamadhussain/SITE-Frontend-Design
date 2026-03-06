import React, { useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function ScrollSection() {
  const sectionRef = useRef(null);
  const triggerRef = useRef(null);

  useLayoutEffect(() => {
    if (!sectionRef.current || !triggerRef.current) return;

    const ctx = gsap.context(() => {
      const section = sectionRef.current;

      gsap.to(section, {
        x: () => -(section.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: () => "+=" + section.scrollWidth,
          scrub: 1,
          pin: true,
        },
      });
    }, triggerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="overflow-hidden">
      <div ref={triggerRef}>
        <div ref={sectionRef} className="flex">

          <div className="w-screen h-screen flex justify-center items-center">
            <img src="/D3.webp" />
          </div>

          <div className="w-screen h-screen flex justify-center items-center">
            <img src="/D3.webp" />
          </div>

          <div className="w-screen h-screen flex justify-center items-center">
            <img src="/D3.webp"  />
          </div>

          <div className="w-screen h-screen flex justify-center items-center">
            <img src="/D3.webp"  />
          </div>

        </div>
      </div>
    </section>
  );
}

export default ScrollSection;