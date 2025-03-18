// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../../../core/models/dtv/utils/TreeElement';
import {childrenString, fieldString, formatTreeItem} from '../../../../../../core/models/dtv/utils/TreeUtils';
import {allUndefined, isDefined} from '../../../../../../core/models/dtv/utils/Utils';
import {MultipleSegmentBase} from './MultipleSegmentBase';

/**
 * A pattern of segments played on the client. Contains media data and/or metadata to access, decode and present
 * the included media contentBase class for [[MultipleSegmentBase]].
 *
 * At each level at most one of the three, [[SegmentBase]], [[SegmentTemplate]] and [[SegmentList]] shall be present.
 * Further, if [[SegmentTemplate]] or [[SegmentList]] is present on one level of the hierarchy, then the other one shall not be present
 * on any lower hierarchy level.
 *
 * The SegmentTemplate element provides a mechanism to construct a list of segments from a given template. This means that
 * specific identifiers will be substituted by dynamic values to create a list of segments. This has several advantages, e.g.,
 * SegmentList based MPDs can become very large because each segment needs to be referenced individually, compared with
 * SegmentTemplate, this list could be described by a few lines that indicate how to build a large list of segments.
 *
 * Number based SegmentTemplate
 * ~~~~
 * <Representation mimeType="video/mp4"
 *                 frameRate="24"
 *                 bandwidth="1558322"
 *                 codecs="avc1.4d401f" width="1277" height="544">
 *    <SegmentTemplate media="http://cdn.bitmovin.net/bbb/video-1500/segment-$Number$.m4s"
 *                     initialization="http://cdn.bitmovin.net/bbb/video-1500/init.mp4"
 *                     startNumber="0"
 *                     timescale="24"
 *                     duration="48"/>
 * </Representation>
 * ~~~~
 * The example above shows the number based SegmentTemplate mechanism. As you can see, instead of having multiple individual
 * segment references through SegmentURL as shown in the SegmentList example, a SegmentTemplate can describe this use case in just
 * a few lines, which makes the MPD more compact. This is especially useful for longer movies with multiple Representations where
 * an MPD with SegmentList could have multiple megabytes, which would heavily increase the startup latency of a stream, as the
 * client has to fetch the MPD before it could start with the actual streaming process.
 *
 * Time Based SegmentTemplate
 * The SegmentTemplate element could also contain a $Time$ identifier, which will be substituted with the value of the t attribute
 * from the SegmentTimeline. The SegmentTimeline element provides an alternative to the duration attribute with additional features
 * such as:
 * - specifying arbitrary segment durations
 * - specifying exact segment durations
 * - specifying discontinuities in the media timeline
 *
 * The SegmentTimeline also uses run-length compression, which is especially efficient when having a sequence of segments with the
 * same duration. When SegmentTimline is used with SegmentTemplate then the following conditions must apply:
 * - at least one sidx box shall be present
 * - all values of the SegmentTimeline shall describe accurate
 * - timing, equal to the information in the sidx box
 *
 * For example, MPD excerpt with a SegmentTemplate that is based on a SegmentTimeline is shown below.
 * ~~~~
 * <Representation mimeType="video/mp4"
 *                 frameRate="24"
 *                 bandwidth="1558322"
 *                 codecs="avc1.4d401f" width="1277" height="544">
 *    <SegmentTemplate media="http://cdn.bitmovin.net/bbb/video-1500/segment-$Time$.m4s"
 *                     initialization="http://cdn.bitmovin.net/bbb/video-1500/init.mp4"
 *                     timescale="24">
 *       <SegmentTimeline>
 *          <S t="0" d="48" r="5"/>
 *       </SegmentTimeline>
 *    </SegmentTemplate>
 * </Representation>
 * ~~~~
 * The resulting segment requests of the client would be as follows:
 * - http://cdn.bitmovin.net/bbb/video-1500/init.mp4
 * - http://cdn.bitmovin.net/bbb/video-1500/segment-0.m4s
 * - http://cdn.bitmovin.net/bbb/video-1500/segment-48.m4s
 * - http://cdn.bitmovin.net/bbb/video-1500/segment-96.m4s
 *
 * XSL (merged)
 * ~~~~
 * <xs:complexType name="MergedSegmentTemplateType">
 *    <xs:complexContent>
 *        <xs:sequence>
 *           <xs:element name="Initialization" type="URLType" minOccurs="0"/>
 *           <xs:element name="RepresentationIndex" type="URLType" minOccurs="0"/>
 *           <xs:any namespace="##other" processContents="lax" minOccurs="0" maxOccurs="unbounded"/>
 *
 *           <xs:element name="SegmentTimeline" type="SegmentTimelineType" minOccurs="0"/>
 *           <xs:element name="BitstreamSwitching" type="URLType" minOccurs="0"/>
 *        </xs:sequence>
 *        <xs:attribute name="duration" type="xs:unsignedInt"/>
 *        <xs:attribute name="startNumber" type="xs:unsignedInt"/>
 *        <xs:attribute name="timescale" type="xs:unsignedInt"/>
 *        <xs:attribute name="presentationTimeOffset" type="xs:unsignedLong"/>
 *        <xs:attribute name="timeShiftBufferDepth" type="xs:duration"/>
 *        <xs:attribute name="indexRange" type="xs:string"/>
 *        <xs:attribute name="indexRangeExact" type="xs:boolean" default="false"/>
 *        <xs:attribute name="availabilityTimeOffset" type="xs:double"/>
 *        <xs:attribute name="availabilityTimeComplete" type="xs:boolean"/>
 *        <xs:anyAttribute namespace="##other" processContents="lax"/>
 *
 *       <xs:attribute name="media" type="xs:string"/>
 *       <xs:attribute name="index" type="xs:string"/>
 *       <xs:attribute name="initialization" type="xs:string" />
 *       <xs:attribute name="bitstreamSwitching" type="xs:string" />
 *    </xs:complexContent>
 * </xs:complexType>
 * ~~~~
 *
 * XML
 * ~~~~
 * <SegmentTemplate media="segment-$Number$.ts" timescale="90000">...
 * ~~~~
 *
 * Java: com.triveni.gb.server.standards.atsc3.route.mpd.model.SegmentTemplate
 *
 * @see ISO/IEC 23009-1:2014 5.3.9.4 Segments and Segment information -> Segment Templates
 */
export class SegmentTemplate extends MultipleSegmentBase {
  /**
   * template to create the Media Segment List.
   *
   * @see ISO/IEC 23009-1:2014 5.3.9.4.4 Template-based Segment URL construction
   */
  public media: string;

  /**
   * template to create the Index Segment List. If neither the $Number$ nor the $Time$ identifier is included, this provides the URL to a Representation Index.
   *
   * @see ISO/IEC 23009-1:2014 5.3.9.4.4 Template-based Segment URL construction
   */
  public index: string;

  /**
   * Returns `true` if this MPD tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return super.isLeaf();
  }

  /**
   * Title of this node in the MPD tree.
   *
   * @returns {string} MPD tree node title
   */
  public nodeTitle(): string {
    return `Segment Template ${this.media ?? ''}`;
  }

  /**
   * HTML-formatted simple contents of this MPD tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this MPD tree node.
   */
  public treeNodeText(): string {
    const resolvedURLs: string[] = this.findNearestResolvedBaseURLStrings();
    const resolvedMediaURLStrings: string = resolvedURLs.reduce((acc: string, url: string) =>
      `${acc} ${formatTreeItem('resolved media URL', url + this.media || '')}`, '');
    const resolvedIndexURLStrings: string = resolvedURLs.reduce((acc: string, url: string) =>
      `${acc} ${formatTreeItem('resolved index URL', url + this.index || '')}`, '');

    return `<ul class="nodeInfo">
                ${super.treeNodeText()}
                ${formatTreeItem('media', this.media)}
                ${resolvedMediaURLStrings}
                ${formatTreeItem('index', this.index)}
                ${resolvedIndexURLStrings}
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
      a instanceof SegmentTemplate &&
      this.media === a.media &&
      this.index === a.index &&
      this.initialization === a.initialization &&
      this.bitstreamSwitching === a.bitstreamSwitching &&
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
                ${fieldString('media', this.media, newIndent)}
                ${fieldString('index', this.index, newIndent)}
                ${childrenString('initialization', this.initialization as unknown as TreeElement, newIndent)}
                ${childrenString('bitstreamSwitching', this.bitstreamSwitching as unknown as TreeElement, newIndent)}
                ${super.toString(newIndent)}`;
  }

  /**
   * `true` if this node has no information.
   *
   * @returns {boolean}
   */
  public isEmpty(): boolean {
    return allUndefined(this.media, this.index, this.initialization, this.bitstreamSwitching);
  }
}

