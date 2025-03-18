/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {isDefined} from '../../core/models/dtv/utils/Utils';

export function inRangeCheck(value: number, min: number, max: number): boolean {
    const nonEmpty = isDefined(value) && value.toString().length > 0;
    return nonEmpty ? value >= min && value <= max : false;
}
