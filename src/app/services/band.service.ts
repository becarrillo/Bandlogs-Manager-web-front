import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Band } from '../interfaces/band';
import { Event } from '../interfaces/event';
import { Params } from '@angular/router';
import { User } from '../interfaces/user';
import { MusicalGenre } from '../enums/musical-genre';


@Injectable({
  providedIn: 'root'
})
export class BandService {
  private readonly http = inject(HttpClient);
  private readonly authHeader = `Bearer ${localStorage.getItem('accessToken')}`;

  getBandById(id : number) {
    return this.http.get<Band>(
      `http://localhost:8080/api/v1/bandas/${id}`,
      {
        headers: {'Authorization': this.authHeader}
      }
    );
  }

  listBandsByNameContaining(name : string) {
    const params : Params = {nombre: name};

    return this.http.get<Band[]>(
      "http://localhost:8080/api/v1/bandas",
      {
        headers: {'Authorization': this.authHeader},
        params
      }
    )
  }

  listAllBands() : Observable<Band[]> {
    return this.http.get<Band[]>(
      "http://localhost:8080/api/v1/bandas",
      {headers: {'Authorization': this.authHeader}}
    );
  }

  listBandsByDirector(nickname: string) : Observable<Band[]> {
    const params : Params = {"nombre-de-usuario": nickname};

    return this.http.get<Band[]>(
      "http://localhost:8080/api/v1/bandas/por-director",
      {
        headers: {'Authorization': this.authHeader},
        params
      }
    );
  }

  listBandsByMemberUserNickname(nickname : string) {
    const params : Params = {"nombre-de-usuario": nickname};

    return this.http.get<Band[]>(
      "http://localhost:8080/api/v1/bandas/por-miembro",
      {
        headers: {'Authorization': this.authHeader},
        params
      }
    );
  }

  saveBand(band : {name : string, musicalGenre: MusicalGenre; users: User[];}) : Observable<Band> {
    return this.http.post<Band>(
      "http://localhost:8080/api/v1/bandas/agregar",
      band,
      {
        headers: {'Authorization': this.authHeader,
          'Content-Type': 'application/json;charset=utf-8'}
      }
    );
  }

  updateBand(bandId: number, band : Band) {
    return this.http.put<Band>(
      `http://localhost:8080/api/v1/bandas/${bandId}/modificar`,
      band,
      {
        headers: {'Authorization': this.authHeader,
          'Content-Type': 'application/json;charset=utf-8'}
      }
    );
  }

  deleteBand(band : {bandId: number, name: string, director: string, musicalGenre: MusicalGenre}) {
    return this.http.delete(
      "http://localhost:8080/api/v1/bandas/eliminar",
      {
        headers: {'Authorization': this.authHeader},
        body: band
      }
    );
  }

  patchEventToBand(bandId: number, event : Omit<Event, 'eventId'>) {
    return this.http.patch<Band>(
      `http://localhost:8080/api/v1/bandas/${bandId}/eventos/agregar`,
      event,
      {
        headers: {'Authorization': this.authHeader,
          'Content-Type': 'application/json;charset=utf-8'}
      }
    );
  }

  patchMemberUserToBand(bandId: number, user : User) {
    return this.http.patch<Band>(
      `http://localhost:8080/api/v1/bandas/${bandId}/usuarios/agregar`,
      user,
      {
        headers: {'Authorization': this.authHeader,
          'Content-Type': 'application/json;charset=utf-8'}
      }
    );
  }
}