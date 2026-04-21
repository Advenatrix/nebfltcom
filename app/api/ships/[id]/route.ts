import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const shipId = parseInt(id)

    if (isNaN(shipId)) {
      return NextResponse.json({ error: 'Invalid ship ID' }, { status: 400 })
    }

    // Get ship details
    const ships = await sql`
      SELECT 
        id, fleet_id, name, hull_class, hull_hp, 
        crew, crew_max, ammo, ammo_max
      FROM ships
      WHERE id = ${shipId}
    `

    if (ships.length === 0) {
      return NextResponse.json({ error: 'Ship not found' }, { status: 404 })
    }

    const ship = ships[0]

    // Get weapon slots
    const weapons = await sql`
      SELECT 
        id, mount_kind, weapon_name, weapon_caliber, weapon_damage
      FROM weapon_slots
      WHERE ship_id = ${shipId}
      ORDER BY mount_kind ASC
    `

    // Get magazines (cargo/ammo)
    const magazines = await sql`
      SELECT 
        id, ammo_type, quantity, capacity
      FROM magazines
      WHERE ship_id = ${shipId}
      ORDER BY ammo_type ASC
    `

    return NextResponse.json({
      ...ship,
      weapons,
      magazines
    })
  } catch (error) {
    console.error('Error fetching ship details:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch ship',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      }, 
      { status: 500 }
    )
  }
}