'use client'

import { useState, useEffect } from 'react'

interface Weapon {
  id: number
  mount_kind: string
  weapon_name: string | null
  weapon_caliber: string | null
  weapon_damage: number
}

interface Magazine {
  id: number
  ammo_type: string
  quantity: number
  capacity: number
}

interface ShipDetails {
  id: number
  fleet_id: number
  name: string
  hull_class: string
  hull_hp: number
  crew: number
  crew_max: number
  ammo: number
  ammo_max: number
  weapons: Weapon[]
  magazines: Magazine[]
}

interface ShipDetailsPanelProps {
  shipId: number
  shipName: string
  onBack: () => void
}

export function ShipDetailsPanel({ shipId, shipName, onBack }: ShipDetailsPanelProps) {
  const [ship, setShip] = useState<ShipDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchShipDetails = async () => {
      try {
        const response = await fetch(`/api/ships/${shipId}`)
        if (response.ok) {
          const shipData = await response.json()
          setShip(shipData)
          setError(null)
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Failed to fetch ship details')
        }
      } catch (error) {
        console.error('Error fetching ship:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchShipDetails()
  }, [shipId])

  if (loading) {
    return (
      <div className="h-full bg-black border-l-2 border-cyan-500 flex flex-col items-center justify-center">
        <div className="text-cyan-400 font-mono animate-pulse">ACCESSING SHIP DATA...</div>
      </div>
    )
  }

  if (error || !ship) {
    return (
      <div className="h-full bg-black border-l-2 border-cyan-500 flex flex-col items-center justify-center">
        <div className="text-red-500 font-mono">{error || 'Ship not found'}</div>
        <button
          onClick={onBack}
          className="mt-4 bg-cyan-600/20 border border-cyan-500 text-cyan-400 px-3 py-2 font-mono text-xs rounded hover:bg-cyan-600/40"
        >
          ← BACK
        </button>
      </div>
    )
  }

  // Group weapons by mount kind
  const weaponsByMount = ship.weapons.reduce((acc, weapon) => {
    if (!acc[weapon.mount_kind]) {
      acc[weapon.mount_kind] = []
    }
    acc[weapon.mount_kind].push(weapon)
    return acc
  }, {} as Record<string, Weapon[]>)

  return (
    <div className="h-full bg-black border-l-2 border-cyan-500 flex flex-col overflow-hidden shadow-2xl" style={{ borderImage: 'linear-gradient(180deg, rgb(0,255,255), rgb(0,128,128)) 1' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-cyan-500/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
          <div>
            <h2 className="text-cyan-400 font-mono text-sm font-bold tracking-wider">{ship.name}</h2>
            <div className="text-cyan-500/60 font-mono text-xs">{ship.hull_class.toUpperCase()}</div>
          </div>
        </div>
        <button
          onClick={onBack}
          className="text-cyan-400 hover:text-cyan-300 font-bold text-lg"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-4 p-3">
        {/* Ship Status */}
        <div className="bg-slate-950/50 border border-cyan-500/20 p-3 rounded space-y-2">
          <div className="text-cyan-400 font-mono font-bold text-xs mb-3">SHIP STATUS</div>

          {/* Hull */}
          <div>
            <div className="text-cyan-400/70 text-xs mb-1">HULL INTEGRITY</div>
            <div className="h-2 bg-slate-800 rounded overflow-hidden border border-cyan-500/20">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-500"
                style={{ width: `${(ship.hull_hp / 500) * 100}%` }}
              />
            </div>
            <div className="text-cyan-500/50 text-xs mt-1">{ship.hull_hp} / 500 HP</div>
          </div>

          {/* Crew */}
          <div>
            <div className="text-cyan-400/70 text-xs mb-1">CREW</div>
            <div className="h-2 bg-slate-800 rounded overflow-hidden border border-cyan-500/20">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-500"
                style={{ width: `${(ship.crew / ship.crew_max) * 100}%` }}
              />
            </div>
            <div className="text-cyan-500/50 text-xs mt-1">{ship.crew} / {ship.crew_max}</div>
          </div>

          {/* Ammo */}
          <div>
            <div className="text-cyan-400/70 text-xs mb-1">READY AMMO</div>
            <div className="h-2 bg-slate-800 rounded overflow-hidden border border-cyan-500/20">
              <div
                className="h-full bg-gradient-to-r from-yellow-600 to-yellow-500"
                style={{ width: `${(ship.ammo / ship.ammo_max) * 100}%` }}
              />
            </div>
            <div className="text-cyan-500/50 text-xs mt-1">{ship.ammo} / {ship.ammo_max}</div>
          </div>
        </div>

        {/* Weapons */}
        <div className="bg-slate-950/50 border border-cyan-500/20 p-3 rounded">
          <div className="text-cyan-400 font-mono font-bold text-xs mb-3">WEAPONS SYSTEMS</div>

          {Object.keys(weaponsByMount).length === 0 ? (
            <div className="text-cyan-500/50 text-xs">NO WEAPONS INSTALLED</div>
          ) : (
            <div className="space-y-3">
              {Object.entries(weaponsByMount).map(([mountKind, weapons]) => (
                <div key={mountKind} className="space-y-2">
                  <div className="text-cyan-500/70 font-mono text-xs uppercase">{mountKind}</div>
                  <div className="space-y-1 ml-2">
                    {weapons.map((weapon) => (
                      <div key={weapon.id} className="bg-slate-900/50 border border-cyan-500/10 p-2 rounded text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <div className="text-cyan-300 font-mono">
                            {weapon.weapon_name || '- EMPTY MOUNT -'}
                          </div>
                          {weapon.weapon_damage > 0 && (
                            <div className="text-red-400 font-mono">{weapon.weapon_damage} DMG</div>
                          )}
                        </div>
                        {weapon.weapon_caliber && (
                          <div className="text-cyan-500/60 text-xs">{weapon.weapon_caliber}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cargo - Magazines and Ammo */}
        <div className="bg-slate-950/50 border border-cyan-500/20 p-3 rounded">
          <div className="text-cyan-400 font-mono font-bold text-xs mb-3">CARGO / AMMUNITION</div>

          {ship.magazines.length === 0 ? (
            <div className="text-cyan-500/50 text-xs">NO CARGO</div>
          ) : (
            <div className="space-y-2">
              {ship.magazines.map((mag) => (
                <div key={mag.id} className="bg-slate-900/50 border border-cyan-500/10 p-2 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-cyan-300 font-mono text-xs">{mag.ammo_type}</div>
                    <div className="text-cyan-400 font-mono text-xs">{mag.quantity} / {mag.capacity}</div>
                  </div>
                  <div className="h-1 bg-slate-700 rounded overflow-hidden border border-cyan-500/10">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-600 to-cyan-500"
                      style={{ width: `${(mag.quantity / mag.capacity) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-cyan-500/30 px-3 py-2 bg-slate-950/50">
        <button
          onClick={onBack}
          className="w-full bg-cyan-600/20 border border-cyan-500/50 text-cyan-400 px-3 py-2 font-mono text-xs rounded hover:bg-cyan-600/40 transition-colors"
        >
          ← BACK TO FLEET
        </button>
      </div>
    </div>
  )
}