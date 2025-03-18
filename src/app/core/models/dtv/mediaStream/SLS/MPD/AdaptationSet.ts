// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../../../core/models/dtv/utils/TreeElement';
import {
  childrenString,
  fieldString,
  formatBoolean,
  formatInt,
  formatLang,
  formatTreeItem,
  isArrayEmpty
} from '../../../../../../core/models/dtv/utils/TreeUtils';
import {isDefined, isUndefined} from '../../../../../../core/models/dtv/utils/Utils';
import {Accessibility} from './Accessibility.js';
import {BaseURL} from './BaseURL.js';
import {CommonRepresentation} from './CommonRepresentation.js';
import {ContentComponent} from './ContentComponent.js';
import {Rating} from './Rating.js';
import {Representation} from './Representation.js';
import {Role} from './Role.js';
import {SegmentBase} from './SegmentBase.js';
import {SegmentList} from './SegmentList.js';
import {SegmentTemplate} from './SegmentTemplate.js';
import {Viewpoint} from './Viewpoint.js';
import {arrayEquals} from '../../../utils/Utils';

/**
 * Parts of a media stream, like video, subtitles, or audio in a particular language. Playback is gated at the client, based on user needs.
 * An [[AdaptationSet]] contains alternate [[Representation]]s, i.e. only one [[Representation]] within an [[Adaptation]] Set is expected to be
 * presented at a time. All [[Representation]]s contained in one [[AdaptationSet]] represent the same media content components and therefore
 * contain media serverStreams that are considered to be perceptually equivalent. Possible factors for choosing a particular [[Representation]] are
 * language, media component type, picture aspect ratio, role, accessibility, viewpoint, and rating.
 *
 * Adaptation Set represents a set of interchangeable encoded versions of one or several media content components. For example there may be
 * one Adaptation Set for the main video component and a separate one for the main audio component. If there is other material available, for
 * example captions or audio descriptions, then these may each have a separate Adaptation Set. Material may also be provided in multiplexed
 * form, in which case interchangeable versions of the multiplex may be described as a single Adaptation Set, for example an Adaptation Set
 * containing both the main audio and main video for a Period. Each of the multiplexed components may be described individually by a media
 * content component description.
 *
 * AdaptationSets enable the grouping of different multimedia components that logically belong together. For example, components with the same
 * codec, language, resolution, audio channel format (e.g., 5.1, stereo) etc. could be within the same AdaptationSet. This mechanism allows the
 * client to eliminate a range of multimedia components that do not fulfill its requirements.
 *
 * Each [[AdaptationSet]] contains one or more [[Representation]]s.
 *
 * Java: com.triveni.gb.server.standards.atsc3.route.mpd.model.AdaptationSet
 *
 * XML
 * ~~~~
 * <xs:complexType name="MergedAdaptationSetType">
 *    <xs:sequence>
 *       <xs:element name="FramePacking" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:element name="AudioChannelConfiguration" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:element name="ContentProtection" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:element name="EssentialProperty" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:element name="SupplementalProperty" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:element name="InbandEventStream" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:any namespace="##other" processContents="lax" minOccurs="0" maxOccurs="unbounded"/>
 *
 *       <xs:element name="Accessibility" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:element name="Role" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:element name="Rating" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:element name="Viewpoint" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:element name="ContentComponent" type="ContentComponentType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:element name="BaseURL" type="BaseURLType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:element name="SegmentBase" type="SegmentBaseType" minOccurs="0"/>
 *       <xs:element name="SegmentList" type="SegmentListType" minOccurs="0"/>
 *       <xs:element name="SegmentTemplate" type="SegmentTemplateType" minOccurs="0"/>
 *       <xs:element name="Representation" type="RepresentationType" minOccurs="0" maxOccurs="unbounded"/>
 *    </xs:sequence>
 *
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
 *    <xs:attribute ref="xlink:href"/>
 *    <xs:attribute ref="xlink:actuate" default="onRequest"/>
 *    <xs:attribute name="id" type="xs:unsignedInt"/>
 *    <xs:attribute name="group" type="xs:unsignedInt"/>
 *    <xs:attribute name="lang" type="xs:language"/>
 *    <xs:attribute name="contentType" type="xs:string"/>
 *    <xs:attribute name="par" type="RatioType"/>
 *    <xs:attribute name="minBandwidth" type="xs:unsignedInt"/>
 *    <xs:attribute name="maxBandwidth" type="xs:unsignedInt"/>
 *    <xs:attribute name="minWidth" type="xs:unsignedInt"/>
 *    <xs:attribute name="maxWidth" type="xs:unsignedInt"/>
 *    <xs:attribute name="minHeight" type="xs:unsignedInt"/>
 *    <xs:attribute name="maxHeight" type="xs:unsignedInt"/>
 *    <xs:attribute name="minFrameRate" type="FrameRateType"/>
 *    <xs:attribute name="maxFrameRate" type="FrameRateType"/>
 *    <xs:attribute name="segmentAlignment" type="ConditionalUintType" default="false"/>
 *    <xs:attribute name="subsegmentAlignment" type="ConditionalUintType" default="false"/>
 *    <xs:attribute name="subsegmentStartsWithSAP" type="SAPType" default="0"/>
 *    <xs:attribute name="bitstreamSwitching" type="xs:boolean"/>
 * </xs:complexType>
 *
 * TODO include FrameRateType
 * ~~~~
 *
 * @see ISO/IEC 23009-1:2014 5.3.3 Adaptation Sets
 * @see ISO/IEC 23009-1:2014 5.3.4 Media Content Component
 * @see ISO/IEC 23009-1:2014 5.3.5 Representation
 * @see ISO/IEC 23009-1:2014 5.3.7 TODO
 * @see ts/Tests/MPDTests.ts
 */
export class AdaptationSet extends CommonRepresentation // implements TreeElement
{
  /**
   * A remote element entity that shall contain exactly one element of type [[AdaptationSet]] to replace this one.
   */
  public xlinkHREF: string;

  /** [[xlinkHREF]] processing instructions. Says if the set should be replaced when the MPD is loaded or on request. */
  public xlinkActuate: string; // TODO "onLoad"/"onRequest"

  /**
   * Unique identifier for this [[AdaptationSet]] in the scope of the [[Period]]. The attribute shall be unique in the
   * scope of the containing [[Period]]. The attribute shall not be present in a remote element entity. If not present,
   * no identifier for the [[AdaptationSet]] is specified.
   */
  public id: number;

  /**
   * Identifier for the group that is unique in the scope of the containing [[Period]].
   *
   * @see ISO/IEC 23009-1:2014 5.3.3.1 Adaptaion Sets Overview
   */
  public group: number;

  /**
   * The language code for this [[AdaptationSet]]. If not present, the language code may be defined for each media
   * component or it may be unknown.
   *
   * @see IETF RFC 5646
   */
  public lang: string;

  /**
   * Media content component type for this [[AdaptationSet]]. If not present, the media content component type may
   * be defined for each media component or it may be unknown.
   *
   * @see RFC4288
   */
  public contentType: string;

  /**
   * The picture aspect ratio of the video media component type, in the form of a string consisting of two integers
   * separated by ‘:’, e.g.,”16:9”. When this attribute is present, and the attributes @width and @height for the set
   * of Representations are also present, the picture aspect ratio as specified by this attribute shall be the same
   * as indicated by the values of @width, @height, and @sar, i.e. it shall express the same ratio as (@width * sarx):
   * (@height * sary), with sarx the first number in @sar and sary the second number.
   *
   * If not present, the picture aspect ratio may be defined for each media component or it may be unknown.
   */
  public par: string;

  /**
   * The minimum @bandwidth value in all Representations in this Adaptation Set. This value has the same units as the @bandwidth attribute.
   * If not present, the value is unknown.
   */
  public minBandwidth: number;

  /**
   * The maximum @bandwidth value in all Representations in this Adaptation Set. This value has the same units as the @bandwidth attribute.
   * If not present, the value is unknown.
   */
  public maxBandwidth: number;

  /**
   * The minimum @width value in all Representations in this Adaptation Set. This value has the same units as the @width attribute.
   * If not present, the value is unknown.
   */
  public minWidth: number;

  /**
   * The maximum @width value in all Representations in this Adaptation Set. This value has the same units as the @width attribute.
   * If not present, the value is unknown.
   */
  public maxWidth: number;

  /**
   * The minimum @height value in all Representations in this Adaptation Set. This value has the same units as the @height attribute.
   * If not present, the value is unknown.
   */
  public minHeight: number;

  /**
   * The maximum @height value in all Representations in this Adaptation Set. This value has the same units as the @height attribute.
   * If not present, the value is unknown.
   */
  public maxHeight: number;

  /**
   * The minimum @framerate value in all Representations in this Adaptation Set. This value is encoded in the same format as the @frameRate attribute.
   * If not present, the value is unknown.
   */
  public minFrameRate: number;

  /**
   * The maximum @framerate value in all Representations in this Adaptation Set. This value is encoded in the same format as the @frameRate attribute.
   * If not present, the value is unknown.
   */
  public maxFrameRate: number;

  /**
   * When not set to ‘false’, this specifies that for any two Representations, X and Y, within the same Adaptation Set,
   * the m-th Segment of X and the n-th Segment of Y are non-overlapping whenever m is not equal to n.
   *
   * For Adaptation Sets containing Representations with multiple media content components, this attribute value shall be
   * either 'true' or 'false'.
   *
   * For Adaptation Sets containing Representations with a single media content component, when two AdaptationSet elements
   * within a Period share the same integer value for this attribute, then for any two Representations, X and Y, within the
   * union of the two Adaptation Sets, the m-th Segment of X and the n-th Segment of Y are non-overlapping whenever m is not equal to n.
   *
   * @see ISO/IEC 23009-1:2014 4.5.3 Non-overlapping Segments and Subsegments
   */
  public segmentAlignment: string;

  /**
   * TODO
   *
   * @see ISO/IEC 23009-1:2014 4.5.3 Non-overlapping Segments and Subsegments
   */
  public subSegmentAlignment: string;

  /**
   * When greater than 0, specifies that each Subsegment with SAP_type greater than 0 starts with a SAP of type less
   * than or equal to the value of @subsegmentStartsWithSAP. A Subsegment starts with SAP when the Subsegment contains
   * a SAP, and for the first SAP, ISAU is the index of the first access unit that follows ISAP, and ISAP is contained
   * in the Subsegment.
   * The semantics of @subsegmentStartsWithSAP equal to 0 are unspecified.
   *
   */
  public subSegmentStartsWithSAP: number;

  /**
   * TODO
   *
   * @see ISO/IEC 23009-1:2014 4.5.4 Bitstream concatenation
   */
  public bitstreamSwitching: boolean;

  /**
   * Identifies the accessibility scheme employed. Accessibility is a general term used to describe the degree to which
   * the DASH Media Presentation is available to as many people as possible.
   *
   * @see ISO/IEC 23009-1:2014 5.8.1 Descriptors General
   * @see ISO/IEC 23009-1:2014 5.8.4.3 Accessibility
   */
  public accessibilityList: Accessibility[] = [];

  /**
   * Identifies the roles of the media content component. Roles define and describe characteristics and/or structural
   * functions of media content components.
   *
   * @see ISO/IEC 23009-1:2014 5.8.1 Descriptors General
   * @see ISO/IEC 23009-1:2014 5.8.4.2 Role
   */
  public roleList: Role[] = [];

  /**
   * Ratings specify that content is suitable for presentation to audiences for which that rating is known to be
   * appropriate, or for unrestricted audiences.
   *
   * @see ISO/IEC 23009-1:2014 5.8.1 Descriptors General
   * @see ISO/IEC 23009-1:2014 5.8.4.4 Rating
   */
  public ratingList: Rating[] = [];

  /**
   * Identifies the viewpoint scheme employed. Adaptation Sets containing non-equivalent Viewpoint element values
   * contain different media content components. The Viewpoint elements may equally be applied to media content types
   * that are not video. Adaptation Sets with equivalent Viewpoint element values are intended to be presented together.
   *
   * @see ISO/IEC 23009-1:2014 5.8.1 Descriptors General
   * @see ISO/IEC 23009-1:2014 5.8.4.5 Viewpoint
   */
  public viewpointList: Viewpoint[] = [];

  /**
   * TODO
   *
   * @see ISO/IEC 23009-1:2014 5.3.4 Media Content Component
   */
  public contentComponentList: ContentComponent[] = [];

  /**
   * Base URLs that can be used for reference resolution and alternative URL selection.
   *
   * @see ISO/IEC 23009-1:2014 5.6 Base URL Processing
   */
  public baseURLList: BaseURL[] = [];

  /**
   * Default [[SegmentBase]] information.
   * Information in this element is overridden by information in Representation.SegmentBase, if present.
   *
   * @see ISO/IEC 23009-1:2014(E) 5.3.9 Segments and Segment information
   */
  public segmentBase: SegmentBase;

  /**
   * Default Segment List information.
   * Information in this element is overridden by information in Representation.SegmentList, if present.
   *
   * @see ISO/IEC 23009-1:2014(E) 5.3.9 Segments and Segment information
   */
  public segmentList: SegmentList;

  /**
   * Default Segment Template information.
   * Information in this element is overridden by information in Representation.SegmentTemplate, if present.
   *
   * @see ISO/IEC 23009-1:2014(E) 5.3.9 Segments and Segment information
   */
  public segmentTemplate: SegmentTemplate;

  /**
   * Represenataions.
   *
   * At least one Representation element shall be present in each Adaptation Set. The actual element may however
   * be part of a remote element entity if xlink is used on the containing AdaptationSet element.
   *
   * @see ISO/IEC 23009-1:2014(E) 5.3.5 Representation
   */
  public representationList: Representation[] = [];

  /**
   * Returns `true` if this MPD tree node has no children.
   *
   */
  public isLeaf(): boolean {
    // noinspection OverlyComplexBooleanExpressionJS
    return super.isLeaf() &&
      isArrayEmpty(this.accessibilityList) &&
      isArrayEmpty(this.roleList) &&
      isArrayEmpty(this.ratingList) &&
      isArrayEmpty(this.viewpointList) &&
      isArrayEmpty(this.contentComponentList) &&
      isArrayEmpty(this.baseURLList) &&
      isUndefined(this.segmentBase) &&
      isUndefined(this.segmentList) &&
      isUndefined(this.segmentTemplate) &&
      isArrayEmpty(this.representationList);
  }

  /**
   * Title of this node in the MPD tree.
   *
   */
  public nodeTitle(): string {
    return `Adaptation Set ${this.id ?? ''}`;
  }

  /**
   * HTML-formatted simple contents of this MPD tree node. Children will be displayed elsewhere.
   *
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('xlink:HREF', this.xlinkHREF)}
                ${formatTreeItem('xlink:Actuate', this.xlinkActuate)}
                ${formatTreeItem('id', formatInt(this.id))}
                ${formatTreeItem('group', formatInt(this.group))}
                ${formatTreeItem('language', formatLang(this.lang))}
                ${formatTreeItem('content type', this.contentType)}
                ${formatTreeItem('par', this.par)}
                ${formatTreeItem('minimum bandwidth', formatInt(this.minBandwidth))}
                ${formatTreeItem('maximum bandwidth', formatInt(this.maxBandwidth))}
                ${formatTreeItem('minimum width', formatInt(this.minWidth))}
                ${formatTreeItem('maximum width', formatInt(this.maxWidth))}
                ${formatTreeItem('minimum height', formatInt(this.minHeight))}
                ${formatTreeItem('maximum height', formatInt(this.maxHeight))}
                ${formatTreeItem('minimum frame rate', formatInt(this.minFrameRate))}
                ${formatTreeItem('maximum frame rate', formatInt(this.maxFrameRate))}
                ${formatTreeItem('segment alignment', this.segmentAlignment)}
                ${formatTreeItem('subsegment alignment', this.subSegmentAlignment)}
                ${formatTreeItem('subsegment starts with SAP', formatInt(this.subSegmentStartsWithSAP))}
                ${formatTreeItem('bitstream switching', formatBoolean(this.bitstreamSwitching))}
             </ul>`;
  }

  /**
   * Returns `true` if the object is deep equal to this.
   *
   */
  public isEqual(a: TreeElement): boolean {
    return isDefined(a) &&
      a instanceof AdaptationSet &&
      this.xlinkHREF === a.xlinkHREF &&
      this.xlinkActuate === a.xlinkActuate &&
      this.id === a.id &&
      this.group === a.group &&
      this.lang === a.lang &&
      this.contentType === a.contentType &&
      this.par === a.par &&
      this.minBandwidth === a.minBandwidth &&
      this.maxBandwidth === a.maxBandwidth &&
      this.minWidth === a.minWidth &&
      this.maxWidth === a.maxWidth &&
      this.minHeight === a.minHeight &&
      this.maxHeight === a.maxHeight &&
      this.minFrameRate === a.minFrameRate &&
      this.maxFrameRate === a.maxFrameRate &&
      this.segmentAlignment === a.segmentAlignment &&
      this.subSegmentAlignment === a.subSegmentAlignment &&
      this.subSegmentStartsWithSAP === a.subSegmentStartsWithSAP &&
      this.bitstreamSwitching === a.bitstreamSwitching &&
      arrayEquals(this.accessibilityList, a.accessibilityList) &&
      arrayEquals(this.roleList, a.roleList) &&
      arrayEquals(this.ratingList, a.ratingList) &&
      arrayEquals(this.viewpointList, a.viewpointList) &&
      arrayEquals(this.contentComponentList, a.contentComponentList) &&
      arrayEquals(this.baseURLList, a.baseURLList) &&
      this.segmentBase.isEqual(a.segmentBase) &&
      this.segmentList.isEqual(a.segmentList) &&
      this.segmentTemplate.isEqual(a.segmentTemplate) &&
      arrayEquals(this.representationList, a.representationList) &&
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
                ${fieldString('id', formatInt(this.id), newIndent)}
                ${fieldString('group', formatInt(this.group), newIndent)}
                ${fieldString('language', formatLang(this.lang), newIndent)}
                ${fieldString('content type', this.contentType, newIndent)}
                ${fieldString('par', this.par, newIndent)}
                ${fieldString('minimum bandwidth', formatInt(this.minBandwidth), newIndent)}
                ${fieldString('maximum bandwidth', formatInt(this.maxBandwidth), newIndent)}
                ${fieldString('minimum width', formatInt(this.minWidth), newIndent)}
                ${fieldString('maximum width', formatInt(this.maxWidth), newIndent)}
                ${fieldString('minimum height', formatInt(this.minHeight), newIndent)}
                ${fieldString('maximum height', formatInt(this.maxHeight), newIndent)}
                ${fieldString('minimum frame rate', formatInt(this.minFrameRate), newIndent)}
                ${fieldString('maximum frame rate', formatInt(this.maxFrameRate), newIndent)}
                ${fieldString('segment alignment', this.segmentAlignment, newIndent)}
                ${fieldString('subsegment alignment', this.subSegmentAlignment, newIndent)}
                ${fieldString('subsegment starts with SAP', formatInt(this.subSegmentStartsWithSAP), newIndent)}
                ${fieldString('bitstream switching', formatBoolean(this.bitstreamSwitching), newIndent)}
                ${super.toString(newIndent)}
                ${childrenString('accessibilities', this.accessibilityList as unknown as TreeElement[], newIndent)}
                ${childrenString('roles', this.roleList as unknown as TreeElement[], newIndent)}
                ${childrenString('ratings', this.ratingList as unknown as TreeElement[], newIndent)}
                ${childrenString('viewpoints', this.viewpointList as unknown as TreeElement[], newIndent)}
                ${childrenString('content components', this.contentComponentList as unknown as TreeElement[],
      newIndent)}
                ${childrenString('base URLs', this.baseURLList as unknown as TreeElement[], newIndent)}
                ${childrenString('segment bases', this.segmentBase as unknown as TreeElement, newIndent)}
                ${childrenString('segment lists', this.segmentList as unknown as TreeElement[], newIndent)}
                ${childrenString('segment templates', this.segmentTemplate as unknown as TreeElement, newIndent)}
                ${childrenString('representations', this.representationList as unknown as TreeElement[], newIndent)}`;
  }
}
