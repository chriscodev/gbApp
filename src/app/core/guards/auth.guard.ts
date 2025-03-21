/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot} from '@angular/router';

import {ApiService} from '../services/api.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard  {
  constructor(private router: Router, private apiService: ApiService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this.apiService.currentUserValue;
    if (currentUser) {
      // authorized
      return true;
    }

    // not logged in so redirect to login page with the return url
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
