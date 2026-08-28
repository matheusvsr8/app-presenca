import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcryptjs.hash('123456', 10);

  // Cria o Tenant Base
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Empresa Principal',
    },
  });

  // Cria Admin
  await prisma.user.upsert({
    where: { email: 'admin@teste.com' },
    update: {},
    create: {
      email: 'admin@teste.com',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  // Cria Colaborador
  await prisma.user.upsert({
    where: { email: 'colaborador@teste.com' },
    update: {},
    create: {
      email: 'colaborador@teste.com',
      name: 'Colaborador Scanner',
      password: hashedPassword,
      role: 'COLLABORATOR',
      tenantId: tenant.id,
    },
  });

  // Cria Aluno
  const aluno = await prisma.user.upsert({
    where: { email: 'aluno@teste.com' },
    update: {},
    create: {
      email: 'aluno@teste.com',
      name: 'Aluno Teste',
      password: hashedPassword,
      role: 'STUDENT',
      qrCode: 'qr-code-aluno-12345',
      tenantId: tenant.id,
    },
  });

  // Cria um Curso de Teste
  const curso = await prisma.course.create({
    data: {
      name: 'Curso de Next.js Avançado',
      tenantId: tenant.id,
    }
  });

  // Matricula o Aluno no Curso
  await prisma.enrollment.create({
    data: {
      studentId: aluno.id,
      courseId: curso.id,
    }
  });

  console.log('Seed realizado com sucesso! (Incluindo curso e matrícula)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
