/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {DisplayNameType} from '../../../../../../AbstractElement';

export enum SampleRate {
  kHz48 = 'kHz48',
  kHz44_1 = 'kHz44_1',
  kHz32 = 'kHz32',
  kHz48_kHz44 = 'kHz48_kHz44',
  kHz48_kHz32 = 'kHz48_kHz32',
  kHz44_kHz32 = 'kHz44_kHz32',
  kHz48_kHz44_kHz32 = 'kHz48_kHz44_kHz32'
}

export const AUDIO_SAMPLE_RATES: Record<SampleRate, DisplayNameType> = {
  [SampleRate.kHz48]: {displayName: '48kHz'},
  [SampleRate.kHz44_1]: {displayName: '44.1kHz'},
  [SampleRate.kHz32]: {displayName: '32kHz'},
  [SampleRate.kHz48_kHz44]: {displayName: '48kHz or 44.1kHz'},
  [SampleRate.kHz48_kHz32]: {displayName: '48kHz or 32kHz'},
  [SampleRate.kHz44_kHz32]: {displayName: '44.1kHz or 32kHz'},
  [SampleRate.kHz48_kHz44_kHz32]: {displayName: '48kHz, 44.1kHz, or 32kHz'}
};
