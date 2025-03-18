// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.

import {isDefined} from '../../core/models/dtv/utils/Utils';

/**
 *
 * @param event - an inputted ip address value to be checked for ip address format validation
 * @returns boolean - is for identifying if the input value satisfies an IP address format
 */
export function validateIPOld(event): boolean {
  let dotCount;
  const maxDots = 3;
  const checkNumberOnly = event.target.value;
  const charCode = event.which ? event.which : event.keyCode;
  const numeric = event.target.value?.toString();
  let checkNumeric;

  // reset dot counts
  if (checkNumberOnly === '') {
    dotCount = 0;
  }
  // check input char between 0-9 and dot
  if (charCode > 31 && (charCode < 46 || charCode > 57 || charCode === 47)) {
    return false;
  }
  // check whole input less than 255 and if dot count is zero
  if (checkNumberOnly > 255 && dotCount === 0) {
    return false;
  }

  // if first input is zero prevent input aside from dot.
  // sample expected input: 0.0.0.0
  if (numeric?.substr(numeric?.length - 1) === '0') {
    if (event.key !== '.') {
      checkNumeric = numeric?.split('.');
      dotCount = checkNumeric?.length - 1;
      if (checkNumeric[dotCount] === 0) {
        return false;
      }
    }
  }
  // check input with dot
  if (numeric + event.key?.includes('.')) {
    checkNumeric = numeric?.split('.');
    dotCount = checkNumeric?.length - 1;
    // cannot input double dot
    if (numeric?.substr(numeric?.length - 1) === '.' && event.key === '.') {
      return false;
    }
    // check if last input is dot
    if (dotCount >= maxDots) {
      if (event.key === '.') {
        return false;
      }
    }
    // Handling inputs by checking the segment being edited
    const selectionStart = event.target.selectionStart;
    const currentSegmentIndex = numeric.substring(0, selectionStart).split('.').length - 1;
    if (checkNumeric[currentSegmentIndex] + event.key > 255) {
      return false;
    }
  } else {
    dotCount = 0;
  }

  return true;
}

export function validateIP(event): boolean {
  const input = event.target.value;
  const charCode = event.which ? event.which : event.keyCode;
  const numeric = input?.toString();

  // Check if the input character is valid (0-9 and dot)
  if (charCode > 31 && (charCode < 46 || charCode > 57 || charCode === 47)) {
    return false;
  }
  // Split the input into segments (octets)
  const segments = numeric.split('.');
  // If segments exceed 4, reject input
  if (segments.length > 4) {
    return false;
  }
  const selectionStart = event.target.selectionStart;
  const currentSegmentIndex = numeric.substring(0, selectionStart).split('.').length - 1;
  // Handle current segment
  const currentSegment = segments[currentSegmentIndex] || '';
  // Prevent input if the segment has leading zeros (except for '0' itself)
  if (currentSegment.length > 0 && currentSegment.startsWith('0') && currentSegment !== '0') {
    return false;
  }
  // Validate the number in the current segment
  const newSegmentValue = currentSegment + event.key;
  if (event.key !== '.' && parseInt(newSegmentValue, 10) > 255) {
    return false;
  }
  // Prevent double dots and check if the last character is a dot
  return !(event.key === '.' && (currentSegment.endsWith('.') || segments.length === 4));
}

export function validateIPAddressKeyEvent(event): void {
  let dotCount;
  const maxDots = 3;
  const checkNumberOnly = event.target.value;
  const keyCode = event.keyCode;
  const numeric = event.target.value?.toString();
  let checkNumeric;

  // reset dot counts
  if (checkNumberOnly === '') {
    dotCount = 0;
  }

  const allowedSpecialKeyCodes: boolean =
    keyCode === 8 || keyCode === 37 || keyCode === 39 || keyCode === 46 || keyCode === 144;
  if (allowedSpecialKeyCodes) {
    return;
  }

  // check input char between 0-9 and dot or period
  const numberOrDot: boolean = (keyCode >= 48 && keyCode <= 57) || keyCode === 110 || keyCode === 190;
  if (!numberOrDot) {
    if (event.preventDefault) {
      event.preventDefault();
      event.returnValue = false;
    }
    return;
  }
  // check whole input less than 255 and if dot count is zero
  if (checkNumberOnly > 255 && dotCount === 0) {
    if (event.preventDefault) {
      event.preventDefault();
      event.returnValue = false;
    }
    return;
  }

  // if first input is zero prevent input aside from dot.
  // sample expected input: 0.0.0.0
  if (numeric?.substr(numeric?.length - 1) === '0') {
    if (event.key !== '.') {
      checkNumeric = numeric?.split('.');
      dotCount = checkNumeric?.length - 1;
      if (checkNumeric[dotCount] === 0) {
        if (event.preventDefault) {
          event.preventDefault();
          event.returnValue = false;
        }
        return;
      }
    }
  }

  // check input with dot
  if (numeric + event.key?.includes('.')) {
    checkNumeric = numeric?.split('.');
    dotCount = checkNumeric?.length - 1;
    // cannot input double dot
    if (numeric?.substr(numeric?.length - 1) === '.' && event.key === '.') {
      if (event.preventDefault) {
        event.preventDefault();
        event.returnValue = false;
      }
      return;
    }
    // check if last input is dot
    if (dotCount >= maxDots) {
      if (event.key === '.') {
        if (event.preventDefault) {
          event.preventDefault();
          event.returnValue = false;
        }
        return;
      }
    }
    if (checkNumeric[dotCount] + event.key > 255) {
      if (event.preventDefault) {
        event.preventDefault();
        event.returnValue = false;
      }
      return;
    }
  } else {
    dotCount = 0;
  }
}

/**
 * Returns true if the field value is a valid URL. A valid URL has a "http://" in front,
 * and at least some server of the form "x.y"
 */
export function isUrlValid(urlString: string): boolean {
  return new RegExp('^https?:\\/\\/[^\\s$.?#].[^\\s]*$').test(urlString);
}

export function isIPAddressValid(ipAddress: string): boolean {
  const ipFormat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipFormat.test(ipAddress);
}

export function checkPortLimit(port: number, minPort?: number): boolean {
  return isDefined(port) && (minPort ? port >= minPort : port >= 1) && port <= 65535;
}
