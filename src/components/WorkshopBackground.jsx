export default function WorkshopBackground() {
  return (
    <div className="workshop-bg pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="workshop-bg-gradient" />
      <div className="workshop-bg-grid" />
      <div className="workshop-orb workshop-orb-1" />
      <div className="workshop-orb workshop-orb-2" />
      <div className="workshop-orb workshop-orb-3" />
      <div className="workshop-sparks">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="workshop-spark" style={{ '--i': i }} />
        ))}
      </div>
      <div className="workshop-bg-vignette" />
      <div className="workshop-bg-noise" />
    </div>
  );
}
