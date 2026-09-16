import { useEffect, useRef, useState } from 'react';

/**
 * ScrollReveal Component
 * Smoothly floats and fades in children when scrolled into view.
 */
export default function ScrollReveal({
  children,
  delay = 0,
  duration = 700,
  distance = 'translate-y-10',
  className = '',
}) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const currentElem = domRef.current;
    if (currentElem) observer.observe(currentElem);

    return () => {
      if (currentElem) observer.unobserve(currentElem);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100 blur-0'
          : `opacity-0 ${distance} scale-95 blur-[1px] pointer-events-none`
      } ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
