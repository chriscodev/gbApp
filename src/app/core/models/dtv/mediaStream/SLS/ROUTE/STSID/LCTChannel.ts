/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {datesEqual, formatDate} from '../../../../utils/DateTimeUtils';
import {TreeElement} from '../../../../utils/TreeElement';
import {appendChildString, appendFieldString, formatInt, formatTreeItem} from '../../../../utils/TreeUtils';
import {isDefined, isUndefined} from '../../../../utils/Utils';
import {RepairFlow} from './RepairFlow';
import {SourceFlow} from './SourceFlow';

/**
 * XSD
 * ~~~~
 *  <xs:complexType name="lSessionType">
 *    <xs:sequence>
 *      <xs:element ref="stsid:SrcFlow" minOccurs="0"/>
 *      <xs:element ref="stsid:RepairFlow" minOccurs="0"/>
 *      <xs:any namespace="##other" processContents="strict" minOccurs="0" maxOccurs="unbounded"/>
 *    </xs:sequence>
 *    <xs:attribute name="tsi" type="xs:unsignedInt" use="required"/>
 *    <xs:attribute name="bw" type="xs:unsignedInt"/>
 *    <xs:attribute name="startTime" type="xs:dateTime"/>
 *    <xs:attribute name="endTime" type="xs:dateTime"/>
 *    <xs:anyAttribute processContents="strict"/>
 *  </xs:complexType>
 * ~~~~
 */
export class LCTChannel extends TreeElement {
  /** TSI value */
  public tsi: number;
  /** Maximum bandwidth */
  public maximumBandwidth: number;
  /** Start time */
  public startTime: Date;
  /** End time */
  public endTime: Date;
  public sourceFlow: SourceFlow;
  public repairFlow: RepairFlow;


  /**
   * Returns `true` if this tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return isUndefined(this.sourceFlow) && isUndefined(this.repairFlow);
  }

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return `LCT channel ${this.tsi ?? ''}`;
  }

  /**
   * HTML-formatted simple contents of this tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this tree node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('TSI', formatInt(this.tsi))}
                ${formatTreeItem('maximum bandwidth', formatInt(this.maximumBandwidth))}
                ${formatTreeItem('start time', formatDate(this.startTime))}
                ${formatTreeItem('end time', formatDate(this.endTime))}
              </ul>`;
  }

  /**
   * Returns `true` if the object is deep equal to this.
   *
   * @param {TreeElement} a - object to compare to
   * @returns {boolean} true if a === b
   */
  public isEqual(a: LCTChannel): boolean {
    return isDefined(a) &&
      a instanceof LCTChannel &&
      this.tsi === a.tsi &&
      this.maximumBandwidth === a.maximumBandwidth &&
      datesEqual(this.startTime, a.startTime) &&
      datesEqual(this.endTime, a.endTime) &&
      SourceFlow.isEqual(this.sourceFlow, a.sourceFlow) &&
      RepairFlow.isEqual(this.repairFlow, a.repairFlow);
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
    result = appendFieldString(result, 'TSI', this.tsi, newIndent);
    result = appendFieldString(result, 'maximum bandwidth', this.maximumBandwidth, newIndent);
    result = appendFieldString(result, 'start time', this.startTime, newIndent);
    result = appendFieldString(result, 'end time', this.endTime, newIndent);
    result = appendChildString(result, 'source flow', this.sourceFlow, newIndent);
    result = appendChildString(result, 'repair flow', this.repairFlow, newIndent);

    return result;
  }
}
