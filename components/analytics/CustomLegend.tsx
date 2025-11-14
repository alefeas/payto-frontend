interface LegendEntry {
  value: string
  color: string
  payload?: {
    strokeDasharray?: string
  }
}

interface CustomLegendProps {
  payload: LegendEntry[]
}

export function CustomLegend({ payload }: CustomLegendProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:gap-4 pt-3 px-2">
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center gap-1 sm:gap-1.5">
          {entry.payload?.strokeDasharray ? (
            <svg width="16" height="4" className="sm:w-5 lg:w-6">
              <line
                x1="0"
                y1="2"
                x2="16"
                y2="2"
                stroke={entry.color}
                strokeWidth="2"
                strokeDasharray={entry.payload.strokeDasharray}
              />
            </svg>
          ) : (
            <div 
              className="w-3 h-0.5 sm:w-4 sm:h-0.5 lg:w-5 lg:h-1" 
              style={{ backgroundColor: entry.color }}
            />
          )}
          <span className="text-[9px] sm:text-[10px] lg:text-xs text-gray-600 whitespace-nowrap">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}
