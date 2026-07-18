"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  bindPointerParallax,
  getSceneCameraDistance,
  getSceneMobileScale,
} from "@/lib/pointer-parallax";

export default function FuturisticScene3D({
  compact = false,
}: {
  compact?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 768;
    if (!compact && isMobile) {
      canvas.style.display = "none";
      return;
    }

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
    camera.position.set(0, 0, getSceneCameraDistance());

    const group = new THREE.Group();
    scene.add(group);

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(compact ? 1.4 : 2.0, 1),
      new THREE.MeshBasicMaterial({
        color: 0x0ea5a4,
        wireframe: true,
        transparent: true,
        opacity: 0.28,
      }),
    );
    group.add(core);

    const inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(compact ? 1.0 : 1.45, 1),
      new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        wireframe: true,
        transparent: true,
        opacity: 0.4,
      }),
    );
    group.add(inner);

    const particleCount = compact ? 48 : isMobile ? 60 : 90;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const teal = new THREE.Color(0x0ea5a4);
    const indigo = new THREE.Color(0x6366f1);

    for (let i = 0; i < particleCount; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = 2 * Math.PI * Math.random();
      const r = (compact ? 2.2 : 3) + Math.random() * 2;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      const c = teal.clone().lerp(indigo, Math.random());
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const particles = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    group.add(particles);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(compact ? 2.8 : 4.2, 0.012, 8, 100),
      new THREE.MeshBasicMaterial({
        color: 0x0ea5a4,
        transparent: true,
        opacity: 0.28,
      }),
    );
    ring.rotation.x = Math.PI / 2.4;
    group.add(ring);

    scene.add(new THREE.AmbientLight(0x111122, 0.45));
    const pLight = new THREE.PointLight(0x0ea5a4, 0.9, 30);
    pLight.position.set(4, 2, 4);
    scene.add(pLight);

    let targetRX = 0;
    let targetRY = 0;
    const unbindParallax = reduceMotion
      ? () => {}
      : bindPointerParallax((x, y) => {
          targetRY = x * 0.28;
          targetRX = y * 0.16;
        }, { intensity: 0.7 });

    const applyLayout = () => {
      const parent = canvas.parentElement;
      const w = compact
        ? parent?.clientWidth || 360
        : window.innerWidth;
      const h = compact
        ? parent?.clientHeight || 220
        : window.innerHeight;
      camera.aspect = w / Math.max(h, 1);
      camera.position.z = getSceneCameraDistance(w);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      const scale = compact ? 0.85 : getSceneMobileScale(w);
      group.scale.setScalar(scale);
      group.position.x = compact || w < 900 ? 0 : 3.2;
    };

    window.addEventListener("resize", applyLayout);
    applyLayout();

    const clock = new THREE.Clock();
    let frameId = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = reduceMotion ? 0 : clock.getElapsedTime();
      core.rotation.y = t * 0.08;
      inner.rotation.y = -t * 0.11;
      particles.rotation.y = t * 0.03;
      ring.rotation.z = t * 0.06;
      group.rotation.y += (targetRY - group.rotation.y) * 0.04;
      group.rotation.x += (targetRX - group.rotation.x) * 0.04;
      if (!reduceMotion) {
        group.position.y = Math.sin(t * 0.4) * 0.08;
      }
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      unbindParallax();
      window.removeEventListener("resize", applyLayout);
      renderer.dispose();
    };
  }, [compact]);

  return (
    <canvas
      ref={canvasRef}
      className={compact ? "lf-compact-canvas" : "lf-canvas"}
      aria-hidden
    />
  );
}
