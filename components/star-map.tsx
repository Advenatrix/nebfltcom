'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StarSystem {
  id: number
  name: string
  x: number
  y: number
  star_type: string
  star_color: string
  description: string
}

interface Gate {
  id: number
  system_a_id: number
  system_b_id: number
  system_a_name: string
  system_a_x: number
  system_a_y: number
  system_b_name: string
  system_b_x: number
  system_b_y: number
}

interface StarMapProps {
  onSystemSelect: (system: StarSystem) => void
  selectedSystemId?: number
}

export function StarMap({ onSystemSelect, selectedSystemId }: StarMapProps) {
  const [starSystems, setStarSystems] = useState<StarSystem[]>([])
  const [gates, setGates] = useState<Gate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [systemsRes, gatesRes] = await Promise.all([
          fetch('/api/star-systems'),
          fetch('/api/gates')
        ])

        if (systemsRes.ok && gatesRes.ok) {
          const systems = await systemsRes.json()
          const gatesData = await gatesRes.json()
          setStarSystems(systems)
          setGates(gatesData)
        } else {
          console.error('API error:', systemsRes.status, gatesRes.status)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Galaxy Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="text-lg">Loading galaxy map...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (starSystems.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Galaxy Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center space-y-2">
              <div className="text-2xl">🚀</div>
              <div className="text-lg font-medium">Database Not Connected</div>
              <div className="text-sm text-muted-foreground max-w-md">
                Please set up your Neon database and run the migration scripts.
                Check the README for setup instructions.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate bounds for scaling
  const minX = Math.min(...starSystems.map(s => s.x))
  const maxX = Math.max(...starSystems.map(s => s.x))
  const minY = Math.min(...starSystems.map(s => s.y))
  const maxY = Math.max(...starSystems.map(s => s.y))

  const padding = 100
  const width = maxX - minX + padding * 2
  const height = maxY - minY + padding * 2

  // Scale coordinates to fit the view
  const scaleX = (coord: number) => ((coord - minX + padding) / width) * 100
  const scaleY = (coord: number) => ((coord - minY + padding) / height) * 100

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Galaxy Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative bg-slate-900 rounded-lg overflow-hidden" style={{ height: '600px' }}>
          <svg className="absolute inset-0 w-full h-full">
            {/* Draw gates first (behind systems) */}
            {gates.map((gate) => (
              <line
                key={gate.id}
                x1={`${scaleX(gate.system_a_x)}%`}
                y1={`${scaleY(gate.system_a_y)}%`}
                x2={`${scaleX(gate.system_b_x)}%`}
                y2={`${scaleY(gate.system_b_y)}%`}
                stroke="#60a5fa"
                strokeWidth="2"
                opacity="0.6"
              />
            ))}

            {/* Draw star systems */}
            {starSystems.map((system) => (
              <g key={system.id}>
                {/* Gate connection points */}
                <circle
                  cx={`${scaleX(system.x)}%`}
                  cy={`${scaleY(system.y)}%`}
                  r="4"
                  fill="#60a5fa"
                  opacity="0.8"
                />

                {/* Star system */}
                <circle
                  cx={`${scaleX(system.x)}%`}
                  cy={`${scaleY(system.y)}%`}
                  r={selectedSystemId === system.id ? "12" : "8"}
                  fill={system.star_color}
                  stroke={selectedSystemId === system.id ? "#fbbf24" : "#ffffff"}
                  strokeWidth={selectedSystemId === system.id ? "3" : "2"}
                  className="cursor-pointer hover:r-10 transition-all duration-200"
                  onClick={() => onSystemSelect(system)}
                />

                {/* System label */}
                <text
                  x={`${scaleX(system.x)}%`}
                  y={`${scaleY(system.y) - 3}%`}
                  textAnchor="middle"
                  className="text-xs fill-white font-medium pointer-events-none"
                  style={{ fontSize: '10px' }}
                >
                  {system.name}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Click on a star system to view its planets and orbital paths
        </div>
      </CardContent>
    </Card>
  )
}