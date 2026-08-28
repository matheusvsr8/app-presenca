import { prisma } from '@/lib/prisma';
import RegisterForm from './RegisterForm';

export const dynamic = 'force-dynamic';

export default async function RegisterPage() {
  // Busca todos os cursos criados pelos administradores
  const courses = await prisma.course.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  return <RegisterForm courses={courses} />;
}
