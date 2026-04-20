'use client'

import { useState, useEffect } from 'react'

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

interface SystemViewProps {
  system: StarSystem
  turn: number
}

export function SystemView({ system, turn }: SystemViewProps) {
  const [planets, setPlanets] = useState<Planet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlanets = async () => {
      try {
        const response = await fetch(`/api/systems/${system.id}/planets`)
        if (response.ok) {
          const planetsData = await response.json()
          setPlanets(planetsData)
          setError(null)
        } else {
          const errorData = await response.json()
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

  // Calculate orbital positions based on turn
  const getPlanetPosition = (planet: Planet) => {
    const angle = planet.orbit_phase + (turn / planet.orbit_period_days) * 2 * Math.PI
    const x = Math.cos(angle) * planet.orbit_radius
    const y = Math.sin(angle) * planet.orbit_radius
    return { x, y }
  }

  const scale = 2
  const centerX = 400
  const centerY = 300

  if (loading) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-black via-slate-900 to-black flex items-center justify-center border border-cyan-500/30 font-mono">
        <div className="text-cyan-400 animate-pulse">SCANNING SYSTEM...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-black via-slate-900 to-black flex items-center justify-center border border-cyan-500/30 font-mono">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-black via-slate-900 to-black relative overflow-hidden border border-cyan-500/30">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" className="w-full h-full">
          <defs>
            <pattern id="system-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="cyan" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#system-grid)" />
        </svg>
      </div>

      {/* Orbital display */}
      <svg className="absolute inset-0 w-full h-full">
        {/* Orbital paths */}
        {planets.map((planet) => (
          <circle
            key={`orbit-${planet.id}`}
            cx={centerX}
            cy={centerY}
            r={planet.orbit_radius * scale}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="0.5"
            opacity="0.2"
            strokeDasharray="2,4"
          />
        ))}

        {/* Central star */}
        <circle
          cx={centerX}
          cy={centerY}
          r="12"
          fill={system.star_color}
          style={{
            filter: `drop-shadow(0 0 16px ${system.star_color})`
          }}
        />

        {/* Star type label */}
        <text
          x={centerX}
          y={centerY + 30}
          textAnchor="middle"
          className="fill-cyan-300 font-mono font-bold"
          style={{ fontSize: '12px' }}
        >
          {system.star_type}-CLASS
        </text>

        {/* Planets */}
        {planets.map((planet) => {
          const pos = getPlanetPosition(planet)
          const px = centerX + pos.x * scale
          const py = centerY + pos.y * scale
          const size = Math.max(3, Math.min(8, planet.radius_km / 2000))

          return (
            <g key={planet.id}>
              {/* Planet */}
              <circle
                cx={px}
                cy={py}
                r={size}
                fill={planet.color}
                stroke="#06b6d4"
                strokeWidth="1"
                style={{
                  filter: `drop-shadow(0 0 4px ${planet.color})`
                }}
              />

              {/* Planet label */}
              <text
                x={px}
                y={py - size - 12}
                textAnchor="middle"
                className="fill-cyan-300 font-mono font-bold"
                style={{ fontSize: '10px', pointerEvents: 'none' }}
              >
                {planet.name}
              </text>

              {/* Planet type */}
              <text
                x={px}
                y={py + size + 18}
                textAnchor="middle"
                className="fill-cyan-500/60 font-mono"
                style={{ fontSize: '8px', pointerEvents: 'none' }}
              >
                {planet.planet_type}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Top HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent border-b border-cyan-500/20 font-mono text-xs">
        <div className="flex justify-between">
          <div>
            <div className="text-cyan-400 font-bold">{system.name} SYSTEM</div>
            <div className="text-cyan-500/60">{system.description}</div>
          </div>
          <div className="text-right text-cyan-500/60">
            <div>TURN: {turn}</div>
            <div>PLANETS: {planets.length}</div>
          </div>
        </div>
      </div>

      {/* Planet list (bottom right) */}
      <div className="absolute bottom-4 right-4 bg-black/80 border border-cyan-500 p-3 max-w-xs backdrop-blur-sm font-mono text-xs max-h-64 overflow-y-auto">
        <div className="text-cyan-400 font-bold mb-2">CELESTIAL BODIES</div>
        <div className="space-y-1">
          {planets.map((planet) => (
            <div key={planet.id} className="border-l border-cyan-500/30 pl-2 py-1">
              <div className="text-cyan-300 flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: planet.color }}
                />
                {planet.name}
              </div>
              <div className="text-cyan-500/60 text-xs ml-4">
                {planet.planet_type} • {planet.radius_km.toLocaleString()} km
              </div>
              <div className="text-cyan-500/40 text-xs ml-4">
                Orbit: {planet.orbit_radius.toFixed(0)} AU
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}