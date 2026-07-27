import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

async function seedSuperAdmin() {
  const email = (process.env.SUPERADMIN_EMAIL || "superadmin@printforge3d.com").toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD || "superadmin123";
  const nome = "Super Administrador";

  console.log(`🚀 Provisionando Super-Admin para o e-mail: ${email}...`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let authUserId: string = `superadmin_${Date.now()}`;

  if (supabaseUrl && serviceRoleKey && !supabaseUrl.includes("placeholder")) {
    try {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = usersData?.users?.find(
        (u) => u.email?.toLowerCase() === email
      );

      if (existingUser) {
        authUserId = existingUser.id;
        // Update password if existing
        await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          password,
          email_confirm: true,
          user_metadata: { nome },
        }).catch(() => {});
        console.log(`✅ Usuário ${email} atualizado no Supabase Auth (ID: ${authUserId}).`);
      } else {
        const { data: createdUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { nome },
        });

        if (createError) {
          console.warn(`⚠️ Aviso ao criar ${email} no Supabase Auth:`, createError.message);
        } else if (createdUser?.user) {
          authUserId = createdUser.user.id;
          console.log(`✅ Usuário ${email} criado no Supabase Auth!`);
        }
      }
    } catch (err: any) {
      console.warn(`⚠️ Não foi possível comunicar com o Supabase Auth para ${email}:`, err?.message || err);
    }
  }

  const profile = await prisma.profile.upsert({
    where: { email },
    create: {
      id: authUserId,
      email,
      nome,
      role: "super_admin",
      status: "aprovado",
      empresaId: null,
      aprovadoEm: new Date(),
    },
    update: {
      id: authUserId,
      role: "super_admin",
      status: "aprovado",
      empresaId: null,
      aprovadoEm: new Date(),
    },
  });

  console.log(`🎉 Super-Admin ${profile.email} configurado com sucesso (Role: "${profile.role}", Status: "${profile.status}")!`);
}

seedSuperAdmin()
  .catch((e) => {
    console.error("❌ Erro ao criar super_admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
