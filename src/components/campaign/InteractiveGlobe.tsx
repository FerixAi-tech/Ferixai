"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import createGlobe, { type Marker } from "cobe";
import {
  GLOBE_MARKERS,
  MARKER_GLOW_COLOR,
} from "@/lib/constants/globe-markers";
import { hideWebGLCanvas, isWebGLAvailable } from "@/lib/webgl/safe-init";

function pulsingMarkers(timeSec: number): Marker[] {
  return GLOBE_MARKERS.map((marker, index) => ({
    id: marker.id,
    location: marker.location,
    size: marker.baseSize + Math.sin(timeSec * 2.4 + index * 0.85) * 0.016,
    color: MARKER_GLOW_COLOR,
  }));
}

function getGlobeQuality(width: number) {
  const isMobile = width < 640;
  return {
    devicePixelRatio: Math.min(
      typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
      isMobile ? 1.25 : 2,
    ),
    mapSamples: isMobile ? 7000 : 14000,
  };
}

function markerLabelStyle(markerId: string): CSSProperties {
  return {
    positionAnchor: `--cobe-${markerId}`,
    opacity: `var(--cobe-visible-${markerId}, 0)`,
    filter: `blur(calc((1 - var(--cobe-visible-${markerId}, 0)) * 6px))`,
  } as CSSProperties;
}

export default function InteractiveGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const phiRef = useRef(2.8);
  const thetaRef = useRef(0.28);
  const pointerInteracting = useRef<number | null>(null);
  const pointerMovement = useRef(0);
  const sizeRef = useRef({ width: 0, dpr: 1, mapSamples: 14000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    if (!isWebGLAvailable()) {
      hideWebGLCanvas(canvas);
      return;
    }

    let globe: ReturnType<typeof createGlobe> | null = null;
    let frameId = 0;
    let destroyed = false;
    let webglFailed = false;

    const syncDimensions = () => {
      const layoutWidth = Math.max(240, Math.round(wrapper.clientWidth));
      const quality = getGlobeQuality(layoutWidth);
      sizeRef.current = {
        width: layoutWidth,
        dpr: quality.devicePixelRatio,
        mapSamples: quality.mapSamples,
      };
      return layoutWidth * quality.devicePixelRatio;
    };

    const createOrResizeGlobe = () => {
      if (webglFailed) return;

      try {
        const pixelSize = syncDimensions();
        const { dpr, mapSamples } = sizeRef.current;

        if (!globe) {
          globe = createGlobe(canvas, {
            devicePixelRatio: dpr,
            width: pixelSize,
            height: pixelSize,
            phi: phiRef.current,
            theta: thetaRef.current,
            dark: 1,
            diffuse: 1.15,
            mapSamples,
            mapBrightness: 6.5,
            mapBaseBrightness: 0.08,
            baseColor: [0.08, 0.12, 0.16],
            markerColor: MARKER_GLOW_COLOR,
            glowColor: [0.12, 0.42, 0.32],
            markerElevation: 0.06,
            markers: pulsingMarkers(0),
          });
          return;
        }

        globe.update({
          width: pixelSize,
          height: pixelSize,
          mapSamples,
        });
      } catch {
        webglFailed = true;
        hideWebGLCanvas(canvas);
        globe?.destroy();
        globe = null;
      }
    };

    createOrResizeGlobe();
    if (webglFailed) return;

    const render = (time: number) => {
      if (destroyed || !globe || webglFailed) return;

      try {
        if (pointerInteracting.current === null) {
          phiRef.current += 0.0035;
        }

        const pixelSize = sizeRef.current.width * sizeRef.current.dpr;
        globe.update({
          width: pixelSize,
          height: pixelSize,
          phi: phiRef.current + pointerMovement.current,
          theta: thetaRef.current,
          markers: pulsingMarkers(time / 1000),
        });
      } catch {
        webglFailed = true;
        hideWebGLCanvas(canvas);
        globe?.destroy();
        globe = null;
        return;
      }

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);

    const resizeObserver = new ResizeObserver(() => {
      createOrResizeGlobe();
    });
    resizeObserver.observe(wrapper);

    const onPointerDown = (event: PointerEvent) => {
      pointerInteracting.current = event.clientX;
      pointerMovement.current = 0;
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = "grabbing";
    };

    const onPointerUp = (event: PointerEvent) => {
      pointerInteracting.current = null;
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
      canvas.style.cursor = "grab";
    };

    const onPointerMove = (event: PointerEvent) => {
      if (pointerInteracting.current === null) return;
      const delta = event.clientX - pointerInteracting.current;
      pointerMovement.current += delta * 0.004;
      pointerInteracting.current = event.clientX;

      if (Math.abs(event.movementY) > 0.5) {
        thetaRef.current = Math.max(
          0.12,
          Math.min(0.55, thetaRef.current + event.movementY * 0.0025),
        );
      }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerUp);
    canvas.addEventListener("pointermove", onPointerMove);

    return () => {
      destroyed = true;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerUp);
      canvas.removeEventListener("pointermove", onPointerMove);
      globe?.destroy();
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative mx-auto aspect-square w-full max-w-[min(100%,520px)] touch-none select-none"
    >
      <div
        className="pointer-events-none absolute inset-[8%] rounded-full bg-emerald-500/10 blur-3xl"
        aria-hidden
      />
      <canvas
        ref={canvasRef}
        className="relative z-10 h-full w-full cursor-grab active:cursor-grabbing"
        aria-label="Interactive 3D globe showing FerixAI active regions in the United Arab Emirates, Turkey, United States, Canada, and Australia"
      />

      {GLOBE_MARKERS.map((marker) => (
        <span
          key={marker.id}
          className="globe-marker-label"
          style={markerLabelStyle(marker.id)}
        >
          <span className="sm:hidden">{marker.shortLabel}</span>
          <span className="hidden sm:inline">{marker.label}</span>
        </span>
      ))}
    </div>
  );
}
