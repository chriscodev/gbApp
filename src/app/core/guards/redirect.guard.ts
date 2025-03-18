// Copyright (c) 2025 Triveni Digital, Inc. All rights reserved.

import {CanActivate, Router} from '@angular/router';
import {Injectable, OnDestroy} from '@angular/core';
import {InitLevel} from '../models/server/Server';
import {ServerService} from '../services/server.service';

@Injectable({ providedIn: 'root' })

export class RedirectGuard {
  constructor(
    private router: Router,
    private serverService: ServerService
  ) {

  }
  canActivate() {
    this.serverService.getServerInfo().subscribe((serverStatusInfo) => {
      if (serverStatusInfo.initLevel === InitLevel.LEVEL2) {
        this.router.navigate(['/main/gb-status']).then(r => r);
      } else{
        this.router.navigate(['/main/service-map']).then(r => r);
      }
    });
  }
}
