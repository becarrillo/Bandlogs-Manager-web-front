import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Song } from '../interfaces/song';
import { Tonality } from '../interfaces/tonality';


@Injectable({
  providedIn: 'root'
})
export class SongService {
  private readonly http = inject(HttpClient);
  private readonly authHeader = `Bearer ${localStorage.getItem('accessToken')}`;

  getSongById(id : number) {
    return this.http.get<Song>(
      `http://localhost:8080/api/v1/repertorio/${id}`,
      {
        headers: {'Authorization': this.authHeader}
      }
    );
  }

  transportSong(songId : number, tonality : Tonality) {
    return this.http.patch<Song>(
      `http://localhost:8080/api/v1/repertorio/${songId}/transportar`,
      tonality,
      {
        headers: {
          'Authorization': this.authHeader,
          'Content-Type': 'application/json;charset=utf-8'
        }
      }
    );
  }

  updateSong(songId : number, song : Song) {
    return this.http.put<Song>(
      `http://localhost:8080/api/v1/repertorio/${songId}/modificar`,
      song,
      {
        headers: {
          'Authorization': this.authHeader,
          'Content-Type': 'application/json;charset=utf-8'
        }
      }
    );
  }


  deleteSong(song : Song) {
    this.http.delete(
      "http://localhost:8080/api/v1/repertorio/eliminar",
      {
        headers: {
          'Authorization': this.authHeader,
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: song
      }
    );
  }
}
