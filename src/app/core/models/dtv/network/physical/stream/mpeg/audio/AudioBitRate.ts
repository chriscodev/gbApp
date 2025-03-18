/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {DisplayNameType} from '../../../../../../AbstractElement';

export enum AudioBitRate {
    K32 = 'K32',
    K40 = 'K40',
    K48 = 'K48',
    K56 = 'K56',
    K64 = 'K64',
    K80 = 'K80',
    K96 = 'K96',
    K112 = 'K112',
    K128 = 'K128',
    K160 = 'K160',
    K192 = 'K192',
    K224 = 'K224',
    K256 = 'K256',
    K320 = 'K320',
    K384 = 'K384',
    K448 = 'K448',
    K512 = 'K512',
    K576 = 'K576',
    K640 = 'K640'
}

export const AUDIO_BITRATES: Record<AudioBitRate, DisplayNameType> = {
    [AudioBitRate.K32]: {displayName: '32 kbps'},
    [AudioBitRate.K40]: {displayName: '40 kbps'},
    [AudioBitRate.K48]: {displayName: '48 kbps'},
    [AudioBitRate.K56]: {displayName: '56 kbps'},
    [AudioBitRate.K64]: {displayName: '64 kbps'},
    [AudioBitRate.K80]: {displayName: '80 kbps'},
    [AudioBitRate.K96]: {displayName: '96 kbps'},
    [AudioBitRate.K112]: {displayName: '112 kbps'},
    [AudioBitRate.K128]: {displayName: '128 kbps'},
    [AudioBitRate.K160]: {displayName: '160 kbps'},
    [AudioBitRate.K192]: {displayName: '192 kbps'},
    [AudioBitRate.K224]: {displayName: '224 kbps'},
    [AudioBitRate.K256]: {displayName: '256 kbps'},
    [AudioBitRate.K320]: {displayName: '320 kbps'},
    [AudioBitRate.K384]: {displayName: '384 kbps'},
    [AudioBitRate.K448]: {displayName: '448 kbps'},
    [AudioBitRate.K512]: {displayName: '512 kbps'},
    [AudioBitRate.K576]: {displayName: '576 kbps'},
    [AudioBitRate.K640]: {displayName: '640 kbps'}
};
