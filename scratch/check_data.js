const { PrismaClient } = require('@prisma/client');

async function checkData() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://postgres.dabihspsblbxplqzsfzq:32695940Ma%21@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
      }
    }
  });

  try {
    const tenants = await prisma.tenant.findMany();
    console.log("Tenants:", tenants);
    const courses = await prisma.course.findMany();
    console.log("Courses:", courses);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
