//@ts-ignore
import { PrismaClient } from '@prisma/client'

declare global {
  interface NexusTestContextApp {
    db: {
      client: PrismaClient
    }
  }
}
