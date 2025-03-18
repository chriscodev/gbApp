/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {childrenString, fieldString, formatInt, formatTreeItem, isArrayEmpty} from '../../../../utils/TreeUtils';
import {isDefined} from '../../../../utils/Utils';
import {AssetEntry} from './AssetEntry';

/**
 * @see S33-174r1-Signaling-Delivery-Sync-FEC
 */
export class MPTable extends TreeElement {
  public tableID: number;
  public version: number;
  public tableMode: string;
  public packageID: string;
  public assetEntries: AssetEntry[];

  /**
   * Returns `true` if this tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return isArrayEmpty(this.assetEntries);
  }

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return `MP Table ${(this.packageID ?? '')}`;
  }

  /**
   * HTML-formatted simple contents of this node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('table ID', formatInt(this.tableID))}
                ${formatTreeItem('version', formatInt(this.version))}
                ${formatTreeItem('table mode', this.tableMode)}
                ${formatTreeItem('package ID', this.packageID)}
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
      a instanceof MPTable &&
      this.tableID === a.tableID &&
      this.version === a.version &&
      this.tableMode === a.tableMode &&
      this.packageID === a.packageID &&
      AssetEntry.isEqualArray(this.assetEntries, a.assetEntries);
  }

  /**
   * Return a human-readable string useful for debugging.
   *
   * @param {string} indent - indent size for children
   * @returns {string} - human-readable string representation of this object
   */
  public toString(indent: string): string {
    const newIndent: string = `${indent}  `;
    return `${indent}${this.nodeTitle()}:
                ${fieldString('tableID', this.tableID, newIndent)}
                ${fieldString('version', this.version, newIndent)}
                ${fieldString('tableMode', this.tableMode, newIndent)}
                ${fieldString('packageID', this.packageID, newIndent)}
                ${childrenString('assetEntries', this.assetEntries, newIndent)}`;
  }
}


