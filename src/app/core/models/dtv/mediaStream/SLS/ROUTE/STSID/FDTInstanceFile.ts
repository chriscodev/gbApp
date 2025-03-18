/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {appendFieldString, formatInt, formatTreeItem} from '../../../../utils/TreeUtils';
import {isDefined} from '../../../../utils/Utils';
import {FDTCommonFileAttributes} from './FDTCommonFileAttributes';

/**
 * FLUTE file information for a file being transferred in the parent FDTInstance.
 *
 * XSD
 * ~~~~
 *   <xs:complexType name="FDTInstanceFile">
 *   <xs:sequence>
 *    <xs:any namespace="##other" processContents="skip" minOccurs="0" maxOccurs="unbounded"/>
 *   </xs:sequence>
 *   <xs:attribute name="Content-Location" type="xs:anyURI" use="required"/>
 *   <xs:attribute name="TOI" type="xs:positiveInteger" use="required"/>
 *   <xs:attribute name="Content-Length" type="xs:unsignedLong" use="optional"/>
 *   <xs:attribute name="Transfer-Length" type="xs:unsignedLong" use="optional"/>
 *   <xs:attribute name="Content-Type" type="xs:string" use="optional"/>
 *   <xs:attribute name="Content-Encoding" type="xs:string" use="optional"/>
 *   <xs:attribute name="Content-MD5" type="xs:base64Binary" use="optional"/>
 *   <xs:attribute name="FEC-OTI-FEC-Encoding-ID" type="xs:unsignedByte" use="optional"/>
 *   <xs:attribute name="FEC-OTI-FEC-Instance-ID" type="xs:unsignedLong" use="optional"/>
 *   <xs:attribute name="FEC-OTI-Maximum-Source-Block-Length" type="xs:unsignedLong" use="optional"/>
 *   <xs:attribute name="FEC-OTI-Encoding-Symbol-Length" type="xs:unsignedLong" use="optional"/>
 *   <xs:attribute name="FEC-OTI-Max-Number-of-Encoding-Symbols" type="xs:unsignedLong" use="optional"/>
 *   <xs:attribute name="FEC-OTI-Scheme-Specific-Info" type="xs:base64Binary" use="optional"/>
 *   <xs:anyAttribute processContents="skip"/>
 *   </xs:complexType>
 * ~~~~
 *
 * @see FLUTE - File Delivery over Unidirectional Transport RFC 6726 (https://tools.ietf.org/html/rfc6726)
 * @see Forward Error Correction (FEC) Building Block RFC 5052 (https://tools.ietf.org/html/rfc5052)
 */
export class FDTInstanceFile extends FDTCommonFileAttributes {
  /**
   * URI describing name, identification, and location of file. The semantics for any two "File" elements declaring
   * the same "Content-Location" but differing "TOI" is that the element
   * appearing in the FDT Instance with the greater FDT Instance ID is
   * considered to declare a newer instance (e.g., version) of the same
   * "File".
   *
   * XML: URI, required
   */
  public contentLocation: string;

  /**
   * FLUTE object ID for this file.
   *
   * XML: positive integer, required
   */
  public toi: number;

  /**
   * Length of the transmitted file in uncompressed form.
   *
   * If the file is not content encoded before transport (and thus the
   * "Content-Encoding" attribute is not used), then the transfer
   * length is the length of the original file, and in this case the
   * "Content-Length" is also the transfer length.
   *
   * XML: unsigned long, optional
   */
  public contentLength: number;

  /**
   * Length of the transmitted file in transmitted (compressed) form.
   *
   * XML: unsigned long, optional
   */
  public transferLength: number;

  /**
   * Digest of transmitted file.
   *
   * XML: BASE64 string, optional
   */
  public contentMD5: string;

  /**
   * A space-separated list of URIs representing one or more unique Application Context Identifiers.
   */
  public appContextIDList: string[];

  /**
   * A space-separated list of 32-bit unsigned integers representing Filter Codes that applies to this file.
   */
  public filterCodes: number[];


  // TODO other contained elements

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return 'FDT File';
  }

  /**
   * HTML-formatted simple contents of this node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${super.treeNodeText()}
                ${formatTreeItem('content location', this.contentLocation)}
                ${formatTreeItem('TOI', formatInt(this.toi))}
                ${formatTreeItem('content length', formatInt(this.contentLength))}
                ${formatTreeItem('transfer length', formatInt(this.transferLength))}
                ${formatTreeItem('content MD5', this.contentMD5)}
                ${formatTreeItem('filter codes', this.filterCodes?.join(' '))}
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
      a instanceof FDTInstanceFile &&
      this.contentLocation === a.contentLocation &&
      this.toi === a.toi &&
      this.contentLength === a.contentLength &&
      this.transferLength === a.transferLength &&
      this.contentMD5 === a.contentMD5 &&
      this.filterCodes === a.filterCodes;
  }

  /**
   * Return a human-readable string useful for debugging.
   *
   * @param {string} indent - indent size for children
   * @returns {string} - human-readable string representation of this object
   */
  public toString(indent: string): string {
    const newIndent = `${indent}  `;
    let result = `${indent}${this.nodeTitle()}:`;
    result += super.toString(newIndent);
    result = appendFieldString(result, 'contentLocation', this.contentLocation, newIndent);
    result = appendFieldString(result, 'toi', this.toi, newIndent);
    result = appendFieldString(result, 'contentLength', this.contentLength, newIndent);
    result = appendFieldString(result, 'transferLength', this.transferLength, newIndent);
    result = appendFieldString(result, 'contentMD5', this.contentMD5, newIndent);
    result = appendFieldString(result, 'filterCodes', this.filterCodes?.join(' '), newIndent);

    return result;
  }
}
