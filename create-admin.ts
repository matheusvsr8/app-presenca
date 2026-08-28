import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("ERRO: Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  const email = "admin@admin.com"; // Troque pelo seu email
  const password = "adminpassword123";
  const name = "Administrador Master";

  console.log("1. Criando Tenant...");
  let tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: { name: "Empresa Padrão" }
    });
  }

  console.log("2. Criando Usuário no Supabase Auth...");
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      role: 'ADMIN',
      tenantId: tenant.id
    }
  });

  if (authError || !authData.user) {
    console.error("Erro no Supabase:", authError?.message);
    process.exit(1);
  }

  console.log("3. Sincronizando com o Prisma...");
  await prisma.user.create({
    data: {
      id: authData.user.id,
      name,
      email,
      role: 'ADMIN',
      tenantId: tenant.id
    }
  });

  console.log("✅ Admin criado com sucesso!");
  console.log("E-mail:", email);
  console.log("Senha:", password);
}

main().catch(console.error).finally(() => prisma.$disconnect());
