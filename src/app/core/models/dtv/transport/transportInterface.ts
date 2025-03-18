/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

export class CsvDataRecord {
  public name: string;
  public tsid: string;
  public tsname: string;
  public tstype: string;
  public transportType: string;
  public pn: string;
  public pmtpid: string;
  public pcrpid: string;
  public espid: string;
  public st: string;
  public programs?: ProgramData[];
}

// tslint:disable-next-line:class-name
export interface transType{
  name: string;
  code: string;
}


// New Interfaces

export interface CsvData {
  name?: string;
  tsid: string;
  tsname: string;
  tstype: string;
  transportType: string;
  pn?: string;
  pmtpid: string;
  pcrpid: string;
  espid: string;
  st: string;
  programs?: ProgramData[];
}

export interface ImportCSVData {
  tsid: string;
  tsname: string;
  name: string;
  tstype: string;
  selectedType: string;
  transportType: string;
  programs?: ProgramData[];
  pn?: string;
}

export interface ProgramData {
  number: string;
  pmtPid: string;
  pcrPid: string;
  id: number;
  clientId: string;
  programNumber: number;
  elementaryStreams?: StreamElem[];
}

export interface StreamElem {
  pid: string;
  streamType: string;
  id: number;
  clientId: string;
  audioServiceType?: string;
  priority?: string;
  audioId?: number;
  mainServiceId?: number;
  associatedServiceId?: number;
  sampleRate?: string;
  surroundMode?: string;
  fullService?: boolean;
  description?: string;
  language?: {
    readable: string;
    iso2Code: string;
    iso3Code: string;
  };
  exactBitRate?: boolean;
  bitRate?: string;
  audioCoding?: string;
  useNumberOfChannels?: boolean;
  numberOfChannels?: number;
}
