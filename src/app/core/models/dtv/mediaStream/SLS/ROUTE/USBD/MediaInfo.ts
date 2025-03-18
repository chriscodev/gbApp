/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {appendChildString, appendFieldString, formatBoolean, formatTreeItem} from '../../../../utils/TreeUtils';
import {isDefined, isUndefined} from '../../../../utils/Utils';
import {ContentRating, ContentRatingJSON} from './ContentRating';

/**
 * XSD
 * ~~~~
 *  <xs:complexType name="MediaInfoType">
 *    <xs:sequence>
 *      <xs:element name="ContentRating" type="stsid:ContentRatingType"/>
 *      <xs:any namespace="##other" processContents="strict" minOccurs="0" maxOccurs="unbounded"/>
 *    </xs:sequence>
 *    <xs:attribute name="startup" type="xs:boolean"/>
 *    <xs:attribute ref="xml:lang"/>
 *    <xs:attribute name="contentType" type="stsid:contentTypeType"/>
 *    <xs:attribute name="repId" type="stsid:StringNoWhitespaceType" use="required"/>
 *    <xs:anyAttribute namespace="##other" processContents="strict"/>
 *  </xs:complexType>
 *
 *  <!-- Content Type enumeration -->
 *  <xs:simpleType name="contentTypeType">
 *    <xs:restriction base="xs:string">
 *      <xs:enumeration value="audio"/>
 *      <xs:enumeration value="video"/>
 *      <xs:enumeration value="subtitles"/>
 *    </xs:restriction>
 *  </xs:simpleType>
 *
 *  <!-- String without white spaces -->
 *  <xs:simpleType name="StringNoWhitespaceType">
 *    <xs:restriction base="xs:string">
 *      <xs:pattern value="[^\r\n\t \p{Z}]*"/>
 *    </xs:restriction>
 *  </xs:simpleType>
 * ~~~~
 */
export class MediaInfo extends TreeElement {
  public startup: boolean;
  public lang: string;
  public contentType: string;
  public repID: string;
  public contentRating: ContentRating;

  /**
   * Returns `true` if this tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return isUndefined(this.contentRating);
  }

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return 'Media Info';
  }

  /**
   * HTML-formatted simple contents of this MPD tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this MPD tree node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('startup', formatBoolean(this.startup))}
                ${formatTreeItem('language', this.lang)}
                ${formatTreeItem('content type', this.contentType)}
                ${formatTreeItem('representation ID', this.repID)}
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
      a instanceof MediaInfo &&
      this.startup === a.startup &&
      this.lang === a.lang &&
      this.contentType === a.contentType &&
      this.repID === a.repID &&
      ContentRating.isEqual(this.contentRating, a.contentRating);
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
    result = appendFieldString(result, 'startup', this.startup, newIndent);
    result = appendFieldString(result, 'lang', this.lang, newIndent);
    result = appendFieldString(result, 'contentType', this.contentType, newIndent);
    result = appendFieldString(result, 'repID', this.repID, newIndent);
    result = appendChildString(result, 'contentRating', this.contentRating, newIndent);

    return result;
  }
}

export interface MediaInfoJSON {
  startup?: boolean;
  lang?: string;
  contentType?: string;
  repId: string;
  contentRating?: ContentRatingJSON;
}

