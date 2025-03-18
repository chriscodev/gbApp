/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */


export interface TableTransportData {
  title: string;
  name: string;
  tableDomain: string;
  tableTypeId: number;
  tableTypeIdHex: string;
  pid: number;
  pidHex: string;
  size: number;
  version: string;
  intervalInMillis: string;
  transmitPriority: number;
  lastEncoded: string | null;
  transportId: number;
}

export interface TransportStatusData{
  title: string;
  lastEncodeStartTime: string | null;
  lastEncodeEndTime: string | null;
  transport: {
    name: string;
    transportType: string;
    tsid: number;
    tsidHex: string;
    id: number;
  };
}



export interface TableHexRow {
  offsetHeader: string;
  hex: string;
  ascii: string;
}

export interface TableData {
  data: {
    active: boolean,
    name: string,
    type: string,
    intervalInMillis: string,
    lastEncoded: string,
    pid: number,
    size: number,
    tableDomain: number,
    tableTypeId: number,
    transmitPriority: number,
    version: number,
    transportId: number
  };
}

export interface StreamData {
  data: {
    active: boolean,
    name: string,
    type: string,
    transportType: string,
    tsid: number,
    id: number,
    lastEncodeStartTime: string,
    lastEncodeEndTime: string,
  };
  children?: TableData[];
}
