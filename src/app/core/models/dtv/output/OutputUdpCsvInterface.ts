// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {OutputType} from './Output';

export interface TransportUdpCsvData {
  tsid: string;
  tsname: string;
  ipAddress: string;
  port: string;
}

export interface UdpRouteData {
  name: string;
  tsid: string;
  transportId: number;
  address: string;
  port: string;
  clientTransportId: string;
}

export interface UdpSettings {
  outputType: string;
  routes: number;
  nic: string;
  ttl: number;
  maxBitrate: number;
}

export class UdpDefaultSettings {
  outputType: string = OutputType.UDP;
  routes = 0;
  nic = '';
  ttl = 32;
  maxBitrate = 0;
}

export class DefaultTransportUdpCsvData {
  tsid = '';
  tsname = '';
  ipAddress = '';
  port = '';
}

export class DefaultUdpRouteData {
  name = '';
  tsid = '';
  transportId = 0;
  address = '';
  port = '';
  clientTransportId = undefined;
}





