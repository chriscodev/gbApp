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
import {MultipleSegmentBase} from './MultipleSegmentBase';
import {SegmentURL} from './SegmentURL';


/**
 * A list of segments to play on the client. Contains media data and/or metadata to access, decode and present
 * the included media contentBase class for [[MultipleSegmentBase]].
 *
 * At each level at most one of the three, [[SegmentBase]], [[SegmentTemplate]] and [[SegmentList]] shall be present.
 * Further, if [[SegmentTemplate]] or [[SegmentList]] is present on one level of the hierarchy, then the other one shall not be present
 * on any lower hierarchy level.
 *
 * The SegmentList contains a list of SegmentURL elements which should be played back by the client in the order at which they
 * occur in the MPD. A SegmentURL element contains a URL to a segment and possibly a byte range. Additionally, an index segment
 * could occur at the beginning of the SegmentList. For example, Representation using SegmentList could look like this:
 * ~~~~
 * <Representation mimeType="video/mp4"
 *                 frameRate="24"
 *                 bandwidth="1558322"
 *                 codecs="avc1.4d401f" width="1277" height="544">
 *    <SegmentList duration="10">
 *       <Initialization sourceURL="http://cdn.bitmovin.net/bbb/video-1500/init.mp4"/>
 *       <SegmentURL media="http://cdn.bitmovin.net/bbb/video-1500/segment-0.m4s"/>
 *       <SegmentURL media="http://cdn.bitmovin.net/bbb/video-1500/segment-1.m4s"/>
 *       <SegmentURL media="http://cdn.bitmovin.net/bbb/video-1500/segment-2.m4s"/>
 *       <SegmentURL media="http://cdn.bitmovin.net/bbb/video-1500/segment-3.m4s"/>
 *       <SegmentURL media="http://cdn.bitmovin.net/bbb/video-1500/segment-4.m4s"/>
 *    </SegmentList>
 * </Representation>
 * ~~~~
 *
 * XML (merged)
 * ~~~~
 *  <xs:complexType name="MergedSegmentListType">
 *     <xs:complexContent>
 *        <xs:sequence>
 *           <xs:element name="Initialization" type="URLType" minOccurs="0"/>
 *           <xs:element name="RepresentationIndex" type="URLType" minOccurs="0"/>
 *           <xs:any namespace="##other" processContents="lax" minOccurs="0" maxOccurs="unbounded"/>
 *
 *           <xs:element name="SegmentTimeline" type="SegmentTimelineType" minOccurs="0"/>
 *           <xs:element name="BitstreamSwitching" type="URLType" minOccurs="0"/>
 *           <xs:element name="SegmentURL" type="SegmentURLType" minOccurs="0" maxOccurs="unbounded"/>
 *        </xs:sequence>
 *        <xs:attribute ref="xlink:href"/>
 *        <xs:attribute ref="xlink:actuate" default="onRequest"/>
 *        <xs:attribute name="duration" type="xs:unsignedInt"/>
 *        <xs:attribute name="startNumber" type="xs:unsignedInt"/>
 *        <xs:attribute name="timescale" type="xs:unsignedInt"/>
 *        <xs:attribute name="presentationTimeOffset" type="xs:unsignedLong"/>
 *        <xs:attribute name="timeShiftBufferDepth" type="xs:duration"/>
 *        <xs:attribute name="indexRange" type="xs:string"/>
 *        <xs:attribute name="indexRangeExact" type="xs:boolean"  default="false"/>
 *        <xs:attribute name="availabilityTimeOffset" type="xs:double"/>
 *        <xs:attribute name="availabilityTimeComplete" type="xs:boolean"/>
 *        <xs:anyAttribute namespace="##other" processContents="lax"/>
 *     </xs:complexContent>
 *  </xs:complexType>
 * ~~~~
 *
 * @see ISO/IEC 23009-1:2014 5.3.9.3 Segment list
 */
export class SegmentList extends MultipleSegmentBase {
  /**
   * reference to a remote element entity that contains one or multiple elements of type SegmentList
   */
  public xlinkHREF: string;

  /**
   * specifies the processing set, can be either "onLoad" or "onRequest"
   */
  public xlinkActuate: string; // TODO "onLoad"/"onRequest"

  /**
   * specifies a Media Segment URL and a possibly present Index Segment URL
   *
   * @type {SegmentURL[]}
   */
  public segmentURLList: SegmentURL[] = [];

  /**
   * Returns `true` if this MPD tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return super.isLeaf() && isArrayEmpty(this.segmentURLList);
  }

  /**
   * Title of this node in the MPD tree.
   *
   * @returns {string} MPD tree node title
   */
  public nodeTitle(): string {
    return 'Segment List';
  }

  /**
   * HTML-formatted simple contents of this MPD tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this MPD tree node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${super.treeNodeText()}
                ${formatTreeItem('xlink:HREF', this.xlinkHREF)}
                ${formatTreeItem('xlink:Actuate', this.xlinkActuate)}
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
      a instanceof SegmentList &&
      this.xlinkHREF === a.xlinkHREF &&
      this.xlinkActuate === a.xlinkActuate &&
      arrayEquals(this.segmentURLList, a.segmentURLList) &&
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
                ${fieldString('xlink:HREF', this.xlinkHREF, newIndent)}
                ${fieldString('xlink:Actuate', this.xlinkActuate, newIndent)}
                ${super.toString(newIndent)}
                ${childrenString('segmentURLList', this.segmentURLList as unknown as TreeElement[], newIndent)}`;
  }
}
