"use client"

import { useState, useEffect } from "react"
import { GalaxyStarMap } from "@/components/galaxy-star-map"
import { SystemView } from "@/components/system-view"
import { FleetWidget } from "@/components/fleet-widget"
import { FleetShipsList } from "@/components/fleet-ships-list"
import { FleetSettings } from "@/components/fleet-settings"

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
  status: "in_system" | "traveling"
  target_system_id?: number
}

// ─── Reusable corner-bracket panel decoration ─────────────────────────────────
function CornerBrackets({ color = "#ff8800" }: { color?: string }) {
  const s: React.CSSProperties = { position: "absolute", width: 10, height: 10 }
  const b2 = `2px solid ${color}`
  return (
    <>
      <span style={{ ...s, top: -1, left: -1,  borderTop: b2, borderLeft: b2  }} />
      <span style={{ ...s, top: -1, right: -1, borderTop: b2, borderRight: b2 }} />
      <span style={{ ...s, bottom: -1, left: -1,  borderBottom: b2, borderLeft: b2  }} />
      <span style={{ ...s, bottom: -1, right: -1, borderBottom: b2, borderRight: b2 }} />
    </>
  )
}

// ─── Thin labelled divider used inside info panels ────────────────────────────
function FieldRow({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ color: "#a8c8a8", fontSize: 13, letterSpacing: "0.2em", marginBottom: 4 }}>
        {label}
      </div>
      <div
        style={{
          color: accent ? "#ff8800" : "#d8f0d8",
          fontSize: accent ? 24 : 18,
          fontWeight: "bold",
          letterSpacing: "0.08em",
          fontFamily: "monospace",
        }}
      >
        {value}
      </div>
    </div>
  )
}

export default function Home() {
  const [selectedSystem, setSelectedSystem]             = useState<StarSystem | null>(null)
  const [viewingSystem, setViewingSystem]               = useState<StarSystem | null>(null)
  const [fleets, setFleets]                             = useState<Fleet[]>([])
  const [turn, setTurn]                                 = useState(0)
  const [selectedFleetForShips, setSelectedFleetForShips] = useState<Fleet | null>(null)
  const [fleetSettingsOpen, setFleetSettingsOpen]     = useState(false)

  const refreshFleets = async () => {
    try {
      const response = await fetch("/api/fleets")
      if (response.ok) setFleets(await response.json())
    } catch (error) {
      console.error("Error fetching fleets:", error)
    }
  }

  useEffect(() => {
    refreshFleets()
  }, [])

  const handleSystemDoubleClick  = (system: StarSystem) => setViewingSystem(system)
  const handleBackToGalaxy       = () => setViewingSystem(null)
  const handleAdvanceTurn        = () => setTurn(prev => prev + 1)
  const handleFleetDoubleClick   = (fleet: Fleet) => setSelectedFleetForShips(fleet)
  const handleBackFromFleetShips = () => setSelectedFleetForShips(null)

  // ── Shared palette tokens ──────────────────────────────────────────────────
  const tok = {
    bg:          "#050905",
    panelBg:     "rgba(4, 9, 5, 0.93)",
    border:      "#3d5c42",
    borderBright:"#ff8800",
    textDim:     "#6a8a6a",
    textBase:    "#a8c8a8",
    textHot:     "#ff8800",     // orange — turns, warnings
    textGreen:   "#6adc7a",     // phosphor — system-live indicator
    sidebar:     "#060b07",
  }

  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        overflow: "hidden",
        background: tok.bg,
        fontFamily: "'Courier New', Courier, monospace",
      }}
    >
      {/* ═══════════════════════════════════════════════════════════════════
          LEFT / MAIN — Tactical display
      ════════════════════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

        {/* Scanline veil */}
        <div
          style={{
            position: "absolute", inset: 0, pointerEvents: "none", zIndex: 20,
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 4px)",
          }}
        />

        {/* Star scatter — dimmer, more disciplined than the original */}
        <div
          style={{
            position: "absolute", inset: 0, opacity: 0.22,
            backgroundImage: `
              radial-gradient(1px 1px at 20px 30px, #8ab08a, transparent),
              radial-gradient(1px 1px at 60px 140px, #8ab08a, transparent),
              radial-gradient(1.5px 1.5px at 110px 55px, white, transparent),
              radial-gradient(1px 1px at 200px 90px, #8ab08a, transparent),
              radial-gradient(2px 2px at 330px 20px, white, transparent),
              radial-gradient(1px 1px at 440px 160px, #8ab08a, transparent),
              radial-gradient(1.5px 1.5px at 550px 70px, white, transparent),
              radial-gradient(1px 1px at 660px 120px, #8ab08a, transparent)
            `,
            backgroundSize: "700px 200px",
          }}
        />

        {/* ── Top operational header bar ───────────────────────────────── */}
        <div
          style={{
            position: "relative", zIndex: 30,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 16px",
            borderBottom: `1px solid ${tok.border}`,
            background: "rgba(3, 7, 4, 0.97)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* Live indicator */}
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                display: "inline-block", width: 8, height: 8,
                background: tok.textGreen,
                boxShadow: `0 0 8px ${tok.textGreen}`,
                animation: "pulse 2s infinite",
              }} />
              <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
              <span style={{ color: tok.textGreen, fontSize: 14, letterSpacing: "0.25em" }}>SYS.ONLINE</span>
            </span>
            <span style={{ color: tok.textDim, fontSize: 14, letterSpacing: "0.2em" }}>
              GALACTIC COMMAND INTERFACE — v2.{String(turn).padStart(3, "0")}
            </span>
            {viewingSystem && (
              <button
                onClick={handleBackToGalaxy}
                style={{
                  background: tok.panelBg,
                  border: `1px solid ${tok.borderBright}`,
                  borderLeft: `3px solid ${tok.textHot}`,
                  color: tok.textBase,
                  padding: "6px 12px",
                  fontSize: 13,
                  letterSpacing: "0.2em",
                  cursor: "pointer",
                  marginLeft: 16,
                }}
              >
                ← RTN
              </button>
            )}
          </div>
          <span style={{ color: tok.textDim, fontSize: 14, letterSpacing: "0.2em" }}>
            AUTH.VERIFIED // CLEARANCE: SIGMA
          </span>
        </div>

        {/* ── Main content area with right panel ───────────────────────────── */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Map viewport */}
          <div style={{ flex: 1, position: "relative", zIndex: 5 }}>
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

          {/* SITREP panel - floating - left, stacked on left side */}
          <div
            style={{
              position: "absolute",
              top:  120,
              left: 2,
              width: 180,
              zIndex: 50,
            }}
          >
            <div
              style={{
                background: tok.panelBg,
                border: `1px solid ${tok.border}`,
                padding: "10px 14px",
              }}
            >
              <div
                style={{
                  color: tok.textDim, fontSize: 12, letterSpacing: "0.3em",
                  marginBottom: 10, paddingBottom: 6,
                  borderBottom: `1px solid ${tok.border}`,
                }}
              >
                ▸ SITREP
              </div>
              <FieldRow
                label="SECTOR"
                value={viewingSystem ? viewingSystem.name.toUpperCase() : "GALACTIC MAP"}
              />
              <FieldRow
                label="CYCLE"
                value={String(turn).padStart(4, "0")}
                accent
              />
            </div>

            {/* COMMIT ORDERS button - floating below SITREP */}
            <button
              onClick={handleAdvanceTurn}
              style={{
                background: "#0d2010",
                border: `1px solid ${tok.borderBright}`,
                borderLeft: `3px solid ${tok.textHot}`,
                color: tok.textBase,
                padding: "10px 16px",
                fontSize: 13,
                letterSpacing: "0.2em",
                fontWeight: "bold",
                cursor: "pointer",
                textTransform: "uppercase",
                width: "100%",
                marginTop: 8,
              }}
            >
              COMMIT ORDERS ▶
            </button>

            {/* Selected system info - shows when a system is selected, below COMMIT ORDERS */}
            {selectedSystem && (
              <div
                style={{
                  background: tok.panelBg,
                  border: `1px solid ${tok.border}`,
                  borderLeft: `3px solid ${tok.textHot}`,
                  padding: "10px 14px",
                  marginTop: 8,
                }}
              >
                <div style={{ color: tok.textHot, fontSize: 14, fontWeight: "bold", letterSpacing: "0.12em", marginBottom: 6 }}>
                  {selectedSystem.name.toUpperCase()}
                </div>
                <div style={{ color: tok.textBase, fontSize: 12, letterSpacing: "0.15em" }}>
                  STAR CLASS: {selectedSystem.star_type}
                </div>
                <div style={{ color: tok.textBase, fontSize: 12, letterSpacing: "0.15em", marginTop: 4 }}>
                  STATUS: DESIGNATED ◆
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          RIGHT — Fleet asset manifest sidebar
      ════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          width: 288,
          flexShrink: 0,
          background: tok.sidebar,
          borderLeft: `1px solid ${tok.border}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Sidebar header strip */}
        <div
          style={{
            padding: "8px 14px",
            borderBottom: `1px solid ${tok.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <span style={{ color: tok.textDim, fontSize: 13, letterSpacing: "0.28em" }}>
            ▸ FLEET ASSETS
          </span>
          <button
            onClick={() => setFleetSettingsOpen(true)}
            style={{
              background: "none",
              border: `1px solid ${tok.border}`,
              color: tok.textDim,
              padding: "2px 8px",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            ⚙
          </button>
        </div>

        <div style={{ flex: 1, overflow: "hidden" }}>
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
              selectedFleetId={undefined}
            />
          )}
        </div>
      </div>

      {/* Fleet Settings Modal */}
      <FleetSettings 
        isOpen={fleetSettingsOpen} 
        onClose={() => setFleetSettingsOpen(false)}
        onFleetSelect={(fleetId: number) => {
          const fleet = fleets.find(f => f.id === fleetId)
          if (fleet) setSelectedFleetForShips(fleet)
        }}
        onFleetCreated={refreshFleets}
      />
    </main>
  )
}