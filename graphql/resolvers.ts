import { IResolvers } from "@graphql-tools/utils";
import {
  createUser,
  validateUser,
  catchPokemon,
  freePokemon,
} from "../collections/entrenadorCollections";
import {
  getPokemons,
  getPokemonById,
  createPokemon,
} from "../collections/pokemonCollections";
import { signToken } from "../auth";
import { getDB } from "../db/db";
import { ObjectId } from "mongodb";
import { OwnedPokemon } from "../types/ownedPokemon";
import { COLLECTION_OWNEDPOKEMOSN, COLLECTION_POKEMONS } from "../utils";
import { Trainer } from "../types/trainer";

export const resolvers: IResolvers = {
  Query: {
    pokemons: async (_, { page, size }) => {
      return await getPokemons(page, size);
    },
    pokemon: async (_, { id }) => {
      return await getPokemonById(id);
    },
    me: async (_, __, { user }) => {
      if (!user) return null;
      return {
        _id: user._id.toString(),
        ...user,
      };
    },
  },

  Mutation: {
    startJourney: async (_, { name, password }) => {
      const userId = await createUser(name, password);
      return signToken(userId);
    },

    login: async (_, { name, password }) => {
      const user = await validateUser(name, password);
      if (!user) throw new Error("Invalid credentials");
      return signToken(user._id.toString());
    },

    createPokemon: async (
      _,
      { name, description, height, weight, types },
      { user }
    ) => {
      if (!user) throw new Error("You must be logged in to create Pokemo");
      return await createPokemon(name, description, height, weight, types);
    },

    catchPokemon: async (_, { pokemonId, nickname }, { user }) => {
      if (!user) throw new Error("You must be logged in to create Pokemon");
      return await catchPokemon(pokemonId, nickname, user._id.toString());
    },

    freePokemon: async (_, { ownedPokemonId }, { user }) => {
      if (!user) throw new Error("You must be logged");
      return freePokemon(ownedPokemonId, user._id.toString());
    },
  },

  OwnedPokemon: {
    pokemon: (parent: OwnedPokemon) => {
      const idPokemon = new ObjectId(parent.pokemon);
      return getDB()
        .collection(COLLECTION_POKEMONS)
        .findOne({ _id: idPokemon });
    },
  },

  Trainer: {
    pokemons: (parent: Trainer) => {
      const idPokemon = parent.pokemons.map((id) => new ObjectId(id));
      return getDB()
        .collection(COLLECTION_OWNEDPOKEMOSN)
        .find({ _id: { $in: idPokemon } })
        .toArray();
    },
  },
};
