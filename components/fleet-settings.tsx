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

interface FleetSettingsProps {
  isOpen: boolean
  onClose: () => void
  onFleetSelect?: (fleetId: number) => void
  onFleetCreated?: () => void
}

interface System {
  id: number
  name: string
}

export function FleetSettings({ isOpen, onClose, onFleetSelect, onFleetCreated }: FleetSettingsProps) {
  const [fleets, setFleets] = useState<Fleet[]>([])
  const [systems, setSystems] = useState<System[]>([])
  const [planets, setPlanets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingFleet, setEditingFleet] = useState<Fleet | null>(null)
  const [editingSystemId, setEditingSystemId] = useState<number>(1)
  const [editingPlanetId, setEditingPlanetId] = useState<number | null>(null)
  const [newFleetName, setNewFleetName] = useState('')
  const [newFleetSystem, setNewFleetSystem] = useState<number>(1)
  const [newFleetPlanet, setNewFleetPlanet] = useState<number | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const tok = {
    bg: '#050905',
    border: '#3d5c42',
    textDim: '#6a8a6a',
    textBase: '#a8c8a8',
    textHot: '#ff8800',
  }

  useEffect(() => {
    if (isOpen) fetchFleets()
  }, [isOpen])

  const fetchFleets = async () => {
    try {
      const res = await fetch('/api/fleets')
      if (res.ok) setFleets(await res.json())
    } catch (e) {
      console.error('Error fetching fleets:', e)
    } finally {
      setLoading(false)
    }
  }

  const fetchSystems = async () => {
    try {
      const [sysRes, planetRes] = await Promise.all([
        fetch('/api/star-systems'),
        fetch('/api/planets')
      ])
      if (sysRes.ok) setSystems(await sysRes.json())
      if (planetRes.ok) setPlanets(await planetRes.json())
    } catch (e) {
      console.error('Error fetching systems:', e)
    }
  }

  const getPlanetsForSystem = (systemId: number) => {
    return planets.filter((p: any) => p.system_id === systemId)
  }

  useEffect(() => {
    fetchSystems()
  }, [])

  const handleCreate = async () => {
    if (!newFleetName.trim()) return
    try {
      const res = await fetch('/api/fleets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFleetName, systemId: newFleetSystem, planetId: newFleetPlanet }),
      })
      if (res.ok) {
        const newFleet = await res.json()
        setNewFleetName('')
        setShowCreate(false)
        fetchFleets()
        onFleetCreated?.()
        if (onFleetSelect && newFleet.id) {
          onFleetSelect(newFleet.id)
          onClose()
        }
      }
    } catch (e) {
      console.error('Error creating fleet:', e)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this fleet?')) return
    try {
      const res = await fetch(`/api/fleets/${id}`, { method: 'DELETE' })
      if (res.ok) fetchFleets()
    } catch (e) {
      console.error('Error deleting fleet:', e)
    }
  }

  const handleUpdate = async () => {
    if (!editingFleet) return
    try {
      const res = await fetch(`/api/fleets/${editingFleet.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingFleet.name, systemId: editingSystemId, planetId: editingPlanetId }),
      })
      if (res.ok) {
        setEditingFleet(null)
        fetchFleets()
      }
    } catch (e) {
      console.error('Error updating fleet:', e)
    }
  }

  const startEdit = (fleet: Fleet) => {
    setEditingFleet(fleet)
    setEditingSystemId(fleet.current_system_id)
    setEditingPlanetId((fleet as any).current_planet_id || null)
  }

  const handleSystemChange = (systemId: number) => {
    setEditingSystemId(systemId)
    setEditingPlanetId(null)
  }

  const handleNewFleetSystemChange = (systemId: number) => {
    setNewFleetSystem(systemId)
    setNewFleetPlanet(null)
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.8)',
    }}>
      <div style={{
        background: tok.bg,
        border: `1px solid ${tok.border}`,
        borderLeft: `3px solid ${tok.textHot}`,
        padding: '20px',
        width: 400,
        maxHeight: '80vh',
        overflowY: 'auto',
        fontFamily: "'Courier New', Courier, monospace",
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ color: tok.textHot, fontSize: 16, fontWeight: 'bold', letterSpacing: '0.1em' }}>
            ▸ FLEET MANAGEMENT
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: tok.textDim,
              fontSize: 18, cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div style={{ color: tok.textDim, textAlign: 'center', padding: 20 }}>LOADING...</div>
        ) : (
          <>
            {/* Fleet List */}
            <div style={{ marginBottom: 16 }}>
              {fleets.length === 0 ? (
                <div style={{ color: tok.textDim, textAlign: 'center', padding: 20 }}>
                  NO FLEETS FOUND
                </div>
              ) : (
                fleets?.map((fleet: any) => (
                  <div key={fleet.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 12px', marginBottom: 8,
                    background: 'rgba(4,9,5,0.8)',
                    border: `1px solid ${tok.border}`,
                  }}>
                    {editingFleet?.id === fleet.id ? (
                      <div style={{ display: 'flex', gap: 8, flex: 1, flexDirection: 'column' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            value={editingFleet?.name ?? ''}
                            onChange={e => editingFleet && setEditingFleet({ ...editingFleet, name: e.target.value })}
                            style={{
                              background: '#0a150a', border: `1px solid ${tok.border}`,
                              color: tok.textBase, padding: '8px 12px',
                              fontFamily: 'inherit', flex: 1, fontSize: 16,
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <select
                            value={editingSystemId}
                            onChange={e => handleSystemChange(parseInt(e.target.value))}
                            style={{
                              background: '#0a150a', border: `1px solid ${tok.border}`,
                              color: tok.textBase, padding: '8px 12px',
                              fontFamily: 'inherit', flex: 1, fontSize: 14,
                            }}
                          >
                            {systems.map((sys: any) => (
                              <option key={sys.id} value={sys.id}>{sys.name}</option>
                            ))}
                          </select>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <select
                            value={editingPlanetId || ''}
                            onChange={e => setEditingPlanetId(e.target.value ? parseInt(e.target.value) : null)}
                            style={{
                              background: '#0a150a', border: `1px solid ${tok.border}`,
                              color: tok.textBase, padding: '8px 12px',
                              fontFamily: 'inherit', flex: 1, fontSize: 14,
                            }}
                          >
                            <option value="">STAR</option>
                            {getPlanetsForSystem(editingSystemId).map((p: any) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                          <button onClick={handleUpdate} style={{ background: tok.textHot, border: 'none', padding: '8px 16px', cursor: 'pointer', color: '#000', fontWeight: 'bold', fontSize: 14 }}>SAVE</button>
                          <button onClick={() => setEditingFleet(null)} style={{ background: tok.border, border: 'none', padding: '8px 12px', cursor: 'pointer', color: tok.textBase, fontSize: 14 }}>CANCEL</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <div style={{ color: tok.textBase, fontSize: 16, fontWeight: 'bold' }}>{(fleet?.name || 'UNNAMED').toUpperCase()}</div>
                          <div style={{ color: tok.textDim, fontSize: 14 }}>ORBIT: {fleet?.planet_name || fleet?.system_name} | SHIPS: {fleet?.ship_count || 0}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => startEdit(fleet)} style={{ background: 'none', border: `1px solid ${tok.border}`, color: tok.textBase, padding: '4px 8px', cursor: 'pointer', fontSize: 11 }}>EDIT</button>
                          <button onClick={() => handleDelete(fleet.id)} style={{ background: 'none', border: `1px solid #c84040`, color: '#c84040', padding: '4px 8px', cursor: 'pointer', fontSize: 11 }}>DEL</button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Create New Fleet */}
            {showCreate ? (
              <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                <input
                  value={newFleetName}
                  onChange={e => setNewFleetName(e.target.value)}
                  placeholder="FLEET NAME"
                  style={{
                    background: '#0a150a', border: `1px solid ${tok.border}`,
                    color: tok.textBase, padding: '12px 14px',
                    fontFamily: 'inherit', flex: 1, fontSize: 16,
                  }}
                />
                <select
                  value={newFleetSystem}
                  onChange={e => handleNewFleetSystemChange(parseInt(e.target.value))}
                  style={{
                    background: '#0a150a', border: `1px solid ${tok.border}`,
                    color: tok.textBase, padding: '12px 14px',
                    fontFamily: 'inherit', flex: 1, fontSize: 15,
                  }}
                >
                  {systems.map((sys: any) => (
                    <option key={sys.id} value={sys.id}>{sys.name}</option>
                  ))}
                </select>
                <select
                  value={newFleetPlanet || ''}
                  onChange={e => setNewFleetPlanet(e.target.value ? parseInt(e.target.value) : null)}
                  style={{
                    background: '#0a150a', border: `1px solid ${tok.border}`,
                    color: tok.textBase, padding: '12px 14px',
                    fontFamily: 'inherit', flex: 1, fontSize: 15,
                  }}
                >
                  <option value="">STAR</option>
                  {getPlanetsForSystem(newFleetSystem).map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button onClick={handleCreate} style={{ background: tok.textHot, border: 'none', padding: '12px 16px', cursor: 'pointer', color: '#000', fontWeight: 'bold', flex: 1, fontSize: 16 }}>CREATE</button>
                  <button onClick={() => setShowCreate(false)} style={{ background: tok.border, border: 'none', padding: '12px 14px', cursor: 'pointer', color: tok.textBase, fontSize: 16 }}>CANCEL</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCreate(true)}
                style={{
                  width: '100%', background: 'rgba(4,9,5,0.8)', border: `1px solid ${tok.border}`,
                  color: tok.textBase, padding: '12px', cursor: 'pointer',
                  fontSize: 12, letterSpacing: '0.1em',
                }}
              >
                + CREATE NEW FLEET
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
