'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

interface AnalyticsChartProps {
  data: Array<{ date: string; clicks: number }>
}

const chartConfig = {
  clicks: {
    label: "Clicks",
    color: "hsl(var(--foreground))",
  },
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  if (data.every(d => d.clicks === 0)) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No click data yet. Start sharing your links!
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="date" 
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => {
              const date = new Date(value)
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            }}
            className="text-xs fill-muted-foreground"
          />
          <YAxis 
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            className="text-xs fill-muted-foreground"
          />
          <Tooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="clicks"
            stroke="hsl(var(--foreground))"
            fillOpacity={1}
            fill="url(#colorClicks)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
