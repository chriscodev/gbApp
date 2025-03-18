// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.

import * as moment from 'moment-timezone';
import * as _swal from 'sweetalert';
import {SweetAlert} from 'sweetalert/typings/core';
import {ElementaryStreamTypeArray} from './transportTypes';
import {FeatureType} from '../../core/models/server/License';
import {TRANSPORT_TYPES, TransportType} from '../../core/models/dtv/network/physical/Transport';
import {isDefined} from '../../core/models/dtv/utils/Utils';

const swal: SweetAlert = _swal as any;
declare var $;

type unit = 'bytes' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB';
type unitPrecisionMap = {
  [u in unit]: number;
};

const defaultPrecisionMap: unitPrecisionMap = {
  bytes: 0,
  KB: 0,
  MB: 1,
  GB: 1,
  TB: 2,
  PB: 2
};

/**
 * this function displays sweelalert and redirects to loginpage
 * @param messageAlert when display message on sweet alert
 */
export function swalErrorLogoutFunction(messageAlert: string) {
  swal('', messageAlert, 'success').then((isConfirm) => {
    if (isConfirm) {
      $('.swal-overlay').remove();
      $('.fixed-layout').removeAttr('style');
      swal({
        title: 'Lost connection',
        text: 'Waiting for GuideBuilderOne to restart',
      });
      setTimeout(() => {
        if (localStorage.getItem('errPing') !== 'true') {
          localStorage.clear();
          sessionStorage.clear();
          const reinstatedURL = window.location.origin + '/gbApp/';
          setTimeout(() => {
            window.location.href = reinstatedURL;
          }, 100);
        }
      }, 100);
    }
  });
}

export function errorLogoutFunction(timeout: number) {
  setTimeout(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = window.location.origin + '/gbApp/';
  }, timeout);
}

export function getSoftwareVersionAppData() {
  return JSON.parse(localStorage.getItem('versionInfo'));
}

/***
 * Parameter to be passed
 * mode:type of action- add, edit, delete (optional),
 * tableData: Data array
 * inputValue: data everytime user inputs
 * exist: if user
 */
export function isNameExist(mode, inputValue, exist) {

  const objReturn = {
    nameExisting: false,
    iconText: '',
    icon: false,
  };


  let isExist = exist;
  // const dataNameExst = GlobalVariables.globalNameExst;
  // const dataArray = GlobalVariables.globalNameArray;
  const dataNameExst = '';
  const dataArray = [];
  const dataName = dataArray?.find(
    (obj) => obj.name === inputValue
  );


  if (mode === 'add' || !mode) {
    if (!dataName) {
      isExist = false;
      objReturn.nameExisting = false;
      objReturn.icon = false;
    } else {
      isExist = true;
      objReturn.nameExisting = true;
      objReturn.icon = true;
    }
  } else if (mode === 'edit') {


    if (!dataName && dataNameExst !== inputValue) {
      isExist = false;
      objReturn.nameExisting = false;
      objReturn.icon = false;
    } else {
      isExist = true;
      objReturn.nameExisting = true;
      objReturn.icon = true;
      if (dataNameExst === inputValue) {
        isExist = false;
        objReturn.nameExisting = false;
        objReturn.icon = false;
      }
    }
  }

  objReturn.iconText = iconCheck(isExist, inputValue);

  return objReturn;
}

/**change color check icon
 * if no input,set to grey.
 * if user exists, set to red.
 * if user does not exist, set to green
 */
export function iconCheck(exist, name) {
  let icon = '';
  if (exist === false && name === '') {
    icon = '';
  } else if (exist === true && name !== '') {
    icon = 'text-danger';
  } else if (exist === false && name !== '') {
    icon = 'text-success';
  }
  return icon;
}

/**
 *
 * @param datetime Input datetime
 * @returns return formatted datetime
 */
export function changeDateTimeFormat(datetime) {
  if (datetime) {
    const timeZoneString = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const isManilaTimezone = timeZoneString === 'Asia/Manila';
    // Set the timezone to SGT if it's 'Asia/Manila', otherwise use the original timezone
    // this is a temp fix to follow the client app output, some abbr are depreciated in momentjs
    const convertedTimezone = isManilaTimezone ? 'Asia/Singapore' : timeZoneString;
    return moment(datetime)
      .tz(convertedTimezone)
      .format(`hh:mm:ss A DDMMMYYYY ${convertedTimezone === 'Asia/Singapore' ? '[SGT]' : 'zz'}`);
  }
}

/**
 *
 * @param datetime Input datetime
 * @returns return formatted datetime
 */
export function changeDateFormat(datetime) {
  if (datetime) {
    const timeZoneString = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return moment(datetime)
      .tz(timeZoneString)
      .format('MM/DD/YYYY, hh:mm:ss A');
  }
}

/**
 *
 * @param time Input time
 * @returns return formatted time
 */
export function convertTimeStandard(time) {
  const d = new Date(time);
  const timeString = dateFormat(d, '%m/%d/%Y ', true);
  return timeString + formatAMPM(d);
}

/**
 *
 * @param date input data for date
 * @returns format am pm
 * formats inputtted date to date
 */
function formatAMPM(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  const strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

/***
 * date formattter
 */
export function dateFormat(date, fstr, utc) {
  utc = utc ? 'getUTC' : 'get';
  return fstr?.replace(/%[YmdHMS]/g, (m) => {
    switch (m) {
      case '%Y':
        return date[utc + 'FullYear'](); // no leading zeros required
      case '%m':
        m = 1 + date[utc + 'Month']();
        break;
      case '%d':
        m = date[utc + 'Date']();
        break;
      case '%H':
        m = date[utc + 'Hours']();
        break;
      case '%M':
        m = date[utc + 'Minutes']();
        break;
      case '%S':
        m = date[utc + 'Seconds']();
        break;
      default:
        return m?.slice(1); // unknown code, remove %
    }
    // add leading zero if required
    return ('0' + m)?.slice(-2);
  });
}

/***
 * time convert to hours and minutes
 */
export function timeSecondsConvert(num) {
  let dataConvert = '';
  const uptimeInSeconds = num;
  const upDays = uptimeInSeconds / 86400;
  let upminutes = uptimeInSeconds / 60;
  let uphours = upminutes / 60;
  uphours = uphours % 24;
  upminutes = upminutes % 60;
  if (upDays > 0) {
    dataConvert = upDays + ' day' + (upDays !== 1 ? 's ' : ' ');
  }
  if (uphours > 0) {
    if (upminutes === 0) {
      dataConvert = uphours + ' Hour(s)';
    } else {
      if (uphours < 1) {
        dataConvert = upminutes + ' minute(s)';
      } else {
        uphours = Math.floor(uphours);
        dataConvert = uphours + ' Hour(s) ' + upminutes + ' minute(s)';
      }
    }
  } else {
    dataConvert = upminutes + ' minute(s)';
  }
  return dataConvert;
}

export function convertTransportType(data: string) {
  const transTypes = [
    {name: 'PSIP-Terrestrial', code: 'ATSC_PSIP_TERRESTRIAL'},
    {name: 'PSIP-Cable', code: 'ATSC_PSIP_CABLE'},
    {name: 'DVB-SI', code: 'DVB_SI'},
    {name: 'ATSC-MH', code: 'ATSC_MH'},
    {name: 'SCTE-65', code: 'SCTE_65'},
    {name: 'ATSC-3.0', code: 'ATSC_3'},
  ];

  const result = transTypes?.find((item) => {
    return item.code === data || item.name === data;
  });

  return result?.name;
}

export function convertBytes(bytes: number = 0, precision: number | unitPrecisionMap = 1): string {
  const units: unit[] = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  if (isNaN(parseFloat(String(bytes))) || !isFinite(bytes)) {
    return '?';
  }

  let unitIndex = 0;

  while (bytes >= 1024) {
    bytes /= 1024;
    unitIndex++;
  }

  const unit = units[unitIndex];

  if (typeof precision === 'number') {
    return `${bytes.toFixed(+precision)} ${unit}`;
  }
  return `${bytes.toFixed(precision[unit])} ${unit}`;
}

export function convertBytesToSpeed(bytes: number, unit: string = 'B'): string {
  const units: [string, number][] = [
    ['bps', 1],
    ['Kbps', 1000],
    ['Mbps', 1000000],
    ['Gbps', 1000000000],
    ['Tbps', 1000000000000],
    ['Pbps', 1000000000000000]
  ];

  // Handle optional unit parameter
  const unitIndex = ['B', 'K', 'M', 'G', 'T', 'P'].indexOf(unit.toUpperCase());

  if (unitIndex !== -1) {
    const divisor = units[unitIndex][1];

    for (let i = units.length - 1; i >= 0; i--) {
      const [unit, unitDivisor] = units[i];
      if (bytes >= unitDivisor / divisor) {
        const speed = bytes / (unitDivisor / divisor);
        return speed.toFixed(1) + ' ' + unit;
      }
    }
  }

  // Original logic
  for (let i = units.length - 1; i >= 0; i--) {
    const [unit, divisor] = units[i];
    if (bytes >= divisor) {
      const speed = bytes / divisor;
      return speed.toFixed(1) + ' ' + unit;
    }
  }

  return bytes.toFixed(1) + ' bps';
}

export function numberOnly(event: any) {
  // const pattern = /[0-9\+\-\ ]/;
  const pattern = /^[+]?\d+([.]\d+)?$/;
  const inputChar = String.fromCharCode(event.charCode);
  if (event.keyCode !== 8 && !pattern.test(inputChar)) {
    event.preventDefault();
  }
}

export function numbersListOnly(event: any) {
  const pattern = /^[0-9 ]*$/;
  const inputChar = String.fromCharCode(event.charCode);

  // Allow control keys such as backspace, delete, arrow keys, etc.
  if (event.keyCode !== 8 && event.keyCode !== 46 && event.keyCode !== 37 && event.keyCode !== 39 && !pattern.test(
    inputChar)) {
    event.preventDefault();
  }
}

export function formatOutputState(data: string): string {
  const outputState = data?.split('_')[1]?.toLowerCase();
  return outputState?.charAt(0)?.toUpperCase() + outputState?.slice(1);
}

// ELEM STREAM STYPE
export function convertElemStreamTypeToCode(ElementaryStreamType) {
  const elemType = ElementaryStreamTypeArray;
  const result = elemType?.find((item) => {
    return item.name === ElementaryStreamType || item.shortName === ElementaryStreamType;
  });

  if (result !== undefined) {
    return result.code;
  } else {
    return ElementaryStreamType;
  }
}

export function convertCodeToElemStreamName(elemCode) {
  const elemType = ElementaryStreamTypeArray;
  const result = elemType?.find((item) => {
    return item.code === elemCode;
  });

  if (result === undefined) {
    const result2 = elemType?.find((item) => {
      return item.name === elemCode;
    });

    return result2;
  } else {
    return result;
  }
}

export function formatBytes(bytes, decimals = 0) {
  if (bytes <= 0 || isNaN(bytes)) {
    return '0';
  }
  const k = 1024;
  const dm = decimals + 1;
  const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
  return `${value} ${sizes[i]}`;
}

export function revertTransportTypeName(type) {
  const transTypes: FeatureType[] = [];
  const arrTypes = [];
  // tslint:disable-next-line:forin
  for (const key in TransportType) {
    arrTypes.push(TransportType[key]);
  }
  const licensedTransportTypes: TransportType[] = arrTypes;
  licensedTransportTypes.forEach(transportType => {
    if (isDefined(TRANSPORT_TYPES[transportType])) {
      transTypes.push(new FeatureType(transportType,
        TRANSPORT_TYPES[transportType].displayName));
    }
  });
  let transType;
  let retValue;
  transType = transTypes.find(function(obj) {
    return obj.id === type;
  });

  if (transType === undefined) {
    retValue = type;
  } else {
    retValue = transType.displayName;
  }
  return retValue;
}

export function deleteSelectedRows(parentList, localList, physicalList, callback = null, hasTag = false) {
  if (!hasTag) {
    const len = physicalList.selectedRowIds.length;
    for (let i = 0; i < len; i++) {
      const selectID = physicalList.selectedRowIds[i];
      localList = localList.filter((data) => {
        const idMatch = data.id.toString() !== selectID.toString();
        const clientIdMatch = data.clientId !== selectID.toString();
        return idMatch && clientIdMatch;
      });
    }
  } else {
    physicalList.selectedRows.forEach(selectedRow => {
      const selectedID = selectedRow.hasOwnProperty('descId') ? selectedRow.descId : selectedRow.descClientId;
      localList = localList.filter((data) => {
        const idMatch = data.id.toString() !== selectedID.toString();
        const clientIdMatch = data.clientId !== selectedID.toString();
        const tagMatch = data.tag.toString() !== selectedRow.tag.toString();
        return (idMatch && clientIdMatch) || tagMatch;
      });
    });
  }
  parentList = localList;
  callback(parentList, localList);
}

export function pmtDefaultValue(programNumber: number): number {
  const PROGRAM_PID_OFFSET = 0x20;
  return (programNumber * 16) + PROGRAM_PID_OFFSET;
}

export function pcrDefaultValue(programNumber: number): number {
  const PROGRAM_PID_OFFSET = 0x20;
  return (programNumber * 16) + PROGRAM_PID_OFFSET + 1;
}

export function updateSchemeBasedOnPort(jsonObject: any) {
  const portSchemeMapping = {
    443: 'https',
    80: 'http',
    8000: 'http'
  };
  // Update the scheme property using the mapping or fallback to 'http'
  jsonObject.scheme = portSchemeMapping[jsonObject.port] || 'http';
  return jsonObject;
}

