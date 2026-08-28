const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin(email) {
  try {
    console.log(`Buscando usuário: ${email}`);
    
    // 1. Acha o usuário no Prisma
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log('Usuário não encontrado na tabela Prisma. Certifique-se de que ele já fez o cadastro.');
      return;
    }

    // 2. Atualiza no Prisma
    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });
    console.log('✅ Role atualizada para ADMIN no Prisma (Tabela user)');

    // 3. Atualiza no Supabase Auth usando SQL Raw
    // O Supabase guarda os metadados na coluna raw_user_meta_data da tabela auth.users
    const authUpdate = await prisma.$executeRaw`
      UPDATE auth.users 
      SET raw_user_meta_data = raw_user_meta_data || '{"role": "ADMIN"}'::jsonb 
      WHERE email = ${email};
    `;
    
    console.log(`✅ Metadados atualizados no Supabase Auth (auth.users). Linhas afetadas: ${authUpdate}`);
    console.log(`\n🎉 O usuário ${email} agora é um Administrador Supremo!`);
    
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Mude o e-mail aqui para o e-mail do usuário que você quer promover
makeAdmin('matheusvasconcelosceara@gmail.com');
