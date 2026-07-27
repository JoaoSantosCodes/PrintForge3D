import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://print-forge3-d-six.vercel.app";

  let empresas: { slug: string; pecas: { id: string; createdAt: Date }[] }[] = [];
  try {
    empresas = await prisma.empresa.findMany({
      where: { status: { in: ["ativo", "trial"] } },
      select: {
        slug: true,
        pecas: {
          where: { publicada: true },
          select: { id: true, createdAt: true },
        },
      },
    });
  } catch (err) {
    console.warn("Erro ao buscar empresas para sitemap:", err);
  }

  const lojasUrls: MetadataRoute.Sitemap = [];

  empresas.forEach((emp) => {
    lojasUrls.push({
      url: `${baseUrl}/loja/${emp.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    });

    emp.pecas.forEach((p) => {
      lojasUrls.push({
        url: `${baseUrl}/loja/${emp.slug}/${p.id}`,
        lastModified: p.createdAt,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    });
  });

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/criar-loja`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacidade`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/termos`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  return [...staticUrls, ...lojasUrls];
}
