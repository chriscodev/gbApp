// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../../../core/models/dtv/utils/TreeElement';
import {childrenString, isArrayEmpty} from '../../../../../../core/models/dtv/utils/TreeUtils';
import {arrayEquals, isDefined} from '../../../../../../core/models/dtv/utils/Utils';
import {SegmentTimelineS} from './SegmentTimelineS';

/**
 * earliest presentation time and presentation duration (in units based on the @timescale attribute)
 * for each Segment in the Representation. The use is an alternative to providing the @duration attribute.
 *
 * XML
 * ~~~~
 * <xs:complexType name="SegmentTimelineType">
 *    <xs:sequence>
 *       <xs:element name="S" minOccurs="1" maxOccurs="unbounded"/>
 *       <xs:any namespace="##other" processContents="lax" minOccurs="0" maxOccurs="unbounded"/>
 *    </xs:sequence>
 *    <xs:anyAttribute namespace="##other" processContents="lax"/>
 * </xs:complexType>
 * ~~~~
 *
 * @see ISO/IEC 23009-1:2014 5.3.9.6 Segment timeline
 */
export class SegmentTimeline extends TreeElement {
  /**
   * Segment start time and duration for a contiguous sequence of segments of identical durations.
   * The textual order of the S elements must match the indexed (and thus time) order of the corresponding Media Segments.
   *
   * @type {SegmentTimelineS[]}
   */
  public sList: SegmentTimelineS[] = [];

  /**
   * Returns `true` if this MPD tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return isArrayEmpty(this.sList);
  }

  /**
   * Title of this node in the MPD tree.
   *
   * @returns {string} MPD tree node title
   */
  public nodeTitle(): string {
    return 'Segment Timeline';
  }

  /**
   * Returns `true` if the object is deep equal to this.
   *
   * @param {ServiceName} a - object to compare to
   * @returns {boolean} true if a === b
   */
  public isEqual(a: TreeElement): boolean {
    return isDefined(a) &&
      a instanceof SegmentTimeline &&
      arrayEquals(this.sList, a.sList);
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
                ${childrenString('sList', this.sList as unknown as TreeElement[], newIndent)}`;
  }
}
