"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { useIsDark } from "@/components/theme/useIsDark";

type Palette = {
  colors: [string, string, string];
  blending: THREE.Blending;
  waveOpacity: number;
};

// Additive blending glows on dark backgrounds but vanishes on white, so light
// mode uses normal blending with deeper tones.
const DARK: Palette = {
  colors: ["#10b981", "#38bdf8", "#a855f7"],
  blending: THREE.AdditiveBlending,
  waveOpacity: 0.95,
};

const LIGHT: Palette = {
  colors: ["#059669", "#0284c7", "#7c3aed"],
  blending: THREE.NormalBlending,
  waveOpacity: 0.65,
};

// World units the camera descends over a full page scroll.
const SCROLL_DEPTH = 26;

type Input = { px: number; py: number; scroll: number };

function useInput() {
  const input = useRef<Input>({ px: 0, py: 0, scroll: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      input.current.px = (e.clientX / window.innerWidth) * 2 - 1;
      input.current.py = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      input.current.scroll = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    };
    onScroll();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return input;
}

const WAVE_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uHalfWidth;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    float w = sin(p.x * 0.3 + uTime * 0.7) * 0.8
            + sin(p.z * 0.4 + uTime * 0.5) * 0.55
            + sin((p.x + p.z) * 0.17 - uTime * 0.35) * 0.4;
    p.y += w;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (10.0 / -mv.z);
    vColor = aColor;
    // Crests glow brighter; points fade toward the horizon and the side edges.
    float crest = 0.2 + 0.8 * clamp((w + 1.75) / 3.5, 0.0, 1.0);
    float horizon = smoothstep(-42.0, -12.0, mv.z);
    float sides = 1.0 - smoothstep(uHalfWidth * 0.6, uHalfWidth, abs(position.x));
    vAlpha = crest * horizon * sides;
  }
`;

const WAVE_FRAGMENT = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d);
    gl_FragColor = vec4(vColor, a * uOpacity * vAlpha);
    #include <colorspace_fragment>
  }
`;

function ParticleWave({
  cols,
  rows,
  width,
  palette,
  baseY,
}: {
  cols: number;
  rows: number;
  width: number;
  palette: Palette;
  baseY: RefObject<number>;
}) {
  const ref = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const dpr = useThree((state) => state.viewport.dpr);

  const geometry = useMemo(() => {
    const depth = 44;
    const [a, b, c] = palette.colors.map((hex) => new THREE.Color(hex));
    const positions = new Float32Array(cols * rows * 3);
    const colors = new Float32Array(cols * rows * 3);
    const tmp = new THREE.Color();
    let n = 0;
    for (let r = 0; r < rows; r++) {
      for (let q = 0; q < cols; q++) {
        const u = q / (cols - 1);
        positions[n * 3] = (u - 0.5) * width;
        positions[n * 3 + 2] = 6 - (r / (rows - 1)) * depth;
        // Sweep emerald → sky → purple across the width.
        if (u < 0.5) tmp.copy(a).lerp(b, u * 2);
        else tmp.copy(b).lerp(c, (u - 0.5) * 2);
        colors.set([tmp.r, tmp.g, tmp.b], n * 3);
        n++;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [cols, rows, width, palette]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uSize: { value: 1 }, uOpacity: { value: 1 }, uHalfWidth: { value: 30 } }),
    [],
  );

  useFrame((state) => {
    const material = materialRef.current;
    if (material) {
      material.uniforms.uTime.value = state.clock.elapsedTime;
      material.uniforms.uSize.value = 6.5 * dpr;
      material.uniforms.uOpacity.value = palette.waveOpacity;
      material.uniforms.uHalfWidth.value = width / 2;
    }
    // The wave rides along with the camera so it stays a horizon at the bottom of the view.
    if (ref.current) ref.current.position.y = baseY.current - 4.6;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={WAVE_VERTEX}
        fragmentShader={WAVE_FRAGMENT}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={palette.blending}
      />
    </points>
  );
}

function Scene({ isSmall, palette }: { isSmall: boolean; palette: Palette }) {
  const input = useInput();
  const baseY = useRef(0);

  useFrame((state, delta) => {
    const k = 1 - Math.exp(-Math.min(delta, 0.1) * 2.5);
    const { px, py, scroll } = input.current;
    const camera = state.camera;
    baseY.current += (-scroll * SCROLL_DEPTH - baseY.current) * k;
    camera.position.x += (px * 0.9 - camera.position.x) * k;
    camera.position.y += (baseY.current + py * 0.6 - camera.position.y) * k;
    camera.lookAt(0, baseY.current, 0);
  });

  return (
    <ParticleWave
      cols={isSmall ? 90 : 150}
      rows={isSmall ? 50 : 70}
      width={isSmall ? 26 : 60}
      palette={palette}
      baseY={baseY}
    />
  );
}

export function Background3DScene() {
  const isDark = useIsDark();
  const reduceMotion = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [isSmall] = useState(() => window.innerWidth < 768);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-1 transition-opacity duration-1000"
      style={{ opacity: ready ? 1 : 0 }}
    >
      <Canvas
        camera={{ position: [0, 0, 9], fov: 55, near: 0.1, far: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        frameloop={reduceMotion ? "demand" : "always"}
        onCreated={() => setReady(true)}
        fallback={null}
      >
        <Scene isSmall={isSmall} palette={isDark ? DARK : LIGHT} />
      </Canvas>
    </div>
  );
}
