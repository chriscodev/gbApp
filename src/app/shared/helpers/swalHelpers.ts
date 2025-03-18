/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import { SweetAlert } from "sweetalert/typings/core";

import * as _swal from 'sweetalert';

const swal: SweetAlert = _swal as any;

/**
 *
 * @param message - message of the alert
 * @param title  - not required - custom title of the alert, leave blank to use default
 */
export function alertSuccess(message: string,title?:string) {
    swal({
      icon: 'success',
      title: title ? title : 'Success!',
      text: message
    });
  }

export function alertError(message: string,title?:string) {
    swal({
      icon: 'error',
      title: title ? title : 'Error',
      text: message
    }).then();
  }

export function alertInfo(message: string, title?: string) {
    swal({
      icon: 'info',
      title: title ? title : '',
      text: message
    }).then();
  }
