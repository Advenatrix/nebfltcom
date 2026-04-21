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

const tok = {
  bg:           '#060b07',
  panelBg:      'rgba(4, 9, 5, 0.96)',
  border:       '#1e3022',
  borderBright: '#2e5035',
  textDim:      '#3d5c42',
  textBase:     '#8ab08a',
  textHot:      '#ff8800',
  textGreen:    '#6adc7a',
}

const hullColor = (hp: number, max = 500) => {
  const p = hp / max
  if (p > 0.6) return '#4a8a50'
  if (p > 0.3) return '#ff8800'
  return '#c84040'
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      color: tok.textDim, fontSize: 16, letterSpacing: '0.28em',
      borderBottom: `1px solid ${tok.border}`,
      paddingBottom: 5, marginBottom: 8,
    }}>
      ▸ {children}
    </div>
  )
}

function StatusBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div style={{ height: 2, background: '#111a12', border: `1px solid ${tok.border}`, position: 'relative', margin: '3px 0' }}>
      <div style={{ position: 'absolute', inset: 0, width: `${Math.min(100, (value / max) * 100)}%`, background: color }} />
    </div>
  )
}

function CornerBrackets({ color = '#ff8800' }: { color?: string }) {
  const s: React.CSSProperties = { position: 'absolute', width: 8, height: 8 }
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

export function ShipDetailsPanel({ shipId, shipName, onBack }: ShipDetailsPanelProps) {
  const [ship, setShip] = useState<ShipDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState<ShipDetails | null>(null)

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`/api/ships/${shipId}`)
        if (res.ok) {
          setShip(await res.json())
          setError(null)
        } else {
          const e = await res.json()
          setError(e.error || 'Failed to fetch ship details')
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetch_()
  }, [shipId])

  const handleEditClick = () => {
    if (ship) {
      setEditData({ ...ship })
      setEditMode(true)
    }
  }

  const handleSave = async () => {
    if (!editData) return
    try {
      const res = await fetch(`/api/ships/${shipId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editData.name,
          hull_class: editData.hull_class,
          hull_hp: editData.hull_hp,
          crew: editData.crew,
          crew_max: editData.crew_max,
          ammo: editData.ammo,
          ammo_max: editData.ammo_max,
        }),
      })
      if (res.ok) {
        setShip(editData)
        setEditMode(false)
        setEditData(null)
      }
    } catch (e) {
      console.error('Error saving ship:', e)
    }
  }

  const handleCancel = () => {
    setEditMode(false)
    setEditData(null)
  }

  const handleRemove = async () => {
    if (!confirm(`Permanently delete vessel "${ship?.name}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/ships/${shipId}`, { method: 'DELETE' })
      if (res.ok) {
        onBack()
      }
    } catch (e) {
      console.error('Error removing ship:', e)
    }
  }

  const base: React.CSSProperties = {
    height: '100%',
    background: tok.bg,
    borderLeft: `1px solid ${tok.border}`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: "'Courier New', Courier, monospace",
  }

  if (loading) return (
    <div style={{ ...base, alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: tok.textBase, fontSize: 10, letterSpacing: '0.25em', opacity: 0.7 }}>
        ACCESSING DOSSIER…
      </span>
    </div>
  )

  if (error || !ship) return (
    <div style={{ ...base, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <span style={{ color: '#c84040', fontSize: 10, letterSpacing: '0.2em' }}>⚠ {error ?? 'VESSEL NOT FOUND'}</span>
      <button onClick={onBack} style={{
        background: 'rgba(200,64,64,0.1)',
        border: '1px solid #c84040',
        color: '#c84040',
        padding: '5px 14px',
        fontSize: 9,
        letterSpacing: '0.2em',
        cursor: 'pointer',
      }}>
        ← RTN
      </button>
    </div>
  )

  const weaponsByMount = ship.weapons.reduce<Record<string, Weapon[]>>((acc, w) => {
    ;(acc[w.mount_kind] ??= []).push(w)
    return acc
  }, {})

  return (
    <div style={base}>
      {/* Header */}
      <div style={{
        padding: '8px 14px',
        borderBottom: `1px solid ${tok.border}`,
        background: 'rgba(3,7,4,0.97)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        {editMode && editData ? (
          <div style={{ display: 'flex', gap: 8, flex: 1 }}>
            <input
              value={editData.name}
              onChange={e => setEditData({ ...editData, name: e.target.value })}
              style={{
                background: tok.bg,
                border: `1px solid ${tok.border}`,
                color: tok.textBase,
                padding: '4px 8px',
                fontSize: 11,
                fontFamily: 'inherit',
                flex: 1,
              }}
            />
            <select
              value={editData.hull_class}
              onChange={e => setEditData({ ...editData, hull_class: e.target.value })}
              style={{
                background: tok.bg,
                border: `1px solid ${tok.border}`,
                color: tok.textBase,
                padding: '4px 8px',
                fontSize: 11,
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
          </div>
        ) : (
          <div>
            <div style={{ color: tok.textBase, fontSize: 11, fontWeight: 'bold', letterSpacing: '0.12em' }}>
              {ship.name.toUpperCase()}
            </div>
            <div style={{ color: tok.textDim, fontSize: 16, letterSpacing: '0.25em', marginTop: 2 }}>
              {ship.hull_class.toUpperCase()} — VESSEL DOSSIER
            </div>
          </div>
        )}
        {!editMode ? (
          <>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={handleEditClick}
                style={{
                  background: 'none',
                  border: `1px solid #ff8800`,
                  color: '#ff8800',
                  fontSize: 9,
                  letterSpacing: '0.15em',
                  cursor: 'pointer',
                  padding: '4px 10px',
                }}
              >
                EDIT
              </button>
              <button
                onClick={handleRemove}
                style={{
                  background: 'none',
                  border: `1px solid #c84040`,
                  color: '#c84040',
                  fontSize: 9,
                  letterSpacing: '0.15em',
                  cursor: 'pointer',
                  padding: '4px 10px',
                }}
              >
                REMOVE
              </button>
            </div>
            <button
              onClick={onBack}
              style={{
                background: 'none',
                border: `1px solid ${tok.border}`,
                color: tok.textDim,
                fontSize: 9,
                letterSpacing: '0.2em',
                cursor: 'pointer',
                padding: '3px 8px',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = tok.textBase; e.currentTarget.style.borderColor = tok.borderBright }}
              onMouseLeave={e => { e.currentTarget.style.color = tok.textDim; e.currentTarget.style.borderColor = tok.border }}
            >
              ✕
            </button>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={handleSave}
                style={{
                  background: 'none',
                  border: `1px solid #4a8a4a`,
                  color: '#8ada8a',
                  fontSize: 9,
                  letterSpacing: '0.15em',
                  cursor: 'pointer',
                  padding: '4px 10px',
                }}
              >
                SAVE
              </button>
              <button
                onClick={handleCancel}
                style={{
                  background: 'none',
                  border: `1px solid #8a4a4a`,
                  color: '#da8a8a',
                  fontSize: 9,
                  letterSpacing: '0.15em',
                  cursor: 'pointer',
                  padding: '4px 10px',
                }}
              >
                CANCEL
              </button>
            </div>
            <div style={{ width: 24 }} />
          </>
        )}
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* ── SHIP STATUS ────────────────────────────────────────── */}
        <div style={{ position: 'relative', background: 'rgba(3,7,4,0.8)', border: `1px solid ${tok.border}`, padding: '10px 12px' }}>
          <CornerBrackets />
          <SectionLabel>SHIP STATUS</SectionLabel>

          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
              <span style={{ color: tok.textDim, fontSize: 16, letterSpacing: '0.2em' }}>HULL INTEGRITY</span>
              {editMode && editData ? (
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <input
                    type="number"
                    value={editData.hull_hp}
                    onChange={e => setEditData({ ...editData, hull_hp: parseInt(e.target.value) || 0 })}
                    style={{ background: tok.bg, border: `1px solid ${tok.border}`, color: tok.textBase, padding: '2px 6px', fontSize: 16, fontFamily: 'inherit', width: 50 }}
                  />
                  <span style={{ color: tok.textDim, fontSize: 16 }}>/ 500</span>
                </div>
              ) : (
                <span style={{ color: hullColor(ship.hull_hp), fontSize: 16 }}>{ship.hull_hp} / 500 HP</span>
              )}
            </div>
            <StatusBar value={ship.hull_hp} max={500} color={hullColor(ship.hull_hp)} />
          </div>

          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
              <span style={{ color: tok.textDim, fontSize: 16, letterSpacing: '0.2em' }}>CREW</span>
              {editMode && editData ? (
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <input
                    type="number"
                    value={editData.crew}
                    onChange={e => setEditData({ ...editData, crew: parseInt(e.target.value) || 0 })}
                    style={{ background: tok.bg, border: `1px solid ${tok.border}`, color: tok.textBase, padding: '2px 6px', fontSize: 16, fontFamily: 'inherit', width: 50 }}
                  />
                  <span style={{ color: tok.textDim, fontSize: 16 }}>/</span>
                  <input
                    type="number"
                    value={editData.crew_max}
                    onChange={e => setEditData({ ...editData, crew_max: parseInt(e.target.value) || 0 })}
                    style={{ background: tok.bg, border: `1px solid ${tok.border}`, color: tok.textBase, padding: '2px 6px', fontSize: 16, fontFamily: 'inherit', width: 50 }}
                  />
                </div>
              ) : (
                <span style={{ color: '#4a8aaa', fontSize: 16 }}>{ship.crew} / {ship.crew_max}</span>
              )}
            </div>
            <StatusBar value={ship.crew} max={ship.crew_max} color="#4a8aaa" />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
              <span style={{ color: tok.textDim, fontSize: 16, letterSpacing: '0.2em' }}>READY AMMUNITION</span>
              {editMode && editData ? (
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <input
                    type="number"
                    value={editData.ammo}
                    onChange={e => setEditData({ ...editData, ammo: parseInt(e.target.value) || 0 })}
                    style={{ background: tok.bg, border: `1px solid ${tok.border}`, color: tok.textBase, padding: '2px 6px', fontSize: 16, fontFamily: 'inherit', width: 50 }}
                  />
                  <span style={{ color: tok.textDim, fontSize: 16 }}>/</span>
                  <input
                    type="number"
                    value={editData.ammo_max}
                    onChange={e => setEditData({ ...editData, ammo_max: parseInt(e.target.value) || 0 })}
                    style={{ background: tok.bg, border: `1px solid ${tok.border}`, color: tok.textBase, padding: '2px 6px', fontSize: 16, fontFamily: 'inherit', width: 50 }}
                  />
                </div>
              ) : (
                <span style={{ color: tok.textHot, fontSize: 16 }}>{ship.ammo} / {ship.ammo_max}</span>
              )}
            </div>
            <StatusBar value={ship.ammo} max={ship.ammo_max} color={tok.textHot} />
          </div>
        </div>

        {/* ── WEAPONS SYSTEMS ────────────────────────────────────── */}
        <div style={{ position: 'relative', background: 'rgba(3,7,4,0.8)', border: `1px solid ${tok.border}`, padding: '10px 12px' }}>
          <CornerBrackets />
          <SectionLabel>WEAPONS SYSTEMS</SectionLabel>

          {Object.keys(weaponsByMount).length === 0 ? (
            <div style={{ color: tok.textDim, fontSize: 16, letterSpacing: '0.2em' }}>NO WEAPONS INSTALLED</div>
          ) : (
            Object.entries(weaponsByMount).map(([mountKind, weapons]) => (
              <div key={mountKind} style={{ marginBottom: 8 }}>
                <div style={{ color: tok.textDim, fontSize: 16, letterSpacing: '0.25em', marginBottom: 4 }}>
                  [{mountKind.toUpperCase()}]
                </div>
                {weapons.map((w) => (
                  <div
                    key={w.id}
                    style={{
                      background: 'rgba(4,9,5,0.6)',
                      border: `1px solid ${tok.border}`,
                      borderLeft: `2px solid ${w.weapon_damage > 0 ? '#c84040' : tok.textDim}`,
                      padding: '5px 8px',
                      marginBottom: 4,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ color: w.weapon_name ? tok.textBase : tok.textDim, fontSize: 9, letterSpacing: '0.08em' }}>
                        {w.weapon_name?.toUpperCase() ?? '— MOUNT VACANT —'}
                      </span>
                      {w.weapon_damage > 0 && (
                        <span style={{ color: '#c84040', fontSize: 16, letterSpacing: '0.1em' }}>
                          {w.weapon_damage} DMG
                        </span>
                      )}
                    </div>
                    {w.weapon_caliber && (
                      <div style={{ color: tok.textDim, fontSize: 16, letterSpacing: '0.15em' }}>{w.weapon_caliber}</div>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* ── CARGO / AMMUNITION ─────────────────────────────────── */}
        <div style={{ position: 'relative', background: 'rgba(3,7,4,0.8)', border: `1px solid ${tok.border}`, padding: '10px 12px' }}>
          <CornerBrackets />
          <SectionLabel>CARGO / ORDNANCE</SectionLabel>

          {ship.magazines.length === 0 ? (
            <div style={{ color: tok.textDim, fontSize: 16, letterSpacing: '0.2em' }}>NO CARGO ON MANIFEST</div>
          ) : (
            ship.magazines.map((mag) => (
              <div
                key={mag.id}
                style={{
                  background: 'rgba(4,9,5,0.6)',
                  border: `1px solid ${tok.border}`,
                  padding: '6px 8px',
                  marginBottom: 6,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ color: tok.textBase, fontSize: 9, letterSpacing: '0.08em' }}>{mag.ammo_type.toUpperCase()}</span>
                  <span style={{ color: tok.textHot, fontSize: 16 }}>{mag.quantity} / {mag.capacity}</span>
                </div>
                <StatusBar value={mag.quantity} max={mag.capacity} color={tok.textHot} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer — back button */}
      <div style={{
        borderTop: `1px solid ${tok.border}`,
        padding: '8px 10px',
        flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{
            width: '100%',
            background: 'rgba(4,9,5,0.8)',
            border: `1px solid ${tok.borderBright}`,
            borderLeft: `3px solid ${tok.textBase}`,
            color: tok.textBase,
            padding: '6px 0',
            fontSize: 9,
            letterSpacing: '0.25em',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'background 0.12s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#0d1f10'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(4,9,5,0.8)'}
        >
          ← RTN FLEET MANIFEST
        </button>
      </div>
    </div>
  )
}