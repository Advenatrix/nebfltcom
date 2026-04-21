import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const fleetId = parseInt(id)

    if (isNaN(fleetId)) {
      return NextResponse.json({ error: 'Invalid fleet ID' }, { status: 400 })
    }

    const result = await sql`
      SELECT id, name, faction_id, current_system_id, owner_user_id, created_at, status, target_system_id
      FROM fleets
      WHERE id = ${fleetId}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Fleet not found' }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error('Error fetching fleet:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch fleet' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const fleetId = parseInt(id)

    if (isNaN(fleetId)) {
      return NextResponse.json({ error: 'Invalid fleet ID' }, { status: 400 })
    }

    const body = await request.json()
    const { name, systemId, planetId } = body

    if (!name) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 })
    }

    const planetIdNum = planetId || null

    if (systemId) {
      await sql`
        UPDATE fleets
        SET name = ${name}, current_system_id = ${systemId}, current_planet_id = ${planetIdNum}
        WHERE id = ${fleetId}
      `
    } else {
      await sql`
        UPDATE fleets
        SET name = ${name}, current_planet_id = ${planetIdNum}
        WHERE id = ${fleetId}
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating fleet:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update fleet' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const fleetId = parseInt(id)

    if (isNaN(fleetId)) {
      return NextResponse.json({ error: 'Invalid fleet ID' }, { status: 400 })
    }

    await sql`
      DELETE FROM fleets
      WHERE id = ${fleetId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting fleet:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete fleet' },
      { status: 500 }
    )
  }
}