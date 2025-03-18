// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.

import {AbstractElement, DisplayNameType, UNINITIALIZED_ID} from '../../AbstractElement';
import {v4 as uuidv4} from 'uuid';

export enum ExtensionType {
  UNKNOWN = 'UNKNOWN',
  CAPABILITIES = 'CAPABILITIES',
  DRM_SYSTEM_ID = 'DRM_SYSTEM_ID',
  SERVICE_ID = 'SERVICE_ID',
  INET_URL = 'INET_URL',
  SIMULCAST_TSID = 'SIMULCAST_TSID',
  OTHER_BSID = 'OTHER_BSID',
  GENRE = 'GENRE',
  BROADBAND_SERVICE_ICON = 'BROADBAND_SERVICE_ICON',
  BROADCAST_SERVICE_ICON = 'BROADCAST_SERVICE_ICON',
  BONDED_BSIDS = 'BONDED_BSIDS',
  BASE_URL = 'BASE_URL',
  BASE_PATTERN = 'BASE_PATTERN',
  USER_DEFINED_ATSC3_MESSAGE = 'USER_DEFINED_ATSC3_MESSAGE',
  CP = 'CP',
  CCI = 'CCI',
  LANGUAGE = 'LANGUAGE',
  SGDU_PASSTHROUGH = 'SGDU_PASSTHROUGH',
  VIDEO_STREAM_PROPERTIES = 'VIDEO_STREAM_PROPERTIES',
  AUDIO_STREAM_PROPERTIES = 'AUDIO_STREAM_PROPERTIES',
  CAPTION_ASSET = 'CAPTION_ASSET',
  LOW_DELAY = 'LOW_DELAY'
}

export type DisplayNameWithEditableType = {
  displayName: string,
  editable: boolean
};

export const EXTENSION_TYPES: Record<ExtensionType, DisplayNameWithEditableType> = {
  [ExtensionType.UNKNOWN]: {displayName: 'Unknown', editable: true},
  [ExtensionType.CAPABILITIES]: {displayName: 'Capabilities', editable: true},
  [ExtensionType.DRM_SYSTEM_ID]: {displayName: 'DRM System Id', editable: true},
  [ExtensionType.SERVICE_ID]: {displayName: 'Service Id', editable: true},
  [ExtensionType.INET_URL]: {displayName: 'Broadband Signaling', editable: true},
  [ExtensionType.SIMULCAST_TSID]: {displayName: 'Simulcast TSID', editable: true},
  [ExtensionType.OTHER_BSID]: {displayName: 'Other BSID', editable: true},
  [ExtensionType.GENRE]: {displayName: 'Genre', editable: true},
  [ExtensionType.BROADBAND_SERVICE_ICON]: {displayName: 'Broadband Service Icon', editable: true},
  [ExtensionType.BROADCAST_SERVICE_ICON]: {displayName: 'Broadcast Service Icon', editable: true},
  [ExtensionType.BONDED_BSIDS]: {displayName: 'Bonded BSID', editable: true},
  [ExtensionType.BASE_URL]: {displayName: 'Base URL', editable: true},
  [ExtensionType.BASE_PATTERN]: {displayName: 'Base Pattern', editable: true},
  [ExtensionType.USER_DEFINED_ATSC3_MESSAGE]: {displayName: 'User Defined ATSC3 Message', editable: true},
  [ExtensionType.CP]: {displayName: 'LCT Codepoint', editable: true},
  [ExtensionType.CCI]: {displayName: 'LCT CCI', editable: true},
  [ExtensionType.LANGUAGE]: {displayName: 'Language', editable: true},
  [ExtensionType.SGDU_PASSTHROUGH]: {displayName: 'SGDU Passthrough', editable: false},
  [ExtensionType.VIDEO_STREAM_PROPERTIES]: {displayName: 'Video Stream Properties', editable: false},
  [ExtensionType.AUDIO_STREAM_PROPERTIES]: {displayName: 'Audio Stream Properties', editable: false},
  [ExtensionType.CAPTION_ASSET]: {displayName: 'Caption Asset', editable: false},
  [ExtensionType.LOW_DELAY]: {displayName: 'Low Delay', editable: false}
};

export abstract class AbstractExtension extends AbstractElement {
  protected constructor(
    public type: ExtensionType, public unique: boolean, public id?: number, public clientId?: string) {
    super(id, clientId);
  }
}

export class AllExtension extends AbstractExtension {
  public constructor(public cci: string,
                     public count: number,
                     public languageCode: string,
                     public codePoint: number,
                     public format: PayloadFormat,
                     public fragmentation: PayloadFragmentation,
                     public inOrder: boolean,
                     public srcFECPayloadId: number,
                     public contentType: number,
                     public compression: number,
                     public hexPayload: string,
                     public appServiceType: AppServiceType,
                     public pattern: string,
                     public width: number,
                     public height: number,
                     public mimeType: string,
                     public genre: string,
                     public otherType: OtherBSIDType,
                     public essential: EssentialType,
                     public otherBsids: string,
                     public virtual: string,
                     public tsid: number,
                     public major: number,
                     public minor: number,
                     public gsid: string,
                     public drmSystemId: string,
                     public urlType: InetURLType,
                     public url: string,
                     public capabilities: string,
                     public type: ExtensionType,
                     public unique: boolean,
                     public descName?: string,
                     public id?: number,
                     public clientId?: string) {
    super(ExtensionType.CAPABILITIES, true, id, clientId);
  }
}

export class DefaultExtension extends AbstractExtension {
  public constructor(public type: ExtensionType,
                     public unique: boolean) {
    super(type, unique, UNINITIALIZED_ID, uuidv4());
  }
}

export class UnknownExtension extends AbstractExtension {
  public constructor(public id?: number, public clientId?: string) {
    super(ExtensionType.UNKNOWN, true, id, clientId);
  }
}

export class CapabilitiesExtension extends AbstractExtension {
  public constructor(public capabilities: string, public id?: number, public clientId?: string) {
    super(ExtensionType.CAPABILITIES, true, id, clientId);
  }
}

export class DRMSystemIdExtension extends AbstractExtension {
  public constructor(public drmSystemId: string, public id?: number, public clientId?: string) {
    super(ExtensionType.DRM_SYSTEM_ID, true, id, clientId);
  }
}

export class ServiceIdExtension extends AbstractExtension {
  public constructor(public serviceId: number, public id?: number, public clientId?: string) {
    super(ExtensionType.SERVICE_ID, true, id, clientId);
  }
}

export enum InetURLType {
  SIGNALING_SERVER = 'SIGNALING_SERVER',
  ESG_SERVER = 'ESG_SERVER',
  USAGE_REPORTING = 'USAGE_REPORTING',
  EVENT = 'EVENT'
}

export const INET_URL_TYPES: Record<InetURLType, DisplayNameType> = {
  [InetURLType.SIGNALING_SERVER]: {displayName: 'Signaling Server'},
  [InetURLType.ESG_SERVER]: {displayName: 'ESG Server'},
  [InetURLType.USAGE_REPORTING]: {displayName: 'Usage Reporting'},
  [InetURLType.EVENT]: {displayName: 'Event'}
};

export class InetURLExtension extends AbstractExtension {
  public constructor(public urlType: InetURLType, public url: number, public id?: number, public clientId?: string) {
    super(ExtensionType.INET_URL, true, id, clientId);
  }
}

export class SimulcastExtension extends AbstractExtension {
  public constructor(public virtual: string, public tsid: number, public major: number, public minor: number,
                     public id?: number,
                     public clientId?: string) {
    super(ExtensionType.SIMULCAST_TSID, true, id, clientId);
  }
}

export enum OtherBSIDType {
  DUPLICATE = 'DUPLICATE', PORTION = 'PORTION'
}

export type DisplayNameWithType = {
  displayName: string,
  bsidType: number
};

export const OTHER_BSID_TYPES: Record<OtherBSIDType, DisplayNameWithType> = {
  [OtherBSIDType.DUPLICATE]: {displayName: 'Duplicate', bsidType: 1},
  [OtherBSIDType.PORTION]: {displayName: 'Portion', bsidType: 2}
};

export enum EssentialType {
  NOT_INDICATED = 'NOT_INDICATED', ESSENTIAL = 'ESSENTIAL', NOT_ESSENTIAL = 'NOT_ESSENTIAL'
}

export const ESSENTIAL_TYPES: Record<EssentialType, DisplayNameType> = {
  [EssentialType.NOT_INDICATED]: {displayName: 'Not Indicated'},
  [EssentialType.ESSENTIAL]: {displayName: 'Essential'},
  [EssentialType.NOT_ESSENTIAL]: {displayName: 'Not Essential'}
};

export class OtherBSIDExtension extends AbstractExtension {
  public constructor(public otherType: OtherBSIDType, public essential: EssentialType, public otherBsids: string,
                     public id?: number, public clientId?: string) {
    super(ExtensionType.OTHER_BSID, true, id, clientId);
  }
}

export class GenreExtension extends AbstractExtension {
  public constructor(public genre: string, public id?: number,
                     public clientId?: string) {
    super(ExtensionType.GENRE, true, id, clientId);
  }
}

export class BroadbandServiceIconExtension extends AbstractExtension {
  public constructor(public url: string, public width: number, public height: number, public mimeType: string,
                     public id?: number, public clientId?: string) {
    super(ExtensionType.BROADBAND_SERVICE_ICON, true, id, clientId);
  }
}

export class BroadcastServiceIconExtension extends AbstractExtension {
  public constructor(public url: string, public id?: number, public clientId?: string) {
    super(ExtensionType.BROADCAST_SERVICE_ICON, true, id, clientId);
  }
}

export class BondedBSIDsExtension extends AbstractExtension {

  public constructor(public bondedBsids: string, public displayBsids?: string, public id?: number,
                     public clientId?: string) {
    super(ExtensionType.BONDED_BSIDS, true, id, clientId);
  }
}

export class DefaultBondedBSIDsExtension extends BondedBSIDsExtension {
  public constructor() {
    super(undefined, '', UNINITIALIZED_ID, uuidv4());
  }
}

export class BaseURLExtension extends AbstractExtension {
  public constructor(public url: string, public id?: number, public clientId?: string) {
    super(ExtensionType.BASE_URL, true, id, clientId);
  }
}

export enum AppServiceType {
  BROADCAST = 'BROADCAST', UNICAST = 'UNICAST'
}

export const APP_SERVICE_TYPE: Record<AppServiceType, DisplayNameType> = {
  [AppServiceType.BROADCAST]: {displayName: 'Broadcast'},
  [AppServiceType.UNICAST]: {displayName: 'Unicast'}
};

export class BasePatternExtension extends AbstractExtension {
  public constructor(public appServiceType: AppServiceType, public pattern: string,
                     public id?: number, public clientId?: string) {
    super(ExtensionType.BASE_PATTERN, true, id, clientId);
  }
}

export class UserDefinedATSC3MessageExtension extends AbstractExtension {
  public constructor(public contentType: number, public compression: number,
                     public hexPayload: string, public id?: number, public clientId?: string) {
    super(ExtensionType.USER_DEFINED_ATSC3_MESSAGE, true, id, clientId);
  }
}

export class CCIExtension extends AbstractExtension {
  public constructor(public cci: string, public count: number, public unique: boolean, public id?: number,
                     public clientId?: string) {
    super(ExtensionType.CCI, unique, id, clientId);
  }
}

export enum PayloadFormat {
  AUTO = 'AUTO',
  FILE = 'FILE',
  ENTITY = 'ENTITY',
  UNSIGNED_PACKAGE = 'UNSIGNED_PACKAGE',
  SIGNED_PACKAGE = 'SIGNED_PACKAGE'
}

export const PAYLOAD_FORMATS: Record<PayloadFormat, DisplayNameType> = {
  [PayloadFormat.AUTO]: {displayName: 'Auto'},
  [PayloadFormat.FILE]: {displayName: 'File'},
  [PayloadFormat.ENTITY]: {displayName: 'Entity'},
  [PayloadFormat.UNSIGNED_PACKAGE]: {displayName: 'Unsigned Package'},
  [PayloadFormat.SIGNED_PACKAGE]: {displayName: 'Signed Package'}
};

export enum PayloadFragmentation {
  ARBITRARY = 'ARBITRARY', MDE_SAMPLES = 'MDE_SAMPLES', MDE_METADATA = 'MDE_METADATA'
}

export const PAYLOAD_FRAGMENTATIONS: Record<PayloadFragmentation, DisplayNameType> = {
  [PayloadFragmentation.ARBITRARY]: {displayName: 'Arbitrary'},
  [PayloadFragmentation.MDE_SAMPLES]: {displayName: 'MDE Samples'},
  [PayloadFragmentation.MDE_METADATA]: {displayName: 'MDE Metadata'}
};

export class CPExtension extends AbstractExtension {
  public constructor(public codePoint: number, public format: PayloadFormat,
                     public fragmentation: PayloadFragmentation,
                     public inOrder: boolean, public srcFECPayloadId: number, public unique: boolean,
                     public id?: number, public clientId?: string) {
    super(ExtensionType.CP, unique, id, clientId);
  }
}

export class LanguageExtension extends AbstractExtension {
  public constructor(public languageCode: string, public id?: number, public clientId?: string) {
    super(ExtensionType.LANGUAGE, true, id, clientId);
  }
}

export class SGDUPassthroughExtension extends AbstractExtension {
  public constructor(public id?: number, public clientId?: string) {
    super(ExtensionType.SGDU_PASSTHROUGH, true, id, clientId);
  }
}
