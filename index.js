const { ApolloServer, gql, ApolloError } = require("apollo-server");

const typeDefs = gql`
  type User {
    id: Int!
    name: String!
    age: Int!
  }
  type Query {
    FindManyUsers(name: String): [User]
    FindUser(id: Int): User
  }

  type Mutation {
    createUser(name: String!, age: Int!): User
    updateUser(id: Int!, name: String, age: Int): User
    deleteUser(id: Int!): [User]
  }
`;

const arrUser = [];

let baseId = 0;

const resolvers = {
  Query: {
    FindManyUsers: (parent, args) => {
      if (args.name) {
        return arrUser.filter((users) => users.name.startsWith(args.name));
      }
      return arrUser;
    },
    FindUser: (parent, args, context, info) => {
      const foundOneUser = arrUser.find((user) => user.id == args.id);
      if (!args.id) {
        return arrUser[0];
      }
      if (!foundOneUser) {
        return new ApolloError("Usuário não encontrado");
      }
      if (args.id) {
        return foundOneUser;
      }
    },
  },

  Mutation: {
    createUser: (parent, args, context, info) => {
      const newUser = {
        id: baseId + 1,
        name: args.name,
        age: args.age,
      };
      baseId++;
      arrUser.push(newUser);

      return newUser;
    },
    updateUser: (parent, args, context, info) => {
      const foundUser = arrUser.find((UserId) => UserId.id == args.id);
      if (!foundUser) {
        return new ApolloError("Usuário não encontrado");
      }
      if (args.name) {
        foundUser.name = args.name;
      }
      if (args.age) {
        foundUser.age = args.age;
      }

      return foundUser;
    },
    deleteUser: (parent, args, context, info) => {
      const deleteUser = arrUser.find((UserId) => UserId.id == args.id);
      if (!deleteUser) {
        return new ApolloError("Usuário não encontrado");
      }
      if (args.id) {
        return arrUser.splice(arrUser.indexOf(deleteUser), 1);
      }

      return deleteUser;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => console.log(` Server started at ${url}`));
