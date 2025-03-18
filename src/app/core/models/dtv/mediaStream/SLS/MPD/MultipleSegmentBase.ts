// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../../../core/models/dtv/utils/TreeElement';
import {
  childrenString,
  fieldString,
  formatInt,
  formatTreeItem,
  getFormattedTimeLong
} from '../../../../../../core/models/dtv/utils/TreeUtils';
import {allUndefined, isDefined, isUndefined} from '../../../../../../core/models/dtv/utils/Utils';
import {BitstreamSwitching} from './BitstreamSwitching';
import {SegmentBase} from './SegmentBase';
import {SegmentTimeline} from './SegmentTimeline';


/**
 * Base class for [[SegmentList]] and [[SegmentTemplate]].
 *
 * JSON
 * ~~~~
 * { timescale: 1, presentationTimeOffset: 2, timeShiftBufferDepth: 4, indexRange: "3-5", indexRangeExact: true, availabilityTimeOffset: 9,
 *      availabilityTimeComplete: true, initialization: { url: "v/3.mp4" }, representationIndex: { url: "i/3.sidx" },
 *      startNumber: 5, duration: 4000 }
 * ~~~~
 *
 * XSL
 * ~~~~
 * <xs:complexType name="MergedMultipleSegmentBaseType">
 *   <xs:complexContent>
 *      <xs:sequence>
 *         <xs:element name="Initialization" type="URLType" minOccurs="0"/>
 *         <xs:element name="RepresentationIndex" type="URLType" minOccurs="0"/>
 *         <xs:any namespace="##other" processContents="lax" minOccurs="0" maxOccurs="unbounded"/>
 *
 *         <xs:element name="SegmentTimeline" type="SegmentTimelineType" minOccurs="0"/>
 *         <xs:element name="BitstreamSwitching" type="URLType" minOccurs="0"/>
 *      </xs:sequence>
 *      <xs:attribute name="duration" type="xs:unsignedInt"/>
 *      <xs:attribute name="startNumber" type="xs:unsignedInt"/>
 *
 *      <xs:attribute name="timescale" type="xs:unsignedInt"/>
 *      <xs:attribute name="presentationTimeOffset" type="xs:unsignedLong"/>
 *      <xs:attribute name="timeShiftBufferDepth" type="xs:duration"/>
 *      <xs:attribute name="indexRange" type="xs:string"/>
 *      <xs:attribute name="indexRangeExact" type="xs:boolean"  default="false"/>
 *      <xs:attribute name="availabilityTimeOffset" type="xs:double"/>
 *      <xs:attribute name="availabilityTimeComplete" type="xs:boolean"/>
 *      <xs:anyAttribute namespace="##other" processContents="lax"/>
 *   </xs:complexContent>
 * </xs:complexType>
 * ~~~~
 *
 * @see ISO/IEC 23009-1:2014 5.3.9.2.2 Segment base information Semantics Table 13.
 */
export abstract class MultipleSegmentBase extends SegmentBase {
  /**
   * specifies the number of the first Media Segment in this Representation in the Period.
   *
   * @see ISO/IEC 23009-1:2014 5.3.9.5.3 TODO
   */
  public startNumber: number;
  /**
   * If present, specifies the constant approximate Segment duration.
   *
   * All Segments within this Representation element have the same duration unless it is the last Segment
   * within the Period, which could be significantly shorter.
   *
   * The value of the duration in seconds is the division of the value of this attribute and the value of
   * the @timescale attribute associated to the containing Representation.
   *
   * @see ISO/IEC 23009-1:2014 5.3.9.5.3 TODO
   */
  public duration: number;
  /**
   * Timeline of arbitrary Segment durations
   *
   * @see ISO/IEC 23009-1:2014 5.3.9.6 TODO
   */
  public segmentTimeline: SegmentTimeline;
  /**
   * URL including a possible byte range for the Bitstream Switching Segment.
   *
   * @see ISO/IEC 23009-1:2014 5.3.9.2.2 Segment base information Semantics Table 13.
   */
  public bitstreamSwitching: BitstreamSwitching;

  /**
   * Returns `true` if this MPD tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return super.isLeaf() &&
      isUndefined(this.segmentTimeline) &&
      isUndefined(this.bitstreamSwitching);
  }

  /**
   * Title of this node in the MPD tree.
   *
   * @returns {string} MPD tree node title
   */
  public nodeTitle(): string {
    return '';
  }

  /**
   * HTML-formatted simple contents of this MPD tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this MPD tree node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                 ${super.subNodeText()}
                 ${formatTreeItem('start number', formatInt(this.startNumber))}
                 ${formatTreeItem('duration', getFormattedTimeLong(this.duration, this.timescale))}
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
      a instanceof MultipleSegmentBase &&
      this.startNumber === a.startNumber &&
      this.duration === a.duration &&
      this.segmentTimeline.isEqual(a.segmentTimeline) &&
      this.bitstreamSwitching.isEqual(a.bitstreamSwitching) &&
      super.isEqual(a);
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
                ${fieldString('start number', this.startNumber, newIndent)}
                ${fieldString('duration', this.duration, newIndent)}
                ${super.toString(newIndent)}
                ${childrenString('segment timelines', this.segmentTimeline as unknown as TreeElement[], newIndent)}
                ${childrenString('bitstream switching', this.bitstreamSwitching as unknown as TreeElement[],
      newIndent)}`;
  }

  /**
   * `true` if this node has no information.
   *
   * @returns {boolean}
   */
  public isEmpty(): boolean {
    return allUndefined(this.startNumber, this.duration, this.segmentTimeline, this.bitstreamSwitching);
  }
}
