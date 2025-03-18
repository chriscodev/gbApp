/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {
  appendChildString,
  appendFieldString,
  formatBoolean,
  formatInt,
  formatTreeItem
} from '../../../../utils/TreeUtils';
import {allUndefined, isDefined} from '../../../../utils/Utils';
import {ContentInfo} from '../USBD/ContentInfo';
import {EFDT} from './EFDT';
import {Payload} from './Payload';

/**
 * XSD
 * ~~~~
 *  <xs:element name="SrcFlow" type="stsid:srcFlowType"/>
 *
 *  <xs:complexType name="srcFlowType">
 *    <xs:sequence>
 *      <xs:element name="EFDT" type="stsid:EFDTType" minOccurs="0"/>
 *      <xs:element name="ContentInfo" type="stsid:ContentInfoType" minOccurs="0"/>
 *      <xs:element name="Payload" type="stsid:PayloadType" maxOccurs="unbounded"/>
 *      <xs:any namespace="##other" processContents="strict" minOccurs="0" maxOccurs="unbounded"/>
 *    </xs:sequence>
 *    <xs:attribute name="rt" type="xs:boolean" default="false"/>
 *    <xs:attribute name="minBuffSize" type="xs:unsignedInt"/>
 *    <xs:anyAttribute processContents="strict"/>
 *  </xs:complexType>
 * ~~~~
 *
 * @see A/331 Annex A (see Sections A.1.1, A.1.2, A.3 and A.4
 */
export class SourceFlow extends TreeElement {
  /**
   * If @rt is not present, it is assumed false. Shall be present and set to “true” when the SrcFlow carries streaming media.
   *
   * XML: boolean, optional, default: false
   */
  public rt: boolean;

  /**
   * Defines the minimum number of kilobytes required in the receiver transport buffer for the LCT channel. This
   * value may be present if @rt is set to true.
   *
   * XML: unsigned int, optional
   */
  public minBuffSize: number;

  /**
   * The extended FDT instance.
   *
   * XML: optional
   *
   * @see Section A.3.3.2.3.
   */
  public efdt: EFDT;

  /**
   * May provide additional information that can be mapped to the application service that is carried in
   * this transport session, e.g. Representation ID of a DASH content or the Adaptation Set parameters of a
   * DASH Media Representation in order to select the LCT channel for rendering.
   *
   * XML: optional
   */
  public contentInfo: ContentInfo;

  /**
   * Information on the payload of ROUTE packets carrying the objects of the source flow.
   *
   * XML: optional
   */
  public payloads: Payload[];

  /**
   * Returns `true` if this tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return allUndefined(this.efdt, this.contentInfo, this.payloads);
  }

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return 'SourceFlow';
  }

  /**
   * HTML-formatted simple contents of this tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this tree node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('rt', formatBoolean(this.rt))}
                ${formatTreeItem('minimum buffer size', formatInt(this.minBuffSize))}
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
      a instanceof SourceFlow &&
      this.rt === a.rt &&
      this.minBuffSize === a.minBuffSize &&
      EFDT.isEqual(this.efdt, a.efdt) &&
      ContentInfo.isEqual(this.contentInfo, a.contentInfo) &&
      Payload.isEqualArray(this.payloads, a.payloads);
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
    result = appendFieldString(result, 'rt', this.rt, newIndent);
    result = appendFieldString(result, 'minimum buffer size', this.minBuffSize, newIndent);
    result = appendChildString(result, 'EFDT', this.efdt, newIndent);
    result = appendChildString(result, 'content info', this.contentInfo, newIndent);
    result = appendChildString(result, 'payload', this.payloads, newIndent);

    return result;
  }
}


