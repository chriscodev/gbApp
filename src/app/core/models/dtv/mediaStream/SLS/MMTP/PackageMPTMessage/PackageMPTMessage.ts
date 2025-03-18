/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {childrenString, fieldString, formatInt, formatTreeItem} from '../../../../utils/TreeUtils';
import {isDefined, isUndefined} from '../../../../utils/Utils';
import {MPTable} from './MPTable';

/**
 * @see S33-174r1-Signaling-Delivery-Sync-FEC
 */
export class PackageMPTMessage extends TreeElement {
  public messageID: number;
  public version: number;
  public mpTable: MPTable;

  /**
   * Returns `true` if this tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return isUndefined(this.mpTable);
  }

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return 'Package MPT Message';
  }

  /**
   * HTML-formatted simple contents of this node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('message ID', formatInt(this.messageID))}
                ${formatTreeItem('version', formatInt(this.version))}
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
      a instanceof PackageMPTMessage &&
      this.messageID === a.messageID &&
      this.version === a.version &&
      this.mpTable === a.mpTable;
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
                ${fieldString('messageID', this.messageID, newIndent)}
                ${fieldString('version', this.version, newIndent)}
                ${childrenString('mpTable', this.mpTable, newIndent)}`;
  }
}


