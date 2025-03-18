// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

/* tslint:disable:no-redundant-jsdoc */

import {XMLUtils} from '../../../../../../core/models/dtv/utils/XMLUtils';
import {TreeElement} from '../../../../../../core/models/dtv/utils/TreeElement';
import {childrenString, fieldString, formatBoolean, formatTreeItem, isArrayEmpty} from '../../../../../../core/models/dtv/utils/TreeUtils';
import {allUndefined, arrayEquals, isDefined} from '../../../../../../core/models/dtv/utils/Utils';
import {AdaptationSet} from './AdaptationSet';
import {AssetIdentifier} from './AssetIdentifier';
import {BaseURL} from './BaseURL';
import {EventStream} from './EventStream';
import {Preselection} from './Preselection';
import {SegmentBase} from './SegmentBase';
import {SegmentList} from './SegmentList';
import {SegmentTemplate} from './SegmentTemplate';
import {Subset} from './Subset';

/**
 * Part of the MPD content with a start time and duration. Multiple [[Period]]s can be used for scenes or chapters, or
 * to separate ads from program content. Contains one or more [[AdaptationSet]]s. [[Period]] may contain one or more [[Subset]]s
 * that restrict combination of [[AdaptationSet]]s for presentation. A [[Period]] typically represents a media content period during
 * which a consistent set of encoded versions of the media content is available i.e. the set of available bitrates, languages,
 * captions, subtitles etc. does not change during a Period.
 *
 * Each [[Periods]] contains media components such as video components e.g., different view angles or with different codecs,
 * audio components for different languages or with different types of information (e.g., with director’s comments, etc.),
 * subtitle or caption components, etc. Those components have certain characteristics like the bitrate, frame rate, audio-channels,
 * etc. which do not change during one Period. Nevertheless, the client is able to adapt during a Period according to the available
 * bitrates, resolutions, codecs, etc. that are available in a given Period. Furthermore, a Period could separate the content, e.g.,
 * for ad insertion, changing the camera angle in a live football game, etc. For example if an ad should only be available in high
 * resolution while the content is available from standard definition to high definition, you would simply introduce an own Period
 * for the ad which contains only the ad content in high definition. After and before this Period, there are other Periods that
 * contain the actual content (e.g., movie) in multiple bitrates and resolutions from standard to high definition.
 *
 * A Period may be replaced if the original MPD is annotated with an xlink:show/xlink:href pair. For example, if the period is this:
 * ~~~~
 * <Period start='PT9H' xlink:show="embed" xlink:href="urn:xbc 4399FB77-3939EA47"/>
 * ~~~~
 * then the reciever may query the server with the "urn:xbc 4399FB77-3939EA47" information to receive a new Period, such as:
 * ~~~~
 * <Period start='PT9H'>
 *    <AdaptationSet mimeType='video/mp4' />
 *    <SegmentTemplate timescale='90000' media='xbc-$Number$.mp4v' duration='90000' startNumber='32401' />
 *    <Representation id='v2' width='1920' height='1080' />
 * </Period>
 * ~~~~
 *
 *
 * XSL
 * ~~~~
 *  <xs:complexType name="PeriodType">
 *     <xs:sequence>
 *        <xs:element name="BaseURL" type="BaseURLType" minOccurs="0" maxOccurs="unbounded"/>
 *        <xs:element name="SegmentBase" type="SegmentBaseType" minOccurs="0"/>
 *        <xs:element name="SegmentList" type="SegmentListType" minOccurs="0"/>
 *        <xs:element name="SegmentTemplate" type="SegmentTemplateType" minOccurs="0"/>
 *        <xs:element name="AssetIdentifier" type="DescriptorType" minOccurs="0"/>
 *        <xs:element name="EventStream" type="EventStreamType" minOccurs="0" maxOccurs="unbounded"/>
 *        <xs:element name="AdaptationSet" type="AdaptationSetType" minOccurs="0" maxOccurs="unbounded"/>
 *        <xs:element name="Subset" type="SubsetType" minOccurs="0" maxOccurs="unbounded"/>
 *        <xs:any namespace="##other" processContents="lax" minOccurs="0" maxOccurs="unbounded"/>
 *     </xs:sequence>
 *     <xs:attribute ref="xlink:href"/>
 *     <xs:attribute ref="xlink:actuate" default="onRequest"/>
 *     <xs:attribute name="id" type="xs:string" />
 *     <xs:attribute name="start" type="xs:duration"/>
 *     <xs:attribute name="duration" type="xs:duration"/>
 *     <xs:attribute name="bitstreamSwitching" type="xs:boolean" default="false"/>
 *     <xs:anyAttribute namespace="##other" processContents="lax"/>
 *   </xs:complexType>
 * ~~~~
 *
 * Java: com.triveni.gb.server.standards.atsc3.route.mpd.model.Period
 *
 * @see ISO/IEC 23009-1:2014(E) 5.3.2 Period
 * @see ISO/IEC 23009-1:2014(E) 5.3.3 Adaptation Sets
 * @see ISO/IEC 23009-1:2014(E) 5.3.8 Subsets
 */
export class Period extends TreeElement {
  private static readonly atsc3XlinkTagPrefix: string = 'tag:atsc.org,2016:xlink';

  /**
   * A URL that links to online content, like a commercial. Reference to a remote element entity that is either
   * empty or contains one or multiple top-level [[Period]]s.
   *
   * @type string
   * @see https://www.w3.org/TR/xlink/
   */
  public xlinkHREF: string;

  /**
   * The intended behavior for a link when activated by an application; specifically, the timing for obtaining or
   * retrieving the content of a link (for example, by a user clicking on the link to request the material, or by
   * the material being automatically loaded with a document when the document or document component is loaded).
   *
   * Specifies the processing instructions, which can be either "onLoad" or "onRequest".
   * This attribute shall not be present if the @xlink:href attribute is not present.
   *
   * @type string
   * @see https://www.w3.org/TR/xlink/
   */
  public xlinkActuate: string; // TODO enum "onLoad"/"onRequest"

  /**
   * If "embed", then this period should be replaced by a period that has its contents resolved by using the
   * information in the <code>xlinkHREF</code> field.
   *
   * @type string
   */
  public xlinkShow: string; // TODO

  /**
   * Period id. Won't change if MPD is "dynamic". An identifier for this Period. The identifier shall be unique within
   * the scope of the [[MPD]]. If the [[MPD]] @type is "dynamic", then this attribute shall be present and shall not
   * change in case the [[MPD]] is updated. If not present, no identifier for the [[Period]] is provided.
   *
   * @type {string}
   */
  public id: string;

  /**
   * if present, specifies the PeriodStart time of the [[Period]]. The PeriodStart time is used as an anchor to determine
   * the [[MPD]] start time of each Media Segment as well as to determine the presentation time of each access unit in the
   * Media Presentation timeline.
   *
   * @type {string}
   * @see ISO/IEC 23009-1:2014(E) 5.3.2.1 Overview
   */
  public start: string;

  /**
   * if present, specifies the duration of the Period to determine the PeriodStart time of the next Period.
   *
   * @type {number]
   * @see ISO/IEC 23009-1:2014(E) 5.3.2.1 Overview
   */
  public duration: string;

  /**
   * When `true`, this is equivalent as if the [[AdaptationSet]] @bitstreamSwitching for each [[AdaptationSet]] contained
   * in this [[Period]] is set to 'true'. In this case, the [[AdaptationSet]] @bitstreamSwitching attribute shall not be set to
   * 'false' for any [[AdaptationSet]] in this [[Period]].
   */
  public bitstreamSwitching: boolean;

  /**
   * [[BaseURL]]s that can be used for reference resolution and alternative URL selection.
   *
   * @type {BaseURL[]}
   * @see ISO/IEC 23009-1:2014(E) 5.6 Base URL Processing
   */
  public baseURLs: BaseURL[] = [];

  /**
   * Default [[SegmentBase]] information.
   * Information in this element is overridden by information in AdapationSet.SegmentBase and Representation.SegmentBase, if present.
   *
   * @type {SegmentBase}
   * @see ISO/IEC 23009-1:2014(E) 5.3.9 Segments and Segment information
   */
  public segmentBase: SegmentBase;

  /**
   * Default Segment List information.
   * Information in this element is overridden by information in AdapationSet.SegmentList and Representation.SegmentList, if present.
   *
   * @type {SegmentList[]}
   * @see ISO/IEC 23009-1:2014(E) 5.3.9 Segments and Segment information
   */
  public segmentList: SegmentList;

  /**
   * Default Segment Template information.
   * Information in this element is overridden by information in AdapationSet.SegmentTemplate and Representation.SegmentTemplate, if present.
   *
   * @type {SegmentTemplate[]}
   * @see ISO/IEC 23009-1:2014(E) 5.3.9 Segments and Segment information
   */
  public segmentTemplate: SegmentTemplate;

  /**
   * Specifies that this Period belongs to a certain asset. If two different Periods contain equivalent Asset Identifiers
   * then the content in the two Periods belong to the same asset.
   *
   * @type {AssetIdentifier}
   * @see ISO/IEC 23009-1:2014(E) 5.8.4.10 Asset Identifier
   */
  public assetIdentifier: AssetIdentifier;

  /**
   * List of events signalled in the [[Period]].
   *
   * @type {EventStream[]}
   * @see ISO/IEC 23009-1:2014(E) 5.10.2 MPD Events
   */
  public eventStreams: EventStream[] = [];

  /**
   * Contained [[AdaptationSet]]s.
   * At least one [[AdaptationSet]] shall be present in each [[Period]] unless
   * the value of the @duration attribute of the [[Period]] is set to zero.
   *
   * @type {AdaptationSet[]}
   * @see ISO/IEC 23009-1:2014(E) 5.3.3 Adaptation Sets
   */
  public adaptationSetList: AdaptationSet[] = [];

  /**
   * Possible combinations of [[AdaptationSet]]s.
   *
   * @type {Subset[]}
   * @see ISO/IEC 23009-1:2014(E) 5.3.8 Subsets
   */
  public subsetList: Subset[] = [];

  public preselectionList: Preselection[];

  /**
   * Returns `true` if this MPD tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return isArrayEmpty(this.baseURLs) &&
      allUndefined(this.segmentBase, this.segmentList, this.segmentTemplate, this.assetIdentifier) &&
      isArrayEmpty(this.eventStreams) &&
      isArrayEmpty(this.adaptationSetList) &&
      isArrayEmpty(this.subsetList) &&
      isArrayEmpty(this.preselectionList);
  }

  /**
   * Title of this node in the MPD tree.
   *
   * @returns {string} MPD tree node title
   */
  public nodeTitle(): string {
    const hrefTitle: string = this.xlinkHREF?.startsWith(Period.atsc3XlinkTagPrefix) ?
      this.xlinkHREF.slice(Period.atsc3XlinkTagPrefix.length) :
      this.xlinkHREF;
    let hrefShortTitle: string;
    if (isDefined(hrefTitle)) {
      hrefShortTitle = hrefTitle.startsWith(',') ? hrefTitle.slice(1) : hrefTitle;
    }
    const xlinkSummary: string = isDefined(hrefShortTitle) ? ` xlink:href ${hrefShortTitle}` : '';

    return `Period ${this.id ?? ''} ${xlinkSummary}`;
  }

  /**
   * HTML-formatted simple contents of this MPD tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this MPD tree node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('xlink:href', this.xlinkHREF)}
                ${formatTreeItem('xlink:actuate', this.xlinkActuate)}
                ${formatTreeItem('id', this.id)}
                ${formatTreeItem('start', XMLUtils.interpretISODuration(this.start))}
                ${formatTreeItem('duration', XMLUtils.interpretISODuration(this.duration))}
                ${formatTreeItem('bitstream switching', formatBoolean(this.bitstreamSwitching))}
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
      a instanceof Period &&
      this.xlinkHREF === a.xlinkHREF &&
      this.xlinkActuate === a.xlinkActuate &&
      this.id === a.id &&
      this.start === a.start &&
      this.duration === a.duration &&
      this.bitstreamSwitching === a.bitstreamSwitching &&
      BaseURL.isEqualArray(this.baseURLs, a.baseURLs) &&
      this.segmentBase.isEqual(a.segmentBase) &&
      this.segmentList.isEqual(a.segmentList) &&
      this.segmentTemplate.isEqual(a.segmentTemplate) &&
      AssetIdentifier.isEqual(this.assetIdentifier, a.assetIdentifier) &&
      EventStream.isEqualArray(this.eventStreams, a.eventStreams) &&
      AdaptationSet.isEqualArray(this.adaptationSetList, a.adaptationSetList) &&
      arrayEquals(this.subsetList, a.subsetList) &&
      Preselection.isEqualArray(this.preselectionList, a.preselectionList);
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
                ${fieldString('id', this.id, newIndent)}
                ${fieldString('start', this.start, newIndent)}
                ${fieldString('duration', this.duration, newIndent)}
                ${fieldString('bitstreamSwitching', this.bitstreamSwitching, newIndent)}
                ${childrenString('baseURLs', this.baseURLs, newIndent)}
                ${childrenString('segmentBase', this.segmentBase as unknown as TreeElement[], newIndent)}
                ${childrenString('segmentLists', this.segmentList as unknown as TreeElement[], newIndent)}
                ${childrenString('segmentTemplateList', this.segmentTemplate as unknown as TreeElement, newIndent)}
                ${childrenString('assetIdentifiers', this.assetIdentifier, newIndent)}
                ${childrenString('eventStreams', this.eventStreams, newIndent)}
                ${childrenString('adaptationSetList', this.adaptationSetList, newIndent)}
                ${childrenString('subsetList', this.subsetList as unknown as TreeElement[], newIndent)}
                ${childrenString('preselectionList', this.preselectionList, newIndent)}`;
  }
}
