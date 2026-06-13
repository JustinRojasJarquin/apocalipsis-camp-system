import { useEffect, useRef } from "react";

export function useTiltEffect<T extends HTMLElement>(
  maxTilt = 6,
  glare = true,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;
      const rotateX = (-mouseY / (rect.height / 2)) * maxTilt;
      const rotateY = (mouseX / (rect.width / 2)) * maxTilt;
      el.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;

      if (glare) {
        const glareX = ((mouseX / rect.width) * 100 + 50) % 100;
        const glareY = ((mouseY / rect.height) * 100 + 50) % 100;
        el.style.setProperty("--glare-x", `${glareX}%`);
        el.style.setProperty("--glare-y", `${glareY}%`);
      }
    };

    const handleMouseLeave = () => {
      el.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)";
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [maxTilt, glare]);

  return ref;
}