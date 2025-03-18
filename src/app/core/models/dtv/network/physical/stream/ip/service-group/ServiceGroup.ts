// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {ATSC3Stream} from '../IPStream';
import {AbstractElement, DisplayNameType, UNINITIALIZED_ID} from '../../../../../../AbstractElement';
import {v4 as uuidv4} from 'uuid';

export enum AEAIngestType {
  FTP = 'FTP', SFTP = 'SFTP', API = 'API'
}

export const AEA_INGEST_TYPES: Record<AEAIngestType, DisplayNameType> = {
  [AEAIngestType.FTP]: {displayName: 'FTP'},
  [AEAIngestType.SFTP]: {displayName: 'SFTP / SCP'},
  [AEAIngestType.API]: {displayName: 'API'}
};

export class ATSC3AEASettings {
  public constructor(public aeatEnabled: boolean, public aeatInterval: number, public aeatNrtEnabled: boolean,
                     public aeatNrtBitrate: number, public aeaUserId: number, public aeaIngestType: AEAIngestType,
                     public aeaUserName: string, public aeaPassword: string, public aeaAuthenticationKey: string) {
  }
}

export class DefaultATSC3AEASettings extends ATSC3AEASettings {
  public constructor() {
    super(false, 1000, false, 1000, undefined,
      AEAIngestType.FTP, undefined, undefined, undefined);
  }
}

export const DEFAULT_AEA_NRT_SERVICE_ID = 0xF911;
export const DEFAULT_AEA_NRT_IP = '239.255.91.91';
export const DEFAULT_AEA_NRT_PORT = 9110;

export class ATSC3BroadbandSettings {
  public constructor(public slsEnabled: boolean, public esgEnabled: boolean, public publishingEnabled: boolean,
                     public primaryPublishUrl: string, public primaryUserName: string, public primaryPassword: string,
                     public backupPublishingEnabled: boolean, public backupPublishUrl: string,
                     public backupUserName: string, public backupPassword: string) {
  }
}

export class DefaultATSSC3BroadbandSettings extends ATSC3BroadbandSettings {
  public constructor() {
    super(false, false, false, undefined, undefined,
      undefined, false, undefined, undefined,
      undefined);
  }
}

export class ATSC3ESGSettings {
  public constructor(public appContextIdList, public enabled: boolean, public dstAddress: string,
                     public dstPort: number, public bitrate: number, public hoursAhead: number,
                     public hoursBehind: number) {
  }
}

export class DefaultATSC3ESGSettings extends ATSC3ESGSettings {
  public constructor() {
    super(null, false, '239.255.0.255', 8000, 64, 24, 0);
  }
}

export enum RRTRatingRegion {
  USA = 'USA', CANADA = 'Canada', USA_CANADA = 'USA & Canada'
}

export const RRT_RATING_REGIONS: Record<RRTRatingRegion, DisplayNameType> = {
  [RRTRatingRegion.USA]: {displayName: 'USA'},
  [RRTRatingRegion.CANADA]: {displayName: 'Canada'},
  [RRTRatingRegion.USA_CANADA]: {displayName: 'USA & Canada'}
};

export class ATSC3LLSSettings {
  public constructor(public sltInterval: number, public sttInterval: number, public cdtInterval: number,
                     public rrtEnabled: boolean, public rrtRegion: RRTRatingRegion, public rrtInterval: number) {
  }
}

export class DefaultATSC3LLSSettings extends ATSC3LLSSettings {
  public constructor() {
    super(1000, 1000, 1000, false, RRTRatingRegion.USA, 60000);
  }
}

export class VP1Embedder extends AbstractElement {
  public constructor(
    public name: string,
    public host: string,
    public port: number,
    public processingInstance: number,
    public serverCode: number,
    public epochYear: number,
    public aeatUrl: string,
    public id?: number,
    public clientId?: string) {
    super(id, clientId);
  }
}

export class DefaultVP1Embedder extends VP1Embedder {
  public constructor() {
    super(undefined, undefined, undefined, undefined, undefined, undefined, undefined, UNINITIALIZED_ID, uuidv4());
  }
}

export class ATSC3RecoverySettings {
  public constructor(public enabled: boolean, public submissionUrl: string, public userName: string,
                     public password: string, public vp1Embedders: VP1Embedder[]) {
  }
}

export const DEFAULT_SUBMISSION_SERVER = 'https://a4c-prod-rdm-endpoint.svc.aspect.us/recoveryresponsesubmission';

export class DefaultRecoverySettings extends ATSC3RecoverySettings {
  public constructor() {
    super(false, DEFAULT_SUBMISSION_SERVER, undefined, undefined, []);
  }
}

export enum DSTPTunnelMode {
  DSTP = 'DSTP',
  CALLER = 'CALLER',
  LISTENER = 'LISTENER',
  RENDEZVOUS = 'RENDEZVOUS'
}

export enum SRTKeyLength {
  AES_128 = 'AES_128',
  AES_192 = 'AES_192',
  AES_256 = 'AES_256'
}

export enum SRTAutoRepeatRequest {
  ALWAYS = 'ALWAYS',
  ON_REQUEST = 'ON_REQUEST',
  NEVER = 'NEVER'
}

export enum SRTFECLayout {
  EVEN = 'EVEN',
  STAIRCASE = 'STAIRCASE'
}

export enum DSTPPacketMode {
  FIXED = 'FIXED',
  DYNAMIC = 'DYNAMIC',
  PADDED = 'PADDED'
}

export interface SRTAutoRepeatRequestWithDetails {
  readonly displayName: string;
  readonly requestType: string;
}

export interface SRTKeyLengthWithDetails {
  readonly displayName: string;
  readonly length: number;
}

export const DSTP_TUNNEL_MODE_TYPES: Record<DSTPTunnelMode, DisplayNameType> = {
  [DSTPTunnelMode.DSTP]: {displayName: 'DSTP'},
  [DSTPTunnelMode.CALLER]: {displayName: 'DSTP over SRT (Caller)'},
  [DSTPTunnelMode.LISTENER]: {displayName: 'DSTP over SRT (Listener)'},
  [DSTPTunnelMode.RENDEZVOUS]: {displayName: 'DSTP over SRT (Rendezvous)'}
};
export const SRT_AUTO_RESPONSE_REQUEST_TYPES: Record<SRTAutoRepeatRequest, SRTAutoRepeatRequestWithDetails> = {
  [SRTAutoRepeatRequest.ALWAYS]: {displayName: 'Always', requestType: 'always'},
  [SRTAutoRepeatRequest.ON_REQUEST]: {displayName: 'On Request', requestType: 'onreq'},
  [SRTAutoRepeatRequest.NEVER]: {displayName: 'Never', requestType: 'never'}

};
export const SRT_FEC_LAYOUT_TYPES: Record<SRTFECLayout, DisplayNameType> = {
  [SRTFECLayout.EVEN]: {displayName: 'Even'},
  [SRTFECLayout.STAIRCASE]: {displayName: 'Staircase'}
};

export const SRT_KEY_LENGTH_TYPES: Record<SRTKeyLength, SRTKeyLengthWithDetails> = {
  [SRTKeyLength.AES_128]: {displayName: 'AES-128', length: 16},
  [SRTKeyLength.AES_192]: {displayName: 'AES-192', length: 24},
  [SRTKeyLength.AES_256]: {displayName: 'AES-256', length: 32}
};

export class ATSC3DSTPSettings {
  public constructor(public enabled: boolean, public tunnelMode: DSTPTunnelMode, public packetMode: DSTPPacketMode,
                     public dstAddress: string, public dstPort: number, public bindNic: string,
                     public bindPort: number, public fecEnabled: boolean, public fecColumns: number,
                     public fecRows: number,
                     public fecLayout: SRTFECLayout, public autoRepeatRequest: SRTAutoRepeatRequest,
                     public encryptionEnabled: boolean, public passphrase: string, public keyLength: SRTKeyLength,
                     public mtu: number, public ttl: number, public latency: number) {
  }
}

export class DefaultATSC3DSTPSettings extends ATSC3DSTPSettings {
  public constructor() {
    super(false, DSTPTunnelMode.DSTP, DSTPPacketMode.DYNAMIC, null, null, undefined, null, false,
      null, null, SRTFECLayout.EVEN, SRTAutoRepeatRequest.ON_REQUEST, false, null, SRTKeyLength.AES_128,
      1500, 64, 1);
  }
}

export class BaseServiceGroup extends AbstractElement {
  public constructor(public name: string, public statmuxed: boolean, public statmuxRate: number,
                     public groupId: number, public groupCount: number,
                     public currentCertId: number, public nextCertId: number, public cdtCertId: number,
                     public cdtNextCertId: number,
                     public aeaSettings: ATSC3AEASettings, public broadbandSettings: ATSC3BroadbandSettings,
                     public esgSettings: ATSC3ESGSettings, public llsSettings: ATSC3LLSSettings,
                     public recoverySettings: ATSC3RecoverySettings,
                     public dstpSettings: ATSC3DSTPSettings, public id?: number, public clientId?: string) {
    super(id, clientId);
  }
}

export class ServiceGroup extends BaseServiceGroup {
  public constructor(
    public name: string,
    public statmuxed: boolean,
    public statmuxRate: number,
    public groupId: number,
    public groupCount: number,
    public currentCertId: number,
    public nextCertId: number,
    public cdtCertId: number,
    public cdtNextCertId: number,
    public aeaSettings: ATSC3AEASettings,
    public broadbandSettings: ATSC3BroadbandSettings,
    public esgSettings: ATSC3ESGSettings,
    public llsSettings: ATSC3LLSSettings,
    public recoverySettings: ATSC3RecoverySettings,
    public dstpSettings: ATSC3DSTPSettings,
    public ipStreams: ATSC3Stream[],
    public id?: number,
    public clientId?: string) {
    super(name, statmuxed, statmuxRate, groupId, groupCount, currentCertId, nextCertId, cdtCertId, cdtNextCertId,
      aeaSettings, broadbandSettings, esgSettings, llsSettings, recoverySettings, dstpSettings);
  }
}

export class DefaultServiceGroup extends ServiceGroup {
  public constructor(public groupId: number) {
    super('', false, 0, groupId, 1, undefined, undefined, undefined, undefined,
      new DefaultATSC3AEASettings(), new DefaultATSSC3BroadbandSettings(),
      new DefaultATSC3ESGSettings(), new DefaultATSC3LLSSettings(), new DefaultRecoverySettings(),
      new DefaultATSC3DSTPSettings(), [], UNINITIALIZED_ID, uuidv4());
  }
}

