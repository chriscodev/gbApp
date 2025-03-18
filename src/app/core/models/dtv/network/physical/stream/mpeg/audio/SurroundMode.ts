/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {DisplayNameType} from '../../../../../../AbstractElement';

export enum SurroundMode {
  NOT_INDICATED = 'NOT_INDICATED', NOT_DOLBY_ENCODED = 'NOT_DOLBY_ENCODED', DOLBY_ENCODED = 'DOLBY_ENCODED'
}

export const SURROUND_MODES: Record<SurroundMode, DisplayNameType> = {
  [SurroundMode.NOT_INDICATED]: {displayName: 'Not Indicated'},
  [SurroundMode.NOT_DOLBY_ENCODED]: {displayName: 'Not Dolby Surround Encoded'},
  [SurroundMode.DOLBY_ENCODED]: {displayName: 'Dolby Surround Encoded'}
};
