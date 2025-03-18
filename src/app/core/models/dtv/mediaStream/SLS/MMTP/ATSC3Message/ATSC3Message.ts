/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {fieldString, formatInt, formatTreeItem} from '../../../../utils/TreeUtils';
import {isDefined} from '../../../../utils/Utils';

/**
 * @see S33-174r1-Signaling-Delivery-Sync-FEC 7.2.3.1 mmt_atsc3_message() MMT Signaling Message
 */
export class ATSC3Message extends TreeElement {
  public messageID: number;
  public version: number;
  public serviceID: number;
  public contentType: string;
  public contentVersion: number;
  public contentCompression: string;

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return 'ATSC3 Message';
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
                ${formatTreeItem('service ID', formatInt(this.serviceID))}
                ${formatTreeItem('content type', this.contentType)}
                ${formatTreeItem('content version', formatInt(this.contentVersion))}
                ${formatTreeItem('content compression', this.contentCompression)}
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
      a instanceof ATSC3Message &&
      this.messageID === a.messageID &&
      this.version === a.version &&
      this.serviceID === a.serviceID &&
      this.contentType === a.contentType &&
      this.contentVersion === a.contentVersion &&
      this.contentCompression === a.contentCompression;
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
                ${fieldString('serviceID', this.serviceID, newIndent)}
                ${fieldString('contentType', this.contentType, newIndent)}
                ${fieldString('contentVersion', this.contentVersion, newIndent)}
                ${fieldString('contentCompression', this.contentCompression, newIndent)}`;
  }
}

