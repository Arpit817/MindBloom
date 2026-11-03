"use client";

import { useState } from "react";

const LEVEL_COLORS = [
  "bg-slate-100 border-slate-200/60",          // Level 0: 0 activities
  "bg-emerald-200 border-emerald-300",         // Level 1: 1-2 activities
  "bg-emerald-400 border-emerald-500",         // Level 2: 3-5 activities
  "bg-emerald-600 border-emerald-700",         // Level 3: 6-9 activities
  "bg-emerald-800 border-emerald-900",         // Level 4: 10+ activities
];

export default function HeatmapGrid({ heatmap = [] }) {
  const [hoveredDay, setHoveredDay] = useState(null);

  if (heatmap.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        No activity history recorded yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Tooltip info */}
      <div className="h-5 flex items-center justify-between text-xs">
        {hoveredDay ? (
          <span className="font-semibold text-slate-700 animate-fade-in">
            📅 {hoveredDay.date}:{" "}
            <span className="text-emerald-600 font-bold">
              {hoveredDay.count} stud{hoveredDay.count === 1 ? "y activity" : "y activities"}
            </span>
          </span>
        ) : (
          <span className="text-slate-400">Hover over any day to see study activity details.</span>
        )}

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span>Less</span>
          {LEVEL_COLORS.map((colorClass, idx) => (
            <span
              key={idx}
              className={`w-2.5 h-2.5 rounded-sm border ${colorClass}`}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Grid */}
      <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 overflow-x-auto">
        <div className="flex flex-wrap gap-1.5 min-w-[500px]">
          {heatmap.map((day) => {
            const colorClass = LEVEL_COLORS[day.level] || LEVEL_COLORS[0];
            return (
              <div
                key={day.date}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
                className={`w-4 h-4 rounded-sm border transition-all cursor-pointer hover:scale-125 ${colorClass}`}
                title={`${day.date}: ${day.count} activities`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

