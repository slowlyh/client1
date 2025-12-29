import { ReactNode } from 'react'

interface StatsCardProps {
  icon: ReactNode
  label: string
  value: string
}

export default function StatsCard({ icon, label, value }: StatsCardProps) {
  return (
    <div className="bg-card/40 border border-white/10 dark:border-white/5 p-6 rounded-xl flex items-center gap-4">
      {/* Icon */}
      <div className="text-foreground">
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
          {label}
        </p>
        <p className="text-xl md:text-2xl font-bold text-foreground">
          {value}
        </p>
      </div>
    </div>
  )
}
