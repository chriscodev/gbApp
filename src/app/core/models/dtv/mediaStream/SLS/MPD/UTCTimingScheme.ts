// Copyright (c) 2023 Triveni Digital, Inc. All rights reserved.

/* tslint:disable:no-redundant-jsdoc no-namespace */

export enum UTCTimingScheme {
  XSDATE = 'urn:mpeg:dash:utc:http-xsdate:2014',
  HTTP_ISO = 'urn:mpeg:dash:utc:http-iso:2014',
  HTTP_NTP = 'urn:mpeg:dash:utc:http-ntp:2014',
  NTP = 'urn:mpeg:dash:utc:ntp:2014',
  HTTP_HEAD = 'urn:mpeg:dash:utc:http-head:2014',
  DIRECT = 'urn:mpeg:dash:utc:direct:2014',

  UNKNOWN = 'UNKOWN'
}

/**
 * Adds class methods to the UTCTimingScheme enum.
 */
export namespace UTCTimingScheme {
  /** Valid enum values */
  const values: readonly string[] = [UTCTimingScheme.XSDATE, UTCTimingScheme.HTTP_ISO, UTCTimingScheme.HTTP_NTP, UTCTimingScheme.NTP, UTCTimingScheme.HTTP_HEAD, UTCTimingScheme.DIRECT];

  /**
   * Returns the corresponding enum if the given string is one of the valid enum values.
   *
   * Use: UTCTimingScheme.get( "urn:mpeg:dash:utc:http-xsdate:2014" ) === UTCTimingScheme.XSDATE
   *
   * @param {string} s - string to test
   * @returns {UTCTimingScheme} - UTCTimingScheme if valid, UNKNOWN if not
   */
  export function get(s: string): UTCTimingScheme {
    switch (s) {
      case 'urn:mpeg:dash:utc:http-xsdate:2014':
        return UTCTimingScheme.XSDATE;
      case 'urn:mpeg:dash:utc:http-iso:2014':
        return UTCTimingScheme.HTTP_ISO;
      case 'urn:mpeg:dash:utc:http-ntp:2014':
        return UTCTimingScheme.HTTP_NTP;
      case 'urn:mpeg:dash:utc:ntp:2014':
        return UTCTimingScheme.NTP;
      case 'urn:mpeg:dash:utc:http-head:2014':
        return UTCTimingScheme.HTTP_HEAD;
      case 'urn:mpeg:dash:utc:direct:2014':
        return UTCTimingScheme.DIRECT;
      default:
        return UTCTimingScheme.UNKNOWN;
    }
  }

  /**
   * Returns true if the given string is one of the valid enum values.
   *
   * @param {string} s - string to test
   * @returns {boolean} - true if valid
   */
  export function isValid(s: string): boolean {
    return values.indexOf(s) > -1;
  }

  /**
   * Returns the correct enum for the given string, or UNKNOWN if not valid.
   *
   * @param {string} s - string to validate
   * @returns {UTCTimingScheme} - enum if valid string, else UNKNOWN
   */
  export function validate(s: string): UTCTimingScheme {
    return isValid(s) ? s as UTCTimingScheme : UTCTimingScheme.UNKNOWN;
  }
}
