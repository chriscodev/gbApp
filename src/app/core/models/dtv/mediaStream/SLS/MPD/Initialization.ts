// Copyright (c) 2023 Triveni Digital, Inc. All rights reserved.

/* tslint:disable:no-redundant-jsdoc */

import {URLType} from './URLType';

/**
 * TODO
 *
 * @see [[URLType]]
 * @see ts/Tests/MPDTests.ts
 */
export class Initialization extends URLType {
  public clone(): Initialization {
    const result: Initialization = new Initialization();
    result.sourceURL = this.sourceURL;
    result.range = this.range;

    return result;
  }
}
