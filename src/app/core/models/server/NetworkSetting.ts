// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {NICState} from './Server';

export enum IPSettingsType {
  DHCP = 'DHCP', STATIC = 'STATIC', UNCONFIGURED = 'UNCONFIGURED'
}

export interface IPSettingsTypeWithDisplayName {
  readonly ipSettingsType: IPSettingsType;
  readonly displayName: string;
}

export const IP_SETTINGS_TYPES: IPSettingsTypeWithDisplayName[] = [{
  ipSettingsType: IPSettingsType.DHCP,
  displayName: 'DHCP'
}, {ipSettingsType: IPSettingsType.STATIC, displayName: 'Static'}, {
  ipSettingsType: IPSettingsType.UNCONFIGURED,
  displayName: 'Unconfigured'
}];

export class IPSettings {
  public constructor(public name: string, public mac: string, public type: IPSettingsType, public address: string,
                     public netmask: string, public gateway: string, public nameServers: string[],
                     public nicState: NICState) {
  }
}

export class DefaultIPSettings extends IPSettings {
  public constructor() {
    super(undefined, undefined, IPSettingsType.UNCONFIGURED, undefined, undefined, undefined, [], NICState.UNKNOWN);
  }
}

export class NetworkSettings {
  public constructor(public hostname: string, public ipSettings: IPSettings[]) {
  }
}

export class DefaultNetworkSettings extends NetworkSettings {
  public constructor() {
    super('', []);
  }
}

export class UpdateNetworkSettings {
  public constructor(public networkSettings: NetworkSettings, public restartServer: boolean) {
  }
}

// TODO change ipaddress to ipAddress once IPSE is fixed.
export class NICDescriptor {
  public constructor(public displayName: string, public interfaceName: string, public ipaddress: string,
                     public macAddress: string, public up: boolean, public verboseName: string) {
  }
}

export class AnyNICDescriptor extends NICDescriptor {
  public constructor() {
    super('Any', 'Any', '0.0.0.0', undefined, true, 'Any (0.0.0.0 - All Network Interfaces)');
  }
}

export interface NICInterface {
  readonly interfaceName: string;
  readonly ipaddress: string;
  readonly displayName: string;
}

