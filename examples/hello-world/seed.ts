import { PrismaClient } from '@prisma/client'

async function seed() {
  const prisma = new PrismaClient()

  const res = await prisma.user.create({
    data: {
      email: 'foo@bar.com',
      birthDate: new Date(),
      posts: {
        create: [{}, {}],
      },
    },
  })

  console.log(res)

  await prisma.disconnect()
}

seed()
