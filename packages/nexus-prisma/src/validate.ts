import { DatamodelInfo, PrismaSchemaConfig, PrismaClientInput } from './types'


function validateDatamodelInfo(datamodelInfo: DatamodelInfo) {
  if (
    !datamodelInfo.uniqueFieldsByModel ||
    !datamodelInfo.clientPath ||
    !datamodelInfo.schema ||
    !datamodelInfo.embeddedTypes
  ) {
    throw new Error(
      `\
Invalid \`prisma.datamodelInfo\` property. This should be imported from the \`nexus-prisma-generate\` output directory.
If you just updated nexus-prisma, try re-running \`nexus-prisma-generate\`.
      `,
    )
  }
}

function validateClient(client: PrismaClientInput) {
  if (
    typeof client !== 'function' &&
    (!client.$exists || !client.$graphql)
  ) {
    throw new Error(
      `\
Invalid \`prisma.client\` property in \`makePrismaSchema({ prisma: { client: ... } })\`.
This should either be an instance of the generated prisma-client, or a function that returns the prisma-client instance from your GraphQL server context
`,
    )
  }
}

export function validateOptions(options: PrismaSchemaConfig): void {
  if (!options.prisma) {
    throw new Error(
      'Missing `prisma` property in `makePrismaSchema({ prisma: { ... } })`',
    )
  }

  if (!options.prisma.datamodelInfo) {
    throw new Error(
      'Missing `prisma.datamodelInfo` property in `makePrismaSchema({ prisma: { datamodelInfo: ... } })`',
    )
  }

  // Do not pass the object as is to enforce a type error if one of the properties aren't checked
  // /!\ Passing a new property doesn't guaranty that it is checked within the function
  validateDatamodelInfo({
    clientPath: options.prisma.datamodelInfo.clientPath,
    embeddedTypes: options.prisma.datamodelInfo.embeddedTypes,
    schema: options.prisma.datamodelInfo.schema,
    uniqueFieldsByModel: options.prisma.datamodelInfo.uniqueFieldsByModel,
  })

  if (!options.prisma.client) {
    throw new Error(
      'Missing `prisma.client` property in `makePrismaSchema({ prisma: { client: ... } })`',
    )
  }

  validateClient(options.prisma.client)
}
