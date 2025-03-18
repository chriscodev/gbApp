/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {DisplayNameType, IntegerValue} from '../AbstractElement';

export enum AlarmLevel {
  CRITICAL = 'CRITICAL', WARNING = 'WARNING', INFORMATION = 'INFORMATION'
}

export const ALARM_LEVELS: Record<AlarmLevel, DisplayNameType> = {
  [AlarmLevel.CRITICAL]: {displayName: 'Critical'},
  [AlarmLevel.WARNING]: {displayName: 'Warning'},
  [AlarmLevel.INFORMATION]: {displayName: 'Information'}
};

export const ALARM_LEVEL_VALUES: Record<AlarmLevel, IntegerValue> = {
  [AlarmLevel.CRITICAL]: {value: 2},
  [AlarmLevel.WARNING]: {value: 1},
  [AlarmLevel.INFORMATION]: {value: 0}
};

export enum AlarmType {
  STREAM_SOURCE_CONNECTION_ERROR = 'STREAM_SOURCE_CONNECTION_ERROR',
  STREAM_NO_DATA = 'STREAM_NO_DATA',
  STREAM_INVALID_NIC = 'STREAM_INVALID_NIC',
  INVALID_MPD = 'INVALID_MPD',
  MISSING_INIT_SEGMENT = 'MISSING_INIT_SEGMENT',
  SEGMENT_ARRIVAL_LATE = 'SEGMENT_ARRIVAL_LATE',
  LLS_SLS_NIC_MISMATCH = 'LLS_SLS_NIC_MISMATCH',
  SIGNING_CERTIFICATE_EXPIRED = 'SIGNING_CERTIFICATE_EXPIRED',
  BROADBAND_SERVER_CONNECTION_ERROR = 'BROADBAND_SERVER_CONNECTION_ERROR',
  RECOVERY_SERVER_CONNECTION_ERROR = 'RECOVERY_SERVER_CONNECTION_ERROR',
  CHANNEL_UNLINKED = 'CHANNEL_UNLINKED',
  SERVICE_UNLINKED = 'SERVICE_UNLINKED',
  STREAM_UNLINKED = 'STREAM_UNLINKED',
  OUTPUT_INVALID_NIC = 'OUTPUT_INVALID_NIC',
  OUTPUT_CONNECTION_ERROR = 'OUTPUT_CONNECTION_ERROR',
  OUTPUT_NO_TRANSPORT = 'OUTPUT_NO_TRANSPORT',
  SCHEDULE_PROVIDER_CONNECTION_ERROR = 'SCHEDULE_PROVIDER_CONNECTION_ERROR',
  SCHEDULE_PROVIDER_INVALID_DATA = 'SCHEDULE_PROVIDER_INVALID_DATA',
  SYSTEM_STREAM_DATA_UNASSIGNED = 'SYSTEM_STREAM_DATA_UNASSIGNED',
  SYSTEM_REDUNDANT_SYSTEM_CONNECTION_ERROR = 'SYSTEM_REDUNDANT_SYSTEM_CONNECTION_ERROR',
  SYSTEM_NO_LICENSE = 'SYSTEM_NO_LICENSE',
  SYSTEM_LICENSE_EXPIRED = 'SYSTEM_LICENSE_EXPIRED',
  SYSTEM_LICENSE_CAPABILITY_EXCEEDED = 'SYSTEM_LICENSE_CAPABILITY_EXCEEDED',
  SYSTEM_LICENSE_INVALID_NODE_LOCK = 'SYSTEM_LICENSE_INVALID_NODE_LOCK',
  SYSTEM_LICENSE_FLOATING_GRACE_PERIOD = 'SYSTEM_LICENSE_FLOATING_GRACE_PERIOD',
  SYSTEM_RAID_STATE = 'SYSTEM_RAID_STATE',
  SYSTEM_POWER_SUPPLY_STATE = 'SYSTEM_POWER_SUPPLY_STATE'
}

export interface AlarmTypeWithDetails {
  readonly alarmType: AlarmType;
  readonly displayName: string;
  readonly defaultAlarmLevel: AlarmLevel;
  readonly defaultEnabled: boolean;
  readonly defaultTimeOutSeconds?: number;
  readonly defaultSendEmailEnabled: boolean;
}

export const ALARM_TYPES: AlarmTypeWithDetails[] = [];

export class AlarmConfiguration {
  public constructor(public type: AlarmType, public level: AlarmLevel, public enabled: boolean,
                     public timeOutSeconds: number, public sendEmailEnabled: boolean, public description: string
  ) {
  }
}

export class DefaultAlarmConfiguration extends AlarmConfiguration {
  public constructor() {
    super(AlarmType.BROADBAND_SERVER_CONNECTION_ERROR, AlarmLevel.CRITICAL, true, undefined,
      false, '');
  }
}

export class AlarmEvent {
  public constructor(public id: number, public clientId: string, public type: AlarmType, public level: AlarmLevel,
                     public startTime: Date, public lastTime: Date, public endTime: Date,
                     public timesOccurred: number, public component: string, public description: string,
                     public uuid: string, public serviceId?: number, public elementId?: number) {
  }
}



