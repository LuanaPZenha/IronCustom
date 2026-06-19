export default function PageHero({ title, subtitle, image, badge }) {
  return (
    <div className="page-hero group relative mb-6 overflow-hidden rounded-2xl border border-workshop-700/80 shadow-glow">
      <div
        className="page-hero-image absolute inset-0 bg-cover bg-center transition-transform duration-[8000ms] ease-out group-hover:scale-105"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="page-hero-shine absolute inset-0" />
      <div className="relative flex min-h-[140px] flex-col justify-end p-5 sm:min-h-[168px] sm:p-6 md:min-h-[180px]">
        {badge && (
          <span className="mb-2 w-fit rounded-full border border-workshop-accent/40 bg-workshop-accent/10 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-workshop-accent backdrop-blur-sm">
            {badge}
          </span>
        )}
        <h1 className="font-display text-3xl tracking-wide text-white drop-shadow-lg sm:text-4xl">{title}</h1>
        {subtitle && (
          <p className="mt-1 max-w-xl text-sm text-zinc-300 drop-shadow md:text-base">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
