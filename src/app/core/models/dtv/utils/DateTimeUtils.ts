// Copyright (c) 2023 Triveni Digital, Inc. All rights reserved.

import {checkUndefinedCompatible, isUndefined} from './Utils';

/*
 * Utils for date/time manipulation, formatting.
 *
 * @class DateTimeUtils
 */

export function getDateString(dateTime: string): string {
  if (isUndefined(dateTime)) {
    return '';
  }
  return getISODate(dateTime?.split('T')[0]);
}

export function getISODate(dateField: string): string {
  if (dateField === '') {
    return '';
  }
  const formatedDate: Date = new Date(dateField);
  return formatedDate.toLocaleDateString('en-US', {timeZone: 'UTC'});
}

export function getTimeString(dateTime: string): string {
  if (isUndefined(dateTime)) {
    return '';
  }
  return timeConversion(dateTime);
}

export function getDateandTimeFields(dateField: string, timeField: string): string {
  if (isUndefined(dateField)) {
    return '';
  }
  if (isUndefined(timeField)) {
    return '';
  }
  return concatDateTimeFields(dateField, timeField);
}

export function convert12To24Hrs(timeField: string): string {
  const AMPM: string = timeField.slice(-2);
  const timeArr: any = timeField.slice(0, -2).split(':');
  if (AMPM === 'AM' && timeArr[0] === '12') {
    timeArr[0] = '00';
  } else if (AMPM === 'PM' || AMPM === 'pm') {
    timeArr[0] = String((timeArr[0] % 12) + 12);
  }
  return timeArr.join(':');
}

export function timeConversion(datetimeField: string): string {
  if (datetimeField !== '') {

    const dField: string = datetimeField.split('T') [0];
    const tField: string = datetimeField.split('T') [1];
    const localDateTime: string = convertTOLocalTime(dField + ' ' + tField);
    if (localDateTime.includes('Z')) {
      return convert24To12Hrs(localDateTime.split('Z') [0]);
    } else {
      return convert12To24Hrs(localDateTime);
    }
  } else {
    return '';
  }

}

export function validateTimeFields(dateField: string, timeField: string): boolean {
  const convertedDate: Date = new Date(dateField + ' ' + timeField);
  return isValidDateField(convertedDate.toString());
}

export function validateDate(timeField: string): boolean {
  const parsedDate: number = Date.parse(timeField);
  return (isNaN(Number(timeField)) && !isNaN(parsedDate));
}

export function convert24To12Hrs(timeField: string): string {
  const timeString12hr: string = new Date(timeField)
    .toLocaleTimeString('en-US',
      {hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit'}
    );
  return timeString12hr;
}

export function concatDateTimeFields(dateField: string, timeField: string): string {
  const formatedDate: Date = new Date(dateField + ' ' + convert12To24Hrs(timeField));
  return formatedDate.toISOString().replace('.000Z', 'Z');
}

export function getDateandTimeFieldAsDate(dateField: string, timeField: string): Date {
  if (dateField === '' || timeField === '') {
    return undefined;
  }
  return new Date(getDateandTimeFields(dateField, timeField));
}

export function datesEqual(a: Date, b: Date): boolean {
  return checkUndefinedCompatible(a, b) && a.getTime() === b.getTime();
}

export function dateField1BeforeDateField2(d1: string, t1: string, d2: string, t2: string): boolean {
  return new Date(`${d2}T${t2}`) > new Date(`${d1}T${t1}`);
}

export function isValidDateField(dateField: string): boolean {
  return (dateField !== 'Invalid Date');
}

export function convertDateTO12hrs(dateField: Date): string {
  const time12hr: string = dateField.toLocaleString('en-US',
    {hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true});
  const p: any = {
    year: `${dateField.getUTCFullYear()}`.slice(-2),
    date: `0${dateField.getUTCDate()}`.slice(-2),
    month: `0${dateField.getMonth() + 1}`.slice(-2),
    time: `${time12hr}`
  };
  return `${p.time} ${p.month}/${p.date}`;
}

export function convertTOLocalTime(dateField: string): string {
  return new Date(new Date(dateField).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().replace('.000Z',
    'Z');
}

export function date1BeforeDate2(d1: Date, d2: Date): boolean {
  if (isUndefined(d1) || isUndefined(d2)) {
    return true;
  }
  return d2 > d1;
}

export function formatTimestamp(timeStamp: number, asUTC?: boolean): string {
  if (timeStamp === undefined) {
    return '';
  }
  return asUTC ? formatDate(new Date(timeStamp)) : formatLocalDate(new Date(timeStamp));
}

export function parseDateParts(date: Date): any {
  return {
    year: `${date.getUTCFullYear()}`.slice(-2),
    date: `0${date.getUTCDate()}`.slice(-2),
    month: `0${date.getMonth() + 1}`.slice(-2),
    amPM: date.getHours() < 12 ? 'AM' : 'PM',
    amPMHours: `${date.getHours()}`,
    hours: `0${date.getUTCHours()}`.slice(-2),
    minutes: `0${date.getMinutes()}`.slice(-2),
    seconds: `0${date.getSeconds()}`.slice(-2)
  };
}

export function formatDate(date: Date): string {
  if (date === undefined) {
    return '';
  }

  const p: any = parseDateParts(date);
  return `${p.month}/${p.date}/${p.year} ${p.hours}:${p.minutes}:${p.seconds}`;
}

export function formatLocalDate(date: Date): string {
  if (date === undefined) {
    return '';
  }

  const p: any = parseDateParts(date);
  return `${p.month}/${p.date}/${p.year} ${p.amPMHours}:${p.minutes}:${p.seconds} ${p.amPM}`;
}

export function formatShortDate(date: Date): string {
  if (date === undefined) {
    return '';
  }

  const p: any = parseDateParts(date);
  return `${p.month}/${p.date} ${p.hours}:${p.minutes} ${p.amPM}`;
}

export function formatShortTimestamp(timeStamp: number): string {
  if (timeStamp === undefined) {
    return '';
  }

  return formatShortDate(new Date(timeStamp));
}

export function formatShortDateSeconds(date: Date): string {
  if (date === undefined) {
    return '';
  }
  const dateNumber = `${date.getDate()}`;
  const monthOne: number = date.getMonth() + 1;
  const monthNumber = `${monthOne}`;
  const amPM: string = date.getHours() < 12 ? 'AM' : 'PM';
  const hours: number = date.getHours() % 12 || 12;
  const hourNumber = `${hours}`;
  const minuteNumber: string = `0${date.getMinutes()}`.slice(-2);
  const secondNumber: string = `0${date.getSeconds()}`.slice(-2);
  return `${monthNumber}/${dateNumber} ${hourNumber}:${minuteNumber}:${secondNumber} ${amPM}`;
}

export function formatReallyShortTimestamp(timeStamp: number): string {
  if (timeStamp === undefined) {
    return '';
  }
  return formatReallyShortDate(new Date(timeStamp));
}

export function formatReallyShortDate(date: Date): string {
  if (date === undefined) {
    return '';
  }
  const amPM: string = date.getHours() < 12 ? 'AM' : 'PM';
  const hours: number = date.getHours() % 12 || 12;
  const hourNumber = `${hours}`;
  const minuteNumber: string = `0${date.getMinutes()}`.slice(-2);
  const secondsNumber: string = `0${date.getSeconds()}`.slice(-2);
  return `${hourNumber}:${minuteNumber}:${secondsNumber} ${amPM}`;
}

export function dateIfDefined(n: string): Date {
  return n === undefined ? undefined : new Date(n);
}

export function printDateWithLocalTime(d: Date): string {
  if (d === undefined) {
    return '';
  }

  return formatDate(d) + ' (' + d.toLocaleString() + ' local)';
}

export function formatPeriodSeconds(millis: number): string {
  if (millis === undefined) {
    return '';
  }
  const secs: number = Math.floor(millis / 1000);
  return `${secs}s`;
}

export function msToString(ms: number): string {
  const d: Date = new Date(ms);
  const timeString: string = d.toISOString().slice(11, -1);
  const min: number = Math.floor(ms / (1000 * 60));
  const sec: number = Math.floor(ms / 1000 % 60);
  let formattedTimeString = '';
  if (min > 0 && Number(sec) > 0) {
    formattedTimeString = min === 1 ? min + ' minute' : min + ' minutes';
    formattedTimeString += sec === 1 ? ', ' + sec + ' second' : ', ' + sec + ' seconds';
  } else if (min === 0 && Number(sec) > 0) {
    formattedTimeString = sec === 1 ? sec + ' second' : sec + ' seconds';
  } else {
    formattedTimeString = 'less than a second';
  }
  return formattedTimeString + ' (' + timeString + ')';
}


// export function formatSecsMillis( millis: number ): string
// {
// const s: number = Math.floor( millis / 1000 );
// const m: number = millis - 1000 * s;
// if( s === 0 ) { return `${m}ms`; }
// // noinspection Annotator
// const ms: string = `${m}`.padStart( 3, "0" );
// return `${s}s${ms}ms`;
// }
//
// export function formatMillis( millis: number ): string
// {
// return `${millis}ms`;
// }
//
// export function formatPeriodHMS( millis: number ): string
// {
// if( millis === undefined ) { return undefined; }
// let result: string = "";
//
// let secs: number = Math.floor( millis / 1000 );
//
// const hours: number = Math.floor( secs / 3600 );
// if( hours > 0 ) { result += `${hours}h `; }
// secs -= 3600 * hours;
//
// const mins: number = Math.floor( secs / 60 );
// if( mins > 0 ) { result += `${mins}m `; }
// secs -= 60 * mins;
//
// if( secs > 0 && result.length > 0 ) { return `${result}${secs}s `; }
// if( secs > 0 ) { return `${secs}s `; }
// return "0s";
// }

// export function parsePeriod( period: string ): number
// {
// const periodParts: string[] = /^(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?$/g.exec( period ) || [];
//
// return 31536000 * parseFloat( periodParts[ 1 ] ) +
// 2628000 * parseFloat( periodParts[ 2 ] ) +
// 86400 * parseFloat( periodParts[ 3 ] );
// }
//
// export function parseTime( time: string ): number
// {
// const timeParts: string[] = /^(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/g.exec( time ) || [];
//
// return 3600 * parseFloat( timeParts[ 1 ] ) +
// 60 * parseFloat( timeParts[ 2 ] ) +
// parseFloat( timeParts[ 3 ] );
// }

// export function parseXMLDuration( str: string ): number
// {
// if( str === undefined || str === "NaN" ) { return undefined; }
//
// const neg: boolean = str[0] === "-";
// const duration: string = neg ? str.slice( 1 ) : str;
// const splitDuration: string[] = duration.split( "T" );
// const period: string = splitDuration[ 0 ].slice( 1 );
// const time: string = splitDuration[ 1 ];
//
// let output: number = 0;
// if( period.length > 0 ) { output += parsePeriod( period ); }
// if( time.length > 0 ) { output += parseTime( time ); }
// return neg ? -output : output;
// }



