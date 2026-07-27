import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://print-forge3-d-six.vercel.app";

  let pecas: { id: string; createdAt: Date }[] = [];
  try {
    pecas = await prisma.peca.findMany({
      where: { publicada: true },
      select: { id: true, createdAt: true },
    });
  } catch (err) {
    console.warn("Erro ao buscar peças para sitemap:", err);
  }

  const pecasUrls: MetadataRoute.Sitemap = pecas.map((p) => ({
    url: `${baseUrl}/catalogo/${p.id}`,
    lastModified: p.createdAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalogo`,
      lastModified: new Date(),
      changeFrequency: "daily",
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

  return [...staticUrls, ...pecasUrls];
}
