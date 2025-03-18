/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {appendChildString, appendFieldString, formatTreeItem, isArrayEmpty} from '../../../../utils/TreeUtils';
import {isDefined, isUndefined} from '../../../../utils/Utils';
import {LCTChannel} from './LCTChannel';

/**
 *
 * XSD
 * ~~~~
 *  <xs:complexType name="rSessionType">
 *    <xs:sequence>
 *      <xs:element name="LS" type="stsid:lSessionType" maxOccurs="unbounded"/>
 *      <xs:any namespace="##other" processContents="strict" minOccurs="0" maxOccurs="unbounded"/>
 *    </xs:sequence>
 *    <xs:attribute name="sIpAddr" type="stsid:IPv4addressType"/>
 *    <xs:attribute name="dIpAddr" type="stsid:IPv4addressType"/>
 *    <xs:attribute name="dPort" type="stsid:PortType"/>
 *    <xs:anyAttribute processContents="strict"/>
 *  </xs:complexType>
 *
 *  <xs:simpleType name="IPv4addressType">
 *    <xs:restriction base="xs:token">
 *      <xs:pattern value="(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])"/>
 *    </xs:restriction>
 *  </xs:simpleType>
 *
 *  <xs:simpleType name="PortType">
 *    <xs:restriction base="xs:unsignedShort">
 *      <xs:minInclusive value="1"/>
 *    </xs:restriction>
 *  </xs:simpleType>
 * ~~~~
 */
export class ROUTESession extends TreeElement {
  /**
   * Source IP address (default: current ROUTE session’s source IP address) (mandatory for non-primary session)
   *
   * XML attribute name: sIpAddr
   */
  public sourceIPAddress: string;

  /** Destination IP address (default: current ROUTE session’s destination IP address) (mandatory for non-primary session) */
  public destinationIPAddress: string;
  /** Destination port (default: current ROUTE session’s destination port) (mandatory for non-primary session) */
  public destinationPort: number;
  /** LCT channels */
  public lctChannels: LCTChannel[];

  /**
   * Returns `true` if this tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return isArrayEmpty(this.lctChannels);
  }

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    if (isUndefined(this.destinationIPAddress)) {
      return 'ROUTE session';
    }
    return `ROUTE session ${this.destinationIPAddress}:${this.destinationPort}`;
  }

  /**
   * HTML-formatted simple contents of this tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this tree node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('source ', this.sourceIPAddress)}
                ${formatTreeItem('destination', `${this.destinationIPAddress}:${this.destinationPort}`)}
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
      a instanceof ROUTESession &&
      this.sourceIPAddress === a.sourceIPAddress &&
      this.destinationIPAddress === a.destinationIPAddress &&
      this.destinationPort === a.destinationPort &&
      LCTChannel.isEqualArray(this.lctChannels, a.lctChannels);
  }

  /**
   * Return a human-readable string useful for debugging.
   *
   * @param {string} indent
   * @returns {string}
   */
  public toString(indent: string): string {
    const newIndent = `${indent}  `;
    let result = `${indent}${this.nodeTitle()}:`;
    result = appendFieldString(result, 'source IP address', this.sourceIPAddress, newIndent);
    result = appendFieldString(result, 'destination IP address', this.destinationIPAddress, newIndent);
    result = appendFieldString(result, 'destination port', this.destinationPort, newIndent);
    result = appendChildString(result, 'LCT channels', this.lctChannels, newIndent);

    return result;
  }
}
