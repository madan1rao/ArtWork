import type { Photo } from '@/types/photo';

/** Corridor half-width: walls sit at x = ±WALL_X. */
export const WALL_X = 3;
/** Camera / frame-centre height. */
export const EYE = 1.6;
export const CEILING = 4;
/** Z where the visitor starts, looking down -z. */
export const START_Z = 6;

const FIRST_Z = -4;
/** Distance along the hall between consecutive frames (they alternate walls). */
const STEP = 3.2;
/** How far before a frame (along the hall) the visitor stands to look at it. */
export const VIEW_DIST = 0.5;
/** Camera vertical field of view, in degrees (wider on portrait screens so whole works fit). */
export const FOV = 55;
export const fovFor = (aspect: number) => (aspect < 1 ? 68 : FOV);
const MAX_H = 1.7;
const MAX_W = 2.4;

export interface Frame {
  photo: Photo;
  /** -1 = left wall, 1 = right wall. */
  side: -1 | 1;
  z: number;
  w: number;
  h: number;
}

export interface WalkLayout {
  frames: Frame[];
  /** Camera z at each pause: entrance, one per frame, then the end wall. */
  stops: number[];
  endWallZ: number;
}

export function buildLayout(photos: Photo[]): WalkLayout {
  const frames: Frame[] = photos.map((photo, i) => {
    const aspect = photo.width / photo.height;
    let h = MAX_H;
    let w = h * aspect;
    if (w > MAX_W) {
      w = MAX_W;
      h = w / aspect;
    }
    return { photo, side: i % 2 === 0 ? -1 : 1, z: FIRST_Z - i * STEP, w, h };
  });
  const lastZ = frames.length ? frames[frames.length - 1].z : FIRST_Z;
  return {
    frames,
    stops: [START_Z, ...frames.map((f) => f.z + VIEW_DIST), lastZ - 2],
    endWallZ: lastZ - 5.5,
  };
}

export interface Pose {
  x: number;
  z: number;
  /** Turn left (+) / right (−) from looking down the hall. */
  yaw: number;
  /** Look up (+) / down (−). */
  pitch: number;
}

export interface WalkSample extends Pose {
  /** Index of the frame the visitor is standing at, or -1 between frames. */
  active: number;
  /** Nearest stop (0 = entrance, last = end wall). */
  stop: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
const smooth = (a: number, b: number, t: number) => {
  const x = clamp((t - a) / (b - a), 0, 1);
  return x * x * (3 - 2 * x);
};
const lerpAngle = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Where to stand to look at a frame: square-on, far enough back that the whole work
 * fits, and composed so the on-screen wall label doesn't cover it — on wide screens the
 * work sits toward the wall it hangs on and the label takes the other side (left-wall
 * works sit left with the label on the right, and vice versa); on tall screens the work
 * sits in the upper half with the label below.
 */
export function framePose(frame: Frame, aspect: number): Pose {
  const tanV = Math.tan((fovFor(aspect) * Math.PI) / 360);
  const portrait = aspect < 1;
  const fitH = portrait ? 0.42 : 0.6;
  const fitW = portrait ? 0.84 : 0.5;
  // Frame plus moulding, and a little headroom for the picture lamp.
  const fw = frame.w + 0.34;
  const fh = frame.h + 0.75;
  const dist = clamp(Math.max(fh / (fitH * 2 * tanV), fw / (fitW * 2 * tanV * aspect)), 2.2, 2 * WALL_X - 0.6);
  const across = Math.sqrt(Math.max(dist * dist - VIEW_DIST * VIEW_DIST, 0.01));

  const x = frame.side * (WALL_X - across);
  const z = frame.z + VIEW_DIST;
  // Face the frame's centre…
  let yaw = Math.atan2(-frame.side * across, VIEW_DIST);
  let pitch = 0;
  // …then nudge the view so the work sits clear of the label.
  if (portrait) pitch = -Math.atan(0.26 * tanV);
  else yaw += frame.side * Math.atan(0.16 * tanV * aspect);
  return { x, z, yaw, pitch };
}

/**
 * Maps scroll progress (0–1) to a camera pose. At each stop you face a work square-on;
 * between stops you turn back to look down the hall, walk, then turn to the next one.
 * Movement eases into each stop so the walk lingers in front of every work.
 */
export function sampleWalk(layout: WalkLayout, progress: number, aspect = 16 / 9): WalkSample {
  const { frames, stops } = layout;
  const segments = stops.length - 1;
  const t = clamp(progress, 0, 1) * segments;
  const k = Math.min(Math.floor(t), segments - 1);
  const f = t - k;

  const poseAt = (i: number): Pose =>
    i === 0 || i === segments ? { x: 0, z: stops[i], yaw: 0, pitch: 0 } : framePose(frames[i - 1], aspect);
  const a = poseAt(k);
  const b = poseAt(k + 1);

  const eased = 0.2 * f + 0.8 * f * f * (3 - 2 * f);
  // Turns finish well before you stop, so a resting view is always square-on.
  const leaving = smooth(0.05, 0.4, f);
  const arriving = smooth(0.55, 0.88, f);

  const stop = Math.round(t);
  const nearest = stop - 1;
  const active = nearest >= 0 && nearest < frames.length && Math.abs(t - stop) < 0.14 ? nearest : -1;

  return {
    x: a.x + (b.x - a.x) * eased,
    z: a.z + (b.z - a.z) * eased,
    yaw: f < 0.5 ? lerpAngle(a.yaw, 0, leaving) : lerpAngle(0, b.yaw, arriving),
    pitch: f < 0.5 ? lerpAngle(a.pitch, 0, leaving) : lerpAngle(0, b.pitch, arriving),
    active,
    stop,
  };
}
