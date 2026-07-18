export type ParallaxHandler = (x: number, y: number) => void;

export function bindPointerParallax(
  onParallax: ParallaxHandler,
  options?: { intensity?: number },
): () => void {
  const intensity = options?.intensity ?? 1;

  const update = (clientX: number, clientY: number) => {
    const x = (clientX / window.innerWidth - 0.5) * 2 * intensity;
    const y = (clientY / window.innerHeight - 0.5) * 2 * intensity;
    onParallax(x, y);
  };

  const onMouseMove = (e: MouseEvent) => update(e.clientX, e.clientY);
  const onTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (touch) update(touch.clientX, touch.clientY);
  };

  document.addEventListener("mousemove", onMouseMove, { passive: true });
  document.addEventListener("touchmove", onTouchMove, { passive: true });
  document.addEventListener("touchstart", onTouchMove, { passive: true });

  return () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("touchmove", onTouchMove);
    document.removeEventListener("touchstart", onTouchMove);
  };
}

export function getSceneMobileScale(width = window.innerWidth): number {
  if (width < 480) return 0.45;
  if (width < 768) return 0.6;
  if (width < 1024) return 0.78;
  return 1;
}

export function getSceneCameraDistance(width = window.innerWidth): number {
  if (width < 480) return 18;
  if (width < 768) return 16;
  return 14;
}
