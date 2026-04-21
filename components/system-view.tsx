'use client'

import { useState, useEffect } from 'react'

interface Planet {
  id: number; name: string
  orbit_radius: number; orbit_period_days: number; orbit_phase: number
  radius_km: number; planet_type: string; color: string
}

interface StarSystem {
  id: number; name: string; x: number; y: number
  star_type: string; star_color: string; description: string
}

interface SystemViewProps {
  system: StarSystem
  turn: number
}

const tok = {
  bg:         '#050905',
  border:     '#3d5c42',
  borderBright:'#ff8800',
  textDim:    '#6a8a6a',
  textBase:   '#a8c8a8',
  textHot:    '#ff8800',
  textGreen:  '#6adc7a',
  gridStroke: '#1a2a1a',
  orbitStroke:'#3d5c42',
}

export function SystemView({ system, turn }: SystemViewProps) {
  const [planets, setPlanets] = useState<Planet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [hoveredPlanet, setHoveredPlanet] = useState<number | null>(null)

  useEffect(() => {
    const fetchPlanets = async () => {
      try {
        const res = await fetch(`/api/systems/${system.id}/planets`)
        if (res.ok) {
          setPlanets(await res.json())
          setError(null)
        } else {
          const e = await res.json()
          setError(e.error || 'Failed to fetch planets')
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchPlanets()
  }, [system.id])

  const getPlanetPos = (planet: Planet) => {
    const angle = planet.orbit_phase + (turn / planet.orbit_period_days) * 2 * Math.PI
    return {
      x: Math.cos(angle) * planet.orbit_radius,
      y: Math.sin(angle) * planet.orbit_radius,
    }
  }

  const scale = 2
  const centerX = 400
  const centerY = 300

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.button === 2) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && (e.buttons === 4 || e.buttons === 2)) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = rect.width / 2; const cy = rect.height / 2
    const dir = e.deltaY > 0 ? -1 : 1
    const newZoom = Math.max(0.5, Math.min(3, zoom + dir * 0.1))
    const zf = newZoom / zoom
    setZoom(newZoom)
    setPan({ x: cx - (cx - pan.x) * zf, y: cy - (cy - pan.y) * zf })
  }

  const base: React.CSSProperties = {
    width: '100%', height: '100%', background: tok.bg,
    position: 'relative', overflow: 'hidden',
    fontFamily: "'Courier New', Courier, monospace",
  }

  if (loading) return (
    <div style={{ ...base, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: tok.textBase, fontSize: 10, letterSpacing: '0.28em', opacity: 0.7 }}>
        SCANNING SYSTEM…
      </span>
    </div>
  )

  if (error) return (
    <div style={{ ...base, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#c84040', fontSize: 10, letterSpacing: '0.2em' }}>⚠ {error}</span>
    </div>
  )

  return (
    <div
      style={{ ...base, display: 'flex', flexDirection: 'column', cursor: 'crosshair' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onWheel={handleWheel}
      onContextMenu={e => e.preventDefault()}
    >
      {/* Top HUD strip */}
      <div style={{
        padding: '8px 14px',
        borderBottom: `1px solid ${tok.border}`,
        background: 'rgba(3,7,4,0.97)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ color: tok.textBase, fontSize: 16, fontWeight: 'bold', letterSpacing: '0.2em' }}>
            {system.name.toUpperCase()} SYSTEM
          </div>
          <div style={{ color: tok.textDim, fontSize: 14, letterSpacing: '0.12em', marginTop: 2 }}>
            {system.description}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: tok.textDim, fontSize: 14, letterSpacing: '0.2em' }}>CYCLE: <span style={{ color: tok.textHot }}>{String(turn).padStart(4, '0')}</span></div>
          <div style={{ color: tok.textDim, fontSize: 14, letterSpacing: '0.2em', marginTop: 2 }}>BODIES: {planets.length}</div>
        </div>
      </div>

      {/* Main content area - map + planet list */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Map area */}
        <div style={{ flex: 1, position: 'relative' }}>
          {/* Scanline veil */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20,
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 4px)',
          }} />

          {/* Tactical grid */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}>
            <defs>
              <pattern id="sys-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke={tok.gridStroke} strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sys-grid)" opacity="0.5" />
          </svg>

          {/* Orbital display */}
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 10 }}
            fontFamily="'Courier New', Courier, monospace"
          >
            <g style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}>

              {/* Orbital lanes */}
              {planets.map(planet => (
                <circle
                  key={`orbit-${planet.id}`}
                  cx={centerX} cy={centerY}
                  r={planet.orbit_radius * scale}
                  fill="none"
                  stroke={tok.orbitStroke}
                  strokeWidth="0.8"
                  strokeDasharray="3,8"
                  opacity="0.8"
                />
              ))}

              {/* Central star glow halo */}
              <circle cx={centerX} cy={centerY} r="24" fill={system.star_color} opacity="0.06" />
              <circle cx={centerX} cy={centerY} r="16" fill={system.star_color} opacity="0.12" />

              {/* Central star */}
              <circle
                cx={centerX} cy={centerY} r="12"
                fill={system.star_color}
                style={{ filter: `drop-shadow(0 0 18px ${system.star_color})` }}
              />

              {/* Star class label */}
              <text
                x={centerX} y={centerY + 32}
                textAnchor="middle"
                fill={tok.textBase}
                fontSize="13"
                fontWeight="bold"
                letterSpacing="0.12em"
                style={{ pointerEvents: 'none' }}
              >
                {system.star_type.toUpperCase()}-CLASS
              </text>

              {/* Planets */}
              {planets.map(planet => {
                const pos = getPlanetPos(planet)
                const px = centerX + pos.x * scale
                const py = centerY + pos.y * scale
                const r = Math.max(3, Math.min(9, planet.radius_km / 2000))
                const isHovered = hoveredPlanet === planet.id

                return (
                  <g
                    key={planet.id}
                    onMouseEnter={() => setHoveredPlanet(planet.id)}
                    onMouseLeave={() => setHoveredPlanet(null)}
                    style={{ cursor: 'default' }}
                  >
                    {/* Hover indicator */}
                    {isHovered && (
                      <circle cx={px} cy={py} r={r + 6} fill="none" stroke={tok.textBase} strokeWidth="0.8" opacity="0.5" />
                    )}

                    {/* Planet body */}
                    <circle
                      cx={px} cy={py} r={r}
                      fill={planet.color}
                      stroke={isHovered ? tok.textBase : tok.orbitStroke}
                      strokeWidth="1"
                      style={{ filter: `drop-shadow(0 0 ${r}px ${planet.color})` }}
                    />

                    {/* Planet name */}
                    <text
                      x={px} y={py - r - 10}
                      textAnchor="middle"
                      fill={isHovered ? tok.textBase : tok.textDim}
                      fontSize="12"
                      fontWeight="bold"
                      letterSpacing="0.1em"
                      style={{ pointerEvents: 'none' }}
                    >
                      {planet.name.toUpperCase()}
                    </text>

                    {/* Planet type */}
                    <text
                      x={px} y={py + r + 14}
                      textAnchor="middle"
                      fill={tok.textDim}
                      fontSize="10"
                      letterSpacing="0.12em"
                      style={{ pointerEvents: 'none' }}
                    >
                      {planet.planet_type}
                    </text>
                  </g>
                )
              })}
            </g>
          </svg>
        </div>

        {/* Planet roster — right panel */}
        <div style={{
          width: 180,
          background: 'rgba(4,9,5,0.95)',
          borderLeft: `1px solid ${tok.border}`,
          padding: '8px 10px',
          overflowY: 'auto',
        }}>
          <div style={{
            color: tok.textDim, fontSize: 12, letterSpacing: '0.28em',
            borderBottom: `1px solid ${tok.border}`,
            paddingBottom: 4, marginBottom: 8,
          }}>
            ▸ CELESTIAL BODIES
          </div>

          {planets.map(planet => (
            <div
              key={planet.id}
              style={{
                borderLeft: `2px solid ${hoveredPlanet === planet.id ? tok.textBase : tok.border}`,
                paddingLeft: 8,
                paddingBottom: 8,
                marginBottom: 8,
                transition: 'border-color 0.12s',
              }}
              onMouseEnter={() => setHoveredPlanet(planet.id)}
              onMouseLeave={() => setHoveredPlanet(null)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ display: 'inline-block', width: 10, height: 10, background: planet.color }} />
                <span style={{ color: tok.textBase, fontSize: 15, fontWeight: 'bold', letterSpacing: '0.08em' }}>
                  {planet.name.toUpperCase()}
                </span>
              </div>
              <div style={{ color: tok.textBase, fontSize: 12, letterSpacing: '0.1em', marginLeft: 16 }}>
                {planet.planet_type.toUpperCase()} · {planet.radius_km.toLocaleString()} KM
              </div>
              <div style={{ color: tok.textBase, fontSize: 12, letterSpacing: '0.1em', marginLeft: 16, marginTop: 2 }}>
                ORBIT: {planet.orbit_radius.toFixed(0)} AU
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}