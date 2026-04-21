"use client"

import { useState, useEffect } from "react"
import { GalaxyStarMap } from "@/components/galaxy-star-map"
import { SystemView } from "@/components/system-view"
import { FleetWidget } from "@/components/fleet-widget"
import { FleetShipsList } from "@/components/fleet-ships-list"
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
  const [selectedFleetForShips, setSelectedFleetForShips] = useState<Fleet | null>(null)

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

  const handleFleetDoubleClick = (fleet: Fleet) => {
    setSelectedFleetForShips(fleet)
  }

  const handleBackFromFleetShips = () => {
    setSelectedFleetForShips(null)
  }

  return (
    <main className="w-screen h-screen flex bg-slate-950 overflow-hidden">
      {/* Main map area */}
      <div className="flex-1 flex flex-col relative bg-gradient-to-br from-slate-900 via-slate-950 to-black">
        {/* Starfield background */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            radial-gradient(1px 1px at 20px 30px, white, rgba(255,255,255,0)),
            radial-gradient(1px 1px at 40px 70px, white, rgba(255,255,255,0)),
            radial-gradient(1.5px 1.5px at 50px 50px, white, rgba(255,255,255,0)),
            radial-gradient(1px 1px at 130px 80px, white, rgba(255,255,255,0)),
            radial-gradient(2px 2px at 90px 10px, white, rgba(255,255,255,0)),
            radial-gradient(1.5px 1.5px at 130px 40px, white, rgba(255,255,255,0))
          `,
          backgroundSize: '200px 200px, 300px 300px, 250px 250px, 350px 350px, 400px 400px, 325px 325px',
          backgroundPosition: '0 0, 20px 30px, 60px 70px, 130px 80px, 90px 10px, 130px 40px'
        }} />

        {/* Map view */}
        <div className="flex-1 relative" style={{ zIndex: 5 }}>
          {viewingSystem ? (
            <SystemView system={viewingSystem} turn={turn} />
          ) : (
            <GalaxyStarMap
              onSystemSelect={setSelectedSystem}
              onSystemDoubleClick={handleSystemDoubleClick}
              selectedSystemId={selectedSystem?.id}
            />
          )}
        </div>

        {/* Top Left: ESC/Back button */}
        {viewingSystem && (
          <div className="absolute top-24 left-6 z-40">
            <button
              onClick={handleBackToGalaxy}
              className="bg-slate-950/70 hover:bg-slate-900 border border-slate-700 text-blue-300 px-4 py-2 font-mono text-sm rounded transition-all"
            >
              ← BACK
            </button>
          </div>
        )}

        {/* Top Right: Info Panel */}
        <div className="absolute top-24 right-6 z-40">
          <div className="bg-slate-950/60 border border-slate-700 rounded backdrop-blur-sm px-4 py-3">
            <div className="flex flex-col gap-3">
              <div>
                <div className="text-slate-500 font-mono text-xs">VIEWING</div>
                <div className="text-slate-200 font-mono font-bold text-sm">
                  {viewingSystem ? viewingSystem.name : 'GALACTIC MAP'}
                </div>
              </div>
              <div>
                <div className="text-slate-500 font-mono text-xs">TURN</div>
                <div className="text-blue-300 font-mono font-bold text-lg">{turn}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Right: End Turn button */}
        <div className="absolute bottom-6 right-6 z-40">
          <button
            onClick={handleAdvanceTurn}
            className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-mono font-bold px-6 py-2 text-sm rounded transition-all shadow-lg"
          >
            ADVANCE TURN ▼
          </button>
        </div>
      </div>

      {/* Fleet Widget - Right sidebar */}
      <div className="w-72 flex-shrink-0">
        {selectedFleetForShips ? (
          <FleetShipsList
            fleetId={selectedFleetForShips.id}
            fleetName={selectedFleetForShips.name}
            onBack={handleBackFromFleetShips}
          />
        ) : (
          <FleetWidget
            fleets={fleets}
            onFleetDoubleClick={handleFleetDoubleClick}
            selectedFleetId={selectedSystem?.id}
          />
        )}
      </div>
    </main>
  )
}
