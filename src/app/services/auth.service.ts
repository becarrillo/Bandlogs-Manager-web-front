import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LoginUser } from '../interfaces/login-user';
import { Observable } from 'rxjs';
import { IUserRole } from '../interfaces/i-user-role';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  http = inject(HttpClient);
  /**
   * It gets a logged in user object compound by attributes of
   * nickname and role, from server
   */
  getAuthenticatedUserRole() : Observable<IUserRole> {
    const token = localStorage.getItem("accessToken");
    if (token===null) {
      throw new Error(
        "Ningún token de acceso encontrado en el almacenamiento local."
      );
    }
    return this.http.get<IUserRole>(
      "http://localhost:8080/api/v1/auth/usuario-rol",
      {
        headers: new HttpHeaders({
          "Authorization": `Bearer ${token}`
        }),
        params: { token }
      }
    );
  }

  login(loginUser : LoginUser) : Observable<LoginUser> {
    return this.http.post<LoginUser>(
      "http://localhost:8080/api/v1/auth/login",
      loginUser,
      {
        headers: new HttpHeaders(
          { "Content-Type": "application/json;charset=utf-8" }
        )
      }
    );
  }

  logout() {
    this.http.delete<void>("http://localhost:8080/api/v1/auth/logout");
  }
}
