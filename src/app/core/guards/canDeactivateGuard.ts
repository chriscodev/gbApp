/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import * as _swal from 'sweetalert';
import {SweetAlert} from 'sweetalert/typings/core';

const swal: SweetAlert = _swal as any;

export interface ComponentCanDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}

@Injectable({
  providedIn: 'root',
})

export class PendingChangesGuard {
  constructor() {
  }

  canDeactivate(component: any) {
    return component.canDeactivate()
      ? true
      :
      swal({
        title: 'Confirmation',
        text:
          'You have unsaved changes. Press Cancel to go back and save these changes, or OK to lose these changes. ',
        buttons: ['Cancel', 'Ok'],
        icon: 'warning',
      }).then((isConfirm) => {
        return isConfirm === true;
      });

  }

}
