const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixRoleSyncTrigger() {
  try {
    console.log('Atualizando a função de trigger com o cast de UUID correto...');

    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION public.sync_user_role_to_auth()
      RETURNS TRIGGER AS $$
      BEGIN
        UPDATE auth.users
        SET raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', NEW.role)
        WHERE id = NEW.id::uuid;
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

    console.log('✅ Trigger e função corrigidos com sucesso com NEW.id::uuid!');
  } catch (error) {
    console.error('Erro ao atualizar trigger:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixRoleSyncTrigger();
