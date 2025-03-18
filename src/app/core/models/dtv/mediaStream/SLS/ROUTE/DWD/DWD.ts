/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {childrenString, isArrayEmpty} from '../../../../utils/TreeUtils';
import {isDefined} from '../../../../utils/Utils';
import {DistributionWindowDescriptor} from './DistributionWindowDescriptor';

/**
 * Distribution Window Description
 *
 * Provides the broadcast delivery schedule of NRT files associated with broadcaster applications,
 * and additional metadata such as Filter Codes that enable selective content reception,
 * identification of the application to which the application-related files belong, and the specific
 * collection of files delivered during a given distribution window instance.
 *
 * @see A/337
 */

export class DWD extends TreeElement {
  public distributionWindowDescriptors: DistributionWindowDescriptor[];

  /**
   * Returns `true` if this tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return isArrayEmpty(this.distributionWindowDescriptors);
  }

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return 'DWD';
  }

  /**
   * HTML-formatted simple contents of this node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this node.
   */
  public treeNodeText(): string {
    return '';
  }

  /**
   * Returns `true` if the object is deep equal to this.
   *
   * @param {TreeElement} a - object to compare to
   * @returns {boolean} true if a === b
   */
  public isEqual(a: TreeElement): boolean {
    return isDefined(a) &&
      a instanceof DWD &&
      DistributionWindowDescriptor.isEqualArray(this.distributionWindowDescriptors,
        a.distributionWindowDescriptors);
  }

  public toString(indent: string): string {
    return `${indent}${this.nodeTitle()}:
                ${childrenString('distributionWindowDescriptors', this.distributionWindowDescriptors, `${indent}  `)}`;
  }
}
