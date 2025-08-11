import { Pitch } from "../enums/pitch"; 


export interface Song {
    songId : number,
    title: string,
    pitch : Pitch,
    tonalitySuffix : string,
    progression : string[]
}
