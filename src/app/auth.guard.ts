import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';


export const authGuard: CanActivateChildFn = (childRoute, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('accessToken');
  // Check if the user is authenticated
  // If the token is not present, redirect to the login page
  var isAuthenticated = false;
  if (token!==undefined && token!==null && token.length>0)
    isAuthenticated = true;
  if (!isAuthenticated)
    router.navigateByUrl('/login');   // redirect to login
  return isAuthenticated;
};