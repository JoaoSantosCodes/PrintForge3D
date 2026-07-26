import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@printforge3d.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log(`🌱 Promovendo/criando conta de administrador inicial (${adminEmail})...`);

  let authUserId: string = "admin-initial-id";

  if (supabaseUrl && serviceRoleKey && !supabaseUrl.includes("placeholder")) {
    try {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      // Tenta buscar se o usuário já existe no Supabase Auth
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = usersData?.users?.find(
        (u) => u.email?.toLowerCase() === adminEmail.toLowerCase()
      );

      if (existingUser) {
        authUserId = existingUser.id;
        console.log(`✅ Usuário ${adminEmail} encontrado no Supabase Auth (ID: ${authUserId}).`);
      } else {
        // Criar usuário no Supabase Auth
        const { data: createdUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: adminEmail,
          password: adminPassword,
          email_confirm: true,
          user_metadata: { nome: "Administrador Inicial" },
        });

        if (createError) {
          console.warn("⚠️ Aviso ao criar usuário no Supabase Auth:", createError.message);
        } else if (createdUser?.user) {
          authUserId = createdUser.user.id;
          console.log(`✅ Usuário ${adminEmail} criado com sucesso no Supabase Auth!`);
        }
      }
    } catch (err: any) {
      console.warn("⚠️ Não foi possível comunicar com o Supabase Auth:", err?.message || err);
    }
  }

  // Upsert do Profile no Prisma com role="admin" e status="aprovado"
  const profile = await prisma.profile.upsert({
    where: { email: adminEmail },
    create: {
      id: authUserId,
      email: adminEmail,
      nome: "Administrador Inicial",
      role: "admin",
      status: "aprovado",
      aprovadoEm: new Date(),
    },
    update: {
      role: "admin",
      status: "aprovado",
      aprovadoEm: new Date(),
    },
  });

  console.log(`🎉 Administrador ${profile.email} configurado com sucesso com role="admin" e status="aprovado"!`);
}

seedAdmin()
  .catch((e) => {
    console.error("❌ Erro ao executar seed-admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
