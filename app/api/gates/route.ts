import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET() {
  try {
    const gates = await sql`
      SELECT g.id, g.system_a_id, g.system_b_id,
             sa.name as system_a_name, sa.x as system_a_x, sa.y as system_a_y,
             sb.name as system_b_name, sb.x as system_b_x, sb.y as system_b_y
      FROM gates g
      JOIN star_systems sa ON g.system_a_id = sa.id
      JOIN star_systems sb ON g.system_b_id = sb.id
      ORDER BY g.id
    `

    return NextResponse.json(gates)
  } catch (error) {
    console.error('Error fetching gates:', error)
    return NextResponse.json({ error: 'Failed to fetch gates' }, { status: 500 })
  }
}