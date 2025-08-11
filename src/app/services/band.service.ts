import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Band } from '../interfaces/band';
import { Observable } from 'rxjs';
import { Params } from '@angular/router';
import { User } from '../interfaces/user';
import { Event } from '../interfaces/event';
import { MusicalGenre } from '../enums/musical-genre';

@Injectable({
  providedIn: 'root'
})
export class BandService {
  protected http = inject(HttpClient);

  getBandById(id : number) {
    const AUTHORIZATION_HEADER_VALUE = `Bearer ${localStorage.getItem('accessToken')}`;

    return this.http.get<Band>(
      `http://localhost:8080/api/v1/bandas/${id}`,
      {
        headers: {'Authorization': AUTHORIZATION_HEADER_VALUE}
      }
    );
  }

  listAllBands() : Observable<Band[]> {
    const AUTHORIZATION_HEADER_VALUE = `Bearer ${localStorage.getItem('accessToken')}`;

    return this.http.get<Band[]>(
      "http://localhost:8080/api/v1/bandas",
      {headers: {'Authorization': AUTHORIZATION_HEADER_VALUE}}
    );
  }

  listBandsByDirector(nickname: string) : Observable<Band[]> {
    const AUTHORIZATION_HEADER_VALUE = `Bearer ${localStorage.getItem('accessToken')}`;
    const params : Params = {"nombre-de-usuario": nickname};

    window.alert(params['nombre-de-usuario']);

    return this.http.get<Band[]>(
      "http://localhost:8080/api/v1/bandas/por-director",
      {
        headers: {'Authorization': AUTHORIZATION_HEADER_VALUE},
        params
      }
    );
  }

  listBandsByMemberUserNickname(nickname : string) {
    const AUTHORIZATION_HEADER_VALUE = `Bearer ${localStorage.getItem('accessToken')}`;
    
    const params : Params = {"nombre-de-usuario": nickname};

    return this.http.get<Band[]>(
      "http://localhost:8080/api/v1/bandas/por-miembro",
      {
        headers: {'Authorization': AUTHORIZATION_HEADER_VALUE},
        params
      }
    );
  }

  saveBand(band : {name : string, musicalGenre: MusicalGenre}) : Observable<Band> {
    const AUTHORIZATION_HEADER_VALUE = `Bearer ${localStorage.getItem('accessToken')}`;

    return this.http.post<Band>(
      "http://localhost:8080/api/v1/bandas/agregar",
      band,
      {
        headers: {'Authorization': AUTHORIZATION_HEADER_VALUE,
          'Content-Type': 'application/json;charset=utf-8'}
      }
    );
  }

  updateBand(bandId: number, band : Band) {
    const AUTHORIZATION_HEADER_VALUE = `Bearer ${localStorage.getItem('accessToken')}`;

    return this.http.put<Band>(
      `http://localhost:8080/api/v1/bandas/${bandId}/modificar`,
      band,
      {
        headers: {'Authorization': AUTHORIZATION_HEADER_VALUE,
          'Content-Type': 'application/json;charset=utf-8'}
      }
    );
  }

  deleteBand(band : {bandId: number, name: string, director: string, musicalGenre: MusicalGenre}) {
    const AUTHORIZATION_HEADER_VALUE = `Bearer ${localStorage.getItem('accessToken')}`;

    return this.http.delete(
      "http://localhost:8080/api/v1/bandas/eliminar",
      {
        headers: {'Authorization': AUTHORIZATION_HEADER_VALUE},
        body: band
      }
    );
  }

  patchEventToBand(bandId: number, event : Event) {
    const AUTHORIZATION_HEADER_VALUE = `Bearer ${localStorage.getItem('accessToken')}`;

    return this.http.patch<Band>(
      `http://localhost:8080/api/v1/bandas/${bandId}/eventos/agregar`,
      event,
      {
        headers: {'Authorization': AUTHORIZATION_HEADER_VALUE,
          'Content-Type': 'application/json;charset=utf-8'}
      }
    );
  }

  patchMemberUserToBand(bandId: number, user : User) {
    const AUTHORIZATION_HEADER_VALUE = `Bearer ${localStorage.getItem('accessToken')}`;

    return this.http.patch<Band>(
      `http://localhost:8080/api/v1/bandas/${bandId}/usuarios/agregar`,
      user,
      {
        headers: {'Authorization': AUTHORIZATION_HEADER_VALUE,
          'Content-Type': 'application/json;charset=utf-8'}
      }
    );
  }
}
