import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { cardImage } from '../utils/theme';

export default function ImageCard({
  image,
  imageIndex,
  children,
  className = '',
  to,
  onClick,
  overlay = 'default',
}) {
  const initial = image || cardImage(imageIndex ?? 0);
  const [src, setSrc] = useState(initial);

  useEffect(() => {
    setSrc(image || cardImage(imageIndex ?? 0));
  }, [image, imageIndex]);

  const classes = `card group relative overflow-hidden ${className}`;

  const overlayClass =
    overlay === 'light'
      ? 'card-image-overlay-light'
      : overlay === 'alert'
        ? 'card-image-overlay-alert'
        : 'card-image-overlay';

  const content = (
    <>
      <img
        src={src}
        alt=""
        className="card-image absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        onError={() => setSrc(cardImage(0))}
        aria-hidden="true"
      />
      <div className={`${overlayClass} absolute inset-0`} aria-hidden="true" />
      <div className="relative z-[1]">{children}</div>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`${classes} block transition hover:border-workshop-accent/50 hover:shadow-glow-lg`}>
        {content}
      </Link>
    );
  }

  return (
    <div
      className={classes}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {content}
    </div>
  );
}
