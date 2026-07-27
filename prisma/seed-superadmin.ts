import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedSuperAdmin() {
  const email = process.env.SUPERADMIN_EMAIL || "superadmin@printforge3d.com";

  console.log(`🚀 Provisionando Super-Admin para o e-mail: ${email}...`);

  const existingProfile = await prisma.profile.findUnique({
    where: { email },
  });

  if (existingProfile) {
    await prisma.profile.update({
      where: { email },
      data: {
        role: "super_admin",
        status: "aprovado",
        empresaId: null,
      },
    });
    console.log("✅ Perfil existente atualizado para super_admin.");
  } else {
    await prisma.profile.create({
      data: {
        id: `superadmin_${Date.now()}`,
        email,
        nome: "Super Administrador",
        role: "super_admin",
        status: "aprovado",
        empresaId: null,
      },
    });
    console.log("✅ Novo perfil super_admin criado com sucesso.");
  }
}

seedSuperAdmin()
  .catch((e) => {
    console.error("❌ Erro ao criar super_admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
