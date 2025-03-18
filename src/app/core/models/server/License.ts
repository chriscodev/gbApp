// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {OutputType} from '../dtv/output/Output';
import {ScheduleProviderType} from '../dtv/schedule/ScheduleProvider';
import {DisplayNameType} from '../AbstractElement';

export enum LicenseType {
  LEGACY = 'LEGACY', SOFTWARE_KEY = 'SOFTWARE_KEY'
}

export enum NodeLockType {
  MAC_ADDRESS = 'MAC_ADDRESS',
  DONGLE_KEY = 'DONGLE_KEY',
  MACHINE_FINGER_PRINT = 'MACHINE_FINGER_PRINT',
  CLOUD_CONTROLLED_FLOATING_LICENSE = 'CLOUD_CONTROLLED_FLOATING_LICENSE'
}

export const NODE_LOCK_TYPES: Record<NodeLockType, DisplayNameType> = {
  [NodeLockType.MAC_ADDRESS]: {displayName: 'MAC Address'},
  [NodeLockType.DONGLE_KEY]: {displayName: 'Dongle Key'},
  [NodeLockType.MACHINE_FINGER_PRINT]: {displayName: 'Computer Node Lock'},
  [NodeLockType.CLOUD_CONTROLLED_FLOATING_LICENSE]: {displayName: 'Cloud-Controlled Floating'}
};

export enum NodeLockState {
  NEW_LICENSE_REQUIRED = 'NEW_LICENSE_REQUIRED',
  VALID_MAC_ADDRESS = 'VALID_MAC_ADDRESS',
  INVALID_MAC_ADDRESS = 'INVALID_MAC_ADDRESS',
  VALID_MACHINE_THUMB_PRINT = 'VALID_MACHINE_THUMB_PRINT',
  INVALID_MACHINE_THUMB_PRINT = 'INVALID_MACHINE_THUMB_PRINT',
  VALID_DONGLE_KEY = 'VALID_DONGLE_KEY',
  INVALID_DONGLE_KEY = 'INVALID_DONGLE_KEY',
  MISSING_DONGLE_KEY = 'MISSING_DONGLE_KEY',
  VALID_CLOUD_NETWORK_LICENSE = 'VALID_CLOUD_NETWORK_LICENSE',
  GRACE_PERIOD_CLOUD_NETWORK_LICENSE = 'GRACE_PERIOD_CLOUD_NETWORK_LICENSE',
  GRACE_PERIOD_CLOUD_NETWORK_LICENSE_EXPIRED = 'GRACE_PERIOD_CLOUD_NETWORK_LICENSE_EXPIRED',
  INVALID_CLOUD_NETWORK_LICENSE = 'INVALID_CLOUD_NETWORK_LICENSE',
  NO_LICENSE = 'NO_LICENSE'
}

export const NODE_LOCK_STATES: Record<NodeLockState, DisplayNameType> = {
  [NodeLockState.NEW_LICENSE_REQUIRED]: {displayName: 'New License Required'},
  [NodeLockState.VALID_MAC_ADDRESS]: {displayName: 'Invalid MAC Address'},
  [NodeLockState.INVALID_MAC_ADDRESS]: {displayName: 'Invalid MAC Address'},
  [NodeLockState.VALID_MACHINE_THUMB_PRINT]: {displayName: 'Valid Machine Thumb Print'},
  [NodeLockState.INVALID_MACHINE_THUMB_PRINT]: {displayName: 'Invalid Machine Thumb Print'},
  [NodeLockState.VALID_DONGLE_KEY]: {displayName: 'Valid Dongle Key'},
  [NodeLockState.INVALID_DONGLE_KEY]: {displayName: 'Invalid Dongle Key'},
  [NodeLockState.MISSING_DONGLE_KEY]: {displayName: 'Missing Dongle Key'},
  [NodeLockState.VALID_CLOUD_NETWORK_LICENSE]: {displayName: 'Valid Network License'},
  [NodeLockState.GRACE_PERIOD_CLOUD_NETWORK_LICENSE]: {displayName: 'Grace Period Network License'},
  [NodeLockState.GRACE_PERIOD_CLOUD_NETWORK_LICENSE_EXPIRED]: {displayName: 'Grace Period Network License Expired'},
  [NodeLockState.INVALID_CLOUD_NETWORK_LICENSE]: {displayName: 'Invalid Network License'},
  [NodeLockState.NO_LICENSE]: {displayName: 'No License Detected'}
};

// TODO Fix this enum on Server so can just use NetworkType
export enum LicensedNetworkType {
  PSIP = 'PSIP',
  CABLE_PSIP = 'CABLE_PSIP',
  DVB_SI = 'DVB_SI',
  MH = 'MH',
  SCTE = 'SCTE',
  ATSC_3 = 'ATSC_3',
  ATSC_3_KR = 'ATSC_3_KR',
  ATSC_3_TRANSLATED = 'ATSC_3_TRANSLATED'
}

export const LICENSED_NETWORK_TYPES: Record<LicensedNetworkType, DisplayNameType> = {
  [LicensedNetworkType.PSIP]: {displayName: 'PSIP'},
  [LicensedNetworkType.CABLE_PSIP]: {displayName: 'Cable PSIP'},
  [LicensedNetworkType.DVB_SI]: {displayName: 'DVB-SI'},
  [LicensedNetworkType.MH]: {displayName: 'M/H'},
  [LicensedNetworkType.SCTE]: {displayName: 'SCTE 65'},
  [LicensedNetworkType.ATSC_3]: {displayName: 'ATSC-3.0'},
  [LicensedNetworkType.ATSC_3_KR]: {displayName: 'ATSC-3.0 Korea'},
  [LicensedNetworkType.ATSC_3_TRANSLATED]: {displayName: 'ATSC-3.0 Translated'}
};

export enum SystemType {
  PRIMARY = 'PRIMARY', REDUNDANT = 'REDUNDANT'
}

export const SYSTEM_TYPES: Record<SystemType, DisplayNameType> = {
  [SystemType.PRIMARY]: {displayName: 'Primary'},
  [SystemType.REDUNDANT]: {displayName: 'Redundant'}
};

export class ServerLicense {
  public constructor(public licenseId: number, public productId: number, public activationPassword: string,
                     public installationName: string, public installationId: string,
                     public cloudFloatingLicenseEnabled: boolean,
                     public cloudFloatingLicenseGracePeriodMinutes: number,
                     public guestOSVMEnabled: boolean, public licenseType: LicenseType,
                     public nodeLockType: NodeLockType, public licensedNetworkTypes: LicensedNetworkType[],
                     public licensedInputTypes: ScheduleProviderType[],
                     public licensedOutputTypes: OutputType[],
                     public creationDate: string, public licenseExpirationDate: string, public version: string,
                     public macAddress: string, public dongleKey: string, public maxInputs: number,
                     public maxOutputs: number, public maxTransports: number, public maxMajorNumbers: number,
                     public maxServices: number, public maxRoutes: number, public aeaEnabled: boolean,
                     public aeaNrtEnabled: boolean, public esgEnabled: boolean, public measEnabled: boolean,
                     public mmtEnabled: boolean, public routeEncoderEnabled: boolean,
                     public dashServerEnabled: boolean,
                     public serviceExportEnabled: boolean, public systemType: SystemType) {
  }
}

export class ServerLicenseInfo {
  public constructor(public serverLicense: ServerLicense, public serverLicenseText: string,
                     public attachedDongleKey: string, public nodeLockValid: boolean,
                     public nodeLockState: NodeLockState, public gracePeriodMinutes: number,
                     public gracePeriodStart: string, public gracePeriodExpired: boolean, public expired: boolean,
                     public newLicenseRequired: boolean, public dongleAttached: boolean,
                     public correctDongle: boolean,
                     public transportsLimitExceeded: boolean, public majorNumbersLimitExceeded: boolean,
                     public servicesLimitExceeded: boolean, public routeLimitExceeded: boolean,
                     public providersLimitExceeded: boolean, public outputsLimitExceeded: boolean,
                     public unlicensedNetworkTypes: LicensedNetworkType[],
                     public unlicensedInputTypes: ScheduleProviderType[], public unlicensedOutputTypes: OutputType[],
                     public measExceeded: boolean, public aeaExceeded: boolean, public aeaNRTExceeded: boolean,
                     public esgExceeded: boolean, public mmtExceeded: boolean, public guestOSVMExceeded: boolean,
                     public backupSystem: boolean, public serviceExportExceeded: boolean,
                     public routeEncoderEnabled: boolean, public valid: boolean,
                     public licenseCapabilityExceeded: boolean,
                     public outputsExceeded: boolean,
                     public providersExceeded: boolean,
                     public servicesExceeded: boolean,
                     public transportsExceeded: boolean,
                     public majorNumbersExceeded: boolean,
                     public measexceeded: boolean,
                     public aeaexceeded: boolean,
                     public aeanrtexceeded: boolean,
                     public esgexceeded: boolean,
                     public mmtexceeded: boolean,
                     public isRoutesExceeded: boolean,
                     public systemType?: string,
  ) {
  }
}

export class LicenseRequest {
  public constructor(public licenseId: number, public activationPassword: string, public installationName: string,
                     public restartOnSuccess: boolean) {
  }
}

export class OnlineResponse {
  public constructor(public accepted: boolean, public message: string) {
  }
}

export class OfflineLicenseRequest {
  public constructor(public responseString: string, public activation: boolean, public restartOnSuccess: boolean) {
  }
}

export class OfflineLicenseResponse {
  public constructor(public accepted: boolean, public message: string, public activationRequestString: string) {
  }
}

export class NetworkLicenseSession {
  public constructor(public keyName: string, public keyValue: number, public sessionId: string,
                     public licenseStatus: string, public customerId: number, public licenseId: number,
                     public productId: number, public prodOptionId: number, public computerName: string,
                     public pollFrequency: number, public pollRetryFrequency: number, public pollRetryCount: number,
                     public checkedOut: boolean, public totalSeats: number, public seatsAvailable: number,
                     public ipAddress: string, public checkoutDurationMinimum: number,
                     public checkoutDurationMaximum: number, public allowCheckoutExtension: boolean,
                     public certificatePath: string, public allocatedDate: string, public allocatedUntilDate: string,
                     public expirationDate: string, public lastPollDate: string, public status: string,
                     public resultCode: number, public error: string, public errorMessage: string,
                     public sessionCode: string, public serverDateTime: string) {
  }
}

export class NetworkLicenseInfo {
  public constructor(public networkLicenseSession: NetworkLicenseSession, public totalPollRetryAttempts: number,
                     public lastPollRetryTime: string) {
  }
}

export class FeatureType {
  constructor(public id: string, public displayName: string) {
  }
}

export class NotifyLicenseLogoff {
  constructor(public reason: string) {
  }
}

export class NotifyLicenseNodeLock {
  constructor(public nodeLockState: NodeLockState) {
  }
}
