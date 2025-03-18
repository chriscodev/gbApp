// Copyright (c) 2023 Triveni Digital, Inc. All rights reserved.

/* tslint:disable:no-redundant-jsdoc */

import {URLType} from './URLType';

/**
 * TODO
 *
 * @see [[URLType]]
 * @see ts/Tests/MPDTests.ts
 */
export class RepresentationIndex extends URLType {
  public clone(): RepresentationIndex {
    const result: RepresentationIndex = new RepresentationIndex();
    result.sourceURL = this.sourceURL;
    result.range = this.range;

    return result;
  }
}
