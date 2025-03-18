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
import {arrayEquals, isDefined, isUndefined} from '../../../../utils/Utils';
import {FDTCommonFileAttributes} from './FDTCommonFileAttributes';
import {FDTInstanceFile} from './FDTInstanceFile';


/**
 * File Delivery Table for a FLUTE session. Note that this needs to be merged with any
 * other FDT in the FLUTE session. Subsequent FDT Instances MUST NOT change
 * the parameters already described for a specific TOI.
 *
 * A FLUTE FDT per RFC 6726 with ATSC- and 3GPP-defined extensions.
 *
 * The "FDT-Instance" element MAY contain attributes that give common
 * parameters for all files of an FDT Instance.  These attributes MAY
 * also be provided for individual files in the "File" element.  Where
 * the same attribute appears in both the "FDT-Instance" and the "File"
 * elements, the value of the attribute provided in the "File" element
 * takes precedence.
 *
 * XSD
 * ~~~~
 *   <xs:element name="FDT-Instance" type="FDT-InstanceType"/>
 *
 *   <xs:complexType name="FDT-InstanceType">
 *   <xs:sequence>
 *    <xs:element name="File" type="FDTInstanceFile" maxOccurs="unbounded"/>
 *    <xs:any namespace="##other" processContents="skip" minOccurs="0" maxOccurs="unbounded"/>
 *   </xs:sequence>
 *   <xs:attribute name="Expires" type="xs:string" use="required"/>
 *   <xs:attribute name="Complete" type="xs:boolean" use="optional"/>
 *   <xs:attribute name="Content-Type" type="xs:string" use="optional"/>
 *   <xs:attribute name="Content-Encoding" type="xs:string" use="optional"/>
 *   <xs:attribute name="FEC-OTI-FEC-Encoding-ID" type="xs:unsignedByte" use="optional"/>
 *   <xs:attribute name="FEC-OTI-FEC-Instance-ID" type="xs:unsignedLong" use="optional"/>
 *   <xs:attribute name="FEC-OTI-Maximum-Source-Block-Length" type="xs:unsignedLong" use="optional"/>
 *   <xs:attribute name="FEC-OTI-Encoding-Symbol-Length" type="xs:unsignedLong" use="optional"/>
 *   <xs:attribute name="FEC-OTI-Max-Number-of-Encoding-Symbols" type="xs:unsignedLong" use="optional"/>
 *   <xs:attribute name="FEC-OTI-Scheme-Specific-Info" type="xs:base64Binary" use="optional"/>
 *
 *     <!-- ATSC FDT Instance extensions -->
 *     <xs:attribute name="efdtVersion" type="xs:unsignedByte"/>
 *     <xs:attribute name="maxExpiresDelta" type="xs:unsignedInt"/>
 *     <xs:attribute name="maxTransportSize" type="xs:unsignedInt"/>
 *     <xs:attribute name="fileTemplate" type="afdt:fileTemplateType"/>
 *     <xs:attribute name="appContextIDList" type="afdt:uriListType"/>
 *     <xs:attribute name="filterCodes" type="afdt:listOfUnsignedIntType"/>
 *
 *   <xs:anyAttribute processContents="skip"/>
 *   </xs:complexType>
 *
 *  <xs:simpleType name="uriListType">
 *  <xs:list itemType="xs:anyURI"/>
 *  </xs:simpleType>
 *
 *  <xs:simpleType name="fileTemplateType">
 *  <xs:restriction base="xs:string"/>
 *  </xs:simpleType>
 *
 *  <xs:simpleType name="listOfUnsignedIntType">
 *  <xs:list itemType="xs:unsignedInt"/>
 *  </xs:simpleType>
 * ~~~~
 *
 * @see FLUTE - File Delivery over Unidirectional Transport RFC 6726 (https://tools.ietf.org/html/rfc6726)
 * @see FLUTE 3.2. File Delivery Table
 * @see FLUTE 3.4.2. Syntax of FDT Instance
 * @see A.3.3.2.3 ATSC Extensions to the FDT-Instance Element
 * @see A.3.3.2.4 and A.3.3.2.5 for ATSC FLUTE extensionsw
 */
export class FDTInstance extends FDTCommonFileAttributes {
  /**
   * The expiration time is expressed within the FDT Instance payload as a
   * UTF-8 decimal representation of a 32-bit unsigned integer.  The
   * value of this integer represents the 32 most significant bits of a
   * 64-bit Network Time Protocol (NTP) [RFC5905] time value.  These
   * 32 bits provide an unsigned integer representing the time in
   * seconds relative to 0 hours 1 January 1900 in the case of the
   * prime epoch (era 0) [RFC5905].  The handling of time wraparound
   * (to happen in 2036) requires that the associated epoch be
   * considered.  In any case, both a sender and a receiver easily
   * determine to which (136-year) epoch the FDT Instance expiration
   * time value pertains by choosing the epoch for which the expiration
   * time is closest in time to the current time.
   *
   * XML: string, required
   *
   * @see FLUTE 3.3 Dynamics of FDT Instances within a File Delivery Session
   */
  public expires: string;

  /**
   * a boolean that can be either set to '1' or 'true' for TRUE, or '0' or 'false' for FALSE
   * When TRUE, the "Complete" attribute signals that this "FDT Instance"
   * includes the set of "File" entries that exhausts both the set of
   * files delivered so far and the set of files to be delivered in the
   * session.  This implies that no new data will be provided in future
   * FDT Instances within this session (i.e., that either FDT Instances
   * with higher ID numbers will not be used or, if they are used, will
   * only provide file parameters identical to those already given in this
   * and previous FDT Instances).  The "Complete" attribute is therefore
   * used to provide a complete list of files in an entire FLUTE session
   * (a "complete FDT").  Note that when all the FDT Instances received so
   * far have no "Complete" attribute, the receiver MUST consider that the
   * session is not complete and that new data MAY be provided in future
   * FDT Instances.  This is equivalent to receiving FDT Instances having
   * the "Complete" attribute set to FALSE.
   *
   * XML: boolean, optional
   */
  public complete: boolean;

  /**
   * Files described in this FDT instance. Needs to be at least one file.
   */
  public files: FDTInstanceFile[];

  // ATSC FDT extensions

  /**
   * The version of this Extended FDT instance descriptor.
   */
  public efdtVersion: number;

  /**
   * Time interval for use in deriving the expiration time of the associated EFDT.
   */
  public maxExpiresDelta: number;

  /**
   * The maximum transport size of any object described by this EFDT.
   */
  public maxTransportSize: number;

  /**
   * Describes the means to generate the file URL, i.e. Content-Location attribute of the FDT.
   */
  public fileTemplate: string;

  /**
   * List of URIs representing one or more unique Application Context Identifiers.
   */
  public appContextIDList: string[];

  /**
   * Filter Codes applying to all files in the Source flow.
   */
  public filterCodes: number[];

  // TODO other contained elements

  /**
   * Returns `true` if this tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return isUndefined(this.files) || this.files.length === 0;
  }

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return 'FDT Instance';
  }

  /**
   * HTML-formatted simple contents of this node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${super.treeNodeText()}
                ${formatTreeItem('expires', this.expires)}
                ${formatTreeItem('complete', formatBoolean(this.complete))}
                ${formatTreeItem('EFDT version', formatInt(this.efdtVersion))}
                ${formatTreeItem('max expires delta', formatInt(this.maxExpiresDelta))}
                ${formatTreeItem('max transport size', formatInt(this.maxTransportSize))}
                ${formatTreeItem('file template', this.fileTemplate)}
                ${formatTreeItem('app context ID list', this.appContextIDList.join(' '))}
                ${formatTreeItem('filter codes', this.filterCodes.join(' '))}
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
      a instanceof FDTInstance &&
      super.isEqual(a) &&
      this.expires === a.expires &&
      this.complete === a.complete &&
      FDTInstanceFile.isEqualArray(this.files, a.files) &&
      this.efdtVersion === a.efdtVersion &&
      this.maxExpiresDelta === a.maxExpiresDelta &&
      this.maxTransportSize === a.maxTransportSize &&
      arrayEquals(this.appContextIDList, a.appContextIDList) &&
      arrayEquals(this.filterCodes, a.filterCodes);
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
    result = appendFieldString(result, 'expires', this.expires, newIndent);
    result = appendFieldString(result, 'complete', this.complete, newIndent);
    result = appendFieldString(result, 'efdtVersion', this.efdtVersion, newIndent);
    result = appendFieldString(result, 'maxExpiresDelta', this.maxExpiresDelta, newIndent);
    result = appendFieldString(result, 'maxTransportSize', this.maxTransportSize, newIndent);
    result = appendFieldString(result, 'fileTemplate', this.fileTemplate, newIndent);
    if (this.appContextIDList.length > 0) {
      result = appendFieldString(result, 'appContextIDList', this.appContextIDList.join(' '), newIndent);
    }
    if (this.filterCodes.length > 0) {
      result = appendFieldString(result, 'filterCodes', this.filterCodes.join(' '), newIndent);
    }
    result = appendChildString(result, 'files', this.files, newIndent);

    return result;
  }
}

