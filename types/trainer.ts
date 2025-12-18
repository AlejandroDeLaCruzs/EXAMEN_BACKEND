import { ObjectId } from "mongodb"

export type Trainer = {
    _id: string | ObjectId
    name: string
    pokemons: string[]
  }