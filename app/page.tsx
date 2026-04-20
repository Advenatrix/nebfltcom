"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Minus, RotateCcw } from "lucide-react"

export default function Home() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState("")

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">React App</CardTitle>
          <CardDescription>A simple interactive demo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Greeting Section */}
          <div className="space-y-3">
            <Input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {name && (
              <p className="text-center text-lg text-muted-foreground">
                Hello, <span className="font-semibold text-foreground">{name}</span>!
              </p>
            )}
          </div>

          {/* Counter Section */}
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-6xl font-bold tabular-nums">{count}</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCount(count - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCount(0)}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCount(count + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
