// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

/* tslint:disable:no-redundant-jsdoc */

import {formatPeriodSeconds} from '../../../../../../core/models/dtv/utils/DateTimeUtils';
import {TreeElement} from '../../../../../../core/models/dtv/utils/TreeElement';
import {fieldString, formatTreeItem} from '../../../../../../core/models/dtv/utils/TreeUtils';
import {isDefined} from '../../../../../../core/models/dtv/utils/Utils';

/**
 * Time periods to collect metrics.
 *
 * XSL
 * ~~~~
 *  <xs:complexType name="RangeType">
 *     <xs:attribute name="starttime" type="xs:duration"/>
 *     <xs:attribute name="duration" type="xs:duration"/>
 *  </xs:complexType>
 * ~~~~
 *
 * @see "ISO IEC 23009-1 2014 Section 5.9 DASH metrics descriptor"
 */
export class MetricsRange extends TreeElement {
  public startTime: number;
  public duration: number;

  /**
   * Title of this node in the MPD tree.
   *
   * @returns {string} MPD tree node title
   */
  public nodeTitle(): string {
    return 'Range';
  }

  /**
   * HTML-formatted simple contents of this MPD tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this MPD tree node.
   */
  public treeNodeText(): string {
    // TODO I suspect that startTime and duration are ISO durations, not numbers, and won't parse; use XMLUtils.interpretISODuration() here to interpret
    return `<ul class="nodeInfo">
                ${formatTreeItem('start time', `${this.startTime}`)}
                ${formatTreeItem('duration', formatPeriodSeconds(this.duration))}
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
      a instanceof MetricsRange &&
      this.startTime === a.startTime &&
      this.duration === a.duration;
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
                ${fieldString('startTime', this.startTime, newIndent)}
                ${fieldString('duration', this.duration, newIndent)}`;
  }
}
