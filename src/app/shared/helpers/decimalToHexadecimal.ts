/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

export function convertDecToHex(val): string {
  let result = '';
  try {
    result = Number(val)?.toString(16).toLocaleUpperCase();
  } catch (e) {
    console.log('convertDecToHex() function error: ' + e);
  }
  return result;
}

export function numberToHex(value: number): string {
  return value !== undefined ? '0x' + Number(value)?.toString(16).toLocaleUpperCase() : '';
}

// Decode Base64 to Byte Array
export function base64ToByteArray(base64Str: string): Uint8Array {
  const binaryStr = atob(base64Str);
  const len = binaryStr.length;
  const byteArray = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    byteArray[i] = binaryStr.charCodeAt(i);
  }
  return byteArray;
}

export function byteArrayToHexDump(slice: Uint8Array): string[] {
  return Array.from(slice).map(byte => byte.toString(16).padStart(2, '0'));
}

export function byteArrayToAsciiDump(slice: Uint8Array): string[] {
  return Array.from(slice).map(byte => {
    return (byte >= 32 && byte <= 126) ? String.fromCharCode(byte) : '.';
  });
}
