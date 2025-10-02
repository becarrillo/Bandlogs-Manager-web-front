import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Event } from '../interfaces/event';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly authHeader = `Bearer ${localStorage.getItem('accessToken')}`;

  getEventById(id : string) {
    return this.http.get<Event>(
      "http://localhost:8080/api/v1/eventos/".concat(id),
      {
        headers: {'Authorization': this.authHeader}
      }
    );
  }

  listAllEvents() {
    return this.http.get<Event>(
      "http://localhost:8080/api/v1/eventos",
      {
        headers: {'Authorization': this.authHeader}
      }
    );
  }

  listEventsByDate(date : Date) {
    const params : Params = {};
    params['fecha'] = date;

    return this.http.get<Event[]>(
      "http://localhost:8080/api/v1/eventos/",
      {
        headers: {'Authorization': this.authHeader},
        params
      }
    );
  }

  addEvent(event : Omit<Event, 'eventId'>) {
    return this.http.post<Event>(
      "http://localhost:8080/api/v1/eventos/agregar",
      event,
      {
        headers: {
          'Authorization': this.authHeader,
          'Content-Type': 'application/json;charset=utf-8'
        }
      }
    );
  }

  deleteEvent(event : Event) {this.http.delete(
      "http://localhost:8080/api/v1/eventos/eliminar",
      {
        headers: {'Authorization': this.authHeader},
        body: event
      }
    );
  }

  updateEvent(eventId : string, event : Event) {
    return this.http.put<Event>(
      `http://localhost:8080/api/v1/eventos/${eventId}/modificar`,
      event,
      {
        headers: {
          'Authorization': this.authHeader,
          'Content-Type': 'application/json;charset=utf-8'
        }
      }
    );
  }
}
