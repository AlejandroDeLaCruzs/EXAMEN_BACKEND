export * from "./core/context";
export * from "./core/assertions";
export * from "./scenario/step";
export * from "./scenario/scenario";
export * from "./core/engine";
import { ApolloServer } from "apollo-server";
import { connectToMongoDB } from "./db/db"
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { getUserFromToken } from "./auth";

const start = async () => {
  await connectToMongoDB();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const token = req.headers.authorization || "";
      const user = token ? await getUserFromToken(token as string) : null;
      return { user };
    },
  });

  await server.listen({ port: 4000 });
  console.log("GQL en el puerto", 4000);
};



start().catch(err=>console.error(err));