import { GraphQLServer } from 'graphql-yoga'
import { Prisma } from 'prisma-binding'

import { PRISMA_ENDPOINT, K8S_PRISMA_MANAGEMENT_API_SECRET } from 'src/config'

import resolvers from 'src/resolvers'

const prisma = new Prisma({
  typeDefs: `${__dirname}/database/prisma.graphql`,
  endpoint: PRISMA_ENDPOINT,
  secret: K8S_PRISMA_MANAGEMENT_API_SECRET,
})

const server = new GraphQLServer({
  typeDefs: `${__dirname}/schema.graphql`,
  resolvers,
  context: req => ({ req, prisma }),
})

server.start(() => console.log(`GraphQL server is running on port 4000`))
