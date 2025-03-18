/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {
  childrenString,
  fieldString,
  formatTreeItemNumber,
  formatTreeItemString,
  isArrayEmpty
} from '../../../../utils/TreeUtils';
import {isDefined} from '../../../../utils/Utils';
import {AppContextID} from './AppContextID';

export class DistributionWindowDescriptor extends TreeElement {
  public startTime: string;
  public endTime: string;
  public lctTSIRef: string;
  public contentLabel: number;
  public appContextIds: AppContextID[];

  /**
   * Returns `true` if this tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return isArrayEmpty(this.appContextIds);
  }

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return 'Distribution Window Descriptor';
  }

  /**
   * HTML-formatted simple contents of this node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItemString('start time', this.startTime)}
                ${formatTreeItemString('end time', this.endTime)}
                ${formatTreeItemString('LCT TSI Refs', this.lctTSIRef)}
                ${formatTreeItemNumber('content label', this.contentLabel)}
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
      a instanceof DistributionWindowDescriptor &&
      this.startTime === a.startTime &&
      this.endTime === a.endTime &&
      this.lctTSIRef === a.lctTSIRef &&
      this.contentLabel === a.contentLabel &&
      AppContextID.isEqualArray(this.appContextIds, a.appContextIds);
  }

  /**
   * Return a human-readable string useful for debugging.
   *
   * @param {string} indent - indent size for children
   * @returns {string} - human-readable string representation of this object
   */
  public toString(indent: string): string {
    const newIndent = `${indent}  `;
    return `${indent}${this.nodeTitle()}:
                ${fieldString('startTime', this.startTime, newIndent)}
                ${fieldString('endTime', this.endTime, newIndent)}
                ${fieldString('lctTSIRef', this.lctTSIRef, newIndent)}
                ${fieldString('contentLabel', this.contentLabel, newIndent)}
                ${childrenString('appContextIds', this.appContextIds, newIndent)}`;
  }
}
