/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {
  appendChildString,
  appendFieldString,
  formatInt,
  formatTreeItem,
  isArrayEmpty
} from '../../../../utils/TreeUtils';
import {isDefined} from '../../../../utils/Utils';
import {ProtectedObject} from './ProtectedObject';

/**
 * XSD
 * ~~~~
 *  <xs:complexType name="fecParametersType">
 *    <xs:sequence>
 *      <xs:element name="ProtectedObject" type="stsid:protectedObjectType" minOccurs="0" maxOccurs="unbounded"/>
 *      <xs:any namespace="##other" processContents="strict" minOccurs="0" maxOccurs="unbounded"/>
 *    </xs:sequence>
 *    <xs:attribute name="maximumDelay" type="xs:unsignedInt" default="0"/>
 *    <xs:attribute name="overhead" type="stsid:percentageType"/>
 *    <xs:attribute name="minBuffSize" type="xs:unsignedInt"/>
 *    <xs:attribute name="fecOTI" type="stsid:fecOTIType"/>
 *    <xs:anyAttribute processContents="strict"/>
 *  </xs:complexType>
 *
 *  <xs:simpleType name="percentageType">
 *    <xs:restriction base="xs:unsignedShort">
 *      <xs:maxInclusive value="1000"/>
 *    </xs:restriction>
 *  </xs:simpleType>
 *
 *  <xs:simpleType name="fecOTIType">
 *    <xs:restriction base="xs:hexBinary">
 *      <xs:length value="12"/>
 *    </xs:restriction>
 *  </xs:simpleType>
 * ~~~~
 */
export class FECParameters extends TreeElement {
  public maximumDelay: number;
  public overhead: number;
  public minBuffSize: number;
  public fecOTI: string;
  public protectedObjects: ProtectedObject[] = [];

  /**
   * Returns `true` if this tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return isArrayEmpty(this.protectedObjects);
  }

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return 'FECParameters';
  }

  /**
   * HTML-formatted simple contents of this MPD tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this MPD tree node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('maximum delay', formatInt(this.maximumDelay))}
                ${formatTreeItem('overhead', formatInt(this.overhead))}
                ${formatTreeItem('min buffer size', formatInt(this.minBuffSize) + 'b')}
                ${formatTreeItem('FEC OTI', this.fecOTI)}
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
      a instanceof FECParameters &&
      this.maximumDelay === a.maximumDelay &&
      this.overhead === a.overhead &&
      this.minBuffSize === a.minBuffSize &&
      this.fecOTI === a.fecOTI &&
      ProtectedObject.isEqualArray(this.protectedObjects, a.protectedObjects);
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
    result = appendFieldString(result, 'maximumDelay', this.maximumDelay, newIndent);
    result = appendFieldString(result, 'overhead', this.overhead, newIndent);
    result = appendFieldString(result, 'minBuffSize', this.minBuffSize, newIndent);
    result = appendFieldString(result, 'fecOTI', this.fecOTI, newIndent);
    result = appendChildString(result, 'protected objects', this.protectedObjects, newIndent);

    return result;
  }
}
