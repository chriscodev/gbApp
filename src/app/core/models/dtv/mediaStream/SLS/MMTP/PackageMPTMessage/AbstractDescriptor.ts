/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {isDefined} from '../../../../utils/Utils';

export abstract class AbstractDescriptor extends TreeElement {
  public tag: number;

  protected constructor(tag: number) {
    super();
    this.tag = tag;
  }

  /**
   * Returns `true` if the object is deep equal to this.
   *
   * @param {TreeElement} a - object to compare to
   * @returns {boolean} true if a === b
   */
  public isEqual(a: TreeElement): boolean {
    return isDefined(a) &&
      a instanceof AbstractDescriptor &&
      this.tag === a.tag;
  }
}
