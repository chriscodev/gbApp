/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {fieldString, formatTreeItem} from '../../../../utils/TreeUtils';
import {isUndefined} from '../../../../utils/Utils';

/**
 * @see S33-174r1-Signaling-Delivery-Sync-FEC
 */
export class AssetID extends TreeElement {
  public assetIDScheme: string;
  public assetIDValue: string;

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return `Asset ID ${this.assetIDValue ?? ''}`;
  }

  /**
   * HTML-formatted simple contents of this node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('asset ID scheme', this.assetIDScheme)}
                ${formatTreeItem('asset ID value', this.assetIDValue)}
              </ul>`;
  }

  /**
   * Returns `true` if the object is deep equal to this.
   *
   * @param {TreeElement} a - object to compare to
   * @returns {boolean} true if a === b
   */
  public isEqual(a: TreeElement): boolean {
    return isUndefined(a) &&
      a instanceof AssetID &&
      this.assetIDScheme === a.assetIDScheme &&
      this.assetIDValue === a.assetIDValue;
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
                ${fieldString('assetIDScheme', this.assetIDScheme, newIndent)}
                ${fieldString('assetIDValue', this.assetIDValue, newIndent)}`;
  }
}

