/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {fieldString, formatTreeItem} from '../../../../utils/TreeUtils';
import {allDefined, isDefined} from '../../../../utils/Utils';

/**
 * @see S33-174r1-Signaling-Delivery-Sync-FEC
 */
export class RouteComponent extends TreeElement {
  public stsidURI: string;
  public dstAddress: string;
  public dstPort: number;
  public srcAddress: string;

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    const idText: string = allDefined(this.dstAddress, this.dstPort) ? `${this.dstAddress}:${this.dstPort}` : '';
    return `Route Component ${idText}`;
  }

  /**
   * HTML-formatted simple contents of this node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('S-TSID URI', this.stsidURI)}
                ${formatTreeItem('destination', `${this.dstAddress}:${this.dstPort}`)}
                ${formatTreeItem('source', this.srcAddress)}
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
      a instanceof RouteComponent &&
      this.stsidURI === a.stsidURI &&
      this.dstAddress === a.dstAddress &&
      this.dstPort === a.dstPort &&
      this.srcAddress === a.srcAddress;
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
                ${fieldString('stsidURI', this.stsidURI, newIndent)}
                ${fieldString('dstAddress', this.dstAddress, newIndent)}
                ${fieldString('dstPort', this.dstPort, newIndent)}
                ${fieldString('srcAddress', this.srcAddress, newIndent)}`;
  }
}
