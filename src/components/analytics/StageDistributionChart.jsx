"use client";

export default function StageDistributionChart({ distribution = [] }) {
  const maxCount = Math.max(1, ...distribution);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-11 gap-1.5 sm:gap-2 items-end h-44 pt-6 pb-2 px-2 bg-slate-50/70 border border-slate-200/80 rounded-2xl">
        {distribution.map((count, stage) => {
          const heightPct = Math.max(8, Math.round((count / maxCount) * 100));
          const isMastered = stage >= 8;
          const isRetaining = stage >= 4 && stage < 8;

          const barColor = isMastered
            ? "bg-purple-600 hover:bg-purple-500"
            : isRetaining
            ? "bg-brand-600 hover:bg-brand-500"
            : "bg-blue-400 hover:bg-blue-300";

          return (
            <div key={stage} className="flex flex-col items-center gap-1.5 h-full justify-end group">
              <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                {count}
              </span>

              <div
                className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${barColor}`}
                style={{ height: `${heightPct}%` }}
                title={`Stage ${stage}: ${count} note(s)`}
              />

              <span className="text-[10px] font-bold text-slate-500">
                S{stage}
              </span>
            </div>
          );
        })}
      </div>

      {/* Stage Category Legend */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-400" />
          <span>Early Learning (S0–S3)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-brand-600" />
          <span>Intermediate Retaining (S4–S7)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-purple-600" />
          <span>Long-Term Mastered (S8–S10)</span>
        </div>
      </div>
    </div>
  );
}

