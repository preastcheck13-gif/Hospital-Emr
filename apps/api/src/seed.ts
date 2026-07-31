import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@tgph.com';
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+234000000000',
      role: 'ADMIN'
    }
  });

  console.log('Seeded user:', {
    id: user.id,
    email: user.email,
    role: user.role
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
