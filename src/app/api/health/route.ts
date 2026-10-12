import { NextResponse } from "next/server";

/**
 * GET /api/health
 * Rota simples para verificar se a aplicação está no ar.
 */
export function GET() {
  return NextResponse.json({ status: "ok" });
}
