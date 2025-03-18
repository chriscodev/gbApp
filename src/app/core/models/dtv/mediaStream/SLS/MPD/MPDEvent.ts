// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../../../core/models/dtv/utils/TreeElement';
import {fieldString, formatInt, formatTreeItem} from '../../../../../../core/models/dtv/utils/TreeUtils';
import {isDefined} from '../../../../../../core/models/dtv/utils/Utils';

/**
 * TODO
 *
 * XSL
 * ~~~~
 * <xs:complexType name="EventType">
 *    <xs:sequence>
 *       <xs:any namespace="##other" processContents="lax" minOccurs="0" maxOccurs="unbounded"/>
 *    </xs:sequence>
 *    <xs:attribute name="presentationTime" type="xs:unsignedLong" default="0"/>
 *    <xs:attribute name="duration" type="xs:unsignedLong"/>
 *    <xs:attribute name="id" type="xs:unsignedInt"/>
 *    <xs:anyAttribute namespace="##other" processContents="lax"/>
 * </xs:complexType>
 * ~~~~
 *
 * @see ts/Tests/MPDTests.ts
 */
export class MPDEvent extends TreeElement {
  public presentationTime: number;
  public duration: number;
  public id: number;

  /**
   * Title of this node in the MPD tree.
   *
   * @returns {string} MPD tree node title
   */
  public nodeTitle(): string {
    return `Event ${this.id ?? ''}`;
  }

  /**
   * HTML-formatted simple contents of this MPD tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this MPD tree node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('presentation time', formatInt(this.presentationTime))}
                ${formatTreeItem('duration', formatInt(this.duration))}
                ${formatTreeItem('ID', formatInt(this.id))}
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
      a instanceof MPDEvent &&
      this.presentationTime === a.presentationTime &&
      this.duration === a.duration &&
      this.id === a.id;
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
                ${fieldString('presentationTime', this.presentationTime, newIndent)}
                ${fieldString('duration', this.duration, newIndent)}
                ${fieldString('id', this.id, newIndent)}`;
  }
}
