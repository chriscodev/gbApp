/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {AbstractElement, UNINITIALIZED_ID} from './AbstractElement';
import {v4 as uuidv4} from 'uuid';

export enum SnmpVersion {
    V1 = 'V1', V2C = 'V2C'
}

export const SNMP_VERSIONS: Record<SnmpVersion, string> = {
    [SnmpVersion.V1]: 'v1',
    [SnmpVersion.V2C]: 'v2c'
};

export enum SecurityLevel {
    NONE = 'NONE', AUTH_NO_PRIV = 'AUTH_NO_PRIV', AUTH_PRIV = 'AUTH_PRIV'
}

export enum AuthenticationMethod {
    MD5 = 'MD5', SHA = 'SHA'
}

export enum EncryptionMethod {
    DES = 'DES', TRIPLE_DES = 'TRIPLE_DES', AES = 'AES'
}

export class SnmpManager extends AbstractElement {
    public constructor(
        public snmpVersion: SnmpVersion,
        public entityName: string,
        public ipAddress: string,
        public contextName: string,
        public securityName: string,
        public securityLevel: SecurityLevel,
        public authenticationMethod: AuthenticationMethod,
        public authenticationPassword: string,
        public encryptionMethod: EncryptionMethod,
        public encryptionPassword: string,
        public id?: number,
        public clientId?: string
    ) {
        super(id, clientId);
    }
}

export class DefaultSnmpManager extends SnmpManager {
    public constructor() {
        super(SnmpVersion.V1, '', '', '', '', SecurityLevel.NONE, undefined, '', undefined, '', UNINITIALIZED_ID,
            uuidv4());
    }
}

export class SnmpConfiguration extends AbstractElement {
    public constructor(
        public id?: number,
        public systemName?: string,
        public systemLocation?: string,
        public communityReadOnlyString?: string,
        public clientId?: string) {
        super(id, clientId);
    }
}

export class SnmpSettings {
    public constructor(
        public snmpConfiguration: SnmpConfiguration,
        public snmpManagers: SnmpManager[]
    ) {
    }
}

export class SNMPSettingsUpdate {
    public constructor(public snmpConfiguration: SnmpConfiguration, public added: SnmpManager[],
                       public updated: SnmpManager[], public deleted: number[]) {
    }
}
