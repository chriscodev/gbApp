// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.

import {AbstractElement, DisplayNameType} from '../AbstractElement';
import {RestartServerMode} from './Server';


export class GpiSettings {
  public constructor(public enabled: boolean, public commPortId: string) {
  }
}

export class RedundancySettings extends AbstractElement {
  gpiSetting: any;

  public constructor(public scheme: string, public host: string, public port: number, public enabled: boolean,
                     public target: RestartServerMode, gpiSetting: GpiSettings, public gpiEnabled?: number,
                     public gpiPort?: number, public id?: number, public clientId?: string) {
    super(id, clientId);
  }
}

export class DefaultRedundancySettings extends RedundancySettings {
  public constructor() {
    const defaultGpiSettings = new GpiSettings(false, '');
    super('', '', 25, false, RestartServerMode.ACTIVE_MODE, defaultGpiSettings);
  }
}

export enum RedundancyState {
  UPDATE_PENDING = 'UPDATE_PENDING',
  UPDATE_PROCESSING = 'UPDATE_PROCESSING',
  UPDATE_ERROR = 'UPDATE_ERROR',
  UPDATE_COMPLETE = 'UPDATE_COMPLETE',
  UPDATE_READY = 'UPDATE_READY'
}

export const REDUNDANCY_STATE_TYPES: Record<RedundancyState, DisplayNameType> = {
  [RedundancyState.UPDATE_PENDING]: {displayName: 'Pending'},
  [RedundancyState.UPDATE_PROCESSING]: {displayName: 'Processing'},
  [RedundancyState.UPDATE_ERROR]: {displayName: 'Error'},
  [RedundancyState.UPDATE_COMPLETE]: {displayName: 'Complete'},
  [RedundancyState.UPDATE_READY]: {displayName: 'Ready'}
};

export enum RedundancySystemState {
  SYSTEM_DISCONNECTED = 'SYSTEM_DISCONNECTED',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  SYSTEM_CONNECTED = 'SYSTEM_CONNECTED',
  SYSTEM_REDUNDANCY_DISABLE = 'SYSTEM_REDUNDANCY_DISABLE'
}

export const REDUNDANCY_SYSTEM_STATE_TYPES: Record<RedundancySystemState, DisplayNameType> = {
  [RedundancySystemState.SYSTEM_DISCONNECTED]: {displayName: 'Disconnected'},
  [RedundancySystemState.SYSTEM_ERROR]: {displayName: 'Error'},
  [RedundancySystemState.SYSTEM_CONNECTED]: {displayName: 'Connected'},
  [RedundancySystemState.SYSTEM_REDUNDANCY_DISABLE]: {displayName: 'Redundancy Disabled'}
};

export class RedundancyStatus {
  public constructor(public redundancyState: RedundancyState, public lastUpdateTime: string,
                     public redundancySystemState: RedundancySystemState, public redundancyServerAddress: string,
                     public lastUpdateMessage: string) {
  }
}


export class DefaultRedundancyStatus extends RedundancyStatus {
  public constructor() {
    super(RedundancyState.UPDATE_READY, '', RedundancySystemState.SYSTEM_DISCONNECTED, '', '');
  }
}
