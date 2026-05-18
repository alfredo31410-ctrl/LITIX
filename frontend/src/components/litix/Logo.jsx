export function Logo({ className = "", size = "md", showSubtitle = true }) {
  const sizes = {
    sm: { litix: "text-xl", sub: "text-[9px]" },
    md: { litix: "text-2xl", sub: "text-[10px]" },
    lg: { litix: "text-4xl", sub: "text-xs" },
  };
  const s = sizes[size];
  return (
    <div className={`flex flex-col leading-none ${className}`} data-testid="litix-logo">
      <span className={`${s.litix} font-extrabold tracking-tight text-[#E60000]`}>LITIX</span>
      {showSubtitle && (
        <span className={`${s.sub} font-semibold tracking-[0.25em] text-black uppercase mt-0.5`}>
          Capacitación
        </span>
      )}
    </div>
  );
}
