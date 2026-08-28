const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://postgres.dabihspsblbxplqzsfzq:32695940Ma%21@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
      }
    }
  });

  try {
    const user = await prisma.user.findFirst();
    console.log("Connection successful!");
    console.log(user);
  } catch (error) {
    console.error("Connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
