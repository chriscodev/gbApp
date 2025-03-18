// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../../../core/models/dtv/utils/TreeElement';
import {
  childrenString,
  fieldString,
  formatInt,
  formatTreeItem,
  isArrayEmpty
} from '../../../../../../core/models/dtv/utils/TreeUtils';
import {allUndefined, isDefined} from '../../../../../../core/models/dtv/utils/Utils';
import {BaseURL} from './BaseURL';
import {CommonRepresentation} from './CommonRepresentation';
import {SegmentBase} from './SegmentBase';
import {SegmentList} from './SegmentList';
import {SegmentTemplate} from './SegmentTemplate';
import {SubRepresentation} from './SubRepresentation';

/**
 * Different encodings of a part of a media stream, separated by resolution, codec, or bandwidth, to allow
 * matching to download speeds, clients or display size. Each [[Representation]] consists of one or more Segments
 * ([[SegmentBase]], [[SegmentList]], or [[SegmentTemplate]]). May also include [[SubRepresentation]]s
 * to describe and extract partial information from a [[Representation]].
 *
 * A Representation describes a deliverable encoded version of one or several media content components. A Representation
 * includes one or more media serverStreams (one for each media content component in the multiplex). Any single Representation
 * within an Adaptation Set is sufficient to render the contained media content components. By collecting different
 * Representations in one Adaptation Set, the Media Presentation author expresses that the Representations represent perceptually
 * equivalent content. Typically this means that clients may switch dynamically from Representation to Representation within
 * an Adaptation Set in order to adapt to network conditions or other factors. Switching refers to the presentation of decoded
 * data up to a certain time t, and presentation of decoded data of another Representation from time t onwards. If Representations
 * are included in one Adaptation Set, and the client switches properly, the Media Presentation is expected to be perceived
 * seamless across the switch. Clients may ignore Representations that rely on codecs or other rendering technologies they do not
 * support or that are otherwise unsuitable.
 *
 * Representations contain interchangeable versions of the respective content, e.g., different resolutions, bitrates etc. Although
 * one single Representation would be enough to provide a playable stream, multiple Representations give the client the possibility
 * to adapt the media stream to its current network conditions and bandwidth requirements and therefore guarantee smooth playback.
 * Of course, there are also further characteristics beyond the bandwidth describing the different representations and enabling
 * adaptation. Representations may differ in the used codec, the decoding complexity and therefore the necessary CPU resources or
 * the rendering technology, just to name a few examples.
 *
 * Segments are typically referenced through URLs as defined in RFC3986, using HTTP or HTTPs restricted possibly by a byte range.
 * The byte range can be signaled through the attribute range and must be compliant to the RFC2616. Segments are part of a
 * Representation, while elements like, BaseURL, SegmentBase, SegmentTemplate and SegmentList can add additional information,
 * such as location, availability and further properties. Specifically a Representation shall contain only one option of the following:
 * - one or more SegmentList elements
 * - one SegmentTemplate
 * - one or more BaseURL elements, at most one SegmentBase element and no SegmentTemplate or SegmentList element.
 *
 * Segments enable switching between individual Representations during playback. Those Segments are described by a
 * URL and in certain cases by an additional byte range if those segments are stored in a bigger, continuous file. The
 * Segments in a Representation usually have the same length in terms of time and are arranged according to the media
 * presentation timeline, which represents the timeline for the synchronization, enabling the smooth switching of Representations
 * during playback. Segments could also have an availability time signaled as wall-clock time from which they are accessible
 * for live streaming scenarios. In contrast to other systems, MPEG-DASH does not restrict the segment length or give advice
 * on the optimal length. This can be chosen depending on the given scenario, e.g., longer Segments allow more efficient
 * compression as Group of Pictures (GOP) could be longer or less network overhead, as each Segment will be requested through
 * HTTP and with each request a certain amount of HTTP overhead is introduced. In contrast, shorter Segments are used for live
 * scenarios as well as for highly variable bandwidth conditions like mobile networks, as they enable faster and flexible
 * switching between individual bitrates.
 *
 * Segments may also be subdivided into smaller Subsegments which represent a set of smaller access units in the given Segment. In
 * this case, there is a Segment index available in the Segment describing the presentation time range and byte position of the
 * Subsegments, which may be downloaded by the client in advance to generate the appropriate Subsegment requests using HTTP 1.1
 * byte range requests.
 *
 * During the playback of the content, arbitrary switching between the Representations is not possible at any point in the
 * stream and certain constraints have to be considered. So the Segments are, e.g., not allowed to overlap, dependencies between
 * segments are also not allowed. To enable the switching between Representations, MPEG-DASH introduced Stream Access Points
 * (SAP) on which this is possible. As an example, each Segment typically begins with an IDR-frame (in H.264/AVC) to be able to
 * switch the Representation always after the transmission of one segment.
 *
 * Java: com.triveni.gb.server.standards.atsc3.route.mpd.model.Representation
 *
 * XSL
 * ~~~~
 * <xs:complexType name="MergedRepresentationType">
 *    <xs:sequence>
 *       <xs:element name="FramePacking" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:element name="AudioChannelConfiguration" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:element name="ContentProtection" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:element name="EssentialProperty" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:element name="SupplementalProperty" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:element name="InbandEventStream" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:any namespace="##other" processContents="lax" minOccurs="0" maxOccurs="unbounded"/>
 *
 *       <xs:element name="BaseURL" type="BaseURLType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:element name="SubRepresentation" type="SubRepresentationType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:element name="SegmentBase" type="SegmentBaseType" minOccurs="0"/>
 *       <xs:element name="SegmentList" type="SegmentListType" minOccurs="0"/>
 *       <xs:element name="SegmentTemplate" type="SegmentTemplateType" minOccurs="0"/>
 *    </xs:sequence>
 *    <xs:attribute name="profiles" type="xs:string"/>
 *    <xs:attribute name="width" type="xs:unsignedInt"/>
 *    <xs:attribute name="height" type="xs:unsignedInt"/>
 *    <xs:attribute name="sar" type="RatioType"/>
 *    <xs:attribute name="frameRate" type="FrameRateType"/>
 *    <xs:attribute name="audioSamplingRate" type="xs:string"/>
 *    <xs:attribute name="mimeType" type="xs:string"/>
 *    <xs:attribute name="segmentProfiles" type="xs:string"/>
 *    <xs:attribute name="codecs" type="xs:string"/>
 *    <xs:attribute name="maximumSAPPeriod" type="xs:double"/>
 *    <xs:attribute name="startWithSAP" type="SAPType"/>
 *    <xs:attribute name="maxPlayoutRate" type="xs:double"/>
 *    <xs:attribute name="codingDependency" type="xs:boolean"/>
 *    <xs:attribute name="scanType" type="VideoScanType"/>
 *    <xs:anyAttribute namespace="##other" processContents="lax"/>
 *
 *    <xs:attribute name="id" type="StringNoWhitespaceType" use="required"/>
 *    <xs:attribute name="bandwidth" type="xs:unsignedInt" use="required"/>
 *    <xs:attribute name="qualityRanking" type="xs:unsignedInt"/>
 *    <xs:attribute name="dependencyId" type="StringVectorType"/>
 *    <xs:attribute name="mediaStreamStructureId" type="StringVectorType"/>
 * </xs:complexType>
 * ~~~~
 *
 * @see ISO/IEC 23009-1:2014 5.3.5 Representation
 * @see ISO/IEC 23009-1:2014 5.3.6 Sub-Representation
 * @see ISO/IEC 23009-1:2014 5.3.7 Common attributes and elements
 * @see ISO/IEC 23009-1:2014 6 Segment formats
 */
export class Representation extends CommonRepresentation {
  /**
   * Identifier for this Representation. The identifier shall be unique within a Period unless the Representation
   * is functionally identical to another Representation in the same Period.
   *
   * The identifier shall not contain whitespace characters.
   *
   * If used in the template-based URL construction as defined in 5.3.9.4.4, the string shall only contain
   * characters that are permitted within an HTTP-URL according to RFC 3986.
   *
   * @see ISO/IEC 23009-1:2014 5.3.9.4.4 Segment timeline
   * @see RFC 3986
   */
  public id: string;

  /**
   * Consider a hypothetical constant bitrate channel of bandwidth with the value of this attribute in bits per second
   * (bps). Then, if the Representation is continuously delivered at this bitrate, starting at any SAP that is indicated
   * either by @startWithSAP or by any Segment Index box, a client can be assured of having enough data for continuous
   * playout providing playout begins after @minBufferTime * @bandwidth bits have been received (i.e. at time @minBufferTime
   * after the first bit is received).
   *
   * For dependent Representations this value specifies the bandwidth according to the above definition for the aggregation
   * of this Representation and all complementary Representations.
   */
  public bandwidth: number;

  /**
   * Quality ranking of the Representation relative to other Representations in the same Adaptation Set. Lower values
   * represent higher quality content. If not present then no ranking is defined.
   */
  public qualityRanking: number;

  /**
   * All complementary Representations the Representation depends on in the decoding and/or presentation process as a
   * whitespace-separated list of values of @id attributes.
   *
   * If not present, the Representation can be decoded and presented independently of any other Representation.
   *
   * This attribute shall not be present where there are no dependencies.
   */
  public dependencyID: string;

  public mediaStreamStructureID: string;

  /**
   * [[BaseURL]]s that can be used for reference resolution and alternative URL selection.
   *
   * @type {BaseURL[]}
   * @see ISO/IEC 23009-1:2014 5.6 Base URLs
   */
  public baseURLList: BaseURL[] = [];

  /**
   * TODO
   *
   * @type {SubRepresentation[]}
   * @see ISO/IEC 23009-1:2014 5.3.6 Sub-Representation
   */
  public subrepresentationList: SubRepresentation[] = [];

  /**
   * Default [[SegmentBase]] information.
   * Information in this element is overridden by information in Representation.SegmentBase, if present.
   *
   * @type {SegmentBase}
   * @see ISO/IEC 23009-1:2014(E) 5.3.9 Segments and Segment information
   */
  public segmentBase: SegmentBase;

  /**
   * Default Segment List information.
   * Information in this element is overridden by information in Representation.SegmentList, if present.
   *
   * @type {SegmentList[]}
   * @see ISO/IEC 23009-1:2014(E) 5.3.9 Segments and Segment information
   */
  public segmentList: SegmentList;

  /**
   * Default Segment Template information.
   * Information in this element is overridden by information in Representation.SegmentTemplate, if present.
   *
   * @type {SegmentTemplate[]}
   * @see ISO/IEC 23009-1:2014(E) 5.3.9 Segments and Segment information
   */
  public segmentTemplate: SegmentTemplate;

  /**
   * Returns `true` if this MPD tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return super.isLeaf() &&
      isArrayEmpty(this.baseURLList) &&
      isArrayEmpty(this.subrepresentationList) &&
      allUndefined(this.segmentBase, this.segmentList, this.segmentTemplate);
  }

  /**
   * Title of this node in the MPD tree.
   *
   * @returns {string} MPD tree node title
   */
  public nodeTitle(): string {
    return `Representation ${this.id ?? ''}`;
  }

  /**
   * HTML-formatted simple contents of this MPD tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this MPD tree node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${super.treeNodeText()}
                ${formatTreeItem('id', this.id)}
                ${formatTreeItem('bandwidth', formatInt(this.bandwidth))}
                ${formatTreeItem('quality ranking', formatInt(this.qualityRanking))}
                ${formatTreeItem('dependency ID', this.dependencyID)}
                ${formatTreeItem('media stream structure ID', this.mediaStreamStructureID)}
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
      a instanceof Representation &&
      this.id === a.id &&
      this.bandwidth === a.bandwidth &&
      this.qualityRanking === a.qualityRanking &&
      this.dependencyID === a.dependencyID &&
      this.mediaStreamStructureID === a.mediaStreamStructureID &&
      BaseURL.isEqualArray(this.baseURLList, a.baseURLList) &&
      SubRepresentation.isEqualArray(this.subrepresentationList, a.subrepresentationList) &&
      this.segmentBase.isEqual(a.segmentBase) &&
      this.segmentList.isEqual(a.segmentList) &&
      this.segmentTemplate.isEqual(a.segmentTemplate) &&
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
                ${fieldString('id', this.id, newIndent)}
                ${fieldString('bandwidth', this.bandwidth, newIndent)}
                ${fieldString('qualityRanking', this.qualityRanking, newIndent)}
                ${fieldString('dependencyID', this.dependencyID, newIndent)}
                ${fieldString('mediaStreamStructureID', this.mediaStreamStructureID, newIndent)}
                ${super.toString(newIndent)}
                ${childrenString('baseURLList', this.baseURLList, newIndent)}
                ${childrenString('subrepresentationList', this.subrepresentationList, newIndent)}
                ${childrenString('segmentBaseList', this.segmentBase as unknown as TreeElement, newIndent)}
                ${childrenString('segmentLists', this.segmentList as unknown as TreeElement[], newIndent)}
                ${childrenString('segmentTemplateList', this.segmentTemplate as unknown as TreeElement, newIndent)}`;
  }
}
