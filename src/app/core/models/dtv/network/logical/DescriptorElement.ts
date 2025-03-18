/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {AbstractElement, DisplayNameType, UNINITIALIZED_ID} from '../../../AbstractElement';
import {Program} from '../physical/stream/mpeg/Program';
import {v4 as uuidv4} from 'uuid';
export enum MPEG2DescriptorTag {
    REGISTRATION = 'REGISTRATION',
    DATA_STREAM_ALIGNMENT = 'DATA_STREAM_ALIGNMENT',
    CONDITIONAL_ACCESS = 'CONDITIONAL_ACCESS',
    LANGUAGE = 'LANGUAGE',
    SMOOTHING_BUFFER = 'SMOOTHING_BUFFER',
    STD = 'STD',
    USER_DEFINED = 'USER_DEFINED'
}

export const MPEG2_DESCRIPTOR_TAGS: Record<MPEG2DescriptorTag, DisplayNameType> = {
    [MPEG2DescriptorTag.REGISTRATION]: {displayName: 'Registration'},
    [MPEG2DescriptorTag.DATA_STREAM_ALIGNMENT]: {displayName: 'Data Stream Alignment'},
    [MPEG2DescriptorTag.CONDITIONAL_ACCESS]: {displayName: 'Conditional Access Descriptor'},
    [MPEG2DescriptorTag.LANGUAGE]: {displayName: 'Language'},
    [MPEG2DescriptorTag.SMOOTHING_BUFFER]: {displayName: 'Smoothing Buffer'},
    [MPEG2DescriptorTag.STD]: {displayName: 'STD'},
    [MPEG2DescriptorTag.USER_DEFINED]: {displayName: 'User Defined'}
};

export enum ATSCDescriptorTag {
    STUFFING = 'STUFFING',
    AC_3_AUDIO = 'AC_3_AUDIO',
    CAPTION_SERVICE = 'CAPTION_SERVICE',
    CONTENT_ADVISORY = 'CONTENT_ADVISORY',
    EXTENDED_CHANNEL_NAME = 'EXTENDED_CHANNEL_NAME',
    SERVICE_LOCATION = 'SERVICE_LOCATION',
    TIME_SHIFTED_SERVICE = 'TIME_SHIFTED_SERVICE',
    COMPONENT_NAME = 'COMPONENT_NAME',
    REDISTRIBUTION_CONTROL = 'REDISTRIBUTION_CONTROL',
    GENRE = 'GENRE',
    PRIVATE_INFORMATION = 'PRIVATE_INFORMATION',
    PROTOCOL_VERSION = 'PROTOCOL_VERSION',
    NRT_SERVICE = 'NRT_SERVICE',
    CAPABILITIES = 'CAPABILITIES'
}

export const ATSC_DESCRIPTOR_TAGS: Record<ATSCDescriptorTag, DisplayNameType> = {
    [ATSCDescriptorTag.STUFFING]: {displayName: 'Stuffing'},
    [ATSCDescriptorTag.AC_3_AUDIO]: {displayName: 'AC-3 Audio'},
    [ATSCDescriptorTag.CAPTION_SERVICE]: {displayName: 'Caption Service'},
    [ATSCDescriptorTag.CONTENT_ADVISORY]: {displayName: 'Content Advisory'},
    [ATSCDescriptorTag.EXTENDED_CHANNEL_NAME]: {displayName: 'Extended Channel Name'},
    [ATSCDescriptorTag.SERVICE_LOCATION]: {displayName: 'Service Location'},
    [ATSCDescriptorTag.TIME_SHIFTED_SERVICE]: {displayName: 'Time Shifted Service'},
    [ATSCDescriptorTag.COMPONENT_NAME]: {displayName: 'Componet Name'},
    [ATSCDescriptorTag.REDISTRIBUTION_CONTROL]: {displayName: 'Redistribution Control'},
    [ATSCDescriptorTag.GENRE]: {displayName: 'Genre'},
    [ATSCDescriptorTag.PRIVATE_INFORMATION]: {displayName: 'ATSC Private Information'},
    [ATSCDescriptorTag.PROTOCOL_VERSION]: {displayName: 'Protocol Version'},
    [ATSCDescriptorTag.NRT_SERVICE]: {displayName: 'NRT Service'},
    [ATSCDescriptorTag.CAPABILITIES]: {displayName: 'Capabilities'}
};

export enum ATSC3DescriptorTag {
    SERVICE_PREVIEW = 'SERVICE_PREVIEW', SERVICE_CAPABILITIES = 'SERVICE_CAPABILITIES'
}

export const ATSC3_DESCRIPTOR_TAGS: Record<ATSC3DescriptorTag, DisplayNameType> = {
    [ATSC3DescriptorTag.SERVICE_PREVIEW]: {displayName: 'Service Icon'},
    [ATSC3DescriptorTag.SERVICE_CAPABILITIES]: {displayName: 'Capabilities'}
};

export class DescriptorElement extends AbstractElement {
    public constructor(
                       public tag: number,
                       public editable: boolean,
                       public descName?: string,
                       public formatIdentifier?: string,
                       public privateData?: string,
                       public userTag?: string,
                       public payload?: string,
                       public longChannelName?: string,
                       public pid?: string,
                       public systemId?: string,
                       public name?: string,
                       public id?: number,
                       public clientId?: string) {
        super(id, clientId);
    }
}

export class Descriptor extends DescriptorElement {
    public constructor() {
        super(0, false);
    }
}

export class DefaultDescriptor extends DescriptorElement {
  public constructor(public tag: number,
                     public editable: boolean) {
    super(tag, editable, '', '', '', '', '', '', '', '', '', UNINITIALIZED_ID, uuidv4());
  }
}
