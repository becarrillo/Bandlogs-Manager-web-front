import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Song } from '../interfaces/song';
import { Tonality } from '../interfaces/tonality';


@Injectable({
  providedIn: 'root'
})
export class SongService {
  private readonly http = inject(HttpClient);

  getSongById(id : number) {
    const AUTHORIZATION_HEADER_VALUE = `Bearer ${localStorage.getItem('accessToken')}`;
    return this.http.get<Song>(
      `http://localhost:8080/api/v1/repertorio/${id}`,
      {
        headers: {'Authorization': AUTHORIZATION_HEADER_VALUE}
      }
    );
  }

  transportSong(songId : number, tonality : Tonality) {
    const AUTHORIZATION_HEADER_VALUE = `Bearer ${localStorage.getItem('accessToken')}`;
    return this.http.patch<Song>(
      `http://localhost:8080/api/v1/repertorio/${songId}/transportar`,
      tonality,
      {
        headers: {
          'Authorization': AUTHORIZATION_HEADER_VALUE,
          'Content-Type': 'application/json;charset=utf-8'
        }
      }
    );
  }

  updateSong(songId : number, song : Song) {
    const AUTHORIZATION_HEADER_VALUE = `Bearer ${localStorage.getItem('accessToken')}`;

    return this.http.put<Song>(
      `http://localhost:8080/api/v1/repertorio/${songId}/modificar`,
      song,
      {
        headers: {
          'Authorization': AUTHORIZATION_HEADER_VALUE,
          'Content-Type': 'application/json;charset=utf-8'
        }
      }
    );
  }

  alertAuthorization() {
    const AUTHORIZATION_HEADER_VALUE = `Bearer ${localStorage.getItem('accessToken')}`;
    window.alert(AUTHORIZATION_HEADER_VALUE);
  }

  deleteSong(song : Song) {
    const AUTHORIZATION_HEADER_VALUE = `Bearer ${localStorage.getItem('accessToken')}`;
    this.http.delete(
      "http://localhost:8080/api/v1/repertorio/eliminar",
      {
        headers: {'Authorization': AUTHORIZATION_HEADER_VALUE, 'Content-Type': 'application/json;charset=utf-8'},
        body: song
      }
    );
  }
}
