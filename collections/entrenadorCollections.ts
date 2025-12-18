import { ObjectId } from "mongodb";
import { getDB } from "../db/db";
import bcrypt from "bcryptjs";
import {
  COLLECTION_POKEMONS,
  COLLECTION_ENTRENADORES,
  COLLECTION_OWNEDPOKEMOSN,
} from "../utils";
import { Trainer } from "../types/trainer";
import { randomInt } from "crypto";

export const createUser = async (name: string, password: string) => {
  const db = getDB();
  const findUserByEmail = await db
    .collection(COLLECTION_ENTRENADORES)
    .findOne({ name });

  if (findUserByEmail) throw new Error("Usuario con email ya registrado");

  const passwordEncriptada = await bcrypt.hash(password, 10);

  const result = await db.collection(COLLECTION_ENTRENADORES).insertOne({
    name,
    password: passwordEncriptada,
    pokemons: [],
  });

  return result.insertedId.toString();
};

export const validateUser = async (name: string, password: string) => {
  const db = getDB();
  const user = await db.collection(COLLECTION_ENTRENADORES).findOne({ name });
  if (!user) return null;

  const validatepassword = await bcrypt.compare(password, user.password);
  if (!validatepassword) return null;

  return user;
};

export const findUserById = async (id: string) => {
  const db = getDB();
  return await db
    .collection(COLLECTION_ENTRENADORES)
    .findOne({ _id: new ObjectId(id) });
};

export const catchPokemon = async (
  pokemonId: string,
  nickname: string,
  userId: string
) => {
  const db = getDB();
  const pokemon = await db
    .collection(COLLECTION_POKEMONS)
    .findOne({ _id: new ObjectId(pokemonId) });
  if (!pokemon) throw new Error("No exsite ese Pokemon");

  const entrenador = await db
    .collection<Trainer>(COLLECTION_ENTRENADORES)
    .findOne({ _id: new ObjectId(userId) });
    
  if (entrenador && entrenador.pokemons.length > 6) {
    throw new Error("No puedes caputrar mas de 6 pokemons");
  }

  const insertedId = await db.collection(COLLECTION_OWNEDPOKEMOSN).insertOne({
    pokemon: pokemonId,
    attack: randomInt(1, 100),
    nickname,
    defense: randomInt(1, 100),
    speed: randomInt(1, 100),
    special: randomInt(1, 100),
    level: randomInt(1, 100),
  });

  await db
    .collection(COLLECTION_ENTRENADORES)
    .updateOne(
      { _id: new ObjectId(userId) },
      { $addToSet: { pokemons: insertedId.insertedId.toString() } }
    );
  return getDB()
    .collection(COLLECTION_OWNEDPOKEMOSN)
    .findOne({ _id: insertedId.insertedId });
};

export const freePokemon = async (ownedPokemonId: string, userId: string) => {
  const db = getDB();
  const idPokemon = await db
    .collection(COLLECTION_OWNEDPOKEMOSN)
    .findOne({ _id: new ObjectId(ownedPokemonId) });
  if (!idPokemon) throw new Error("no existe ownedPokem con ese id");

  const trainer = await db
    .collection(COLLECTION_ENTRENADORES)
    .findOne({ _id: new ObjectId(userId) });

  if (trainer?.pokemons.find((id: any) => id == ownedPokemonId)) {
    await db.collection(COLLECTION_POKEMONS).deleteOne({ _id: idPokemon._id }); //Se elemina de POKEMONS
    await db
      .collection(COLLECTION_OWNEDPOKEMOSN)
      .deleteOne({ _id: new ObjectId(ownedPokemonId) });

    await db
      .collection<Trainer>(COLLECTION_ENTRENADORES)
      .updateOne(
        { _id: new ObjectId(userId) },
        { $pull: { pokemons: ownedPokemonId } }
      );
  } else {
    throw new Error("no es tuyo ese pokemon");
  }
  return db
    .collection(COLLECTION_ENTRENADORES)
    .findOne({ _id: new ObjectId(userId) });
};
