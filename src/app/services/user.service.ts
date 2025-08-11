import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '../interfaces/user';
import { IUserRole } from '../interfaces/i-user-role';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);

  listAll() {
    const AUTHORIZATION_HEADER_VALUE = `Bearer ${localStorage.getItem('accessToken')}`;
    
    return this.http.get<User[]>(
      "http://localhost:8080/api/v1/usuarios",
      {headers: {'Authorization': AUTHORIZATION_HEADER_VALUE}}
    );
  }

  getUserByNickname(nickname : string) {
    const AUTHORIZATION_HEADER_VALUE = `Bearer ${localStorage.getItem('accessToken')}`;

    return this.http.get<User>(
      "http://localhost:8080/api/v1/usuarios/usuario",
      {
        headers: {
          'Authorization': AUTHORIZATION_HEADER_VALUE
        },
        params : {'nombre-de-usuario': nickname}
      }
    );
  }

  registerUser(user : Omit<User, "userId">) : Observable<User> {
    // The userId is not required for registration, so we omit them
    return this.http.post<User>("http://localhost:8080/api/v1/usuarios/registro",
      user,
      {
        headers: new HttpHeaders({
          "Content-Type": "application/json;charset=utf-8"
        })
      }
    );
  } 

  setUserPhoneNumber(user : User, phoneNumber : string) {
    const AUTHORIZATION_HEADER_VALUE = `Bearer ${localStorage.getItem('accessToken')}`;

    return this.http.patch<User>(
      `http://localhost:8080/api/v1/usuarios/${user.userId}/telefono/modificar`,
      {phoneNumber},
      {headers: {'Authorization': AUTHORIZATION_HEADER_VALUE}}
    );
  }

  setUserRole(userId : number, dto : IUserRole) {
    const AUTHORIZATION_HEADER_VALUE = `Bearer ${localStorage.getItem('accessToken')}`;
    
    return this.http.patch<User>(
      `http://localhost:8080/api/v1/usuarios/${userId}/rol/modificar`,
      dto,
      {
        headers: {'Authorization': AUTHORIZATION_HEADER_VALUE,
          'Content-Type': 'application/json;charset=utf-8'}
      }
    );
  }

  updateUser(user : User) {
    const AUTHORIZATION_HEADER_VALUE = `Bearer ${localStorage.getItem('accessToken')}`;

    return this.http.put<User>(
      `http://localhost:8080/api/v1/usuarios/${user.userId}/modificar`,
      user,
      {
        headers: {'Authorization': AUTHORIZATION_HEADER_VALUE,
          'Content-Type': 'application/json;charset=utf-8'}
      }
    );
  }
}
