/** Best-effort WebGL probe — still wrap renderer init in try/catch. */
export function isWebGLAvailable(): boolean {
  if (typeof document === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

export function hideWebGLCanvas(canvas: HTMLCanvasElement): void {
  canvas.style.display = "none";
}
