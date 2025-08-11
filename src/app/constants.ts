import { MusicalGenre } from "./enums/musical-genre";
import { Pitch } from "./enums/pitch";

export const WHATSAPP_COUNTRY_CODES: (string | null)[] = [
  null,
  '+1',   // USA/Canada
  '+52',  // Mexico
  '+57',  // Colombia
  '+54',  // Argentina
  '+55',  // Brazil
  '+56',  // Chile
  '+51',  // Peru
  '+34',  // Spain
  '+44',  // UK
  '+49',  // Germany
  '+33',  // France
  '+39',  // Italy
  '+91',  // India
  '+81',  // Japan
  '+82',  // South Korea
  '+86',  // China
  '+7',   // Russia
  '+61',  // Australia
  '+62',  // Indonesia
  '+90',  // Turkey
  '+234', // Nigeria
  '+27',  // South Africa
  '+971', // UAE
  '+66',  // Thailand
  '+63',  // Philippines
  '+60',  // Malaysia
  '+94',  // Sri Lanka
  '+880', // Bangladesh
  '+92',  // Pakistan
  '+20',  // Egypt
  '+212'  // Morocco
];

export const MUSICAL_GENRES = [
  "CLASSICAL",
  "COMERCIAL_JAZZ",
  "COMERCIAL_LATIN",
  "COMERCIAL_ROCK",
  "COMERCIAL_POP",
  "COMERCIAL_VALLENATO",
  "FOLKLORIC",
  "AFRO_MUSIC"
];

export const LATIN_STRING_PITCHES : string[] = [
  'La',
  'La#/Sib',
  'Si',
  'Do',
  'Do#/Reb',
  'Re',
  'Re#/Mib',
  'Mi',
  'Fa',
  'Fa#/Solb',
  'Sol',
  'Sol#/Lab'
];
export const SUFFIXES = [
  '', 'm', '7', 'Maj7', 'dim', 'aug', 'sus2', 'sus4', 'add9', 'm(add11)', '6', '9', '11', '13', 'm7',
  'mMaj7', '7b5', '7b9'
];