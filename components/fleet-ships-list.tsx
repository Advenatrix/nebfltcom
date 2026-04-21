'use client'

import { useState, useEffect } from 'react'
import { ShipDetailsPanel } from './ship-details-panel'

interface Ship {
  id: number
  fleet_id: number
  name: string
  hull_class: string
  hull_hp: number
  crew: number
  crew_max: number
  ammo: number
  ammo_max: number
  weapon_count: number
  magazine_count: number
}

interface FleetShipsListProps {
  fleetId: number
  fleetName: string
  onBack: () => void
}

export function FleetShipsList({ fleetId, fleetName, onBack }: FleetShipsListProps) {
  const [ships, setShips] = useState<Ship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedShipId, setExpandedShipId] = useState<number | null>(null)
  const [selectedShipId, setSelectedShipId] = useState<number | null>(null)

  useEffect(() => {
    const fetchShips = async () => {
      try {
        const response = await fetch(`/api/fleets/${fleetId}/ships`)
        if (response.ok) {
          const shipsData = await response.json()
          setShips(shipsData)
          setError(null)
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Failed to fetch ships')
        }
      } catch (error) {
        console.error('Error fetching ships:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchShips()
  }, [fleetId])

  const getHullColor = (hullClass: string): string => {
    const colors: Record<string, string> = {
      'corvette': '#34d399',
      'frigate': '#60a5fa',
      'destroyer': '#f97316',
      'cruiser': '#8b5cf6',
      'battleship': '#ef4444'
    }
    return colors[hullClass.toLowerCase()] || '#06b6d4'
  }

  if (loading) {
    return (
      <div className="h-full bg-black border-l-2 border-cyan-500 flex flex-col items-center justify-center">
        <div className="text-cyan-400 font-mono animate-pulse">LOADING FLEET...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full bg-black border-l-2 border-cyan-500 flex flex-col items-center justify-center">
        <div className="text-red-500 font-mono">{error}</div>
        <button
          onClick={onBack}
          className="mt-4 bg-cyan-600/20 border border-cyan-500 text-cyan-400 px-3 py-2 font-mono text-xs rounded hover:bg-cyan-600/40"
        >
          ← BACK
        </button>
      </div>
    )
  }

  // Show ship details if one is selected
  if (selectedShipId !== null) {
    const selectedShip = ships.find(s => s.id === selectedShipId)
    if (selectedShip) {
      return (
        <ShipDetailsPanel
          shipId={selectedShip.id}
          shipName={selectedShip.name}
          onBack={() => setSelectedShipId(null)}
        />
      )
    }
  }

  return (
    <div className="h-full bg-black border-l-2 border-cyan-500 flex flex-col overflow-hidden shadow-2xl" style={{ borderImage: 'linear-gradient(180deg, rgb(0,255,255), rgb(0,128,128)) 1' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-cyan-500/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
          <div>
            <h2 className="text-cyan-400 font-mono text-sm font-bold tracking-wider">{fleetName}</h2>
            <div className="text-cyan-500/60 font-mono text-xs">SHIP MANIFEST</div>
          </div>
        </div>
        <button
          onClick={onBack}
          className="text-cyan-400 hover:text-cyan-300 font-bold text-lg"
        >
          ✕
        </button>
      </div>

      {/* Ship List */}
      <div className="flex-1 overflow-y-auto space-y-2 p-3">
        {ships.length === 0 ? (
          <div className="text-cyan-500/50 text-xs text-center py-8">NO SHIPS IN FLEET</div>
        ) : (
          ships.map((ship) => (
            <div key={ship.id} className="space-y-2">
              {/* Ship header - clickable to show details */}
              <button
                onClick={() => {
                  if (selectedShipId === ship.id) {
                    setExpandedShipId(expandedShipId === ship.id ? null : ship.id)
                  } else {
                    setSelectedShipId(ship.id)
                  }
                }}
                className="w-full text-left bg-slate-900/50 border border-cyan-500/30 hover:border-cyan-500/60 p-2 rounded transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getHullColor(ship.hull_class) }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-cyan-300 font-mono font-bold text-xs">{ship.name}</div>
                      <div className="text-cyan-500/60 font-mono text-xs">{ship.hull_class.toUpperCase()}</div>
                    </div>
                  </div>
                  <div className="text-cyan-400 text-xs font-mono">
                    {expandedShipId === ship.id ? '▼' : '▶'}
                  </div>
                </div>
              </button>

              {/* Ship details (expanded) */}
              {expandedShipId === ship.id && (
                <div className="bg-slate-950/80 border border-cyan-500/20 p-2 rounded space-y-2 text-xs">
                  {/* Status bars */}
                  <div className="space-y-1">
                    {/* Hull HP */}
                    <div>
                      <div className="text-cyan-400/70 mb-0.5">HULL</div>
                      <div className="h-1.5 bg-slate-800 rounded overflow-hidden border border-cyan-500/20">
                        <div
                          className="h-full bg-gradient-to-r from-red-600 to-red-500"
                          style={{ width: `${(ship.hull_hp / 500) * 100}%` }}
                        />
                      </div>
                      <div className="text-cyan-500/50 text-xs">{ship.hull_hp} / 500 HP</div>
                    </div>

                    {/* Crew */}
                    <div>
                      <div className="text-cyan-400/70 mb-0.5">CREW</div>
                      <div className="h-1.5 bg-slate-800 rounded overflow-hidden border border-cyan-500/20">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-blue-500"
                          style={{ width: `${(ship.crew / ship.crew_max) * 100}%` }}
                        />
                      </div>
                      <div className="text-cyan-500/50 text-xs">{ship.crew} / {ship.crew_max}</div>
                    </div>

                    {/* Ammo */}
                    <div>
                      <div className="text-cyan-400/70 mb-0.5">AMMUNITION</div>
                      <div className="h-1.5 bg-slate-800 rounded overflow-hidden border border-cyan-500/20">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-600 to-yellow-500"
                          style={{ width: `${(ship.ammo / ship.ammo_max) * 100}%` }}
                        />
                      </div>
                      <div className="text-cyan-500/50 text-xs">{ship.ammo} / {ship.ammo_max}</div>
                    </div>
                  </div>

                  {/* Weapon and Magazine count */}
                  <div className="border-t border-cyan-500/20 pt-2 mt-2 space-y-1">
                    <div className="flex justify-between text-cyan-400/70">
                      <span>Weapons Mounted:</span>
                      <span className="text-cyan-300 font-mono">{ship.weapon_count}</span>
                    </div>
                    <div className="flex justify-between text-cyan-400/70">
                      <span>Magazines:</span>
                      <span className="text-cyan-300 font-mono">{ship.magazine_count}</span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-cyan-500/20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedShipId(ship.id)
                        }}
                        className="w-full bg-cyan-600/20 border border-cyan-500/50 text-cyan-400 px-2 py-1 font-mono text-xs rounded hover:bg-cyan-600/40 transition-colors"
                      >
                        VIEW DETAILS →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-cyan-500/30 px-3 py-2 bg-slate-950/50">
        <div className="text-cyan-400/60 font-mono text-xs">
          TOTAL SHIPS: {ships.length}
        </div>
      </div>
    </div>
  )
}