/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {appendFieldString, formatBoolean, formatInt, formatTreeItem} from '../../../../utils/TreeUtils';
import {isDefined} from '../../../../utils/Utils';

/**
 * XSD
 * ~~~~
 *  <xs:complexType name="PayloadType">
 *    <xs:attribute name="codePoint" type="xs:unsignedByte" default="0"/>
 *    <xs:attribute name="formatId" type="stsid:formatIdType" use="required"/>
 *    <xs:attribute name="frag" type="stsid:fragType" default="0"/>
 *    <xs:attribute name="order" type="xs:boolean" default="0"/>
 *    <xs:attribute name="srcFecPayloadId" type="stsid:srcFecPayloadIdType" use="required" default="0"/> // NOTE mistake in XSD
 *    <xs:attribute name="fecParams" type="stsid:fecOTIType"/>
 *    <xs:anyAttribute processContents="strict"/>
 *  </xs:complexType>
 *
 *  <xs:simpleType name="formatIdType">
 *    <xs:restriction base="xs:unsignedByte">
 *      <xs:minInclusive value="1"/>
 *      <xs:maxInclusive value="3"/>
 *    </xs:restriction>
 *  </xs:simpleType>
 *
 *  <xs:simpleType name="fragType">
 *    <xs:restriction base="xs:unsignedByte">
 *      <xs:maxInclusive value="2"/>
 *    </xs:restriction>
 *  </xs:simpleType>
 *
 *  <xs:simpleType name="srcFecPayloadIdType">
 *    <xs:restriction base="xs:unsignedByte">
 *      <xs:maxInclusive value="2"/>
 *    </xs:restriction>
 *  </xs:simpleType>
 * ~~~~
 */
export class Payload extends TreeElement {
  /**
   * A numerical representation of the combination of values specified for the child elements and
   * attributes of the Payload element. The value of @codePoint shall be identical to the CP (Codepoint)
   * field in the LCT header.
   *
   * XML: unsignedByte, optional, default: 0
   */
  public codePoint: number;

  /**
   * Specifies the payload format of the delivery object. For details see Table A.3.2.
   *
   * XML: unsignedByte, required
   */
  public formatID: number;

  /**
   * This attribute contains an unsignedByte value indicating how the payload of ROUTE packets carrying
   * the objects of the source flow are fragmented for delivery.
   *
   * 0: arbitrary. This value means that the payload of this ROUTE packet carries a contiguous portion of
   *    the delivery object whose fragmentation occurs at arbitrary byte boundaries.
   * 1: application specific (sample based). This value means that the payload of this ROUTE packet carries
   *    media data in the form of one or more complete samples, where the term “sample” is as defined in
   *    ISO/IEC 14496-12 [23]. Its usage pertains to the MDE mode as described in Sec. 8.1.1.5.2, whereby the
   *    packet strictly carries an MDE data block comprising samples stored in the ‘mdat’ box.
   * 2: application specific (a collection of boxes). This value means that the payload of this ROUTE packet
   *    contains the entire data content of one or more boxes, where term “box” is as defined in ISO/IEC 14496-12 [41].
   *    Its usage pertains to the MDE mode as described in Sec. 8.1.1.5.2, whereby each packet carries the
   *    portion of an MDE data block starting with RAP, and strictly comprising boxes which contain metadata
   *    (e.g. styp, sidx, moof and their contained (subordinate) boxes).
   * 3-127: reserved for future use
   * 128-255: reserved for proprietary
   *
   * XML: unsignedByte, optional, default: 0
   */
  public frag: number;

  public order: boolean;

  /**
   * Defined values of the Source FEC Payload ID for use in conjunction with the following rules:
   * 0: the source FEC payload ID is absent and the entire delivery object is contained in this packet. The
   *    FECParameters child element of SrcFlow shall be absent.
   * 1: the source FEC payload ID is a 32-bit unsigned integer value that expresses the start offset in the object.
   *    Start offset is defined in Section A.3.5 The FECParameters child element of SrcFlow shall be absent.
   * 2: the FECParameters child element of SrcFlow defines the Format of the Source FEC Payload ID.
   *
   * XML: unsignedByte, optional, default: 1
   */
  public srcFecPayloadID: number;

  /**
   * Defines the parameters of the FEC scheme associated with the source flow, in the form of FEC Object
   * Transmission Information as defined in RFC 5052 [15]
   * The FEC parameters are applied to the Source FEC Payload ID value specified in the ROUTE (ALC) packet header.
   */
  public fecParams: string;

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return 'Payload';
  }

  /**
   * HTML-formatted simple contents of this MPD tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this MPD tree node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('code point', formatInt(this.codePoint))}
                ${formatTreeItem('format ID', formatInt(this.formatID))}
                ${formatTreeItem('fragment type', formatInt(this.frag))}
                ${formatTreeItem('order', formatBoolean(this.order))}
                ${formatTreeItem('source FEC payload ID', formatInt(this.srcFecPayloadID))}
                ${formatTreeItem('FEC params', this.fecParams)}
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
      a instanceof Payload &&
      this.codePoint === a.codePoint &&
      this.formatID === a.formatID &&
      this.frag === a.frag &&
      this.order === a.order &&
      this.srcFecPayloadID === a.srcFecPayloadID &&
      this.fecParams === a.fecParams;
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
    result = appendFieldString(result, 'codePoint', this.codePoint, newIndent);
    result = appendFieldString(result, 'formatID', this.formatID, newIndent);
    result = appendFieldString(result, 'frag', this.frag, newIndent);
    result = appendFieldString(result, 'order', this.order, newIndent);
    result = appendFieldString(result, 'srcFecPayloadID', this.srcFecPayloadID, newIndent);
    result = appendFieldString(result, 'fecParams', this.fecParams, newIndent);

    return result + '\n';
  }
}

