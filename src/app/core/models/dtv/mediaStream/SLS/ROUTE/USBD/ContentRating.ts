/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {fieldString, formatTreeItem} from '../../../../utils/TreeUtils';
import {isDefined} from '../../../../utils/Utils';

/**
 * XSD
 * ~~~~
 *  <xs:complexType name="ContentRatingType">
 *    <xs:sequence>
 *      <xs:any namespace="##other" processContents="strict" minOccurs="0" maxOccurs="unbounded"/>
 *    </xs:sequence>
 *    <xs:attribute name="schemeIDURI" type="xs:anyURI" default="tag:atsc.org,2016:carating:1"/>
 *    <xs:attribute name="value" type="xs:string" use="required"/>
 *    <xs:anyAttribute namespace="##other" processContents="strict"/>
 *  </xs:complexType>
 * ~~~~
 */
export class ContentRating extends TreeElement {
  public schemeIDURI: string;
  public value: string;

  // TODO others

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return 'Content Rating';
  }

  /**
   * HTML-formatted simple contents of this MPD tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this MPD tree node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('scheme ID URI', this.schemeIDURI)}
                ${formatTreeItem('value', this.value)}
              </ul>`;
  }

  /**
   * Returns `true` if the object is deep equal to this.
   *
   * @param {ServiceName} a - object to compare to
   * @returns {boolean} true if a === b
   */
  public isEqual(a: TreeElement): boolean {
    return isDefined(a) &&
      a instanceof ContentRating &&
      this.schemeIDURI === a.schemeIDURI &&
      this.value === a.value;
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
                ${fieldString('scheme ID URI', this.schemeIDURI, newIndent)}
                ${fieldString('value', this.value, newIndent)}`;
  }
}


export interface ContentRatingJSON {
  schemeIdUri?: string;
  value: string;
}
