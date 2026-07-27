import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

async function seedAdminAndUser() {
  const usersToSeed = [
    {
      email: process.env.ADMIN_EMAIL || "admin@printforge3d.com",
      password: process.env.ADMIN_PASSWORD || "admin123",
      nome: "Administrador Inicial",
      role: "admin",
      status: "aprovado",
      defaultId: "admin-initial-id",
    },
    {
      email: "cliente@printforge3d.com",
      password: "user123",
      nome: "Cliente Demonstração",
      role: "usuario",
      status: "aprovado",
      defaultId: "cliente-demo-id",
    },
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  for (const userConfig of usersToSeed) {
    console.log(`🌱 Criando/configurando perfil ${userConfig.role.toUpperCase()} (${userConfig.email})...`);
    let authUserId: string = userConfig.defaultId;

    if (supabaseUrl && serviceRoleKey && !supabaseUrl.includes("placeholder")) {
      try {
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = usersData?.users?.find(
          (u) => u.email?.toLowerCase() === userConfig.email.toLowerCase()
        );

        if (existingUser) {
          authUserId = existingUser.id;
          console.log(`✅ Usuário ${userConfig.email} encontrado no Supabase Auth (ID: ${authUserId}).`);
        } else {
          const { data: createdUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: userConfig.email,
            password: userConfig.password,
            email_confirm: true,
            user_metadata: { nome: userConfig.nome },
          });

          if (createError) {
            console.warn(`⚠️ Aviso ao criar ${userConfig.email} no Supabase Auth:`, createError.message);
          } else if (createdUser?.user) {
            authUserId = createdUser.user.id;
            console.log(`✅ Usuário ${userConfig.email} criado no Supabase Auth!`);
          }
        }
      } catch (err: any) {
        console.warn(`⚠️ Não foi possível comunicar com o Supabase Auth para ${userConfig.email}:`, err?.message || err);
      }
    }

    const profile = await prisma.profile.upsert({
      where: { email: userConfig.email },
      create: {
        id: authUserId,
        email: userConfig.email,
        nome: userConfig.nome,
        role: userConfig.role,
        status: userConfig.status,
        aprovadoEm: new Date(),
      },
      update: {
        role: userConfig.role,
        status: userConfig.status,
        aprovadoEm: new Date(),
      },
    });

    console.log(`🎉 Perfil ${profile.email} configurado com sucesso (Role: "${profile.role}", Status: "${profile.status}")!`);
  }
}

seedAdminAndUser()
  .catch((e) => {
    console.error("❌ Erro ao executar seed de contas:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
