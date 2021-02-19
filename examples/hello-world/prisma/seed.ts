import { PrismaClient } from '@prisma/client'

async function seed() {
  const prisma = new PrismaClient()

  const res = await prisma.user.create({
    data: {
      email: 'foo@bar.com',
      birthDate: new Date(),
      metadata: {},
      posts: {
        create: [
          { title: 'post 1', status: 'DRAFT' },
          { title: 'post 2', status: 'DRAFT' },
        ],
      },
    },
  })

  console.log(res)

  await prisma.$disconnect()
}

seed()
