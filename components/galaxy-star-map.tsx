'use client'

import { useState, useEffect } from 'react'

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
  onSystemDoubleClick: (system: StarSystem) => void
  selectedSystemId?: number
}

export function GalaxyStarMap({ onSystemSelect, onSystemDoubleClick, selectedSystemId }: StarMapProps) {
  const [starSystems, setStarSystems] = useState<StarSystem[]>([])
  const [gates, setGates] = useState<Gate[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredSystemId, setHoveredSystemId] = useState<number | null>(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

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
      <div className="w-full h-full bg-black flex items-center justify-center border border-cyan-500/30">
        <div className="text-cyan-400 font-mono animate-pulse">SCANNING GALAXY...</div>
      </div>
    )
  }

  if (starSystems.length === 0) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center border border-cyan-500/30">
        <div className="text-center space-y-3">
          <div className="text-red-500 font-mono font-bold">⚠ SIGNAL LOST</div>
          <div className="text-cyan-500/50 font-mono text-sm">Database connection required</div>
        </div>
      </div>
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

  const scaleX = (coord: number) => ((coord - minX + padding) / width) * 100
  const scaleY = (coord: number) => ((coord - minY + padding) / height) * 100

  const lastClickTime = { current: 0 }
  let clickTimeout: NodeJS.Timeout

  const handleSystemClick = (system: StarSystem) => {
    if (isDragging) return // Don't select if we were dragging

    const now = Date.now()
    const timeSinceLastClick = now - lastClickTime.current

    if (timeSinceLastClick < 300) {
      // Double click
      onSystemDoubleClick(system)
      clearTimeout(clickTimeout)
    } else {
      // Single click
      onSystemSelect(system)
      clickTimeout = setTimeout(() => {}, 300)
    }
    lastClickTime.current = now
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan with middle mouse or if right click
    if (e.button === 1 || e.button === 2) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && (e.buttons === 4 || e.buttons === 2)) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    // Scroll position is already handled by browser, but we can add zoom later if needed
  }

  return (
    <div 
      className="w-full h-full bg-gradient-to-br from-black via-slate-900 to-black border border-cyan-500/30 overflow-hidden relative cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Grid background */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" className="w-full h-full">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="cyan" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Map */}
      <svg className="absolute inset-0 w-full h-full cursor-pointer" style={{ zIndex: 10 }}>
        <g style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}>
          {/* Gates (FTL connections) */}
          {gates.map((gate) => (
          <g key={`gate-${gate.id}`}>
            <line
              x1={`${scaleX(gate.system_a_x)}%`}
              y1={`${scaleY(gate.system_a_y)}%`}
              x2={`${scaleX(gate.system_b_x)}%`}
              y2={`${scaleY(gate.system_b_y)}%`}
              stroke="#06b6d4"
              strokeWidth="1.5"
              opacity="0.4"
              strokeDasharray="5,5"
              className="hover:opacity-70 transition-opacity"
            />
            {/* Gate label at midpoint */}
            <text
              x={`${(scaleX(gate.system_a_x) + scaleX(gate.system_b_x)) / 2}%`}
              y={`${(scaleY(gate.system_a_y) + scaleY(gate.system_b_y)) / 2}%`}
              textAnchor="middle"
              className="fill-cyan-500/30 font-mono text-xs"
              style={{ fontSize: '8px', pointerEvents: 'none' }}
            >
              ◆
            </text>
          </g>
        ))}

        {/* Star Systems */}
        {starSystems.map((system) => (
          <g 
            key={`system-${system.id}`}
            onClick={() => handleSystemClick(system)}
            onMouseEnter={() => setHoveredSystemId(system.id)}
            onMouseLeave={() => setHoveredSystemId(null)}
            className="hover:opacity-100 transition-opacity"
          >
            {/* Outer ring (when hovered or selected) */}
            {(hoveredSystemId === system.id || selectedSystemId === system.id) && (
              <>
                <circle
                  cx={`${scaleX(system.x)}%`}
                  cy={`${scaleY(system.y)}%`}
                  r="25"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="1"
                  opacity="0.3"
                  className="animate-pulse"
                />
                <circle
                  cx={`${scaleX(system.x)}%`}
                  cy={`${scaleY(system.y)}%`}
                  r="35"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="0.5"
                  opacity="0.2"
                />
              </>
            )}

            {/* Star */}
            <circle
              cx={`${scaleX(system.x)}%`}
              cy={`${scaleY(system.y)}%`}
              r={selectedSystemId === system.id ? "12" : "8"}
              fill={system.star_color}
              stroke={selectedSystemId === system.id ? "#fbbf24" : "#06b6d4"}
              strokeWidth={selectedSystemId === system.id ? "2" : "1"}
              className="transition-all drop-shadow-lg cursor-pointer"
              style={{
                filter: `drop-shadow(0 0 ${selectedSystemId === system.id ? '12px' : '6px'} ${system.star_color})`
              }}
            />

            {/* Scan indicator */}
            {hoveredSystemId === system.id && (
              <circle
                cx={`${scaleX(system.x)}%`}
                cy={`${scaleY(system.y)}%`}
                r="8"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="1.5"
                opacity="0.6"
                className="animate-spin"
                style={{ animationDuration: '3s' }}
              />
            )}

            {/* System label */}
            <text
              x={`${scaleX(system.x)}%`}
              y={`${scaleY(system.y) + 4}%`}
              textAnchor="middle"
              className="fill-cyan-300 font-mono font-bold"
              style={{ 
                fontSize: '10px',
                pointerEvents: 'none',
                textShadow: '0 0 4px rgba(0,255,255,0.5)'
              }}
            >
              {system.name}
            </text>

            {/* Type indicator */}
            <text
              x={`${scaleX(system.x)}%`}
              y={`${scaleY(system.y) + 12}%`}
              textAnchor="middle"
              className="fill-cyan-500/60 font-mono"
              style={{ fontSize: '7px', pointerEvents: 'none' }}
            >
              [{system.star_type}]
            </text>
          </g>
        ))}
        </g>
      </svg>

      {/* Top HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent border-b border-cyan-500/20 pointer-events-none font-mono text-xs">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-cyan-400 font-bold">GALACTIC MAP</div>
            <div className="text-cyan-500/60">STAR SYSTEMS {starSystems.length}</div>
          </div>
          <div className="text-right">
            <div className="text-cyan-500/60">NAVIGATION</div>
            <div className="text-cyan-400 text-xs">CLICK TO SELECT • DOUBLE-CLICK TO SCAN • MIDDLE MOUSE TO PAN</div>
          </div>
        </div>
      </div>

      {/* System Info (bottom left) */}
      {selectedSystemId && (
        <div className="absolute bottom-4 left-4 bg-black/80 border border-cyan-500 p-3 font-mono text-xs max-w-xs pointer-events-none backdrop-blur-sm">
          {starSystems.find(s => s.id === selectedSystemId) && (
            <>
              <div className="text-cyan-400 font-bold mb-2">
                {starSystems.find(s => s.id === selectedSystemId)?.name}
              </div>
              <div className="text-cyan-500/70 text-xs space-y-1">
                <div>STAR TYPE: {starSystems.find(s => s.id === selectedSystemId)?.star_type}</div>
                <div>STATUS: SCANNING...</div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}