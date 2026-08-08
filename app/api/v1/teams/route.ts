import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { teams, teamMembers } from "@/lib/db/schema"
import { applyApiRateLimit } from "@/lib/api-middleware"

export async function GET(request: NextRequest) {
  const { response, headers } = applyApiRateLimit(request)
  if (response) return response

  try {
    const allTeams = await db.query.teams.findMany()
    return NextResponse.json({ data: allTeams }, { headers })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers })
  }
}

export async function POST(request: NextRequest) {
  const { response, headers } = applyApiRateLimit(request)
  if (response) return response

  try {
    const body = await request.json()
    if (!body.name || !body.slug) {
      return NextResponse.json({ error: "name and slug are required" }, { status: 400, headers })
    }

    const [newTeam] = await db
      .insert(teams)
      .values({
        name: body.name,
        slug: body.slug.toLowerCase(),
      })
      .returning()

    return NextResponse.json({ data: newTeam }, { status: 201, headers })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers })
  }
}
