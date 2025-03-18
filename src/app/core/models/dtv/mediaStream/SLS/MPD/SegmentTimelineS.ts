// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../../../core/models/dtv/utils/TreeElement';
import {
  fieldString,
  formatInt,
  formatTreeItem,
  getFormattedTimeLong,
  getFormattedTimeShort
} from '../../../../../../core/models/dtv/utils/TreeUtils';
import {isDefined} from '../../../../../../core/models/dtv/utils/Utils';

/**
 * XML
 * ~~~~
 * <xs:element name="S" minOccurs="1" maxOccurs="unbounded" >
 *    <xs:complexType>
 *       <xs:attribute name="t" type="xs:unsignedLong"/>
 *       <xs:attribute name="d" type="xs:unsignedLong" use="required"/>
 *       <xs:attribute name="r" type="xs:int" use="optional" default="0"/>
 *       <xs:anyAttribute namespace="##other" processContents="lax"/>
 *    </xs:complexType>
 * </xs:element>
 * ~~~~
 *
 * @see ISO/IEC 23009-1:2014 5.3.9.6.2 Segment timeline Semantics
 */
export class SegmentTimelineS extends TreeElement {
  /**
   * The MPD start time, in @timescale units, the first Segment in the series starts relative to the beginning of
   * the Period. The value of this attribute must be equal to or greater than the sum of the previous S element
   * the earliest presentation time and the sum of the contiguous Segment durations.
   *
   * If the value of the attribute is greater than what is expressed by the previous S element, it expresses discontinuities in the timeline.
   *
   * If not present then the value shall be assumed to be zero for the first S element and for the subsequent S
   * elements, the value shall be assumed to be the sum of the previous S element's earliest presentation time and
   * contiguous duration (i.e. previous S@t + @d * (@r + 1)).
   *
   * @type {number}
   */
  public t: number;

  /**
   * The Segment duration, in units of the value of the @timescale.
   *
   * @type {number}
   */
  public d: number;

  /**
   * The repeat count of the number of following contiguous Segments with the same duration expressed by the value of @d. This
   * value is zero-based (e.g. a value of three means four Segments in the contiguous series). A negative value of the @r attribute
   * of the S element indicates that the duration indicated in @dattribute repeats until the start of the next S element, the end
   * of the Period or until the next MPD update.
   *
   * @type {number}
   */
  public r: number;

  public timescale?: number;

  /**
   * Title of this node in the MPD tree.
   *
   * @returns {string} MPD tree node title
   */
  public nodeTitle(): string {
    let title = 'S';
    if (isDefined(this.t)) {
      title += ' t: ' + getFormattedTimeShort(this.t, this.timescale);
    }
    if (isDefined(this.d)) {
      title += ' d: ' + getFormattedTimeShort(this.d, this.timescale);
    }
    if (isDefined(this.r)) {
      title += ' r: ' + formatInt(this.r);
    }

    return title;
  }

  /**
   * HTML-formatted simple contents of this MPD tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this MPD tree node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('t', getFormattedTimeLong(this.t, this.timescale))}
                ${formatTreeItem('d', getFormattedTimeLong(this.d, this.timescale))}
                ${formatTreeItem('r', formatInt(this.r))}
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
      a instanceof SegmentTimelineS &&
      this.t === a.t &&
      this.d === a.d &&
      this.r === a.r;
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
                ${fieldString('t', this.t, newIndent)}
                ${fieldString('d', this.d, newIndent)}
                ${fieldString('r', this.r, newIndent)}`;
  }
}
