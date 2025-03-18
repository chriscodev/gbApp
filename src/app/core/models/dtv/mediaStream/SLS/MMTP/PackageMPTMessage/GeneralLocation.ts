/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {fieldString, formatInt, formatTreeItem} from '../../../../utils/TreeUtils';
import {isDefined, isUndefined} from '../../../../utils/Utils';

/**
 * @see S33-174r1-Signaling-Delivery-Sync-FEC
 */
export class GeneralLocation extends TreeElement {
  public locationType: string;
  public packetID: number;
  public messageID: number;
  public networkID: number;
  public tsid: number;
  public mpeg2PID: number;
  public ipSourceAddress?: string;
  public ipDestinationAddress?: string;
  public destinationPort: number;

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return `General Location ${this.packetID ?? ''}`;
  }

  /**
   * HTML-formatted simple contents of this node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('location type', this.locationType)}
                ${formatTreeItem('packet ID', formatInt(this.packetID))}
                ${formatTreeItem('message ID', formatInt(this.messageID))}
                ${formatTreeItem('network ID', formatInt(this.networkID))}
                ${formatTreeItem('TSID', formatInt(this.tsid))}
                ${formatTreeItem('MPEG2 PID', formatInt(this.mpeg2PID))}
                ${formatTreeItem('source address', this.ipSourceAddress)}
                ${formatTreeItem('destination address', this.ipDestinationAddress)}
                ${formatTreeItem('destination port', formatInt(this.destinationPort))}
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
      a instanceof GeneralLocation &&
      this.locationType === a.locationType &&
      this.packetID === a.packetID &&
      this.messageID === a.messageID &&
      this.networkID === a.networkID &&
      this.tsid === a.tsid &&
      this.mpeg2PID === a.mpeg2PID &&
      this.destinationPort === a.destinationPort &&
      this.ipSourceAddress === a.ipSourceAddress &&
      this.ipDestinationAddress === a.ipDestinationAddress;
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
                ${fieldString('locationType', this.locationType, newIndent)}
                ${fieldString('packetID', this.packetID, newIndent)}
                ${fieldString('messageID', this.messageID, newIndent)}
                ${fieldString('networkID', this.networkID, newIndent)}
                ${fieldString('tsid', this.tsid, newIndent)}
                ${fieldString('mpeg2PID', this.mpeg2PID, newIndent)}
                ${fieldString('destinationPort', this.destinationPort, newIndent)}`;
  }
}
