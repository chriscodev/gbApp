// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../../../core/models/dtv/utils/TreeElement';
import {fieldString, formatLang, formatTreeItem} from '../../../../../../core/models/dtv/utils/TreeUtils';
import {isDefined} from '../../../../../../core/models/dtv/utils/Utils';

/**
 * Descriptive information about the program. Multiple may be present if they have different lang attributes.
 *
 * XML
 * ~~~~
 * <xs:complexType name="ProgramInformationType">
 *    <xs:sequence>
 *       <xs:element name="Title" type="xs:string" minOccurs="0"/>
 *       <xs:element name="Source" type="xs:string" minOccurs="0"/>
 *       <xs:element name="Copyright" type="xs:string" minOccurs="0"/>
 *       <xs:any namespace="##other" processContents="lax" minOccurs="0" maxOccurs="unbounded"/>
 *    </xs:sequence>
 *    <xs:attribute name="lang" type="xs:language"/>
 *    <xs:attribute name="moreInformationURL" type="xs:anyURI"/>
 *    <xs:anyAttribute namespace="##other" processContents="lax"/>
 * </xs:complexType>
 * ~~~~
 *
 *
 * @see ISO/IEC 23009-1:2014 5.7 Program information
 * @see ts/Tests/MPDTests.ts
 */
export class ProgramInformation extends TreeElement {
  /** title for the Media Presentation */
  public title: string;

  /** information about the original source (for example content provider) of the Media Presentation. */
  public source: string;

  /** a copyright statement for the Media Presentation, usually starting with the copyright symbol, unicode U+00A9 */
  public copyright: string;

  /**
   * Language code for this info. If not present the value is unknown.
   *
   * @see "IETF RFC 5646 for codes"
   */
  public langCode: string;

  /** If provided, this attribute specifies an absolute URL which provides more information about the Media Presentation. If not present the value is unknown. */
  public moreInformationURL: string;

  /**
   * Title of this node in the MPD tree.
   *
   * @returns {string} MPD tree node title
   */
  public nodeTitle(): string {
    return 'Program Information';
  }

  /**
   * HTML-formatted simple contents of this MPD tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this MPD tree node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('title', this.title)}
                ${formatTreeItem('source', this.source)}
                ${formatTreeItem('copyright', this.copyright)}
                ${formatTreeItem('language', formatLang(this.langCode))}
                ${formatTreeItem('more information URL', this.moreInformationURL)}
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
      a instanceof ProgramInformation &&
      this.title === a.title &&
      this.source === a.source &&
      this.copyright === a.copyright &&
      this.langCode === a.langCode &&
      this.moreInformationURL === a.moreInformationURL;
  }

  /**
   * Return a human-readable string useful for debugging.
   *
   * @param {string} indent
   * @returns {string}
   */
  public toString(indent: string): string {
    const newIndent = `${indent}  `;
    return `${indent}${this.nodeTitle()}:
                ${fieldString('title', this.title, newIndent)}
                ${fieldString('source', this.source, newIndent)}
                ${fieldString('copyright', this.copyright, newIndent)}
                ${fieldString('langCode', this.langCode, newIndent)}
                ${fieldString('moreInformationURL', this.moreInformationURL, newIndent)}`;
  }
}
