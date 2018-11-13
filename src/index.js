import { GraphQLServer } from 'graphql-yoga'
import { Prisma } from 'prisma-binding'

import { PRISMA_ENDPOINT, PRISMA_MANAGEMENT_API_SECRET } from 'src/env/config'
import resolvers from 'src/app/resolvers'

const server = new GraphQLServer({
  typeDefs: `${__dirname}/schema.graphql`,
  resolvers,
  context: req => ({
    req,
    prisma: new Prisma({
      typeDefs: `${__dirname}/database/prisma.graphql`,
      endpoint: PRISMA_ENDPOINT,
      secret: PRISMA_MANAGEMENT_API_SECRET,
    }),
  }),
})

server.start(() => console.log(`GraphQL server is running on port 4000`))
