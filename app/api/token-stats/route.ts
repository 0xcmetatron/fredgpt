import { type NextRequest, NextResponse } from "next/server"
import { tokenManager } from "@/lib/token-rotation"

export async function GET(request: NextRequest) {
  try {
    const stats = tokenManager.getTokenStats()
    return NextResponse.json({ tokens: stats })
  } catch (error) {
    console.error("Token Stats Error:", error)
    return NextResponse.json({ error: "Failed to get token statistics" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, email } = body

    if (action === "reset" && email) {
      tokenManager.resetToken(email)
      return NextResponse.json({ success: true, message: `Token ${email} reset successfully` })
    }

    if (action === "resetAll") {
      tokenManager.resetAllTokens()
      return NextResponse.json({ success: true, message: "All tokens reset successfully" })
    }

    return NextResponse.json({ error: "Invalid action or missing email" }, { status: 400 })
  } catch (error) {
    console.error("Token Management Error:", error)
    return NextResponse.json({ error: "Failed to manage token" }, { status: 500 })
  }
}
