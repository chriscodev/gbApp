/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {fieldString, formatTreeItem} from '../../../../utils/TreeUtils';
import {isDefined} from '../../../../utils/Utils';

export class MPUComponent extends TreeElement {
  public mmtPackageID: string;

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return `MPU Component ${this.mmtPackageID ?? ''}`;
  }

  /**
   * HTML-formatted simple contents of this MPD tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this MPD tree node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('MMT Package ID', this.mmtPackageID)}
              </ul>`;
  }

  /**
   * Returns `true` if the object is deep equal to this.
   *
   * @param {TreeElement} a - object to compare to
   * @returns {boolean} true if a === b
   */
  public isEqual(a: TreeElement): boolean {
    return isDefined(a) &&
      a instanceof MPUComponent &&
      this.mmtPackageID === a.mmtPackageID;
  }

  /**
   * Return a human-readable string useful for debugging.
   *
   * @param {string} indent
   * @returns {string}
   */
  public toString(indent: string): string {
    const newIndent = `${indent}  `;
    return `${indent}${this.nodeTitle()}:
                ${fieldString('mmtPackageId', this.mmtPackageID, newIndent)}`;
  }
}
