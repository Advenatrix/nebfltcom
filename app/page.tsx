"use client"

import { useState, useEffect } from "react"
import { GalaxyStarMap } from "@/components/galaxy-star-map"
import { SystemView } from "@/components/system-view"
import { FleetWidget } from "@/components/fleet-widget"
import { Button } from "@/components/ui/button"

interface StarSystem {
  id: number
  name: string
  x: number
  y: number
  star_type: string
  star_color: string
  description: string
}

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

export default function Home() {
  const [selectedSystem, setSelectedSystem] = useState<StarSystem | null>(null)
  const [viewingSystem, setViewingSystem] = useState<StarSystem | null>(null)
  const [fleets, setFleets] = useState<Fleet[]>([])
  const [turn, setTurn] = useState(0)

  useEffect(() => {
    // Fetch fleets
    const fetchFleets = async () => {
      try {
        const response = await fetch('/api/fleets')
        if (response.ok) {
          const fleetsData = await response.json()
          setFleets(fleetsData)
        }
      } catch (error) {
        console.error('Error fetching fleets:', error)
      }
    }

    fetchFleets()
  }, [])

  const handleSystemDoubleClick = (system: StarSystem) => {
    setViewingSystem(system)
  }

  const handleBackToGalaxy = () => {
    setViewingSystem(null)
  }

  const handleAdvanceTurn = () => {
    setTurn(prev => prev + 1)
  }

  return (
    <main className="w-screen h-screen flex bg-black overflow-hidden">
      {/* Main map area */}
      <div className="flex-1 flex flex-col relative">
        {/* Map view */}
        {viewingSystem ? (
          <SystemView system={viewingSystem} turn={turn} />
        ) : (
          <GalaxyStarMap
            onSystemSelect={setSelectedSystem}
            onSystemDoubleClick={handleSystemDoubleClick}
            selectedSystemId={selectedSystem?.id}
          />
        )}

        {/* Control HUD - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent border-t border-cyan-500/20 p-4 font-mono text-xs">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-cyan-500/60">CURRENT VIEW</div>
                <div className="text-cyan-300 font-bold">
                  {viewingSystem ? `${viewingSystem.name} SYSTEM` : 'GALACTIC MAP'}
                </div>
              </div>
              {viewingSystem && (
                <Button
                  onClick={handleBackToGalaxy}
                  className="bg-cyan-600 hover:bg-cyan-500 text-black font-mono font-bold px-4 py-1 text-xs h-auto"
                >
                  ← RETURN TO GALAXY
                </Button>
              )}
            </div>

            <div className="flex items-center gap-6">
              <div>
                <div className="text-cyan-500/60">TURN</div>
                <div className="text-cyan-300 font-bold text-lg">{turn}</div>
              </div>
              {viewingSystem && (
                <Button
                  onClick={handleAdvanceTurn}
                  className="bg-green-600 hover:bg-green-500 text-black font-mono font-bold px-6 py-2 text-xs h-auto"
                >
                  ADVANCE TURN ▶
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Back button (top left) */}
        {viewingSystem && (
          <div className="absolute top-4 left-4 z-20">
            <button
              onClick={handleBackToGalaxy}
              className="bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500 text-cyan-400 px-3 py-2 font-mono text-xs rounded transition-all"
            >
              [ESC] RETURN
            </button>
          </div>
        )}
      </div>

      {/* Fleet Widget - Right sidebar */}
      <div className="w-72 flex-shrink-0">
        <FleetWidget fleets={fleets} selectedFleetId={selectedSystem?.id} />
      </div>
    </main>
  )
}
