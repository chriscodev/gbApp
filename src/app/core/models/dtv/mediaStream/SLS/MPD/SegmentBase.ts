// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

/* tslint:disable:no-redundant-jsdoc */

import {XMLUtils} from '../../../../../../core/models/dtv/utils/XMLUtils';
import {TreeElement} from '../../../../../../core/models/dtv/utils/TreeElement';
import {
  childrenString,
  fieldString,
  formatBoolean,
  formatInt,
  formatTreeItem,
  getFormattedTimeLong
} from '../../../../../../core/models/dtv/utils/TreeUtils';
import {anyUndefined, isDefined} from '../../../../../../core/models/dtv/utils/Utils';
import {Initialization} from './Initialization';
import {RepresentationIndex} from './RepresentationIndex';

/**
 * A single segment to play on the client. Contains media data and/or metadata to access, decode and present
 * the included media contentBase class for [[MultipleSegmentBase]]. Can exist on its own.
 *
 * At each level at most one of the three, [[SegmentBase]], [[SegmentTemplate]] and [[SegmentList]] shall be present.
 * Further, if [[SegmentTemplate]] or [[SegmentList]] is present on one level of the hierarchy, then the other one shall not be present
 * on any lower hierarchy level.
 *
 * SegmentBase is the most trivial way of referencing segments in the MPEG-DASH standard as it will be used when only one media
 * segment is present per Representation, which will then be referenced through a URL in the BaseURL element. If a Representation
 * should contain more segments, either SegmentList or SegmentTemplate must be used. For example, Representation using
 * SegmentBase could look like this:
 * ~~~~
 * <Representation mimeType="video/mp4"
 *                 frameRate="24"
 *                 bandwidth="1558322"
 *                 codecs="avc1.4d401f" width="1277" height="544">
 *    <BaseURL>http://cdn.bitmovin.net/bbb/video-1500k.mp4</BaseURL>
 *    <SegmentBase indexRange="0-834"/>
 * </Representation>
 * ~~~~
 * The Representation example references one single segment through the BaseURL which is the 1500 kbps video quality of the
 * corresponding content. The index of the quality is described by the SegmentBase attribute indexRange. This means that the
 * information about Random Access Points (RAP) and other initialization information is contained in the first 834 bytes.
 *
 * XSL
 * ~~~~
 * <xs:complexType name="SegmentBaseType">
 *    <xs:sequence>
 *       <xs:element name="Initialization" type="URLType" minOccurs="0"/>
 *       <xs:element name="RepresentationIndex" type="URLType" minOccurs="0"/>
 *       <xs:any namespace="##other" processContents="lax" minOccurs="0" maxOccurs="unbounded"/>
 *    </xs:sequence>
 *    <xs:attribute name="timescale" type="xs:unsignedInt"/>
 *    <xs:attribute name="presentationTimeOffset" type="xs:unsignedLong"/>
 *    <xs:attribute name="timeShiftBufferDepth" type="xs:duration"/>
 *    <xs:attribute name="indexRange" type="xs:string"/>
 *    <xs:attribute name="indexRangeExact" type="xs:boolean"  default="false"/>
 *    <xs:attribute name="availabilityTimeOffset" type="xs:double"/>
 *    <xs:attribute name="availabilityTimeComplete" type="xs:boolean"/>
 *    <xs:anyAttribute namespace="##other" processContents="lax"/>
 * </xs:complexType>
 * ~~~~
 *
 * @see ISO/IEC 23009-1:2014 5.3.9 Segments and Segment information
 * @see ISO/IEC 23009-1:2014 6.2.3.2 TODO
 */
export class SegmentBase extends TreeElement {
  /**
   * Timescale in units per seconds to be used for the derivation of different real-time duration values in
   * the Segment Information.
   *
   * If not present on any level, it shall be set to 1.
   *
   * NOTE: This may be any frequency but typically is the media clock frequency of one of the media serverStreams
   * (or a positive integer multiple thereof).
   */
  public timescale: number;
  /**
   * pPresentation time offset of the Representation relative to the start of the Period, i.e. the presentation
   * time value of the media stream that shall be presented at the start of this Period.
   *
   * The value of the presentation time offset in seconds is the division of the value of this attribute and the
   * value of the @timescale attribute.
   *
   * If not present on any level, the value of the presentation time offset is 0.
   */
  public presentationTimeOffset: number;
  /**
   * Duration of the time shifting buffer for this Representation that is guaranteed to be available for a Media
   * Presentation with type 'dynamic'. When not present, the value is of the @timeShiftBufferDepth on MPD level
   * applies. If present, this value shall be not smaller than the value on MPD level. This value of the attribute
   * is undefined if the type attribute is equal to ‘static’.
   *
   * NOTE: When operating in a time-shift buffer on a Representation with value larger than the time-shift buffer
   * than signalled on MPD level, not all Representations may be available for switching.
   */
  public timeShiftBufferDepth: string;
  /**
   * byte range that contains the Segment Index in all Media Segments of the Representation.
   * The byte range shall be expressed and formatted as a byte-range-spec as defined in RFC 2616, Clause 14.35.1. It is
   * restricted to a single expression identifying a contiguous range of bytes.
   * If not present the value is unknown
   */
  public indexRange: string;
  /**
   * when set to 'true' specifies that for all Segments in the Representation, the data outside the prefix defined
   * by @indexRange contains the data needed to access all access units of all media serverStreams syntactically and semantically.
   * This attribute shall not be present if @indexRange is absent.
   */
  public indexRangeExact: boolean;
  /**
   * offset to define the adjusted segment availability time. The value is specified in seconds, possibly with arbitrary precision.
   * The offset provides the time how much earlier these segments are available compared to their computed availability start time
   * for all Segments of all associated Representation.
   * The segment availability start time defined by this value is referred to as adjusted segment availability start time. For
   * details on computing the adjusted segment availability start time, refer to 5.3.9.5.
   * If not present, no adjusted segment availability start time is defined.
   * NOTE: the value of "INF" implies availability of all segments starts at MPD@availabilityStartTime.
   */
  public availabilityTimeOffset: number;
  /**
   * specifies if all Segments of all associated Representation are complete at the adjusted availability start time. The attribute
   * shall be ignored if @availabilityTimeOffset is not present on any level.
   * If not present on any level, the value is inferred to true.
   * NOTE: If the value is set to false, then it may be inferred by the client that the segment is available at its announced
   * location prior being complete.
   */
  public availabilityTimeComplete: boolean;
  /**
   * URL including a possible byte range for the Initialization Segment.
   *
   * @see ISO/IEC 23009-1:2014 5.3.9.2.2 Semantics Table 13
   */
  public initialization: Initialization;
  /**
   * URL including a possible byte range for the Representation Index Segment.
   *
   * @see ISO/IEC 23009-1:2014 5.3.9.2.2 Semantics Table 13
   */
  public representationIndex: RepresentationIndex;

  /**
   * Returns `true` if the object is deep equal to this.
   *
   * @param {TreeElement} a - object to compare to
   * @returns {boolean} true if a === b
   */
  public isEqual(a: TreeElement): boolean {
    return isDefined(a) &&
      a instanceof SegmentBase &&
      this.timescale === a.timescale &&
      this.presentationTimeOffset === a.presentationTimeOffset &&
      this.timeShiftBufferDepth === a.timeShiftBufferDepth &&
      this.indexRange === a.indexRange &&
      this.indexRangeExact === a.indexRangeExact &&
      this.availabilityTimeOffset === a.availabilityTimeOffset &&
      this.availabilityTimeComplete === a.availabilityTimeComplete &&
      this.initialization.isEqual(a.initialization) &&
      this.representationIndex.isEqual(a.representationIndex);
  }

  /**
   * Title of this node in the MPD tree.
   *
   * @returns {string} MPD tree node title
   */
  public nodeTitle(): string {
    return 'Segment Base';
  }

  /**
   * HTML-formatted simple contents of this MPD tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this MPD tree node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${this.subNodeText()}
              </ul>`;
  }

  /**
   * Allows [[MultipleSegmentBase]] to include fields.
   *
   * @returns {string}
   */
  public subNodeText(): string {
    return `${formatTreeItem('timescale', formatInt(this.timescale))}
                ${formatTreeItem('presentation time offset',
      getFormattedTimeLong(this.presentationTimeOffset, this.timescale))}
                ${formatTreeItem('time shift buffer depth', XMLUtils.interpretISODuration(this.timeShiftBufferDepth))}
                ${formatTreeItem('index range', this.indexRange)}
                ${formatTreeItem('index range exact', formatBoolean(this.indexRangeExact))}
                ${formatTreeItem('availability time offset',
      getFormattedTimeLong(this.availabilityTimeOffset, this.timescale))}
                ${formatTreeItem('availability time complete', formatBoolean(this.availabilityTimeComplete))}`;
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
                ${fieldString('timescale', this.timescale, newIndent)}
                ${fieldString('presentationTimeOffset', this.presentationTimeOffset, newIndent)}
                ${fieldString('timeShiftBufferDepth', this.timeShiftBufferDepth, newIndent)}
                ${fieldString('indexRange', this.indexRange, newIndent)}
                ${fieldString('indexRangeExact', this.indexRangeExact, newIndent)}
                ${fieldString('availabilityTimeOffset', this.availabilityTimeOffset, newIndent)}
                ${fieldString('availabilityTimeComplete', this.availabilityTimeComplete, newIndent)}
                ${childrenString('initialization', this.initialization as unknown as TreeElement, newIndent)}
                ${childrenString('representationIndex', this.representationIndex as unknown as TreeElement,
      newIndent)}`;
  }

  /**
   * `true` if this node has no information.
   *
   * @returns {boolean}
   */
  public isEmpty(): boolean {
    return anyUndefined(this.timescale, this.presentationTimeOffset, this.timeShiftBufferDepth,
      this.indexRange, this.indexRangeExact, this.availabilityTimeOffset, this.availabilityTimeComplete,
      this.initialization, this.representationIndex);
  }
}
