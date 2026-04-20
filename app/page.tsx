"use client"

import { useState } from "react"
import { StarMap } from "@/components/star-map"
import { SystemDetail } from "@/components/system-detail"

interface StarSystem {
  id: number
  name: string
  x: number
  y: number
  star_type: string
  star_color: string
  description: string
}

export default function Home() {
  const [selectedSystem, setSelectedSystem] = useState<StarSystem | null>(null)

  const handleSystemSelect = (system: StarSystem) => {
    setSelectedSystem(system)
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Nebulous Fleet Command</h1>
          <p className="text-muted-foreground">
            Command your fleets across the galaxy. Navigate star systems and manage your empire.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Galaxy Map */}
          <div className="space-y-4">
            <StarMap
              onSystemSelect={handleSystemSelect}
              selectedSystemId={selectedSystem?.id}
            />
          </div>

          {/* System Details */}
          <div className="space-y-4">
            {selectedSystem ? (
              <SystemDetail system={selectedSystem} />
            ) : (
              <div className="flex items-center justify-center h-96 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <div className="text-center space-y-2">
                  <div className="text-2xl">🪐</div>
                  <div className="text-lg font-medium">Select a Star System</div>
                  <div className="text-sm text-muted-foreground">
                    Click on a star in the galaxy map to view its planets
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
