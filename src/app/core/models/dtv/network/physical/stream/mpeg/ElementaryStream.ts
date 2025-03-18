/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {AbstractElement, DisplayNameType, UNINITIALIZED_ID} from '../../../../../AbstractElement';
import {isDefined} from '../../../../utils/Utils';
import {v4 as uuidv4} from 'uuid';

export enum ElementaryStreamType {
    STANDARD_13818_2_VIDEO = 'STANDARD_13818_2_VIDEO',
    STANDARD_ATSC_52_AC3 = 'STANDARD_ATSC_52_AC3',
    STANDARD_13818_1_PES = 'STANDARD_13818_1_PES',
    ITU_T_ISO_IEC_Reserved = 'ITU_T_ISO_IEC_Reserved',
    STANDARD_11172_2_VIDEO = 'STANDARD_11172_2_VIDEO',
    STANDARD_11172_3_AUDIO = 'STANDARD_11172_3_AUDIO',
    STANDARD_13818_3_AUDIO = 'STANDARD_13818_3_AUDIO',
    STANDARD_13818_1_PRIVATE = 'STANDARD_13818_1_PRIVATE',
    STANDARD_13522_MHEG = 'STANDARD_13522_MHEG',
    STANDARD_DSM_CC = 'STANDARD_DSM_CC',
    STANDARD_H_222_1 = 'STANDARD_H_222_1',
    STANDARD_13818_6_TYPE_A = 'STANDARD_13818_6_TYPE_A',
    STANDARD_13818_6_TYPE_B = 'STANDARD_13818_6_TYPE_B',
    STANDARD_13818_6_TYPE_C = 'STANDARD_13818_6_TYPE_C',
    STANDARD_13818_6_TYPE_D = 'STANDARD_13818_6_TYPE_D',
    STANDARD_13818_1_AUX = 'STANDARD_13818_1_AUX',
    STANDARD_13818_7_ADTS = 'STANDARD_13818_7_ADTS',
    STANDARD_14496_2_VISUAL = 'STANDARD_14496_2_VISUAL',
    STANDARD_14496_3_LATM = 'STANDARD_14496_3_LATM',
    STANDARD_14496_1_PES = 'STANDARD_14496_1_PES',
    STANDARD_14496_1_SECTIONS = 'STANDARD_14496_1_SECTIONS',
    STANDARD_13818_6_SDP = 'STANDARD_13818_6_SDP',
    STANDARD_14496_H264 = 'STANDARD_14496_H264',
    STANDARD_23008_HEVC = 'STANDARD_23008_HEVC',
    STANDARD_ATSC_90 = 'STANDARD_ATSC_90',
    STANDARD_ATSC_90_PES = 'STANDARD_ATSC_90_PES',
    STANDARD_13818_1_RESERVED = 'STANDARD_13818_1_RESERVED',
    SCTE_35_SPLICE_INFO = 'SCTE_35_SPLICE_INFO',
    USER_PRIVATE = 'USER_PRIVATE'
}

export const ELEMENTARY_STREAM_TYPES: Record<ElementaryStreamType, DisplayNameType> = {
    [ElementaryStreamType.STANDARD_13818_2_VIDEO]: {displayName: 'MPEG-2 (ISO/IEC 13818-2)'},
    [ElementaryStreamType.STANDARD_ATSC_52_AC3]: {displayName: 'AC-3 Audio'},
    [ElementaryStreamType.STANDARD_13818_1_PES]: {displayName: 'ISO/IEC 13818-1 private PES packets'},
    [ElementaryStreamType.ITU_T_ISO_IEC_Reserved]: {displayName: 'ISO/IEC Reserved'},
    [ElementaryStreamType.STANDARD_11172_2_VIDEO]: {displayName: 'ISO/IEC 11172 Video'},
    [ElementaryStreamType.STANDARD_11172_3_AUDIO]: {displayName: 'ISO/IEC 11172 Audio'},
    [ElementaryStreamType.STANDARD_13818_3_AUDIO]: {displayName: 'ISO/IEC 13818-3 Audio'},
    [ElementaryStreamType.STANDARD_13818_1_PRIVATE]: {displayName: 'ISO/IEC 13818-1 private sections'},
    [ElementaryStreamType.STANDARD_13522_MHEG]: {displayName: 'ISO/IEC 13522 MHEG'},
    [ElementaryStreamType.STANDARD_DSM_CC]: {displayName: 'ISO/IEC 13818-1 Annex A DSM-CC'},
    [ElementaryStreamType.STANDARD_H_222_1]: {displayName: 'ITU-T Rec. H.222.1'},
    [ElementaryStreamType.STANDARD_13818_6_TYPE_A]: {displayName: 'ISO/IEC 13818-6 type A'},
    [ElementaryStreamType.STANDARD_13818_6_TYPE_B]: {displayName: 'ISO/IEC 13818-6 type B'},
    [ElementaryStreamType.STANDARD_13818_6_TYPE_C]: {displayName: 'ISO/IEC 13818-6 type C'},
    [ElementaryStreamType.STANDARD_13818_6_TYPE_D]: {displayName: 'ISO/IEC 13818-6 type D'},
    [ElementaryStreamType.STANDARD_13818_1_AUX]: {displayName: 'ISO/IEC 13818-1 auxiliary'},
    [ElementaryStreamType.STANDARD_13818_7_ADTS]: {displayName: 'ISO/IEC 13818-7 ADTS Audio'},
    [ElementaryStreamType.STANDARD_14496_2_VISUAL]: {displayName: 'MPEG-4 Part 2 (ISO/IEC 14496-2)'},
    [ElementaryStreamType.STANDARD_14496_3_LATM]: {displayName: 'ISO/IEC 14496-3 LATM'},
    [ElementaryStreamType.STANDARD_14496_1_PES]: {displayName: 'ISO/IEC 14496-1 PES packets'},
    [ElementaryStreamType.STANDARD_14496_1_SECTIONS]: {displayName: 'ISO/IEC 14496-1 Sections'},
    [ElementaryStreamType.STANDARD_13818_6_SDP]: {displayName: 'ISO/IEC 13818-6 Synchronized Download Protocol'},
    [ElementaryStreamType.STANDARD_14496_H264]: {displayName: 'H.264 (ISO/IEC 14496-10)'},
    [ElementaryStreamType.STANDARD_23008_HEVC]: {displayName: 'HEVC (ITU-T Rec. H.265 and ISO/IEC 23008-2)'},
    [ElementaryStreamType.STANDARD_ATSC_90]: {displayName: 'A/90 Data Service & Network Table'},
    [ElementaryStreamType.STANDARD_ATSC_90_PES]: {displayName: 'A/90 PES synchronous data'},
    [ElementaryStreamType.STANDARD_13818_1_RESERVED]: {displayName: 'ISO/IEC 13818-1 Reserved'},
    [ElementaryStreamType.SCTE_35_SPLICE_INFO]: {displayName: 'SCTE 35 Splice Info'},
    [ElementaryStreamType.USER_PRIVATE]: {displayName: 'User Private'}
};

export class ElementaryStream extends AbstractElement {
    public constructor(
        public streamType: ElementaryStreamType, public pid?: number, public id?: number) {
        super(id, isDefined(id) && id > 0 ? undefined : uuidv4());
    }
}

export function isAC3Stream(elementaryStream: ElementaryStream): boolean {
    return elementaryStream.streamType === ElementaryStreamType.STANDARD_ATSC_52_AC3;
}

export class DefaultElementaryStream extends ElementaryStream {
    public constructor(public streamType: ElementaryStreamType) {
        super(streamType, undefined, UNINITIALIZED_ID);
    }
}
