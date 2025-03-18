/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {AudioServiceType} from '../../../../../common/AudioDescription';
import {AudioPriority} from './AudioPriority';
import {SampleRate} from './SampleRate';
import {SurroundMode} from './SurroundMode';
import {AudioBitRate} from './AudioBitRate';
import {AudioCoding} from './AudioCoding';
import {ElementaryStream, ElementaryStreamType} from '../ElementaryStream';
import {DisplayNameType, UNINITIALIZED_ID} from '../../../../../../AbstractElement';
import {DefaultLanguage, Language} from '../../../../../common/Language';

export enum FullServiceType {
  COMPLETE = 'COMPLETE',
  PARTIAL = 'PARTIAL'
}

export const FULL_SERVICE_TYPES: Record<FullServiceType, DisplayNameType> = {
  [FullServiceType.COMPLETE]: {displayName: 'Complete'},
  [FullServiceType.PARTIAL]: {displayName: 'Partial'}
};

export class AC3ElementaryStream extends ElementaryStream {
  public constructor(public audioId: number, public bitStreamId: number, public audioServiceType: AudioServiceType,
                     public priority: AudioPriority, public mainServiceId: number,
                     public associatedServiceId: number, public sampleRate: SampleRate,
                     public surroundMode: SurroundMode, public fullService: boolean, public description: string,
                     public language: Language, public exactBitRate: boolean, public bitRate: AudioBitRate,
                     public useNumberOfChannels: boolean, public audioCoding: AudioCoding,
                     public numberOfChannels: number,
                     public pid: number, public id?: number) {
    super(ElementaryStreamType.STANDARD_ATSC_52_AC3, pid, id);
  }
}

export class DefaultAC3ElementaryStream extends AC3ElementaryStream {
  public constructor(public audioId: number, public mainServiceId: number) {
    super(audioId, 8, AudioServiceType.COMPLETE_MAIN, AudioPriority.NOT_SPECIFIED, mainServiceId, 0,
      SampleRate.kHz48, SurroundMode.NOT_INDICATED, true, '', new DefaultLanguage(), false, AudioBitRate.K384,
      false, AudioCoding.LEFT_RIGHT, 0, undefined, UNINITIALIZED_ID);
  }
}
