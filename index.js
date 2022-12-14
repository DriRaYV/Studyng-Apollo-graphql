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
    FindDeactivatedUsers: [User]
  }

  type Mutation {
    createUser(name: String!, age: Int!): User
    updateUser(id: Int!, name: String, age: Int, deleted: Boolean): User
    softDelete(id: Int!): User
    deleteUser(id: Int!): [User]
  }
`;

const arrUser = [];
const delArr = [];
let baseId = 0;
const resolvers = {
  Query: {
    FindManyUsers: (parent, args) => {
      if (args.name) {
        return arrUser.filter((users) =>
          users.name
            .toUpperCase()
            .trim()
            .normalize("NFD")
            .replace(/[^a-zA-Z0-9s]/g, "")
            .startsWith(
              args.name
                .toUpperCase()
                .trim()
                .normalize("NFD")
                .replace(/[^a-zA-Z0-9s]/g, "")
            )
        );
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
    FindDeactivatedUsers: () => delArr,
  },

  Mutation: {
    createUser: (parent, args, context, info) => {
      const newUser = {
        id: baseId + 1,
        name: args.name,
        age: args.age,
      };
      baseId++;

      if (args.age > 1 && args.name.trim() != "") {
        arrUser.push(newUser);
      } else {
        if (args.age <= 0 && args.name == "") {
          return new ApolloError(
            "A idade só pode ser maior que zero e o nome não pode ser vazio"
          );
        }
        if (args.age <= 0) {
          return new ApolloError("A idade só pode ser maior que zero");
        }
        if (args.name == "") {
          return new ApolloError("O nome não pode ser vazio");
        }
      }

      return newUser;
    },
    updateUser: (parent, args, context, info) => {
      const foundUser = arrUser.find((UserId) => UserId.id == args.id);
      if (!foundUser) {
        return new ApolloError("Usuário não encontrado");
      }
      if (args.age > 1 && args.name.trim() != "") {
        foundUser.name = args.name;
        foundUser.age = args.age;
      } else {
        return new ApolloError("O valor não pode ser vazio");
      }

      return foundUser;
    },

    softDelete: (parent, args, context, info) => {
      const deleteUser = arrUser.find((UserId) => UserId.id == args.id);
      if (!deleteUser) {
        return new ApolloError("Usuário não encontrado");
      }
      if (args.id) {
        delArr.push(deleteUser);
        arrUser.splice(arrUser.indexOf(deleteUser), 1);
      }

      return deleteUser;
    },

    deleteUser: (parent, args, context, info) => {
      const deleteUser = delArr.find((UserId) => UserId.id == args.id);
      if (!deleteUser) {
        return new ApolloError(
          "Usuário não desativado! Desative-o antes de deletear"
        );
      }
      if (args.id) {
        return delArr.splice(delArr.indexOf(deleteUser), 1);
      }

      return deleteUser;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => console.log(` Server started at ${url}`));
