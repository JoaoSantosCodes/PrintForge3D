import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RESERVED_SLUGS } from "@/lib/constants";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim().toLowerCase();

  if (!slug) {
    return NextResponse.json({ available: false, message: "Slug inválido" });
  }

  // Validate format (alphanumeric and hyphens only)
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({
      available: false,
      message: "O slug deve conter apenas letras minúsculas, números e hífens.",
    });
  }

  // Reserved slugs check
  if (RESERVED_SLUGS.includes(slug)) {
    return NextResponse.json({
      available: false,
      message: "Este nome não está disponível",
    });
  }

  const existing = await prisma.empresa.findUnique({
    where: { slug },
  });

  return NextResponse.json({
    available: !existing,
    message: existing ? "Este nome não está disponível" : "Slug disponível!",
  });
}
