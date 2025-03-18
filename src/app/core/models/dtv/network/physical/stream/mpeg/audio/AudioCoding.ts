/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {DisplayNameType} from '../../../../../../AbstractElement';

export enum AudioCoding {
  DUAL_MONO = 'DUAL_MONO',
  CENTER_MONO = 'CENTER_MONO',
  LEFT_RIGHT = 'LEFT_RIGHT',
  LEFT_CENTER_RIGHT = 'LEFT_CENTER_RIGHT',
  LEFT_RIGHT_SURROUND = 'LEFT_RIGHT_SURROUND',
  LEFT_CENTER_RIGHT_SURROUND = 'LEFT_CENTER_RIGHT_SURROUND',
  LEFT_RIGHT_SL_SR = 'LEFT_RIGHT_SL_SR',
  LEFT_CENTER_RIGHT_SL_SR = 'LEFT_CENTER_RIGHT_SL_SR'
}

export const AUDIO_CODINGS: Record<AudioCoding, DisplayNameType> = {
  [AudioCoding.DUAL_MONO]: {displayName: 'Dual Moni'},
  [AudioCoding.CENTER_MONO]: {displayName: 'Center Mono'},
  [AudioCoding.LEFT_RIGHT]: {displayName: 'Left/Right'},
  [AudioCoding.LEFT_CENTER_RIGHT]: {displayName: 'Left/Center/Right'},
  [AudioCoding.LEFT_RIGHT_SURROUND]: {displayName: 'Left/Right/Surround'},
  [AudioCoding.LEFT_CENTER_RIGHT_SURROUND]: {displayName: 'Left/Center/Right/Surround'},
  [AudioCoding.LEFT_RIGHT_SL_SR]: {displayName: 'Left/Right/Surround-Left/Surround-Right'},
  [AudioCoding.LEFT_CENTER_RIGHT_SL_SR]: {displayName: 'Left/Center/Right/Surround-Left/Surround-Right'}
};
