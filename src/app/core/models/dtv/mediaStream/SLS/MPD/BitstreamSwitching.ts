// Copyright (c) 2023 Triveni Digital, Inc. All rights reserved.

import {URLType} from './URLType';

/**
 * TODO
 *
 * @see [[URLType]]
 * @see ts/Tests/MPDTests.ts
 */
export class BitstreamSwitching extends URLType {
  public clone(): BitstreamSwitching {
    const result: BitstreamSwitching = new BitstreamSwitching();
    result.sourceURL = this.sourceURL;
    result.range = this.range;

    return result;
  }
}
