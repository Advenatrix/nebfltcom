'use client'

import { useState, useEffect } from 'react'

interface StarSystem {
  id: number; name: string; x: number; y: number
  star_type: string; star_color: string; description: string
}

interface Gate {
  id: number
  system_a_id: number; system_b_id: number
  system_a_name: string; system_a_x: number; system_a_y: number
  system_b_name: string; system_b_x: number; system_b_y: number
}

interface StarMapProps {
  onSystemSelect: (system: StarSystem) => void
  onSystemDoubleClick: (system: StarSystem) => void
  selectedSystemId?: number
}

const tok = {
  bg:         '#050905',
  border:     '#1e3022',
  textDim:    '#3d5c42',
  textBase:   '#8ab08a',
  textHot:    '#c8a840',
  textGreen:  '#6adc7a',
  gateStroke: '#2e5035',
  gridStroke: '#1a2a1a',
}

export function GalaxyStarMap({ onSystemSelect, onSystemDoubleClick, selectedSystemId }: StarMapProps) {
  const [starSystems, setStarSystems] = useState<StarSystem[]>([])
  const [gates, setGates] = useState<Gate[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, gRes] = await Promise.all([
          fetch('/api/star-systems'),
          fetch('/api/gates'),
        ])
        if (sRes.ok && gRes.ok) {
          setStarSystems(await sRes.json())
          setGates(await gRes.json())
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return (
    <div style={{
      width: '100%', height: '100%', background: tok.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Courier New', Courier, monospace",
    }}>
      <span style={{ color: tok.textBase, fontSize: 10, letterSpacing: '0.28em', opacity: 0.7 }}>
        SCANNING SECTOR…
      </span>
    </div>
  )

  if (starSystems.length === 0) return (
    <div style={{
      width: '100%', height: '100%', background: tok.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Courier New', Courier, monospace",
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#c84040', fontSize: 11, letterSpacing: '0.22em', marginBottom: 6 }}>⚠ SIGNAL LOST</div>
        <div style={{ color: tok.textDim, fontSize: 9, letterSpacing: '0.15em' }}>DATABASE CONNECTION REQUIRED</div>
      </div>
    </div>
  )

  const minX = Math.min(...starSystems.map(s => s.x))
  const maxX = Math.max(...starSystems.map(s => s.x))
  const minY = Math.min(...starSystems.map(s => s.y))
  const maxY = Math.max(...starSystems.map(s => s.y))
  const pad = 100
  const W = maxX - minX + pad * 2
  const H = maxY - minY + pad * 2
  const sx = (c: number) => ((c - minX + pad) / W) * 100
  const sy = (c: number) => ((c - minY + pad) / H) * 100

  const lastClick = { current: 0 }
  let clickTO: NodeJS.Timeout

  const handleSystemClick = (system: StarSystem) => {
    if (isDragging) return
    const now = Date.now()
    if (now - lastClick.current < 300) {
      onSystemDoubleClick(system)
      clearTimeout(clickTO)
    } else {
      onSystemSelect(system)
      clickTO = setTimeout(() => {}, 300)
    }
    lastClick.current = now
  }

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
    const cx = rect.width / 2
    const cy = rect.height / 2
    const dir = e.deltaY > 0 ? -1 : 1
    const newZoom = Math.max(0.5, Math.min(3, zoom + dir * 0.1))
    const zf = newZoom / zoom
    setZoom(newZoom)
    setPan({ x: cx - (cx - pan.x) * zf, y: cy - (cy - pan.y) * zf })
  }

  return (
    <div
      style={{ width: '100%', height: '100%', background: tok.bg, position: 'relative', overflow: 'hidden', cursor: 'crosshair' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onWheel={handleWheel}
      onContextMenu={e => e.preventDefault()}
    >
      {/* Scanlines */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 4px)',
      }} />

      {/* SVG tactical grid */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}>
        <defs>
          <pattern id="tac-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke={tok.gridStroke} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tac-grid)" opacity="0.6" />
      </svg>

      {/* Main star map SVG */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 10 }}
        fontFamily="'Courier New', Courier, monospace"
      >
        <g style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}>

          {/* FTL lanes */}
          {gates.map(gate => (
            <g key={`gate-${gate.id}`}>
              <line
                x1={`${sx(gate.system_a_x)}%`} y1={`${sy(gate.system_a_y)}%`}
                x2={`${sx(gate.system_b_x)}%`} y2={`${sy(gate.system_b_y)}%`}
                stroke={tok.gateStroke}
                strokeWidth="1"
                strokeDasharray="6,8"
                opacity="0.7"
              />
              {/* Midpoint waypoint marker */}
              <text
                x={`${(sx(gate.system_a_x) + sx(gate.system_b_x)) / 2}%`}
                y={`${(sy(gate.system_a_y) + sy(gate.system_b_y)) / 2}%`}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={tok.textDim}
                fontSize="7"
                style={{ pointerEvents: 'none' }}
              >
                ◆
              </text>
            </g>
          ))}

          {/* Star systems */}
          {starSystems.map(system => {
            const cx = `${sx(system.x)}%`
            const cy = `${sy(system.y)}%`
            const isSelected = selectedSystemId === system.id
            const isHovered = hoveredId === system.id

            return (
              <g
                key={`sys-${system.id}`}
                onClick={() => handleSystemClick(system)}
                onMouseEnter={() => setHoveredId(system.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Selection ring — amber square bracket style */}
                {isSelected && (
                  <>
                    {/* Outer amber ring */}
                    <circle cx={cx} cy={cy} r="22" fill="none" stroke={tok.textHot} strokeWidth="1" opacity="0.5" />
                    <circle cx={cx} cy={cy} r="28" fill="none" stroke={tok.textHot} strokeWidth="0.5" opacity="0.2" strokeDasharray="3,5" />
                  </>
                )}

                {/* Hover ring */}
                {isHovered && !isSelected && (
                  <circle cx={cx} cy={cy} r="18" fill="none" stroke={tok.textBase} strokeWidth="0.8" opacity="0.45" />
                )}

                {/* Star body */}
                <circle
                  cx={cx} cy={cy}
                  r={isSelected ? '10' : '7'}
                  fill={system.star_color}
                  stroke={isSelected ? tok.textHot : tok.gateStroke}
                  strokeWidth={isSelected ? '1.5' : '1'}
                  style={{ filter: `drop-shadow(0 0 ${isSelected ? '10px' : '5px'} ${system.star_color})`, transition: 'r 0.15s' }}
                />

                {/* System label */}
                <text
                  x={cx} y={`${sy(system.y) + 4}%`}
                  textAnchor="middle"
                  fill={isSelected ? tok.textHot : tok.textBase}
                  fontSize="9"
                  fontWeight="bold"
                  letterSpacing="0.06em"
                  style={{ pointerEvents: 'none' }}
                >
                  {system.name.toUpperCase()}
                </text>

                {/* Star type */}
                <text
                  x={cx} y={`${sy(system.y) + 11.5}%`}
                  textAnchor="middle"
                  fill={tok.textDim}
                  fontSize="6"
                  letterSpacing="0.12em"
                  style={{ pointerEvents: 'none' }}
                >
                  [{system.star_type}]
                </text>
              </g>
            )
          })}
        </g>
      </svg>

      {/* Top HUD strip */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
        padding: '6px 14px',
        background: 'linear-gradient(to bottom, rgba(3,7,4,0.9) 0%, transparent 100%)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: "'Courier New', Courier, monospace",
        pointerEvents: 'none',
        borderBottom: `1px solid ${tok.border}`,
      }}>
        <div>
          <div style={{ color: tok.textBase, fontSize: 10, fontWeight: 'bold', letterSpacing: '0.2em' }}>GALACTIC OVERLAY</div>
          <div style={{ color: tok.textDim, fontSize: 8, letterSpacing: '0.15em', marginTop: 2 }}>
            SYSTEMS DETECTED: {starSystems.length}
          </div>
        </div>
        <div style={{ color: tok.textDim, fontSize: 8, letterSpacing: '0.15em', textAlign: 'right' }}>
          <div>CLICK → DESIGNATE</div>
          <div>DBLCLICK → ENTER SYSTEM</div>
          <div>SCROLL → ZOOM</div>
        </div>
      </div>

      {/* Selected system readout — bottom left */}
      {selectedSystemId && (() => {
        const sys = starSystems.find(s => s.id === selectedSystemId)
        if (!sys) return null
        return (
          <div style={{
            position: 'absolute', bottom: 16, left: 16, zIndex: 30,
            background: 'rgba(4,9,5,0.92)',
            border: `1px solid ${tok.gateStroke}`,
            borderLeft: `3px solid ${tok.textHot}`,
            padding: '8px 12px',
            fontFamily: "'Courier New', Courier, monospace",
            pointerEvents: 'none',
            maxWidth: 220,
          }}>
            <div style={{ color: tok.textHot, fontSize: 10, fontWeight: 'bold', letterSpacing: '0.12em', marginBottom: 4 }}>
              {sys.name.toUpperCase()}
            </div>
            <div style={{ color: tok.textDim, fontSize: 8, letterSpacing: '0.15em' }}>
              STAR CLASS: {sys.star_type}
            </div>
            <div style={{ color: tok.textDim, fontSize: 8, letterSpacing: '0.15em', marginTop: 2 }}>
              STATUS: DESIGNATED ◆
            </div>
          </div>
        )
      })()}
    </div>
  )
}