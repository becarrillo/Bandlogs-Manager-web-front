import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '../interfaces/user';
import { IUserRole } from '../interfaces/i-user-role';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly authHeader = `Bearer ${localStorage.getItem('accessToken')}`;

  listAll() {
    return this.http.get<User[]>(
      "http://localhost:8080/api/v1/usuarios",
      {headers: {'Authorization': this.authHeader}}
    );
  }

  getUserByNickname(nickname : string) {
    return this.http.get<User>(
      "http://localhost:8080/api/v1/usuarios/usuario",
      {
        headers: {'Authorization': this.authHeader},
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
    return this.http.patch<User>(
      `http://localhost:8080/api/v1/usuarios/${user.userId}/telefono/modificar`,
      {phoneNumber},
      {headers: {'Authorization': this.authHeader}}
    );
  }

  setUserRole(userId : number, dto : IUserRole) {
    return this.http.patch<User>(
      `http://localhost:8080/api/v1/usuarios/${userId}/rol/modificar`,
      dto,
      {
        headers: {'Authorization': this.authHeader,
          'Content-Type': 'application/json;charset=utf-8'}
      }
    );
  }

  updateUser(user : User) {return this.http.put<User>(
      `http://localhost:8080/api/v1/usuarios/${user.userId}/modificar`,
      user,
      {
        headers: {'Authorization': this.authHeader,
          'Content-Type': 'application/json;charset=utf-8'}
      }
    );
  }
}
