const { PrismaClient } = require('@prisma/client');

async function cleanUsers() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://postgres.dabihspsblbxplqzsfzq:32695940Ma%21@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
      }
    }
  });

  try {
    const deleted = await prisma.user.deleteMany({});
    console.log("Usuários deletados do Prisma:", deleted.count);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanUsers();
