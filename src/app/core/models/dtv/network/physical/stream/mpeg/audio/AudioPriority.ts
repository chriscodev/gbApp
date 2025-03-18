/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {DisplayNameType} from '../../../../../../AbstractElement';

export enum AudioPriority {
  PRIMARY = 'PRIMARY', OTHER = 'OTHER', NOT_SPECIFIED = 'NOT_SPECIFIED'
}

export const AUDIO_PRIORITIES: Record<AudioPriority, DisplayNameType> = {
  [AudioPriority.PRIMARY]: {displayName: 'Primary Audio'},
  [AudioPriority.OTHER]: {displayName: 'Other Audio'},
  [AudioPriority.NOT_SPECIFIED]: {displayName: 'Not Specified'}
};
