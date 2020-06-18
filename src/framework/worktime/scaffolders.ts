import { stripIndent } from 'common-tags'
import * as fs from 'fs-jetpack'
import * as os from 'os'

export async function prismaClientGeneratorBlock(schemaPath: string) {
  const generatorBlock =
    os.EOL +
    stripIndent`
      generator prisma_client {
        provider = "prisma-client-js"
      }
    ` +
    os.EOL
  await fs.appendAsync(schemaPath, `${generatorBlock}`)
}

export async function exampleModelBlock(schemaPath: string) {
  const exampleModelContent =
    stripIndent`
      // This "Example" model has been generated for you by Nexus.
      // Nexus does this when you do not have any models defined.
      // For more detail and examples of working with your Prisma
      // Schema, refer to its complete docs at https://pris.ly/d/prisma-schema.

      model Example {
        id    Int     @id @default(autoincrement())
        email String  @unique
        name  String?
      }
    ` + os.EOL
  await fs.appendAsync(schemaPath, `${os.EOL}${exampleModelContent}`)
}

export async function emptySchema(schemaPath: string) {
  const content =
    stripIndent`
    // This Prisma Schema file was created by Nexus
    // If you're new to Nexus or Prisma you may find these docs useful: 
    //
    //   - Prisma plugin docs http://nxs.li/nexus-plugin-prisma
    //   - Prisma Schema docs https://pris.ly/d/prisma-schema
  ` + os.EOL

  await fs.writeAsync(schemaPath, content)
}
