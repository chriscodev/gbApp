// Copyright (c) 2023 Triveni Digital, Inc. All rights reserved.

export enum NtpServerType {
  POOL = 'POOL', SERVER = 'SERVER'
}

export class NtpServer {
  public constructor(public address: string, public type: NtpServerType, public burstMode: boolean) {
  }
}

export class TimeZoneMapping {
  public constructor(public id: string, public name: string, public windowsName: string, public timeZone: string) {
  }
}

export class DateTime {
  public constructor(public timeInMillis: number, public ntpEnabled: boolean, public ntpServers: NtpServer[],
                     public timeZoneMapping: TimeZoneMapping) {
  }
}
