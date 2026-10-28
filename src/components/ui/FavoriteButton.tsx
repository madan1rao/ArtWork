import { motion, useReducedMotion } from 'framer-motion';
import { useFavorites } from '@/context/FavoritesContext';
import { HeartIcon } from './Icons';

interface FavoriteButtonProps {
  photoId: string;
  title: string;
  variant?: 'overlay' | 'dark';
  className?: string;
}

export function FavoriteButton({ photoId, title, variant = 'overlay', className = '' }: FavoriteButtonProps) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(photoId);
  const reduce = useReducedMotion();

  const base =
    variant === 'overlay'
      ? 'bg-black/45 text-white backdrop-blur-md hover:bg-black/70'
      : 'bg-white/10 text-white hover:bg-white/20';

  return (
    <motion.button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggle(photoId);
      }}
      whileTap={reduce ? undefined : { scale: 0.86 }}
      aria-pressed={active}
      aria-label={active ? `Remove ${title} from favorites` : `Add ${title} to favorites`}
      className={`grid size-10 place-items-center rounded-full transition-colors ${base} ${className}`}
    >
      <motion.span
        key={String(active)}
        initial={reduce ? false : { scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 18 }}
        className={active ? 'text-[#f97362]' : ''}
      >
        <HeartIcon size={18} filled={active} />
      </motion.span>
    </motion.button>
  );
}
