import type { ReactNode } from 'react';
import { PhotoImage } from '@/components/ui/PhotoImage';
import type { Photo } from '@/types/photo';

interface ArtFrameProps {
  photo: Photo;
  sizes?: string;
  priority?: boolean;
  /** Warm picture-light glow above the frame. */
  glow?: boolean;
  className?: string;
  imageClassName?: string;
  /** Rendered over the picture (inside the mat), e.g. hover captions or buttons. */
  children?: ReactNode;
}

/**
 * The gallery's frame: dark moulding, cream mat, the work uncropped. Moulding and mat are
 * proportional to the frame's width, so a frame looks the same at any size — which is
 * what lets a flying copy hand over to a framed card seamlessly.
 */
export function ArtFrame({ photo, sizes, priority, glow = false, className = '', imageClassName = '', children }: ArtFrameProps) {
  return (
    <div className={`relative ${className}`}>
      {glow && (
        <div className="pointer-events-none absolute -inset-x-[20%] -top-[30%] h-[60%] bg-[radial-gradient(ellipse_at_top,rgba(255,210,161,0.22),transparent_70%)]" />
      )}
      <div className="rounded-[2px] bg-[#0e0d0c] p-[2.8%] shadow-[0_30px_60px_-24px_rgba(0,0,0,0.85)] ring-1 ring-white/5">
        <div className="bg-[#d8d1c5] p-[5.5%]">
          <div className="relative overflow-hidden" style={{ aspectRatio: `${photo.width} / ${photo.height}` }}>
            <PhotoImage photo={photo} priority={priority} sizes={sizes} className={imageClassName} />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

interface FramedOnWallProps extends Omit<ArtFrameProps, 'glow'> {
  /** Wall panel width ÷ height. */
  wallAspect: number;
  /** Largest share of the wall (either way) the frame may take. */
  fill?: number;
  /** Attributes for the frame element itself (e.g. a data hook). */
  frameProps?: Record<string, string>;
}

/** A frame hung centred on a small wall panel, sized to fit whatever the work's shape. */
export function FramedOnWall({ photo, wallAspect, fill = 0.76, frameProps, className = '', ...frame }: FramedOnWallProps) {
  const aspect = photo.width / photo.height;
  const width = Math.min(fill, (fill * aspect) / wallAspect) * 100;
  return (
    <div
      className={`relative grid place-items-center overflow-hidden rounded-sm bg-paper-2 ${className}`}
      style={{ aspectRatio: String(wallAspect) }}
    >
      {/* Picture light washing the wall */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-2/3 bg-[radial-gradient(ellipse_at_top,rgba(255,210,161,0.16),transparent_70%)]" />
      <div style={{ width: `${width}%` }} {...frameProps}>
        <ArtFrame photo={photo} {...frame} />
      </div>
    </div>
  );
}
