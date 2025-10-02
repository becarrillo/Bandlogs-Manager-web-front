import { Injectable } from '@angular/core';
import { Pitch } from '../enums/pitch';

@Injectable({
  providedIn: 'root'
})
export class MusicalUtilService {
  /** 
   * Converts and translates pitch ordinal number to latin system musical notation string
   * @param tonality tonic of whole song
   * @param ordinal integer number (must to be from 0) representing ordinal position value of
   * a chord in Pitch enum
   * @returns name string with latin notation format of the represented pitch by ordinal param
  */
  formatChordPitch(ordinal: number, tonality?: string) {
    switch (ordinal) {
      case 0:
        return "La" as string;
        break;
      case 1:
        if (
          tonality !== undefined &&
          ((!tonality.startsWith('Sib') &&
          !tonality.startsWith('Re') &&
          !tonality.startsWith('Mib') &&
          !tonality.startsWith('Fa') &&
          !tonality.startsWith('Sol') &&
          !tonality.startsWith('Lab') &&
          !tonality.includes('m')) || tonality.startsWith("Fa#"))
        ) {
          return "La#" as string;
        }
        return "Sib" as string;
        break;
      case 2:
        return "Si" as string;
        break;
      case 3:
        return "Do" as string;
        break;
      case 4:
        if (
          tonality !== undefined &&
          (tonality.startsWith('Lab') ||
            tonality.startsWith('Sibm') ||
            tonality.startsWith('Mib') ||
            tonality.startsWith('Solb')) &&
          !tonality.startsWith("Fa#")
        ) {
          return "Reb" as string;
        }
        return "Do#" as string;
        break;
      case 5:
        return "Re" as string;
        break;
      case 6:
        if (
          tonality !== undefined &&
          (!tonality.startsWith('Fa#') &&
          !tonality.startsWith('Si') &&
          !tonality.startsWith('Do#')) &&
          (tonality?.startsWith('Mib') ||
          tonality?.startsWith('Reb') ||
          tonality?.startsWith('Lab') ||
          tonality?.startsWith('Sibm') ||
          tonality?.includes('m'))
        ) {
          return "Mib" as string;
        }
        return tonality !== undefined ? "Re#" : "Mib";
        break;
      case 7:
        return "Mi" as string;
        break;
      case 8:
        return "Fa" as string;
        break;
      case 9:
        if (
          tonality !== undefined &&
          (tonality.startsWith('Reb') ||
            tonality.startsWith('Mib') ||
            tonality.startsWith("Fam") ||
            tonality.startsWith("Lab") ||
            tonality.startsWith('Mibm')) &&
          !tonality.startsWith('Sol')
        ) {
          return "Solb" as string;
        }
        return "Fa#" as string;
        break;
      case 10:
        return "Sol" as string;
        break;
      default:
        if (
          tonality !== undefined &&
          (tonality.startsWith("Reb") ||
            tonality.startsWith("Mib") ||
            tonality.startsWith("Solb") ||
            tonality.startsWith("Lab") ||
            tonality.startsWith("Sib") ||
            tonality.startsWith("Fam"))
        ) {
          return "Lab" as string;
        }
        return tonality !== undefined ? ("Sol#" as string) : ("Lab" as string);
    }
  }

  /**
   * Reverse the operation of format pitch function, taking ordinal of pitch, translating
   * to as backend server expects to receive
   * @param ordinal integer number (must to be from 0) representing ordinal position value of
   * @param resultType type of the return of this function is required
   * @returns the transformation result of pitch name, which is from a latin notation
   * string pitch to a english notation string same to backend server Pitch enum  */
  getPitch(ordinal: number, resultType: 'string' | 'Pitch') {
    switch (ordinal) {
      case 0:
        return resultType === 'Pitch' ? Pitch.A : "A" as string;
      case 1:
        return resultType === 'Pitch' ? Pitch.A_SHARP : "A_SHARP" as string;
      case 2:
        return resultType === 'Pitch' ? Pitch.B : "B" as string;
      case 3:
        return resultType === 'Pitch' ? Pitch.C : "C" as string;
      case 4:
        return resultType === 'Pitch' ? Pitch.C_SHARP : "C_SHARP" as string;
      case 5:
        return resultType === 'Pitch' ? Pitch.D : "D" as string;
      case 6:
        return resultType === 'Pitch' ? Pitch.D_SHARP : "D_SHARP" as string;
      case 7:
        return resultType === 'Pitch' ? Pitch.E : "E" as string;
      case 8:
        return resultType === 'Pitch' ? Pitch.F : "F" as string;
      case 9:
        return resultType === 'Pitch' ? Pitch.F_SHARP : "F_SHARP" as string;
      case 10:
        return resultType === 'Pitch' ? Pitch.G : "G" as string;
      default:
        return resultType === 'Pitch' ? Pitch.G_SHARP : "G_SHARP" as string;
    }
  }

  getPitchIndex(pitch: Pitch): number {
    switch (pitch.toString()) {
      case "A":
      case "0":
        return 0;
      case "A_SHARP":
      case "1":
        return 1;
      case "B":
      case "2":
        return 2;
      case "C":
      case "3":
        return 3;
      case "C_SHARP":
      case "4":
        return 4;
      case "D":
      case "5":
        return 5;
      case "D_SHARP":
      case "6":
        return 6;
      case "E":
      case "7":
        return 7;
      case "F":
      case "8":
        return 8;
      case "F_SHARP":
      case "9":
        return 9;
      case "G":
      case "10":
        return 10;
      case "G_SHARP":
      case "11":
        return 11;
      default:
        throw new Error(`Invalid pitch string: ${pitch.toString()}`);
    }
  }

  /**
   * Converts a string to its corresponding Pitch enum value
   * @param pitchStr string representation of the pitch (e.g., "A", "A_SHARP", etc.)
   * @returns the corresponding Pitch enum value
   * @throws Error if the string doesn't match any Pitch enum value
   */
  stringToPitch(pitchStr: string): Pitch {
    const pitch = Pitch[pitchStr as keyof typeof Pitch];
    if (pitch === undefined) {
      throw new Error(`Invalid pitch string: ${pitchStr}`);
    }
    return pitch;
  }
}
