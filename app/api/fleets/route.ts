import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET() {
  try {
    const fleets = await sql`
      SELECT 
        f.id, f.name, f.faction_id, f.current_system_id, f.owner_user_id, f.created_at,
        ss.name as system_name,
        COUNT(s.id) as ship_count
      FROM fleets f
      JOIN star_systems ss ON f.current_system_id = ss.id
      LEFT JOIN ships s ON f.id = s.fleet_id
      GROUP BY f.id, ss.name
      ORDER BY f.name
    `

    return NextResponse.json(fleets)
  } catch (error) {
    console.error('Error fetching fleets:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch fleets',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      }, 
      { status: 500 }
    )
  }
}