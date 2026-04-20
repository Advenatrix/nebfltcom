'use client'

import { useState, useEffect } from 'react'

interface Fleet {
  id: number
  name: string
  faction_id: number
  current_system_id: number
  owner_user_id: number | null
  created_at: string
  status: 'in_system' | 'traveling'
  target_system_id?: number
}

interface FleetWidgetProps {
  fleets: Fleet[]
  onFleetSelect?: (fleet: Fleet) => void
  selectedFleetId?: number
}

export function FleetWidget({ fleets, onFleetSelect, selectedFleetId }: FleetWidgetProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedFleet, setExpandedFleet] = useState<number | null>(null)

  return (
    <div className="h-full bg-black border-l-2 border-cyan-500 flex flex-col overflow-hidden shadow-2xl" style={{ borderImage: 'linear-gradient(180deg, rgb(0,255,255), rgb(0,128,128)) 1' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-cyan-500/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
          <h2 className="text-cyan-400 font-mono text-sm font-bold tracking-wider">FLEET STATUS</h2>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-cyan-400 hover:text-cyan-300 font-bold text-lg"
        >
          {isCollapsed ? '▼' : '▲'}
        </button>
      </div>

      {/* Fleet List */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto space-y-2 p-3">
          {fleets.length === 0 ? (
            <div className="text-cyan-500/50 text-xs text-center py-8">NO FLEETS DETECTED</div>
          ) : (
            fleets.map((fleet) => (
              <div
                key={fleet.id}
                onClick={() => {
                  setExpandedFleet(expandedFleet === fleet.id ? null : fleet.id)
                  onFleetSelect?.(fleet)
                }}
                className={`cursor-pointer transition-all ${
                  selectedFleetId === fleet.id
                    ? 'bg-cyan-500/20 border border-cyan-400'
                    : 'bg-slate-900/50 border border-cyan-500/30 hover:border-cyan-500/60'
                } p-2 rounded font-mono text-xs`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-cyan-300 font-bold">{fleet.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    fleet.status === 'traveling' ? 'bg-yellow-500/30 text-yellow-300' : 'bg-green-500/30 text-green-300'
                  }`}>
                    {fleet.status === 'traveling' ? '▶ EN ROUTE' : '⚓ ORBITING'}
                  </span>
                </div>
                <div className="text-cyan-400/70 text-xs">SHIPS: 2 | READY: 100%</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-cyan-500/30 px-3 py-2 bg-slate-950/50">
        <div className="text-cyan-400/60 font-mono text-xs">
          OPERATIONAL: {fleets.length}
        </div>
      </div>
    </div>
  )
}