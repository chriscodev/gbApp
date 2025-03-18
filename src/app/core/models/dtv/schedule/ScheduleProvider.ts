/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {AbstractElement, DisplayNameType, IntegerValue, UNINITIALIZED_ID} from '../../AbstractElement';
import {Schedule} from './Schedule';
import {ProcessableElementState} from '../common/ProcessableElementState';
import {AbstractCommitUpdate} from '../../CommitUpdate';
import {v4 as uuidv4} from 'uuid';

export enum ScheduleProviderType {
  TMS = 'TMS',
  PMCP = 'PMCP',
  GENERIC = 'GENERIC',
  ROVI = 'ROVI',
  TMS_DIRECT = 'TMS_DIRECT',
  PMCP_TCP = 'PMCP_TCP',
  ON_CONNECT = 'ON_CONNECT',
  ON_V3 = 'ON_V3',
  OMA_INGEST = 'OMA_INGEST'
}

export const SCHEDULE_PROVIDER_TYPES: Record<ScheduleProviderType, DisplayNameType> = {
  [ScheduleProviderType.TMS]: {displayName: 'TMS'},
  [ScheduleProviderType.PMCP]: {displayName: 'PMCP'},
  [ScheduleProviderType.GENERIC]: {displayName: 'Generic'},
  [ScheduleProviderType.ROVI]: {displayName: 'Rovi'},
  [ScheduleProviderType.TMS_DIRECT]: {displayName: 'TMS Direct'},
  [ScheduleProviderType.PMCP_TCP]: {displayName: 'PMCP TCP'},
  [ScheduleProviderType.ON_CONNECT]: {displayName: 'On Connect'},
  [ScheduleProviderType.ON_V3]: {displayName: 'On V3'},
  [ScheduleProviderType.OMA_INGEST]: {displayName: 'OMA Ingest'}
};

export enum FetchType {
  FTP = 'ftp', FTPS = 'ftps', FTPS_IMPLICIT = 'ftpsi', SFTP = 'sftp'
}

export const FETCH_TYPE: Record<FetchType, DisplayNameType> = {
  [FetchType.FTP]: {displayName: 'FTP'},
  [FetchType.FTPS]: {displayName: 'FTPS'},
  [FetchType.FTPS_IMPLICIT]: {displayName: 'FTPS Implicit'},
  [FetchType.SFTP]: {displayName: 'SFTP'}
};

export const FETCH_TYPE_PORT: Record<FetchType, IntegerValue> = {
  [FetchType.FTP]: {value: 21},
  [FetchType.FTPS]: {value: 21},
  [FetchType.FTPS_IMPLICIT]: {value: 990},
  [FetchType.SFTP]: {value: 22}
};

export enum HTTP_SCHEMES {
  HTTP = 'http', HTTPS = 'https'
}

export const HTTP_PORT: Record<HTTP_SCHEMES, IntegerValue> = {
  [HTTP_SCHEMES.HTTP]: {value: 80},
  [HTTP_SCHEMES.HTTPS]: {value: 443}
};

const DEFAULT_FETCH_TIME = '02:00';
const DEFAULT_DAYS_AHEAD = 5;
const DEFAULT_PORT = 21;


export abstract class AbstractScheduleProvider extends AbstractElement {
  protected constructor(
    public name: string, public scheduleProviderType: ScheduleProviderType, public port: number,
    public transformer: string, public daysAheadToProcess: number, public onLine: boolean,
    public schedules: Schedule[], public id?: number, public clientId?: string) {
    super(id, clientId);
  }

  // TODO why does adding shouldDeleteUnreferencedSchedules cause GB unknown prop error
  // TODO Debug why this doesn't work and need to make a public function to work
  public isFTPBased(): boolean {
    return this.scheduleProviderType === ScheduleProviderType.PMCP || this.scheduleProviderType === ScheduleProviderType.TMS ||
      this.scheduleProviderType === ScheduleProviderType.ROVI || this.scheduleProviderType === ScheduleProviderType.GENERIC ||
      this.scheduleProviderType === ScheduleProviderType.TMS_DIRECT;
  }
}

// This is a workaround for class method doesn't seem to work
export function isProviderTypeFTPBased(scheduleProviderType: ScheduleProviderType): boolean {
  return scheduleProviderType === ScheduleProviderType.PMCP || scheduleProviderType === ScheduleProviderType.TMS ||
    scheduleProviderType === ScheduleProviderType.ROVI || scheduleProviderType === ScheduleProviderType.GENERIC ||
    scheduleProviderType === ScheduleProviderType.TMS_DIRECT;
}

export function isProviderTypeFTPSettingsBased(scheduleProviderType: ScheduleProviderType): boolean {
  return scheduleProviderType === ScheduleProviderType.PMCP || scheduleProviderType === ScheduleProviderType.GENERIC ||
    scheduleProviderType === ScheduleProviderType.TMS_DIRECT;
}

export function isProviderListingsBased(scheduleProviderType: ScheduleProviderType): boolean {
  return scheduleProviderType === ScheduleProviderType.TMS || scheduleProviderType === ScheduleProviderType.ROVI;
}

export function isOnConnectScheduleProvider(scheduleProviderType: ScheduleProviderType): boolean {
  return scheduleProviderType === ScheduleProviderType.ON_CONNECT;
}

export function isOnV3ScheduleProvider(scheduleProviderType: ScheduleProviderType): boolean {
  return scheduleProviderType === ScheduleProviderType.ON_V3;
}

export abstract class AbstractFetchableScheduleProvider extends AbstractScheduleProvider {
  protected constructor(public protocol: string, public host: string, public path: string, public user: string,
                        public password: string, public updateDaily: boolean, public timeOfDay: string,
                        public intervalInMinutes: number, public rateLimit: number, public name: string,
                        public scheduleProviderType: ScheduleProviderType, public port: number,
                        public transformer: string, public daysAheadToProcess: number,
                        public onLine: boolean, public schedules: Schedule[], public id?: number,
                        public clientId?: string) {
    super(name, scheduleProviderType, port, transformer, daysAheadToProcess, onLine, schedules, id, clientId);
  }

  // TODO same as above
  public getFTPTestRequest(): FTPTestRequest {
    return new FTPTestRequest(this.protocol as FetchType, this.host, this.port, this.path, this.user,
      this.password);
  }

  // Subclasses that support TCP should override as needed
  public getTCPTestRequest(): TCPTestRequest {
    return undefined;
  }
}

export function getFTPRequestFromProvider(scheduleProvider: AbstractFetchableScheduleProvider): FTPTestRequest {
  return new FTPTestRequest(scheduleProvider.protocol as FetchType, scheduleProvider.host, scheduleProvider.port,
    scheduleProvider.path, scheduleProvider.user, scheduleProvider.password);
}

export class TMSScheduleProvider extends AbstractFetchableScheduleProvider {
  public constructor(public protocol: string, public host: string, public path: string, public user: string,
                     public password: string, public updateDaily: boolean, public timeOfDay: string,
                     public intervalInMinutes: number, public rateLimit: number, public name: string,
                     public port: number, public transformer: string, public daysAheadToProcess: number,
                     public onLine: boolean, public schedules: Schedule[], public id?: number,
                     public clientId?: string) {
    super(protocol, host, path, user, password, updateDaily, timeOfDay, intervalInMinutes, rateLimit, name,
      ScheduleProviderType.TMS, port, transformer, daysAheadToProcess, onLine, schedules, id, clientId);
  }
}

export class DefaultTMSScheduleProvider extends TMSScheduleProvider {
  public constructor(name?: string, onLine?: boolean) {
    super(FetchType.FTP, 'listings.trivenidigital.com', undefined, undefined, undefined, true, DEFAULT_FETCH_TIME,
      undefined, undefined, name, DEFAULT_PORT, undefined, DEFAULT_DAYS_AHEAD, onLine, undefined,
      UNINITIALIZED_ID, uuidv4());
  }
}

export class PMCPScheduleProvider extends AbstractFetchableScheduleProvider {
  public constructor(public protocol: string, public host: string, public path: string, public user: string,
                     public password: string, public updateDaily: boolean, public timeOfDay: string,
                     public intervalInMinutes: number, public rateLimit: number, public name: string,
                     public port: number, public transformer: string, public daysAheadToProcess: number,
                     public onLine: boolean, public scheduleCount: number, public schedules: Schedule[],
                     public id?: number, public clientId?: string) {
    super(protocol, host, path, user, password, updateDaily, timeOfDay, intervalInMinutes, rateLimit, name,
      ScheduleProviderType.PMCP, port, transformer, daysAheadToProcess, onLine, schedules, id, clientId);
  }
}

export class DefaultPMCPScheduleProvider extends PMCPScheduleProvider {
  public constructor(name?: string, onLine?: boolean) {
    super(FetchType.FTP, undefined, undefined, undefined, undefined, true, DEFAULT_FETCH_TIME, undefined,
      undefined, name, DEFAULT_PORT, undefined, DEFAULT_DAYS_AHEAD, onLine, undefined, undefined,
      UNINITIALIZED_ID, uuidv4());
  }
}

export class GenericScheduleProvider extends AbstractFetchableScheduleProvider {
  public constructor(public protocol: string, public host: string, public path: string, public user: string,
                     public password: string, public updateDaily: boolean, public timeOfDay: string,
                     public intervalInMinutes: number, public rateLimit: number, public name: string,
                     public port: number, public transformer: string, public daysAheadToProcess: number,
                     public onLine: boolean, public schedules: Schedule[], public id?: number,
                     public clientId?: string) {
    super(protocol, host, path, user, password, updateDaily, timeOfDay, intervalInMinutes, rateLimit, name,
      ScheduleProviderType.GENERIC, port, transformer, daysAheadToProcess, onLine, schedules, id, clientId);
  }
}

export class DefaultGenericScheduleProvider extends GenericScheduleProvider {
  public constructor(name?: string, onLine?: boolean) {
    super(FetchType.FTP, undefined, undefined, undefined, undefined, true, DEFAULT_FETCH_TIME, undefined,
      undefined, name, DEFAULT_PORT, undefined, DEFAULT_DAYS_AHEAD, onLine, undefined, UNINITIALIZED_ID,
      uuidv4());
  }
}

export class RoviScheduleProvider extends AbstractFetchableScheduleProvider {
  public constructor(public protocol: string, public host: string, public path: string, public user: string,
                     public password: string, public updateDaily: boolean, public timeOfDay: string,
                     public intervalInMinutes: number, public rateLimit: number, public name: string,
                     public port: number, public transformer: string, public daysAheadToProcess: number,
                     public onLine: boolean, public schedules: Schedule[], public id?: number,
                     public clientId?: string) {
    super(protocol, host, path, user, password, updateDaily, timeOfDay, intervalInMinutes, rateLimit, name,
      ScheduleProviderType.ROVI, port, transformer, daysAheadToProcess, onLine, schedules, id, clientId);
  }
}

export class DefaultRoviScheduleProvider extends RoviScheduleProvider {
  public constructor(name?: string, onLine?: boolean) {
    super(FetchType.FTP, 'listings.trivenidigital.com', undefined, undefined, undefined, true, DEFAULT_FETCH_TIME,
      undefined, undefined, name, DEFAULT_PORT, undefined, DEFAULT_DAYS_AHEAD, onLine, undefined,
      UNINITIALIZED_ID, uuidv4());
  }
}

export class TMSDirectScheduleProvider extends AbstractFetchableScheduleProvider {
  public constructor(public protocol: string, public host: string, public path: string, public user: string,
                     public password: string, public updateDaily: boolean, public timeOfDay: string,
                     public intervalInMinutes: number, public rateLimit: number, public name: string,
                     public port: number, public transformer: string, public daysAheadToProcess: number,
                     public onLine: boolean, public schedules: Schedule[], public id?: number,
                     public clientId?: string) {
    super(protocol, host, path, user, password, updateDaily, timeOfDay, intervalInMinutes, rateLimit, name,
      ScheduleProviderType.TMS_DIRECT, port, transformer, daysAheadToProcess, onLine,
      schedules, id, clientId);
  }
}

export class DefaultTMSDirectScheduleProvider extends TMSDirectScheduleProvider {
  public constructor(name?: string, onLine?: boolean) {
    super(FetchType.FTP, undefined, undefined, undefined, undefined, true, DEFAULT_FETCH_TIME, undefined,
      undefined, name, DEFAULT_PORT, undefined, DEFAULT_DAYS_AHEAD, onLine, undefined,
      UNINITIALIZED_ID, uuidv4());
  }
}

export class PMCPTCPScheduleProvider extends AbstractFetchableScheduleProvider {
  public constructor(public networkInterfaceName: string, public protocol: string, public host: string,
                     public path: string, public user: string, public password: string, public updateDaily: boolean,
                     public timeOfDay: string, public intervalInMinutes: number, public rateLimit: number,
                     public name: string, public port: number, public transformer: string,
                     public daysAheadToProcess: number, public onLine: boolean, public schedules: Schedule[],
                     public id?: number, public clientId?: string) {
    super(protocol, host, path, user, password, updateDaily, timeOfDay, intervalInMinutes, rateLimit, name,
      ScheduleProviderType.PMCP_TCP, port, transformer, daysAheadToProcess, onLine, schedules, id, clientId);
  }

  public getTCPTestRequest(): TCPTestRequest {
    return new TCPTestRequest(uuidv4(), this.id, this.networkInterfaceName, this.host, this.port);
  }
}

export function getTCPTestRequest(pmcpTcpScheduleProvider: PMCPTCPScheduleProvider): TCPTestRequest {
  return new TCPTestRequest(uuidv4(), pmcpTcpScheduleProvider.id, pmcpTcpScheduleProvider.networkInterfaceName,
    pmcpTcpScheduleProvider.host, pmcpTcpScheduleProvider.port);
}

export class DefaultPMCPTCPScheduleProvider extends PMCPTCPScheduleProvider {
  public constructor(name?: string, onLine?: boolean) {
    super(undefined, FetchType.FTP, undefined, undefined, undefined, undefined, true, DEFAULT_FETCH_TIME,
      undefined, undefined, name, 3820, undefined, DEFAULT_DAYS_AHEAD, onLine, undefined,
      UNINITIALIZED_ID, uuidv4());
  }
}

export const onConnectUrlPrefix = '/v1.1/lineups?country=USA&postalCode=08540&api_key=';
export const onV3UrlPrefix = '/v3/Sources?updateId=0&limit=1&api_key=';

export class OnConnectScheduleProvider extends AbstractFetchableScheduleProvider {
  public constructor(public apiKey: string, public protocol: string, public host: string, public path: string,
                     public user: string, public password: string, public updateDaily: boolean,
                     public timeOfDay: string, public intervalInMinutes: number, public rateLimit: number,
                     public name: string, public port: number, public transformer: string,
                     public daysAheadToProcess: number, public onLine: boolean, public schedules: Schedule[],
                     public id?: number, public clientId?: string) {
    super(protocol, host, path, user, password, updateDaily, timeOfDay, intervalInMinutes, rateLimit, name,
      ScheduleProviderType.ON_CONNECT, port, transformer, daysAheadToProcess, onLine, schedules, id, clientId);
  }
}

// Note - below three functions cannot be class functions without custom deserialization
export function getOnConnectHTTPRequest(onConnectScheduleProvider: OnConnectScheduleProvider): HTTPTestRequest {
  return new HTTPTestRequest(new Date().getTime(), getOnConnectHTTPString(onConnectScheduleProvider));
}

export function getOnConnectSearchRequest(onConnectScheduleProvider: OnConnectScheduleProvider,
                                          queryString: string): OnConnectSearchRequest {
  return new OnConnectSearchRequest(new Date().getTime(), onConnectScheduleProvider.protocol,
    onConnectScheduleProvider.host, onConnectScheduleProvider.port, onConnectScheduleProvider.apiKey,
    queryString);
}

function getOnConnectHTTPString(onConnectScheduleProvider: OnConnectScheduleProvider): string {
  return onConnectScheduleProvider.protocol + '://' + onConnectScheduleProvider.host + ':' +
    onConnectScheduleProvider.port + onConnectUrlPrefix + onConnectScheduleProvider.apiKey;
}

export class DefaultOnConnectScheduleProvider extends OnConnectScheduleProvider {
  public constructor(name?: string, onLine?: boolean) {
    super(undefined, HTTP_SCHEMES.HTTPS, 'data.tmsapi.com', undefined, undefined, undefined, true,
      DEFAULT_FETCH_TIME, undefined, undefined, name, 443, undefined, DEFAULT_DAYS_AHEAD, onLine,
      undefined, UNINITIALIZED_ID, uuidv4());
  }
}

export class OnV3ScheduleProvider extends AbstractFetchableScheduleProvider {
  public constructor(public apiKey: string, public protocol: string, public host: string, public path: string,
                     public user: string, public password: string, public updateDaily: boolean,
                     public timeOfDay: string, public intervalInMinutes: number, public rateLimit: number,
                     public name: string, public port: number, public transformer: string,
                     public daysAheadToProcess: number, public onLine: boolean, public schedules: Schedule[],
                     public id?: number, public clientId?: string) {
    super(protocol, host, path, user, password, updateDaily, timeOfDay, intervalInMinutes, rateLimit, name,
      ScheduleProviderType.ON_V3, port, transformer, daysAheadToProcess, onLine,
      schedules, id, clientId);
  }
}

export function getOnV3HTTPRequest(onV3ScheduleProvider: OnV3ScheduleProvider): HTTPTestRequest {
  return new HTTPTestRequest(new Date().getTime(), getOnV3HTTPString(onV3ScheduleProvider));
}

function getOnV3HTTPString(onV3ScheduleProvider: OnV3ScheduleProvider): string {
  return onV3ScheduleProvider.protocol + '://' + onV3ScheduleProvider.host + ':' +
    onV3ScheduleProvider.port + onV3UrlPrefix + onV3ScheduleProvider.apiKey;
}

export class DefaultOnV3CScheduleProvider extends OnV3ScheduleProvider {
  public constructor(name?: string, onLine?: boolean) {
    super(undefined, HTTP_SCHEMES.HTTPS, 'on-api.gracenote.com', undefined, undefined, undefined, true, DEFAULT_FETCH_TIME,
      undefined, undefined, name, 443, undefined, DEFAULT_DAYS_AHEAD, onLine, undefined,
      UNINITIALIZED_ID, uuidv4());
  }
}

export enum OMAESGType {
  ATSC_3 = 'ATSC_3', ATSC_3_KR = 'ATSC_3_KR', OMA_BCAST = 'OMA_BCAST'
}

export class OMAESGTypeWithDisplayName {
  readonly omaEsgType: OMAESGType;
  readonly displayName: string;
}

export const OMAESG_TYPES: OMAESGTypeWithDisplayName[] = [
  {omaEsgType: OMAESGType.ATSC_3, displayName: 'ATSC 3.0'},
  {omaEsgType: OMAESGType.ATSC_3_KR, displayName: 'ATSC 3.0 Korea'},
  {omaEsgType: OMAESGType.OMA_BCAST, displayName: 'OMA BCAST ESG'}
];

export class OMAESGScheduleProvider extends AbstractFetchableScheduleProvider {
  public constructor(public omaEsgType: OMAESGType, public protocol: string,
                     public host: string, public path: string, public user: string,
                     public password: string, public updateDaily: boolean, public timeOfDay: string,
                     public intervalInMinutes: number, public rateLimit: number, public name: string,
                     public port: number, public transformer: string, public daysAheadToProcess: number,
                     public onLine: boolean, public schedules: Schedule[], public id?: number,
                     public clientId?: string) {
    super(protocol, host, path, user, password, updateDaily, timeOfDay, intervalInMinutes, rateLimit, name,
      ScheduleProviderType.OMA_INGEST, port, transformer, daysAheadToProcess, onLine,
      schedules, id, clientId);
  }
}

export class ScheduleSummary {
  public constructor(public scheduleName: string, public scheduleId: number, public scheduleProviderName: string,
                     public scheduleProviderId: number, public scheduleProviderType: ScheduleProviderType,
                     public id?: number) {
  }
}

export class ScheduleTitle {
  public constructor(public id: number, public name: string) {
  }
}

export class ScheduleView {
  public constructor(public name: string, public scheduleProviderType: ScheduleProviderType,
                     public scheduleProviderState: ProcessableElementState, public lastUpdateTime: string,
                     public lastCompletion: string, public lastUpdateMessage: string,
                     public scheduleTitles: ScheduleTitle[]) {
  }
}

export class DefaultScheduleView extends ScheduleView {
  public constructor() {
    super(undefined, undefined, undefined, undefined,
      undefined, undefined, []);
  }
}

export class ScheduleProviderStatus {
  public constructor(public scheduleProviderId: number, public scheduleProviderState: ProcessableElementState,
                     public lastUpdateTime: string, public lastCompletion: string, public lastUpdateMessage: string) {
  }
}

export class FTPTestRequest {
  public constructor(public protocol: FetchType, public host: string, public port: number, public path: string,
                     public username: string, public password: string) {
  }
}

export class FileDescriptor {
  public constructor(public fileName: string, public fileSize: number, public lastModified: string) {
  }
}

export class HTTPTestRequest {
  public constructor(public requestId: number, public uri: string, public user?: string, public password?: string) {
  }
}

export class HTTPTestResponse {
  public constructor(public requestId: number, public successful: boolean, public responseCode: number,
                     public message: string) {
  }
}

export class FTPTestResponse {
  public constructor(public requestId: number, public successful: boolean, public errorMessage: string,
                     public ftpFiles: FileDescriptor[]) {
  }
}

export class TCPTestRequest {
  public constructor(public requestId: number, public providerId: number, public interfaceName: string,
                     public address: string, public port: number) {
  }
}

export class TCPTestResponse {
  public constructor(public requestId: number, public successful: boolean, public message: string) {
  }
}

export class OnConnectSearchRequest {
  public constructor(public requestId: number, public scheme: string, public host: string, public port: number,
                     public apiKey: string, public query: string) {
  }
}

export class OnConnectSearchResponse {
  public constructor(public requestId: number, public successful: boolean, public errorMessage: string,
                     public schedules: Schedule[]) {
  }
}

export class RemoteFileResource {
  public constructor(public name: string, public downloadRelativePath: string, public lastModified: string,
                     public length: number, public id?: number) {
  }
}

export class ScheduleProvidersUpdate extends AbstractCommitUpdate<AbstractScheduleProvider> {
  public constructor(public added: AbstractScheduleProvider[], public updated: AbstractScheduleProvider[],
                     public deleted: number[]) {
    super(added, updated, deleted);
  }
}

export class TranslatedScheduleProvider {
  public constructor(public id: number, public urlLink: string) {
  }
}
