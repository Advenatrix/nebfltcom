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

const tok = {
  bg:           '#060b07',
  panelBg:      'rgba(4, 9, 5, 0.96)',
  border:       '#1e3022',
  borderBright: '#2e5035',
  textDim:      '#3d5c42',
  textBase:     '#8ab08a',
  textHot:      '#c8a840',
  textGreen:    '#6adc7a',
}

// Hull class → muted tactical accent colour
const classColor: Record<string, string> = {
  corvette:   '#4a8a6a',
  frigate:    '#6a9a7a',
  destroyer:  '#c8a840',
  cruiser:    '#c87040',
  battleship: '#c84040',
}

// Hull integrity colour — green → amber → red
const hullIntegColor = (hp: number, max = 500) => {
  const pct = hp / max
  if (pct > 0.6) return '#4a8a50'
  if (pct > 0.3) return '#c8a840'
  return '#c84040'
}

function StatusBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div style={{ height: 2, background: '#111a12', border: `1px solid ${tok.border}`, position: 'relative', margin: '3px 0' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${pct}%`, background: color }} />
    </div>
  )
}

function CornerBrackets({ color = '#4a7a50' }: { color?: string }) {
  const s: React.CSSProperties = { position: 'absolute', width: 7, height: 7 }
  const b = `1px solid ${color}`
  return (
    <>
      <span style={{ ...s, top: -1, left:  -1, borderTop: b, borderLeft:  b }} />
      <span style={{ ...s, top: -1, right: -1, borderTop: b, borderRight: b }} />
      <span style={{ ...s, bottom: -1, left:  -1, borderBottom: b, borderLeft:  b }} />
      <span style={{ ...s, bottom: -1, right: -1, borderBottom: b, borderRight: b }} />
    </>
  )
}

export function FleetShipsList({ fleetId, fleetName, onBack }: FleetShipsListProps) {
  const [ships, setShips] = useState<Ship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedShipId, setExpandedShipId] = useState<number | null>(null)
  const [selectedShipId, setSelectedShipId] = useState<number | null>(null)
  const [showAddShip, setShowAddShip] = useState(false)
  const [newShipName, setNewShipName] = useState('')
  const [newShipClass, setNewShipClass] = useState('frigate')

  useEffect(() => {
    const fetchShips = async () => {
      try {
        const response = await fetch(`/api/fleets/${fleetId}/ships`)
        if (response.ok) {
          setShips(await response.json())
          setError(null)
        } else {
          const err = await response.json()
          setError(err.error || 'Failed to fetch ships')
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchShips()
  }, [fleetId])

  const handleAddShip = async () => {
    if (!newShipName.trim()) return
    try {
      const res = await fetch(`/api/fleets/${fleetId}/ships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newShipName, hull_class: newShipClass }),
      })
      if (res.ok) {
        setNewShipName('')
        setNewShipClass('frigate')
        setShowAddShip(false)
        const updated = await fetch(`/api/fleets/${fleetId}/ships`)
        if (updated.ok) setShips(await updated.json())
      }
    } catch (e) {
      console.error('Error adding ship:', e)
    }
  }

  const baseStyle: React.CSSProperties = {
    height: '100%',
    background: tok.bg,
    borderLeft: `1px solid ${tok.border}`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: "'Courier New', Courier, monospace",
  }

  if (loading) {
    return (
      <div style={{ ...baseStyle, alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: tok.textBase, fontSize: 10, letterSpacing: '0.25em', opacity: 0.7 }}>
          RETRIEVING MANIFEST…
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ ...baseStyle, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <span style={{ color: '#c84040', fontSize: 10, letterSpacing: '0.2em' }}>⚠ {error}</span>
        <button onClick={onBack} style={{
          background: 'rgba(200,64,64,0.1)',
          border: `1px solid #c84040`,
          color: '#c84040',
          padding: '5px 14px',
          fontSize: 9,
          letterSpacing: '0.2em',
          cursor: 'pointer',
        }}>
          ← RTN FLEET VIEW
        </button>
      </div>
    )
  }

  if (selectedShipId !== null) {
    const ship = ships.find(s => s.id === selectedShipId)
    if (ship) {
      return (
        <ShipDetailsPanel
          shipId={ship.id}
          shipName={ship.name}
          onBack={() => setSelectedShipId(null)}
        />
      )
    }
  }

  return (
    <div style={baseStyle}>
      {/* Header */}
      <div style={{
        padding: '8px 14px',
        borderBottom: `1px solid ${tok.border}`,
        background: 'rgba(3, 7, 4, 0.97)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ color: tok.textBase, fontSize: 11, fontWeight: 'bold', letterSpacing: '0.12em' }}>
            {fleetName.toUpperCase()}
          </div>
          <div style={{ color: tok.textDim, fontSize: 8, letterSpacing: '0.25em', marginTop: 2 }}>
            ▸ SHIP MANIFEST
          </div>
        </div>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: `1px solid ${tok.border}`,
            color: tok.textDim, fontSize: 9, letterSpacing: '0.2em',
            cursor: 'pointer', padding: '3px 8px',
            transition: 'color 0.12s, border-color 0.12s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = tok.textBase; e.currentTarget.style.borderColor = tok.borderBright }}
          onMouseLeave={e => { e.currentTarget.style.color = tok.textDim;  e.currentTarget.style.borderColor = tok.border }}
        >
          ✕
        </button>
      </div>

      {/* Ship list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
        {ships.length === 0 ? (
          <div style={{ color: tok.textDim, fontSize: 9, textAlign: 'center', padding: '32px 0', letterSpacing: '0.2em' }}>
            NO VESSELS ON REGISTER
          </div>
        ) : (
          ships.map((ship) => {
            const accentColor = classColor[ship.hull_class.toLowerCase()] ?? '#6a8a70'
            const isExpanded = expandedShipId === ship.id

            return (
              <div key={ship.id} style={{ marginBottom: 6 }}>
                {/* Ship row */}
                <button
                  onClick={() => {
                    if (selectedShipId === ship.id) {
                      setExpandedShipId(isExpanded ? null : ship.id)
                    } else {
                      setSelectedShipId(ship.id)
                    }
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'rgba(4,9,5,0.7)',
                    border: `1px solid ${tok.border}`,
                    borderLeft: `3px solid ${accentColor}`,
                    padding: '7px 10px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = tok.borderBright}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = tok.border; e.currentTarget.style.borderLeftColor = accentColor }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        display: 'inline-block', width: 8, height: 8,
                        background: accentColor,
                      }} />
                      <div>
                        <div style={{ color: tok.textBase, fontSize: 10, fontWeight: 'bold', letterSpacing: '0.1em' }}>
                          {ship.name.toUpperCase()}
                        </div>
                        <div style={{ color: tok.textDim, fontSize: 8, letterSpacing: '0.2em', marginTop: 1 }}>
                          {ship.hull_class.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <span style={{ color: tok.textDim, fontSize: 9 }}>
                      {isExpanded ? '▼' : '▶'}
                    </span>
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div style={{
                    position: 'relative',
                    background: 'rgba(3,7,4,0.8)',
                    border: `1px solid ${tok.border}`,
                    borderTop: 'none',
                    padding: '10px 12px',
                    marginTop: -1,
                  }}>
                    <CornerBrackets />

                    {/* Hull */}
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ color: tok.textDim, fontSize: 8, letterSpacing: '0.2em' }}>HULL INTEGRITY</span>
                        <span style={{ color: hullIntegColor(ship.hull_hp), fontSize: 8 }}>{ship.hull_hp} / 500</span>
                      </div>
                      <StatusBar value={ship.hull_hp} max={500} color={hullIntegColor(ship.hull_hp)} />
                    </div>

                    {/* Crew */}
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ color: tok.textDim, fontSize: 8, letterSpacing: '0.2em' }}>CREW</span>
                        <span style={{ color: '#4a8aaa', fontSize: 8 }}>{ship.crew} / {ship.crew_max}</span>
                      </div>
                      <StatusBar value={ship.crew} max={ship.crew_max} color="#4a8aaa" />
                    </div>

                    {/* Ammo */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ color: tok.textDim, fontSize: 8, letterSpacing: '0.2em' }}>AMMUNITION</span>
                        <span style={{ color: tok.textHot, fontSize: 8 }}>{ship.ammo} / {ship.ammo_max}</span>
                      </div>
                      <StatusBar value={ship.ammo} max={ship.ammo_max} color={tok.textHot} />
                    </div>

                    {/* Weapon / Magazine counts */}
                    <div style={{
                      borderTop: `1px solid ${tok.border}`,
                      paddingTop: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: tok.textDim, fontSize: 7, letterSpacing: '0.2em' }}>WEAPONS</div>
                        <div style={{ color: tok.textBase, fontSize: 13, fontWeight: 'bold' }}>{ship.weapon_count}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: tok.textDim, fontSize: 7, letterSpacing: '0.2em' }}>MAGAZINES</div>
                        <div style={{ color: tok.textBase, fontSize: 13, fontWeight: 'bold' }}>{ship.magazine_count}</div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedShipId(ship.id) }}
                      style={{
                        width: '100%',
                        background: 'rgba(4,9,5,0.8)',
                        border: `1px solid ${tok.borderBright}`,
                        borderLeft: `3px solid ${tok.textBase}`,
                        color: tok.textBase,
                        padding: '5px 0',
                        fontSize: 9,
                        letterSpacing: '0.25em',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#0d1f10'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(4,9,5,0.8)'}
                    >
                      FULL DOSSIER →
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div style={{
        borderTop: `1px solid ${tok.border}`,
        padding: '6px 14px',
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ color: tok.textDim, fontSize: 8, letterSpacing: '0.2em' }}>
          VESSELS: {ships.length}
        </span>
        {showAddShip ? (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <input
              value={newShipName}
              onChange={e => setNewShipName(e.target.value)}
              placeholder="Name"
              style={{
                background: tok.bg,
                border: `1px solid ${tok.border}`,
                color: tok.textBase,
                padding: '4px 6px',
                fontSize: 8,
                fontFamily: 'inherit',
                width: 70,
              }}
            />
            <select
              value={newShipClass}
              onChange={e => setNewShipClass(e.target.value)}
              style={{
                background: tok.bg,
                border: `1px solid ${tok.border}`,
                color: tok.textBase,
                padding: '4px 4px',
                fontSize: 8,
                fontFamily: 'inherit',
              }}
            >
              <option value="frigate">Frigate</option>
              <option value="corvette">Corvette</option>
              <option value="destroyer">Destroyer</option>
              <option value="cruiser">Cruiser</option>
              <option value="carrier">Carrier</option>
              <option value="support">Support</option>
            </select>
            <button
              onClick={handleAddShip}
              style={{
                background: '#1a3a1a',
                border: `1px solid #4a8a4a`,
                color: '#8ada8a',
                padding: '4px 8px',
                fontSize: 8,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              ✓
            </button>
            <button
              onClick={() => { setShowAddShip(false); setNewShipName('') }}
              style={{
                background: '#3a1a1a',
                border: `1px solid #8a4a4a`,
                color: '#da8a8a',
                padding: '4px 8px',
                fontSize: 8,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddShip(true)}
            style={{
              background: 'transparent',
              border: `1px solid ${tok.border}`,
              color: tok.textDim,
              padding: '4px 8px',
              fontSize: 8,
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '0.1em',
            }}
          >
            + SHIP
          </button>
        )}
      </div>
    </div>
  )
}