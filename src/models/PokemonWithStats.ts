import { Species } from "./Species";
import { Stat } from "./Stat";
import { TypeModel } from "./TypeInterface";

export interface PokemonWithStats {
  name: String;
  height: number;
  averageStat: number;
  base_experience: number;
  averageBaseExperience: number;
  id: number;
  sprite_img: string;
  species: Species;
  url: string;
  types: Array<TypeModel>;
  stats: Array<Stat>;
}
