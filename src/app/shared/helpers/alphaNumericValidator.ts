/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {NetworkType} from '../../core/models/dtv/network/logical/Network';

export function validateAlphanumeric(event): boolean {
  const regex = new RegExp('^[a-zA-Z0-9]+$');
  const key = String.fromCharCode(
    !event.charCode ? event.which : event.charCode
  );
  if (!regex.test(key)) {
    event.preventDefault();
    return false;
  }
}

export function validateNumberWithDash(event, atscType: NetworkType): boolean {
  const num = event.target.value?.toString();
  const charCode = event.which ? event.which : event.keyCode;
  let dashCount;
  let majorLimit = 99;
  let addByOneIfATSC3 = 0;
  if (atscType !== 'ATSC_TERRESTRIAL'){
    majorLimit = 999;
    addByOneIfATSC3 = 1;
  }

  // if atscType is equal to terrestial
  if (atscType === 'ATSC_TERRESTRIAL' || atscType === 'ATSC_3') {
    const val = num + event.key;
    if (!num?.toString()?.includes('-') && (val < 1 || val > majorLimit)) {
      event.preventDefault();
      return false;
    }
  }

  // check if input start with zero or dash
  if ((event.key === 0 || event.key === '-') && num?.length === 0) {
    event.preventDefault();
    return false;
  }
  // check if more than one dash input
  dashCount = num?.split('-');
  if (dashCount?.length > 1 && event.key === '-') {
    event.preventDefault();
    return false;
  }
  // check if input has dash then change input limit to 6 else 5
  // check if (max of 3 digital) - (max of 3 digital) then limit is 7
  if (dashCount?.length === 1 && num?.length > (4 + addByOneIfATSC3)) {
    event.preventDefault();
    return false;
  }
  if (dashCount[0]?.length === (2 + addByOneIfATSC3) && num?.length > (5 + addByOneIfATSC3)) {
    event.preventDefault();
    return false;
  }
  if (dashCount[0]?.length === (1 + addByOneIfATSC3) && num?.length > (4 + addByOneIfATSC3) && atscType !== 'ATSC_CABLE') {
    event.preventDefault();
    return false;
  }

  if (atscType === 'ATSC_3' && dashCount[0]?.length === (0 + addByOneIfATSC3) && num?.length > (3 + addByOneIfATSC3)) {
    event.preventDefault();
    return false;
  }

  if (dashCount?.length === 2 && parseInt(event.key) === 0 && dashCount[1]?.length === 0 && atscType !== 'ATSC_CABLE') {
    event.preventDefault();
    return false;
  }
  // check if dash is input in last
  if (num?.length === (4 + addByOneIfATSC3) && event.key === '-') {
    event.preventDefault();
    return false;
  }

  if (
    event.key !== 0 &&
    charCode !== 45 &&
    charCode > 31 &&
    (charCode < 48 || charCode > 57)
  ) {
    event.preventDefault();
    return false;
  }
  return true;
}

export function validateEndDash(val) {
  const len = val?.length;
  // const str = val?.toString();
  return val?.length <= 4 && val?.charAt(len - 1) === '-' ? parseInt(val?.substring(0, len - 1), 10) : val;
}
export function isNumeric(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value);
}
