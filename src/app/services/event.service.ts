import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Event } from '../interfaces/event';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private http = inject(HttpClient);

  getEventById(id : string) {
    const AUTHORIZATION_HEADER_VALUE = `Bearer ${localStorage.getItem('accessToken')}`;

    return this.http.get<Event>(
      "http://localhost:8080/api/v1/eventos/".concat(id),
      {
        headers: {'Authorization': AUTHORIZATION_HEADER_VALUE}
      }
    );
  }

  listAllEvents() {
    const AUTHORIZATION_HEADER_VALUE = `Bearer ${localStorage.getItem('accessToken')}`;

    return this.http.get<Event>(
      "http://localhost:8080/api/v1/eventos",
      {
        headers: {'Authorization': AUTHORIZATION_HEADER_VALUE}
      }
    );
  }

  listEventsByDate(date : Date) {
    const AUTHORIZATION_HEADER_VALUE = `Bearer ${localStorage.getItem('accessToken')}`;

    const params : Params = {};
    params['fecha'] = date;

    return this.http.get<Event[]>(
      "http://localhost:8080/api/v1/eventos/",
      {
        headers: {'Authorization': AUTHORIZATION_HEADER_VALUE},
        params
      }
    );
  }

  addEvent(event : Omit<Event, 'eventId'>) {
    const AUTHORIZATION_HEADER_VALUE = `Bearer ${localStorage.getItem('accessToken')}`;
    
    return this.http.post<Event>(
      "http://localhost:8080/api/v1/eventos/agregar",
      event,
      {
        headers: {
          'Authorization': AUTHORIZATION_HEADER_VALUE,
          'Content-Type': 'application/json;charset=utf-8'
        }
      }
    );
  }

  deleteEvent(event : Event) {
    const AUTHORIZATION_HEADER_VALUE = `Bearer ${localStorage.getItem('accessToken')}`;

    this.http.delete(
      "http://localhost:8080/api/v1/eventos/eliminar",
      {
        headers: {'Authorization': AUTHORIZATION_HEADER_VALUE},
        body: event
      }
    );
  }

  updateEvent(eventId : string, event : Event) {
    const AUTHORIZATION_HEADER_VALUE = `Bearer ${localStorage.getItem('accessToken')}`;
    
    return this.http.put<Event>(
      `http://localhost:8080/api/v1/eventos/${eventId}/modificar`,
      event,
      {
        headers: {
          'Authorization': AUTHORIZATION_HEADER_VALUE,
          'Content-Type': 'application/json;charset=utf-8'
        }
      }
    );
  }
}
