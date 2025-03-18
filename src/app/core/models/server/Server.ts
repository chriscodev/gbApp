// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.

import {convertBytes} from '../../../shared/helpers/appWideFunctions';
import {DisplayNameType} from '../AbstractElement';

export enum OSType {
  FREE_BSD = 'FREE_BSD', LINUX = 'LINUX', MAC = 'MAC', SUN_OS = 'SUN_OS', UNKNOWN = 'UNKNOWN', WINDOWS = 'WINDOWS'
}

export enum InitLevel {
  LEVEL3 = 'LEVEL3', LEVEL2 = 'LEVEL2', LEVEL1 = 'LEVEL1', LEVEL0 = 'LEVEL0'
}

export const INIT_LEVELS: Record<InitLevel, DisplayNameType> = {
  [InitLevel.LEVEL3]: {displayName: 'Active Mode'},
  [InitLevel.LEVEL2]: {displayName: 'Redundant Mode'},
  [InitLevel.LEVEL1]: {displayName: 'Passive Mode'},
  [InitLevel.LEVEL0]: {displayName: 'Maintenance Mode'}
};

export enum RAIDState {
  ACTIVE = 'ACTIVE', DEGRADED = 'DEGRADED', RECOVERING = 'RECOVERING', FAILED = 'FAILED', UNKNOWN = 'UNKNOWN'
}

export enum PowerSupplyState {
  UNAVAILABLE = 'UNAVAILABLE', REDUNDANT = 'REDUNDANT', DEGRADED = 'DEGRADED'
}

export interface PowerSupplyStateWithDisplayName {
  readonly powerSupplyState: PowerSupplyState;
  readonly displayName: string;
}

export const POWER_SUPPLY_STATES: Record<PowerSupplyState, DisplayNameType> = {
  [PowerSupplyState.UNAVAILABLE]: {displayName: 'Unavailable'},
  [PowerSupplyState.REDUNDANT]: {displayName: 'Redundant'},
  [PowerSupplyState.DEGRADED]: {displayName: 'Degraded'}
};

export enum NICState {
  UP = 'UP', DOWN = 'DOWN', UNKNOWN = 'UNKNOWN'
}

export class NIC {
  public constructor(public interfaceName: string, public ipAddress: string, public broadcastAddress: string,
                     public netmask: string, public gateway: string, public state: NICState,
                     public macAddress: string, public displayName: string, public speed: number,
                     public transmittedBytes: number, public transmittedPackets: number, public receivedBytes: number,
                     public receivedPackets: number, public receivedErrors: number, public transmittedErrors: number,
                     public mtu: number, public index: number) {
  }
}

export class DiskPartition {
  public constructor(public fileSystem: string, public partitionSize: string, public amountUsed: string,
                     public amountAvailable: string, public percentUsed: string, public mountedOn: string) {
  }
}

export class ServerInfo {
  public constructor(public hostName: string, public httpPort: number, public version: string,
                     public serialNumber: string, public manufacturer: string, public platform: string,
                     public os: string, public osType: OSType, public processorName: string,
                     public processorSpeed: string, public processorCount: number, public coreCount: number,
                     public totalMemory: string, public maxHeap: number, public initLevel: InitLevel) {
  }
}

export class DefaultServerInfo extends ServerInfo {
  public constructor() {
    super('', 0, '', '', '', '', '', OSType.UNKNOWN, '',
      '', 0, 0, '', 0, InitLevel.LEVEL0);
  }
}

export class ServerStatus {
  public constructor(public dateTime: string, public systemUptime: string, public serverUptime: string,
                     public networkInterfaces: NIC[], public asiTransmitCardIds: number[], public loadAverage: string,
                     public freeMemory: string, public freeHeap: number, public diskUsageStats: string,
                     public diskPartitions: DiskPartition[], public dongleId: string, public dongleAttached: boolean,
                     public commPorts: string[], public raidState: RAIDState,
                     public powerSupplyState: PowerSupplyState,
                     public runtimeLogsZipLastUpdated: string) {
  }
}

export class SoftwareVersionInfo {
  public constructor(public currentVersion: string, public buildDate: string, public entitledVersion: string) {
  }
}

export class DebianPackage {
  public constructor(public name: string, public version: string, public status: string, public summary: string) {
  }
}

export enum RestartServerMode {
  ACTIVE_MODE = 'ACTIVE_MODE',
  PASSIVE_MODE = 'PASSIVE_MODE',
  MAINTENANCE_MODE = 'MAINTENANCE_MODE',
  REDUNDANCY_MODE = 'REDUNDANCY_MODE'
}

export const RESTART_SERVER_MODES: Record<RestartServerMode, DisplayNameType> = {
  [RestartServerMode.ACTIVE_MODE]: {displayName: 'Active Mode'},
  [RestartServerMode.PASSIVE_MODE]: {displayName: 'Passive Mode'},
  [RestartServerMode.MAINTENANCE_MODE]: {displayName: 'Maintenance Mode'},
  [RestartServerMode.REDUNDANCY_MODE]: {displayName: 'Redundant Mode'}
};

export const PRIMARY_SERVER_RESTART_MODES: RestartServerMode[] = [
  RestartServerMode.ACTIVE_MODE, RestartServerMode.PASSIVE_MODE, RestartServerMode.MAINTENANCE_MODE
];

export const REDUNDANT_ENABLED_SERVER_RESTART_MODES: RestartServerMode[] = [
  RestartServerMode.REDUNDANCY_MODE
];

export const REDUNDANT_DISABLED_SERVER_RESTART_MODES: RestartServerMode[] = [
  RestartServerMode.ACTIVE_MODE, RestartServerMode.PASSIVE_MODE
];

export class RestartOptionsRequest {
  public constructor(public purgeInstallation: boolean, public clearDatabase: boolean, public removeLicense: boolean,
                     public rebootWhenComplete: boolean, public restartServerMode: RestartServerMode) {
  }
}

export class DefaultRestartOptionsRequest extends RestartOptionsRequest {
  public constructor() {
    super(false, false, false, false, RestartServerMode.ACTIVE_MODE);
  }
}

export enum ServerResourceType {
  ESG_PREVIEW_FRAGMENTS = 'ESG_PREVIEW_FRAGMENTS', TS_SPOOL = 'TS_SPOOL', XSLT = 'XSLT'
}

export type ResourceDetails = {
  rootDirectoryName: string
};
export const SERVER_RESOURCE_TYPES: Record<ServerResourceType, ResourceDetails> = {
  [ServerResourceType.ESG_PREVIEW_FRAGMENTS]: {rootDirectoryName: 'esgPreview'},
  [ServerResourceType.TS_SPOOL]: {rootDirectoryName: 'tsSpool'},
  [ServerResourceType.XSLT]: {rootDirectoryName: 'XSLT'}
};

export class FileNode {
  public constructor(public id: number, public name: string, public downloadRelativePath: string,
                     public lastModified: Date, public length: number, public formattedSize?: string,
                     public localeLastModified?: string) {
    this.formattedSize = convertBytes(this.length);
    this.localeLastModified = new Date(this.lastModified).toLocaleString();
  }
}

export type ResourceMap = Map<string, FileNode[]>;

export class KeyValuePair {
  public constructor(public key: string, public value: string) {
  }
}
