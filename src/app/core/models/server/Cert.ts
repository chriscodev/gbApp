// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {AbstractElement, UNINITIALIZED_ID} from '../AbstractElement';
import {AbstractCommitUpdate} from '../CommitUpdate';
import {v4 as uuidv4} from 'uuid';

export enum CertType {
  AUTHORING = 'AUTHORING', CERTIFICATE_AUTHORITY = 'CERTIFICATE_AUTHORITY', DISTRIBUTING = 'DISTRIBUTING',
  OCSP_RESPONDER = 'OCSP_RESPONDER', SIGNALING = 'SIGNALING'
}

export interface CertTypeWithDisplayName {
  readonly certType: CertType;
  readonly displayName: string;
}

export const CERT_TYPES: CertTypeWithDisplayName[] = [];

export class Cert extends AbstractElement {
  public constructor(public issuerId: number, public type: CertType, public name: string, public hsmId: number,
                     public keyStoreAlias: string, public issuedTo: string, public issuedToCN: string,
                     public issuedBy: string, public issuedByCN: string, public aki: string,
                     public issuerNameHash: string, public issuerKeyHash: string, public ski: string,
                     public nameHash: string, public keyHash: string, public serialNumber: string,
                     public notBefore: string, public notAfter: string, public bsids: number[],
                     public certificate: string[], public privateKeyAvailable: boolean,
                     public privateKeyExtractable: boolean, public isSelfSigned: boolean, public id?: number,
                     public clientId?: string
  ) {

    super(id, clientId);
  }
}

export class TranslatedCertData {
  public constructor(public id?: number, public type?: string, public onLine?: boolean,
                     public status?: string, public OSCPProduced?: string) {
  }
}

export class DefaultCert extends Cert {
  public constructor() {
    super(null, null, '', -1, '', '', '', '', '',
      '', '', '', '', '', '', '', '', '',
      null, null, false, false, false, UNINITIALIZED_ID, uuidv4());
  }
}

export enum OCSPStatus {
  GOOD = 'GOOD', REVOKED = 'REVOKED', UNKNOWN = 'UNKNOWN', NOT_CHECKED = 'NOT_CHECKED', NOT_YET_VALID = 'NOT_YET_VALID',
  EXPIRED = 'EXPIRED', UNKNOWN_ERROR = 'UNKNOWN_ERROR', RESPONSE_INVALID = 'RESPONSE_INVALID', STALE = 'STALE'
}

export interface OCSPStatusWithDisplayName {
  readonly ocspStatus: OCSPStatus;
  readonly displayName: string;
}

export const OCSP_STATUSES: OCSPStatusWithDisplayName[] = [];

export class CertStatus {
  public constructor(public certId: number, public status: OCSPStatus, public requested?: Date, public produced?: Date,
                     public online?: boolean) {
  }
}

export class DefaultCertStatus extends CertStatus {
  public constructor() {
    super(-1, OCSPStatus.NOT_CHECKED, null, null, false);
  }
}

export class CertsUpdate extends AbstractCommitUpdate<Cert> {
  public constructor(public added: Cert[], public updated: Cert[], public deleted: number[]) {
    super(added, updated, deleted);
  }
}

export enum KeyType {
  RSA_2048 = 'RSA_2048', RSA_3072 = 'RSA_3072', RSA_4096 = 'RSA_4096', EC_256 = 'EC_256', EC_384 = 'EC_384'
}

export interface KeyTypeWithDetails {
  readonly keyType: KeyType;
  readonly displayName: string;
}

export const KEY_TYPES: KeyTypeWithDetails[] = [];

export class CertRequest extends AbstractElement {
  public constructor(public name: string, public keyType: KeyType, public country: string, public state: string,
                     public locality: string, public organization: string, public organizationalUnit: string,
                     public commonName: string, public csr: string, public nameHash: string, public keyHash,
                     public publicKey,
                     public id?: number, public clientId?: string) {
    super();
  }
}

export class DefaultCertRequest extends CertRequest {
  public constructor() {
    super('', KeyType.RSA_3072, '', '', '', '', '', '',
      '', '', '', null, UNINITIALIZED_ID, uuidv4());
  }
}

export class CertRequestsUpdate extends AbstractCommitUpdate<CertRequest> {
  public constructor(public added: CertRequest[], public updated: CertRequest[], public deleted: number[]) {
    super(added, updated, deleted);
  }
}

export interface KeyStoreEntries {
  [key: string]: string;
}

export interface CertificateInfo {
  certDetails: string;
}

export interface KeyStoreEntry {
  alias: string;
  certificates: CertificateInfo[];
}

export class KeyStoreDescriptor {
  password: string;
  entries: KeyStoreEntryDescriptor[];
}

export class KeyStoreEntryDescriptor {
  alias: string;
  passwordRequired: string;
  password: string;
  // certificateChain: CertificateInfo[];
}

export class ExportKeyStoreDescriptor {
  keystorePassword: string;
  privateKeyPassword: string;
  fileName: string;
  certIds: number[];
}

export type CertTypeMap = {
  [key in CertType]: string;
};
export const certTypeToString: CertTypeMap = {
  [CertType.CERTIFICATE_AUTHORITY]: '[CA]',
  [CertType.AUTHORING]: '[AUTHORING]',
  [CertType.SIGNALING]: '[Signaling]',
  [CertType.OCSP_RESPONDER]: '[OCSP]',
  [CertType.DISTRIBUTING]: '[Distrib]'
};
