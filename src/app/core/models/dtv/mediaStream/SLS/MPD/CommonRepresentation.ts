// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../../../core/models/dtv/utils/TreeElement';
import {
  fieldString,
  formatBoolean,
  formatInt,
  formatTreeItem,
  isArrayEmpty
} from '../../../../../../core/models/dtv/utils/TreeUtils';
import {arrayEquals, isDefined} from '../../../../../../core/models/dtv/utils/Utils';
import {AudioChannelConfiguration} from './AudioChannelConfiguration';
import {ContentProtection} from './ContentProtection';
import {EssentialProperty} from './EssentialProperty';
import {FramePacking} from './FramePacking';
import {InbandEventStream} from './InbandEventStream';
import {SupplementalProperty} from './SupplementalProperty';

/**
 * Base class for [[AdaptationSet]], [[Representation]], and [[SubRepresentation]].
 *
 * Does not appear on its own. TODO make abstract
 *
 * Java: com.triveni.gb.server.standards.atsc3.route.mpd.model.CommonRepresentation
 *
 * XSL
 * ~~~~
 * <xs:complexType name="RepresentationBaseType">
 *    <xs:sequence>
 *       <xs:element name="FramePacking" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:element name="AudioChannelConfiguration" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:element name="ContentProtection" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:element name="EssentialProperty" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:element name="SupplementalProperty" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:element name="InbandEventStream" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:any namespace="##other" processContents="lax" minOccurs="0" maxOccurs="unbounded"/>
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
 * </xs:complexType>
 *
 *  <!-- Stream Access Point type enumeration -->
 *  <xs:simpleType name="SAPType">
 *     <xs:restriction base="xs:unsignedInt">
 *        <xs:minInclusive value="0"/>
 *        <xs:maxInclusive value="6"/>
 *     </xs:restriction>
 *  </xs:simpleType>
 *
 *  <!-- Video Scan type enumeration -->
 *  <xs:simpleType name="VideoScanType">
 *     <xs:restriction base="xs:string">
 *        <xs:enumeration value="progressive"/>
 *        <xs:enumeration value="interlaced"/>
 *        <xs:enumeration value="unknown"/>
 *     </xs:restriction>
 *  </xs:simpleType>
 * ~~~~
 *
 * @see ISO/IEC 23009-1:2014 5.3.7 Common Representations
 */
export class CommonRepresentation extends TreeElement {
  /**
   * Profiles which the associated [[Representation]](s) conform to of the list of Media Presentation profiles. The
   * value shall be a subset of the respective value in any higher level of the document hierarchy ([[Representation]],
   * [[AdaptationSet]], [[MPD]]).
   *
   * If not present, the value is inferred to be the same as in the next higher level of the document hierarchy. For
   * example, if the value is not present for a [[Representation]], then @profiles at the [[AdaptationSet]] level is valid
   * for the [[Representation]].
   *
   * @see ISO/IEC 23009-1:2014 8 Profiles
   * @see ISO/IEC 23009-1:2014 5.3.1.2 Hierarchical data model Semantics
   */
  public profiles: string;

  /**
   * Horizontal visual presentation size of the video media type on a grid determined by the @sar attribute.
   * In the absence of @sar width and height are specified as if the value of @sar were "1:1"
   * NOTE The visual presentation size of the video is equal to the number of horizontal and vertical samples used
   * for presentation after encoded samples are cropped in response to encoded cropping parameters, “overscan”
   * signaling, or “pan/scan” display parameters, e.g. SEI messages.
   * If not present on any level, the value is unknown.
   */
  public width: number;

  /**
   * Vertical visual presentation size of the video media type, on a grid determined by the @sar attribute.
   * If not present on any level, the value is unknown.
   */
  public height: number;

  /**
   * Sample aspect ratio of the video media component type, in the form of a string consisting of two integers
   * separated by ‘:’, e.g.,”10:11”. The first number specifies the horizontal size of the encoded video pixels
   * (samples) in arbitrary units. The second number specifies the vertical size of the encoded video pixels
   * (samples) in same units as the horizontal size.
   * If not present on any level, the value is unknown.
   */
  public sar: string;

  /**
   * Output frame rate (or in the case of interlaced, half the output field rate) of the video media type in the
   * Representation. If the frame or field rate is varying, the value is the average frame or half the average field
   * rate field rate over the entire duration of the Representation.
   *
   * The value is coded as a string, either containing two integers separated by a "/", ("F/D"), or a single integer
   * "F". The frame rate is the division F/D, or F, respectively, per second (i.e. the default value of D is “1”).
   *
   * If not present on any level, the value is unknown.
   */
  public frameRate: string;

  /**
   * Either a single decimal integer value specifying the sampling rate or a whitespace separated pair of decimal
   * integer values specifying the minimum and maximum sampling rate of the audio media component type. The values are in samples per second.
   * If not present on any level, the value is unknown.
   */
  public audioSamplingRate: string;

  /**
   * MIME type of the concatenation of the Initialization Segment, if present, and all consecutive Media Segments in the Representation.
   */
  public mimeType: string;

  /**
   * Profiles of Segments that are essential to process the Representation. The detailed semantics depend on the value
   * of the @mimeType attribute.
   *
   * The contents of this attribute shall conform to either the pro-simple or pro-fancy productions of RFC6381, Section 4.5,
   * without the enclosing DQUOTE characters, i.e. including only the unencodedv or encoded elements respectively. As profile
   * identifier the brand identifier for the Segment as defined in 6 shall be used.
   *
   * If not present on any level, the value may be deducted from the value of the @profiles attribute.
   *
   * @see RFC 6381 Section 4.5
   */
  public segmentProfiles: string;

  /**
   * Codecs present within the Representation. The codec parameters shall also include the profile and level
   * information where applicable.
   *
   * For segment formats defined in this specification this element shall be present and the contents of this attribute shall
   * conform to either the simp-list or fancy-list productions of RFC6381, Section 3.2, without the enclosing DQUOTE characters.
   * The codec identifier for the Representation's media format, mapped into the name space for codecs as specified in RFC6381,
   * Section 3.3, shall be used.
   *
   * @see RFC 6381 Section 3.3
   */
  public codecs: string;

  /**
   * Maximum SAP interval in seconds of all contained media serverStreams, where the SAP interval is the maximum time interval
   * between the TSAP of any two successive SAPs of types 1 to 3 inclusive of one media stream in the associated Representations.
   * If not present on any level, the value is unknown.
   */
  public maximumSAPPeriod: number;

  /**
   * When present and greater than 0, specifies that in the associated Representations, each Media Segment starts with a SAP of
   * type less than or equal to the value of this attribute value in each media stream.
   */
  public startWithSAP: number;

  /**
   * Maximum playout rate as a multiple of the regular playout rate, which is supported with the same decoder profile and
   * level requirements as the normal playout rate. If not present on any level, the value is 1.
   */
  public maxPlayoutRate: number;

  /**
   * When present and ‘true’, for all contained media serverStreams, specifies that there is at least one access unit that depends
   * on one or more other access units for decoding. When present and ‘false’, for any contained media stream, there is no
   * access unit that depends on any other access unit for decoding (e.g. for video all the pictures are intra coded). If not
   * specified on any level, there may or may not be coding dependency between access units.
   */
  public codingDependency: boolean;

  /**
   * Scan type of the source material of the video media component type. The value may be equal to one of “progressive”,
   * “interlaced” and “unknown”. If not specified on any level, the scan type is "progressive".
   */
  public scanType: string; // TODO enum "progressive" "interlaced"  "unknown"

  /**
   * Frame-packing arrangement information of the video media component type.
   * When no FramePacking element is provided for a video component, frame-packing shall not used for the video media component.
   *
   * @type {FramePacking[]}
   * @see ISO/IEC 23009-1:2014 5.8.1 Descriptors General
   * @see ISO/IEC 23009-1:2014 5.8.4.6 Frame-packing
   */
  public framePackingList: FramePacking[] = [];

  /**
   * audio channel configuration of the audio media component type.
   *
   * @type {AudioChannelConfiguration[]}
   * @see ISO/IEC 23009-1:2014 5.8.1 Descriptors General
   * @see ISO/IEC 23009-1:2014 5.8.4.7 Audio channel configuration
   */
  public audioChannelConfigurationList: AudioChannelConfiguration[] = [];

  /**
   * Information about content protection schemes used for the associated Representations.
   *
   * @type {ContentProtection[]}
   * @see ISO/IEC 23009-1:2014 5.8.1 Descriptors General
   * @see ISO/IEC 23009-1:2014 5.8.4.1 Content protection
   */
  public contentProtectionList: ContentProtection[] = [];

  /**
   * information about the containing element that is considered essential by the Media Presentation author for processing the containing element.
   *
   * @type {EssentialProperty[]}
   * @see ISO/IEC 23009-1:2014 5.8.1 Descriptors General
   * @see ISO/IEC 23009-1:2014 5.8.4.8 Essential Property Descriptor
   */
  public essentialPropertyList: EssentialProperty[] = [];

  /**
   * supplemental information about the containing element that may be used by the DASH client optimizing the processing.
   *
   * @type {SupplementalProperty[]}
   * @see ISO/IEC 23009-1:2014 5.8.1 Descriptors General
   * @see ISO/IEC 23009-1:2014 5.8.4.9 Supplemental Property Descriptor
   */
  public supplementalPropertyList: SupplementalProperty[] = [];

  /**
   * presence of an inband event stream in the associated Representations.
   *
   * @type {InbandEventStream[]}
   * @see ISO/IEC 23009-1:2014 5.8.1 Descriptors General
   * @see ISO/IEC 23009-1:2014 5.10 Events
   */
  public inbandEventStreamList: InbandEventStream[] = [];

  /**
   * Returns `true` if this MPD tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return isArrayEmpty(this.framePackingList) &&
      isArrayEmpty(this.audioChannelConfigurationList) &&
      isArrayEmpty(this.contentProtectionList) &&
      isArrayEmpty(this.essentialPropertyList) &&
      isArrayEmpty(this.supplementalPropertyList) &&
      isArrayEmpty(this.inbandEventStreamList);
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
    return `${formatTreeItem('profiles', this.profiles)}
                ${formatTreeItem('width', formatInt(this.width))}
                ${formatTreeItem('height', formatInt(this.height))}
                ${formatTreeItem('sar', this.sar)}
                ${formatTreeItem('frame rate', this.frameRate)}
                ${formatTreeItem('audio sampling rate', this.audioSamplingRate)}
                ${formatTreeItem('MIME type', this.mimeType)}
                ${formatTreeItem('segment profiles', this.segmentProfiles)}
                ${formatTreeItem('codecs', this.codecs)}
                ${formatTreeItem('max SAP period', formatInt(this.maximumSAPPeriod))}
                ${formatTreeItem('start with SAP', formatInt(this.startWithSAP))}
                ${formatTreeItem('max playout rate', formatInt(this.maxPlayoutRate))}
                ${formatTreeItem('coding dependency', formatBoolean(this.codingDependency))}
                ${formatTreeItem('scan type', this.scanType)}`;
  }

  /**
   * Returns `true` if the object is deep equal to this.
   *
   * @param {TreeElement} a - object to compare to
   * @returns {boolean} true if a === b
   */
  public isEqual(a: TreeElement): boolean {
    return isDefined(a) &&
      a instanceof CommonRepresentation &&
      this.profiles === a.profiles &&
      this.width === a.width &&
      this.height === a.height &&
      this.sar === a.sar &&
      this.frameRate === a.frameRate &&
      this.audioSamplingRate === a.audioSamplingRate &&
      this.mimeType === a.mimeType &&
      this.segmentProfiles === a.segmentProfiles &&
      this.codecs === a.codecs &&
      this.maximumSAPPeriod === a.maximumSAPPeriod &&
      this.startWithSAP === a.startWithSAP &&
      this.maxPlayoutRate === a.maxPlayoutRate &&
      this.codingDependency === a.codingDependency &&
      this.scanType === a.scanType &&
      arrayEquals(this.framePackingList, a.framePackingList) &&
      arrayEquals(this.audioChannelConfigurationList, a.audioChannelConfigurationList) &&
      arrayEquals(this.contentProtectionList, a.contentProtectionList) &&
      arrayEquals(this.essentialPropertyList, a.essentialPropertyList) &&
      arrayEquals(this.supplementalPropertyList, a.supplementalPropertyList) &&
      arrayEquals(this.inbandEventStreamList, a.inbandEventStreamList);
  }

  /**
   * Return a human-readable string useful for debugging.
   *
   * @param {string} indent
   * @returns {string}
   */
  public toString(indent: string): string {
    const newIndent = `${indent}  `;
    return `${fieldString('profiles', this.profiles, newIndent)}
                ${fieldString('width', this.width, newIndent)}
                ${fieldString('height', this.height, newIndent)}
                ${fieldString('sar', this.sar, newIndent)}
                ${fieldString('frameRate', this.frameRate, newIndent)}
                ${fieldString('audioSamplingRate', this.audioSamplingRate, newIndent)}
                ${fieldString('mimeType', this.mimeType, newIndent)}
                ${fieldString('segmentProfiles', this.segmentProfiles, newIndent)}
                ${fieldString('codecs', this.codecs, newIndent)}
                ${fieldString('maximumSAPPeriod', this.maximumSAPPeriod, newIndent)}
                ${fieldString('startWithSAP', this.startWithSAP, newIndent)}
                ${fieldString('maxPlayoutRate', this.maxPlayoutRate, newIndent)}
                ${fieldString('codingDependency', this.codingDependency, newIndent)}
                ${fieldString('scanType', this.scanType, newIndent)}`;
  }
}
