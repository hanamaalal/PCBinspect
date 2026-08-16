import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminExiste = await prisma.utilisateur.findUnique({
    where: { email: 'admin@pcbinspect.com' },
  });

  if (!adminExiste) {
    const hash = await bcrypt.hash('Admin@1234', 10);
    const admin = await prisma.utilisateur.create({
      data: {
        firstname: 'Admin',
        lastname: 'Admin',
        email: 'admin@pcbinspect.com',
        password: hash,
        role: Role.ADMIN
          },
    });
    console.log(`Admin cree : ${admin.email}`);
  } else {
    console.log('Admin existe deja.');
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());