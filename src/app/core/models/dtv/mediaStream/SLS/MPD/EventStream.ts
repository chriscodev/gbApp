// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../../../core/models/dtv/utils/TreeElement';
import {
  childrenString,
  fieldString,
  formatTreeItem,
  isArrayEmpty
} from '../../../../../../core/models/dtv/utils/TreeUtils';
import {arrayEquals, isDefined} from '../../../../../../core/models/dtv/utils/Utils';
import {MPDEvent} from './MPDEvent';

/**
 * XML
 * ~~~~
 * <xs:complexType name="EventStreamType">
 *    <xs:sequence>
 *       <xs:element name="Event" type="EventType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:any namespace="##other" processContents="lax" minOccurs="0" maxOccurs="unbounded"/>
 *    </xs:sequence>
 *    <xs:attribute ref="xlink:href"/>
 *    <xs:attribute ref="xlink:actuate" default="onRequest"/>
 *    <xs:attribute name="schemeIDURI" type="xs:anyURI" use="required"/>
 *    <xs:attribute name="value" type="xs:string"/>
 *    <xs:attribute name="timescale" type="xs:unsignedInt"/>
 * </xs:complexType>
 * ~~~~
 */
export class EventStream extends TreeElement {
  public xlinkHREF: string;
  public xlinkActuate: string; // TODO "onLoad"/"onRequest"
  public schemeIdUri: string;
  public value: string;
  public timescale: number;
  public events: MPDEvent[] = [];

  /**
   * Returns `true` if this MPD tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return isArrayEmpty(this.events);
  }

  /**
   * Title of this node in the MPD tree.
   *
   * @returns {string} MPD tree node title
   */
  public nodeTitle(): string {
    return 'Event Stream';
  }

  /**
   * HTML-formatted simple contents of this MPD tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this MPD tree node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('xlink:HREF', this.xlinkHREF)}
                ${formatTreeItem('xlink:Actuate', this.xlinkActuate)}
                ${formatTreeItem('scheme ID URI', this.schemeIdUri)}
                ${formatTreeItem('value', this.value)}
                ${formatTreeItem('timescale', `${this.timescale}`)}
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
      a instanceof EventStream &&
      this.xlinkHREF === a.xlinkHREF &&
      this.xlinkActuate === a.xlinkActuate &&
      this.schemeIdUri === a.schemeIdUri &&
      this.value === a.value &&
      this.timescale === a.timescale &&
      arrayEquals(this.events, a.events);
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
                ${fieldString('xlink:HREF', this.xlinkHREF, newIndent)}
                ${fieldString('xlink:Actuate', this.xlinkActuate, newIndent)}
                ${fieldString('schemeIdUri', this.schemeIdUri, newIndent)}
                ${fieldString('value', this.value, newIndent)}
                ${fieldString('timescale', this.timescale, newIndent)}
                ${childrenString('events', this.events as unknown as TreeElement[], newIndent)}`;
  }
}
