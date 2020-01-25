import { PrismaClient } from '@prisma/client'
import { name } from 'faker'

main()

async function main() {
  const prisma = new PrismaClient()
  const author = await prisma.users.create({
    data: {
      name: name.firstName(),
      blog: {},
      rating: 0.5,
      role: 'AUTHOR',
    },
  })
  const blog = await prisma.blogs.create({
    data: {
      name: name.title(),
      authors: {
        connect: {
          id: author.id,
        },
      },
    },
  })
  console.log('added author:\n', author)
  console.log('added blog:\n', blog)
  await prisma.disconnect()
}
