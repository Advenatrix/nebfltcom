'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Planet {
  id: number
  name: string
  orbit_radius: number
  orbit_period_days: number
  orbit_phase: number
  radius_km: number
  planet_type: string
  color: string
}

interface StarSystem {
  id: number
  name: string
  x: number
  y: number
  star_type: string
  star_color: string
  description: string
}

interface SystemDetailProps {
  system: StarSystem
}

export function SystemDetail({ system }: SystemDetailProps) {
  const [planets, setPlanets] = useState<Planet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    const fetchPlanets = async () => {
      try {
        const response = await fetch(`/api/systems/${system.id}/planets`)
        if (response.ok) {
          const planetsData = await response.json()
          console.log(`Fetched ${planetsData.length} planets for system ${system.id}`)
          setPlanets(planetsData)
          setError(null)
        } else {
          const errorData = await response.json()
          console.error('Planet fetch error:', errorData)
          setError(errorData.error || 'Failed to fetch planets')
        }
      } catch (error) {
        console.error('Error fetching planets:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchPlanets()
  }, [system.id])

  // Planets update per turn only - no continuous animation
  // Call advanceTurn() to progress orbital positions

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Loading {system.name}...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="text-lg">Loading planetary data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{system.name} System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800 font-medium">Error Loading Planets</div>
            <div className="text-red-700 text-sm mt-1">{error}</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate orbital positions
  const getPlanetPosition = (planet: Planet, time: number) => {
    const angle = planet.orbit_phase + (time / planet.orbit_period_days) * 2 * Math.PI
    const x = Math.cos(angle) * planet.orbit_radius
    const y = Math.sin(angle) * planet.orbit_radius
    return { x, y }
  }

  // Scale for display (arbitrary units to pixels)
  const scale = 2
  const centerX = 300
  const centerY = 300

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: system.star_color }}
          />
          {system.name} System
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          {system.description}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Orbital view */}
          <div className="relative bg-slate-900 rounded-lg overflow-hidden" style={{ height: '600px' }}>
            <svg className="absolute inset-0 w-full h-full">
              {/* Central star */}
              <circle
                cx={centerX}
                cy={centerY}
                r="8"
                fill={system.star_color}
                className="drop-shadow-lg"
              />

              {/* Orbital paths */}
              {planets.map((planet) => (
                <circle
                  key={`orbit-${planet.id}`}
                  cx={centerX}
                  cy={centerY}
                  r={planet.orbit_radius * scale}
                  fill="none"
                  stroke="#374151"
                  strokeWidth="1"
                  opacity="0.3"
                />
              ))}

              {/* Planets */}
              {planets.map((planet) => {
                const pos = getPlanetPosition(planet, currentTime)
                return (
                  <g key={planet.id}>
                    {/* Planet */}
                    <circle
                      cx={centerX + pos.x * scale}
                      cy={centerY + pos.y * scale}
                      r={Math.max(3, Math.min(8, planet.radius_km / 2000))}
                      fill={planet.color}
                      stroke="#ffffff"
                      strokeWidth="1"
                      className="drop-shadow-sm"
                    />

                    {/* Planet label */}
                    <text
                      x={centerX + pos.x * scale}
                      y={centerY + pos.y * scale - 15}
                      textAnchor="middle"
                      className="text-xs fill-white font-medium"
                      style={{ fontSize: '10px' }}
                    >
                      {planet.name}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Planet list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {planets.map((planet) => (
              <div key={planet.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: planet.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{planet.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {planet.planet_type} • {planet.radius_km.toLocaleString()} km
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Orbit: {planet.orbit_radius.toFixed(1)} AU • {planet.orbit_period_days.toFixed(1)} days
                  </div>
                </div>
              </div>
            ))}
          </div>

          {planets.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No planets found in this system
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}