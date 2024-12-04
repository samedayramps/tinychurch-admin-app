'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'

interface MetricsProps {
  data: Array<{
    name: string
    duration: number
    success: boolean
    path: string
    timestamp: string
  }>
}

export function MiddlewareMetrics({ data }: MetricsProps) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Middleware Performance</h2>
      <LineChart width={800} height={400} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="duration" 
          stroke="#8884d8" 
          name="Duration (ms)" 
        />
      </LineChart>
    </div>
  )
} 