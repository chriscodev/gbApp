/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {isDefined} from '../../core/models/dtv/utils/Utils';

export function date1BeforeDate2( d1: Date, d2: Date ): boolean
{
  if (!isDefined( d1 ) || !isDefined( d2 ) ) {
    return true;
  }
  return d2 > d1;
}
