const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createRoleSyncTrigger() {
  try {
    console.log('Criando função e trigger de sincronização de role no Supabase...');

    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION public.sync_user_role_to_auth()
      RETURNS TRIGGER AS $$
      BEGIN
        UPDATE auth.users
        SET raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', NEW.role)
        WHERE id = NEW.id;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);

    await prisma.$executeRawUnsafe(`
      DROP TRIGGER IF EXISTS on_user_role_change ON public."User";
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER on_user_role_change
      AFTER UPDATE OF role ON public."User"
      FOR EACH ROW
      EXECUTE FUNCTION public.sync_user_role_to_auth();
    `);

    console.log('✅ Trigger criado com sucesso!');
  } catch (error) {
    console.error('Erro ao criar trigger:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createRoleSyncTrigger();
