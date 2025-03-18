/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {appendFieldString, formatInt, formatTreeItem} from '../../../../utils/TreeUtils';
import {isDefined} from '../../../../utils/Utils';

/**
 * XSD
 * ~~~~
 *  <xs:complexType name="protectedObjectType">
 *    <xs:sequence>
 *      <xs:any namespace="##other" processContents="strict" minOccurs="0" maxOccurs="unbounded"/>
 *    </xs:sequence>
 *    <xs:attribute name="sessionDescription" type="xs:string"/>
 *    <xs:attribute name="tsi" type="xs:unsignedInt" use="required"/>
 *    <xs:attribute name="sourceTOI" type="xs:string"/>
 *    <xs:attribute name="fecTransportObjectSize" type="xs:unsignedInt"/>
 *    <xs:anyAttribute processContents="strict"/>
 *  </xs:complexType>
 * ~~~~
 */
export class ProtectedObject extends TreeElement {
  public sessionDescription: string;
  public tsi: number;
  public sourceTOI: string;
  public fedTransportObjectSize: number;

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return 'ProtectedObject';
  }

  /**
   * HTML-formatted simple contents of this MPD tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this MPD tree node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('session description', this.sessionDescription)}
                ${formatTreeItem('TSI', formatInt(this.tsi))}
                ${formatTreeItem('source TOI', this.sourceTOI)}
                ${formatTreeItem('FED transport object size', formatInt(this.fedTransportObjectSize))}
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
      a instanceof ProtectedObject &&
      this.sessionDescription === a.sessionDescription &&
      this.tsi === a.tsi &&
      this.sourceTOI === a.sourceTOI &&
      this.fedTransportObjectSize === a.fedTransportObjectSize;
  }

  /**
   * Return a human-readable string useful for debugging.
   *
   * @param {string} indent
   * @returns {string}
   */
  public toString(indent: string): string {
    const newIndent: string = `${indent}  `;
    let result: string = `${indent}${this.nodeTitle()}:`;
    result = appendFieldString(result, 'sessionDescription', this.sessionDescription, newIndent);
    result = appendFieldString(result, 'tsi', this.tsi, newIndent);
    result = appendFieldString(result, 'sourceTOI', this.sourceTOI, newIndent);
    result = appendFieldString(result, 'fedTransportObjectSize', this.fedTransportObjectSize, newIndent);

    return result;
  }
}

