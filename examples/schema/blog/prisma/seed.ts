import { PrismaClient, PostStatus } from '@prisma/client'
import { name } from 'faker'

main()

async function main() {
  const prisma = new PrismaClient()
  const blogWithAuthor = await prisma.blog.create({
    data: {
      name: name.title(),
      authors: {
        create: {
          name: name.firstName(),
          rating: 0.5,
          role: 'AUTHOR',
          posts: {
            create: [
              {
                title: 'post_1',
                status: PostStatus.PUBLISHED,
                blog: {},
              },
            ],
          },
        },
      },
    },
  })

  console.log('added blog with author:\n', blogWithAuthor)
  await prisma.disconnect()
}
