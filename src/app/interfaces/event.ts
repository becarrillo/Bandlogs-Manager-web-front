import { EventState } from "../enums/event-state";
import { Band } from "./band";
import { Song } from "./song";

/** to model a event related with a musical band in Bandlogs-Manager */
export interface Event {
    eventId : string | null,
    date : Date,
    description : string,
    location : string | null,
    band? : Band,
    repertoire : Song[],
    state? : EventState
}
