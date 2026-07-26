import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Executa uma consulta simples para validar a conexão com o banco de dados
    const userCount = await prisma.profile.count();

    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        database: "connected",
        profilesRegistered: userCount,
        environment: process.env.NODE_ENV || "development",
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Health check database connection error:", err);
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: err?.message || "Database connection failure",
      },
      { status: 500 }
    );
  }
}
