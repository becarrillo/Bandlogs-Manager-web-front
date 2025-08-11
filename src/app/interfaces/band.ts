import { MusicalGenre } from "../enums/musical-genre";
import { Event } from "./event";
import { User } from "./user";


export interface Band {
    bandId : number,
    name: string,
    director: string,
    musicalGenre: MusicalGenre,
    users?: User[],
    events?: Event[],
}
