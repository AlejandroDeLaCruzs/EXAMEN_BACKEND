import { ObjectId } from "mongodb";
import { getDB } from "../db/db";
import { COLLECTION_POKEMONS } from "../utils";
import { typeDefs } from "../graphql/schema";

export const getPokemons = async (page?: number, size?: number) => {
  const db = getDB();
  page = page || 1;
  size = size || 10;
  return await db
    .collection(COLLECTION_POKEMONS)
    .find()
    .skip((page - 1) * size)
    .limit(size)
    .toArray();
};

export const getPokemonById = async (id: string) => {
  const db = getDB();
  return await db
    .collection(COLLECTION_POKEMONS)
    .findOne({ _id: new ObjectId(id) });
};

export const createPokemon = async (
  name: string,
  description: string,
  height: number,
  weight: number,
  types: string[]
) => {
  const db = getDB();
  const insertedId = await db.collection(COLLECTION_POKEMONS).insertOne({
    name,
    description,
    height,
    weight,
    types,
  });
  return await db
    .collection(COLLECTION_POKEMONS)
    .findOne({ _id: insertedId.insertedId });
};
