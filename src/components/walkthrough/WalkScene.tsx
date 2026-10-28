import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshReflectorMaterial, useCursor, useTexture } from '@react-three/drei';
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  DoubleSide,
  MathUtils,
  Object3D,
  SRGBColorSpace,
  type Group,
  type MeshBasicMaterial,
  type MeshStandardMaterial,
  type PerspectiveCamera,
  type PointLight,
  type SpotLight,
  type Texture,
} from 'three';
import type { MotionValue } from 'framer-motion';
import { photoUrl } from '@/lib/image';
import { CEILING, EYE, FOV, START_Z, VIEW_DIST, WALL_X, fovFor, sampleWalk, type Frame, type WalkLayout } from './layout';

const BG = '#0b0a09';
const WALL = '#1c1a17';
const WARM = '#ffd2a1';

interface WalkSceneProps {
  layout: WalkLayout;
  /** Scroll progress through the hall section, 0–1. */
  progress: MotionValue<number>;
  onFrame: (index: number) => void;
  onReady: () => void;
  /** Reflective floor; turned off on small / touch devices to save GPU. */
  highQuality: boolean;
}

/** Extra look-around from dragging, layered on top of the walk. Mutated without re-renders. */
interface Look {
  yaw: number;
  pitch: number;
  dragging: boolean;
}

type Spawn = (x: number, z: number, heading: number, left: boolean) => void;

export default function WalkScene({ layout, progress, onFrame, onReady, highQuality }: WalkSceneProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const look = useRef<Look>({ yaw: 0, pitch: 0, dragging: false });
  const drag = useRef<{ x: number; y: number } | null>(null);
  const spawnStep = useRef<Spawn | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const endDrag = () => {
    drag.current = null;
    look.current.dragging = false;
  };

  return (
    <div
      ref={wrapRef}
      // Click-and-drag to look around (grab the view). Vertical swipes still scroll on touch.
      className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        drag.current = { x: e.clientX, y: e.clientY };
        look.current.dragging = true;
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        const l = look.current;
        l.yaw = MathUtils.clamp(l.yaw + (e.clientX - d.x) * 0.0045, -1.7, 1.7);
        l.pitch = MathUtils.clamp(l.pitch + (e.clientY - d.y) * 0.003, -0.6, 0.45);
        d.x = e.clientX;
        d.y = e.clientY;
      }}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
    >
      <Canvas
        dpr={highQuality ? [1, 1.5] : [1, 1.25]}
        camera={{ fov: FOV, near: 0.1, far: 40, position: [0, EYE, START_Z] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        frameloop={visible ? 'always' : 'never'}
      >
        <color attach="background" args={[BG]} />
        <fog attach="fog" args={[BG, 6, 24]} />
        <ambientLight intensity={0.35} />
        <ScrollRig layout={layout} progress={progress} look={look} spawnStep={spawnStep} />
        <Hall layout={layout} highQuality={highQuality} />
        <FocusSpot frames={layout.frames} />
        <Footsteps spawnRef={spawnStep} />
        <Suspense fallback={null}>
          <Frames frames={layout.frames} onFrame={onFrame} />
          <Ready onReady={onReady} />
        </Suspense>
      </Canvas>
    </div>
  );
}

/** Length of one step, in world units (≈ metres). */
const STRIDE = 0.62;

/**
 * First-person camera that follows scroll position down the hall, moving like a person:
 * a rhythmic step bob and side-sway while walking, gaze dropping to the floor ahead as
 * you walk and lifting when you stop, footprints left at each step, plus drag-to-look.
 */
function ScrollRig({
  layout,
  progress,
  look,
  spawnStep,
}: {
  layout: WalkLayout;
  progress: MotionValue<number>;
  look: RefObject<Look>;
  spawnStep: RefObject<Spawn | null>;
}) {
  const camera = useThree((s) => s.camera);
  const light = useRef<PointLight>(null);
  const body = useRef({ x: 0, z: START_Z, yaw: 0, pitch: 0 });
  const gait = useRef({ phase: 0, amount: 0, foot: false });

  useEffect(() => {
    camera.rotation.order = 'YXZ';
  }, [camera]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const aspect = state.size.width / Math.max(state.size.height, 1);
    const s = sampleWalk(layout, progress.get(), aspect);
    const cam = camera as PerspectiveCamera;
    if (cam.fov !== fovFor(aspect)) {
      cam.fov = fovFor(aspect);
      cam.updateProjectionMatrix();
    }

    // Body: where you are and which way you face, eased toward the scroll pose.
    const b = body.current;
    const px = b.x;
    const pz = b.z;
    b.x = MathUtils.damp(b.x, s.x, 2.6, dt);
    b.z = MathUtils.damp(b.z, s.z, 3, dt);
    b.yaw = MathUtils.damp(b.yaw, s.yaw, 2.6, dt);
    b.pitch = MathUtils.damp(b.pitch, s.pitch, 2.6, dt);

    // Gait: one half-cycle of the bob per step; a footprint each time a foot lands.
    const moved = Math.hypot(b.x - px, b.z - pz);
    const g = gait.current;
    const before = Math.floor(g.phase / Math.PI);
    g.phase += (moved / STRIDE) * Math.PI;
    g.amount = MathUtils.damp(g.amount, Math.min(moved / dt / 1.4, 1), 4, dt);
    if (Math.floor(g.phase / Math.PI) !== before && g.amount > 0.2 && moved > 1e-4) {
      g.foot = !g.foot;
      const dx = (b.x - px) / moved;
      const dz = (b.z - pz) / moved;
      // Next footfall: ahead on the path, offset to the left or right foot.
      const side = g.foot ? -1 : 1;
      spawnStep.current?.(b.x + dx * 2 - dz * 0.13 * side, b.z + dz * 2 + dx * 0.13 * side, Math.atan2(-dx, -dz), g.foot);
    }

    const bob = (Math.abs(Math.sin(g.phase)) - 0.5) * 0.05 * g.amount;
    const sway = Math.sin(g.phase) * 0.022 * g.amount;

    // Drag-to-look relaxes back to the path once you start walking again.
    const l = look.current;
    if (!l.dragging && g.amount > 0.25) {
      l.yaw = MathUtils.damp(l.yaw, 0, 1.8, dt);
      l.pitch = MathUtils.damp(l.pitch, 0, 1.8, dt);
    }
    const hoverYaw = l.dragging ? 0 : -state.pointer.x * 0.05;
    const hoverPitch = l.dragging ? 0 : state.pointer.y * 0.03;

    const yaw = b.yaw + l.yaw + hoverYaw;
    // Walkers glance down at the floor ahead; standing still, the gaze lifts to the work.
    const pitch = b.pitch + l.pitch + hoverPitch - 0.3 * g.amount;

    // Sway is sideways relative to where you're facing.
    camera.position.set(b.x + Math.cos(yaw) * sway, EYE + bob, b.z - Math.sin(yaw) * sway);
    camera.rotation.set(pitch, yaw, Math.sin(g.phase) * 0.01 * g.amount);
    light.current?.position.set(b.x, 3.1, b.z - 1.8);
  });

  return <pointLight ref={light} color={WARM} intensity={9} distance={14} decay={2} />;
}

const STEP_LIFE = 2.2;
const STEP_COUNT = 10;

/** Soft footprints that appear where each step lands, then fade. */
function Footsteps({ spawnRef }: { spawnRef: RefObject<Spawn | null> }) {
  const groups = useRef<(Group | null)[]>([]);
  const mats = useRef<(MeshBasicMaterial | null)[]>([]);
  const born = useRef<number[]>(Array(STEP_COUNT).fill(-Infinity));
  const next = useRef(0);
  const clock = useThree((s) => s.clock);

  useEffect(() => {
    spawnRef.current = (x, z, heading, left) => {
      const i = next.current;
      next.current = (i + 1) % STEP_COUNT;
      const g = groups.current[i];
      if (!g) return;
      g.position.set(x, 0.012, z);
      g.rotation.y = heading;
      g.scale.x = left ? -1 : 1;
      born.current[i] = clock.elapsedTime;
    };
    return () => {
      spawnRef.current = null;
    };
  }, [spawnRef, clock]);

  useFrame(() => {
    const now = clock.elapsedTime;
    for (let i = 0; i < STEP_COUNT; i++) {
      const m = mats.current[i];
      if (!m) continue;
      const age = now - born.current[i];
      m.opacity = age < 0 || age > STEP_LIFE ? 0 : Math.min(age / 0.15, 1) * (1 - age / STEP_LIFE) * 0.32;
    }
  });

  return (
    <>
      {Array.from({ length: STEP_COUNT }, (_, i) => (
        <group key={i} ref={(g) => void (groups.current[i] = g)}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
            <planeGeometry args={[0.16, 0.34]} />
            <meshBasicMaterial
              ref={(m) => void (mats.current[i] = m)}
              map={footprintTexture()}
              color={WARM}
              transparent
              opacity={0}
              blending={AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Hall({ layout, highQuality }: { layout: WalkLayout; highQuality: boolean }) {
  const near = START_Z + 3;
  const length = near - layout.endWallZ;
  const cz = (near + layout.endWallZ) / 2;
  const width = WALL_X * 2;

  return (
    <group>
      {/* Walls */}
      <mesh position={[-WALL_X, CEILING / 2, cz]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[length, CEILING]} />
        <meshStandardMaterial color={WALL} roughness={0.95} />
      </mesh>
      <mesh position={[WALL_X, CEILING / 2, cz]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[length, CEILING]} />
        <meshStandardMaterial color={WALL} roughness={0.95} />
      </mesh>
      <mesh position={[0, CEILING / 2, layout.endWallZ]}>
        <planeGeometry args={[width, CEILING]} />
        <meshStandardMaterial color={WALL} roughness={0.95} />
      </mesh>

      {/* Ceiling with a recessed light strip */}
      <mesh position={[0, CEILING, cz]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color="#0d0c0b" roughness={1} />
      </mesh>
      <mesh position={[0, CEILING - 0.01, cz]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.07, length]} />
        <meshBasicMaterial color={WARM} toneMapped={false} />
      </mesh>

      {/* Floor */}
      <mesh position={[0, 0, cz]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, length]} />
        {highQuality ? (
          <MeshReflectorMaterial
            resolution={512}
            blur={[300, 80]}
            mixBlur={1}
            mixStrength={18}
            mirror={0.6}
            depthScale={1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            roughness={0.9}
            metalness={0.4}
            color="#0f0e0c"
          />
        ) : (
          <meshStandardMaterial color="#121110" roughness={0.6} metalness={0.3} />
        )}
      </mesh>

      {/* Skirting light lines where the walls meet the floor */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (WALL_X - 0.02), 0.03, cz]}>
          <boxGeometry args={[0.02, 0.02, length]} />
          <meshBasicMaterial color={WARM} toneMapped={false} transparent opacity={0.45} />
        </mesh>
      ))}

      {/* Soft pool of light on the end wall */}
      <mesh position={[0, CEILING / 2 + 0.2, layout.endWallZ + 0.01]}>
        <planeGeometry args={[4.5, 4]} />
        <meshBasicMaterial map={washTexture()} color={WARM} transparent opacity={0.3} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Frames({ frames, onFrame }: { frames: Frame[]; onFrame: (i: number) => void }) {
  const textures = useTexture(
    frames.map((f) => photoUrl(f.photo, 800, 75)),
    (loaded) => {
      (Array.isArray(loaded) ? loaded : [loaded]).forEach((t) => {
        t.colorSpace = SRGBColorSpace;
        t.anisotropy = 4;
      });
    },
  );

  return (
    <>
      {frames.map((frame, i) => (
        <HangingFrame
          key={frame.photo.id}
          frame={frame}
          texture={textures[i]}
          onClick={() => onFrame(i)}
        />
      ))}
    </>
  );
}

/** 0 → 1 as the visitor arrives in front of a frame; drives its focus light. */
function focusFor(frame: Frame, cameraZ: number) {
  const d = cameraZ - (frame.z + VIEW_DIST);
  return Math.exp(-(d * d) / FOCUS_SPREAD);
}

/** How quickly the focus light rises / falls as you walk (larger = quicker). */
const FOCUS_SPEED = 4;
/** Width of the focus falloff along the hall (in world units², ≈ 2σ²). */
const FOCUS_SPREAD = 2.6;
const DIM = 0.58;
const MAT_COLOR = new Color('#d8d1c5');

function HangingFrame({
  frame,
  texture,
  onClick,
}: {
  frame: Frame;
  texture: Texture;
  onClick: () => void;
}) {
  const art = useRef<Group>(null);
  const photoMat = useRef<MeshBasicMaterial>(null);
  const matMat = useRef<MeshBasicMaterial>(null);
  const washMat = useRef<MeshBasicMaterial>(null);
  const beamMat = useRef<MeshBasicMaterial>(null);
  const poolMat = useRef<MeshBasicMaterial>(null);
  const lampMat = useRef<MeshStandardMaterial>(null);
  const focus = useRef(0);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const f = (focus.current = MathUtils.damp(focus.current, focusFor(frame, state.camera.position.z), FOCUS_SPEED, dt));

    // The work you're facing comes up to full brightness; the rest wait in half-light.
    photoMat.current?.color.setScalar(DIM + (1 - DIM) * f);
    matMat.current?.color.copy(MAT_COLOR).multiplyScalar(DIM + 0.05 + (0.95 - DIM) * f);
    if (washMat.current) washMat.current.opacity = 0.2 + 0.5 * f;
    if (beamMat.current) beamMat.current.opacity = 0.2 * f;
    if (poolMat.current) poolMat.current.opacity = 0.35 * f;
    if (lampMat.current) lampMat.current.emissiveIntensity = 0.25 + 2.2 * f;

    const g = art.current;
    if (g) {
      g.scale.setScalar(MathUtils.damp(g.scale.x, hovered ? 1.03 : 1, 6, dt));
      g.position.z = MathUtils.damp(g.position.z, hovered ? 0.06 : 0, 6, dt);
    }
  });

  const { w, h, side, z } = frame;
  const border = 0.17;
  const mat = 0.11;
  const lampY = h / 2 + border + 0.32;

  return (
    <group position={[side * (WALL_X - 0.04), EYE + 0.05, z]} rotation={[0, side === -1 ? Math.PI / 2 : -Math.PI / 2, 0]}>
      {/* Light wash on the wall, brightest just above the frame */}
      <mesh position={[0, 0.3, -0.03]}>
        <planeGeometry args={[w + 2.2, h + 2.4]} />
        <meshBasicMaterial
          ref={washMat}
          map={washTexture()}
          color={WARM}
          transparent
          opacity={0.2}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Picture lamp */}
      <mesh position={[0, lampY, 0.16]}>
        <boxGeometry args={[Math.min(w * 0.45, 0.8), 0.045, 0.07]} />
        <meshStandardMaterial ref={lampMat} color="#141210" emissive={WARM} emissiveIntensity={0.25} />
      </mesh>

      {/* Beam: a soft cone from the lamp down over the work (fades in with focus) */}
      <mesh position={[0, (lampY - h * 0.35) / 2, 0.34]} raycast={() => null}>
        <coneGeometry args={[Math.max(w, h) * 0.62, lampY + h * 0.35, 40, 1, true]} />
        <meshBasicMaterial
          ref={beamMat}
          color={WARM}
          alphaMap={beamTexture()}
          transparent
          opacity={0}
          side={DoubleSide}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Pool of light on the floor in front of the work */}
      <mesh position={[0, -(EYE + 0.05) + 0.015, 1]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <planeGeometry args={[w + 1.6, 2.2]} />
        <meshBasicMaterial
          ref={poolMat}
          map={washTexture()}
          color={WARM}
          transparent
          opacity={0}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <group
        ref={art}
        onClick={(e) => {
          e.stopPropagation();
          if (e.delta > 6) return;
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <mesh position={[0, 0, 0.03]}>
          <boxGeometry args={[w + border * 2, h + border * 2, 0.06]} />
          <meshStandardMaterial color="#0e0d0c" roughness={0.45} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.061]}>
          <planeGeometry args={[w + mat * 2, h + mat * 2]} />
          <meshBasicMaterial ref={matMat} color="#d8d1c5" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0.063]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial ref={photoMat} map={texture} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * One real spotlight that glides to whichever frame you're approaching and fades up as
 * you arrive, so the frame, wall and reflective floor are genuinely lit.
 */
function FocusSpot({ frames }: { frames: Frame[] }) {
  const light = useRef<SpotLight>(null);
  const target = useMemo(() => new Object3D(), []);
  const intensity = useRef(0);

  useEffect(() => {
    if (light.current) light.current.target = target;
  }, [target]);

  useFrame((state, delta) => {
    const l = light.current;
    if (!l || frames.length === 0) return;
    const dt = Math.min(delta, 0.1);
    let best = frames[0];
    let bestF = 0;
    for (const fr of frames) {
      const f = focusFor(fr, state.camera.position.z);
      if (f > bestF) {
        bestF = f;
        best = fr;
      }
    }
    // Hang the light out from the wall, above and in front of the frame, aimed at its centre.
    const wallX = best.side * (WALL_X - 0.05);
    const pos = { x: best.side * (WALL_X - 1.3), y: EYE + 0.05 + best.h / 2 + 1.5, z: best.z };
    l.position.set(MathUtils.damp(l.position.x, pos.x, 5, dt), MathUtils.damp(l.position.y, pos.y, 5, dt), MathUtils.damp(l.position.z, pos.z, 5, dt));
    target.position.set(wallX, EYE + 0.05, MathUtils.damp(target.position.z, best.z, 5, dt));
    target.updateMatrixWorld();
    intensity.current = MathUtils.damp(intensity.current, bestF, FOCUS_SPEED, dt);
    l.intensity = 38 * intensity.current;
  });

  return (
    <>
      <spotLight ref={light} color={WARM} angle={0.5} penumbra={0.75} distance={7} decay={2} intensity={0} />
      <primitive object={target} />
    </>
  );
}

let wash: CanvasTexture | undefined;

/** Soft radial gradient used to fake picture-light spill without real spotlights. */
function washTexture() {
  if (wash) return wash;
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size * 0.32, 0, size / 2, size * 0.42, size * 0.5);
  g.addColorStop(0, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.28)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  wash = new CanvasTexture(canvas);
  return wash;
}

let footprint: CanvasTexture | undefined;

/** A soft right-foot print (forefoot + heel); left feet are mirrored. Toes point up the texture. */
function footprintTexture() {
  if (footprint) return footprint;
  const W = 64;
  const H = 136;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const blob = (cx: number, cy: number, rx: number, ry: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(rx, ry);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, 'rgba(255,255,255,0.95)');
    g.addColorStop(0.7, 'rgba(255,255,255,0.5)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  blob(W * 0.46, H * 0.3, W * 0.36, H * 0.24); // ball of the foot, leaning to the big toe
  blob(W * 0.52, H * 0.8, W * 0.27, H * 0.14); // heel
  footprint = new CanvasTexture(canvas);
  return footprint;
}

let beam: CanvasTexture | undefined;

/** Vertical fade for the light beam: bright at the lamp, gone by the floor. */
function beamTexture() {
  if (beam) return beam;
  const canvas = document.createElement('canvas');
  canvas.width = 4;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  // Canvas top maps to the cone's apex (the lamp).
  const g = ctx.createLinearGradient(0, 0, 0, 128);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.35, '#7a7a7a');
  g.addColorStop(1, '#000000');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 4, 128);
  beam = new CanvasTexture(canvas);
  return beam;
}

function Ready({ onReady }: { onReady: () => void }) {
  useEffect(() => onReady(), [onReady]);
  return null;
}
