// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

/* tslint:disable:no-redundant-jsdoc */

import {XMLUtils} from '../../../utils/XMLUtils';
import {datesEqual, printDateWithLocalTime} from '../../../utils/DateTimeUtils';
import {TreeElement} from '../../../utils/TreeElement';
import {childrenString, fieldString, formatTreeItem, isArrayEmpty} from '../../../utils/TreeUtils';
import {arrayEquals, isDefined} from '../../../utils/Utils';
import {BaseURL} from './BaseURL';
import {Metrics} from './Metrics';
import {Period} from './Period';
import {ProgramInformation} from './ProgramInformation';
import {UTCTiming} from './UTCTiming';


/**
 * Root element of an MPD file. A sequence of one or more [[Period]]s. The MPD file is an XML file that represents the
 * different qualities of the media content and the individual segments of each quality with HTTP URLs. This structure
 * provides the binding of the segments to the bitrate (resolution, etc.) among others (e.g., start time, duration of
 * segments). Clients will first request the MPD that contains the temporal and structural information for the media
 * content and based on that information it will request the individual segments that fit best for its requirements.
 *
 * XSL
 * ~~~~
 * <xs:complexType name="MPDtype">
 *   <xs:sequence>
 *      <xs:element name="ProgramInformation" type="ProgramInformationType" minOccurs="0" maxOccurs="unbounded"/>
 *      <xs:element name="BaseURL" type="BaseURLType" minOccurs="0" maxOccurs="unbounded"/>
 *      <xs:element name="Location" type="xs:anyURI" minOccurs="0" maxOccurs="unbounded"/>
 *      <xs:element name="Period" type="PeriodType" maxOccurs="unbounded"/>
 *      <xs:element name="Metrics" type="MetricsType" minOccurs="0" maxOccurs="unbounded"/>
 *      <xs:any namespace="##other" processContents="lax" minOccurs="0" maxOccurs="unbounded"/>
 *   </xs:sequence>
 *   <xs:attribute name="id" type="xs:string"/>
 *   <xs:attribute name="profiles" type="xs:string" use="required"/>
 *   <xs:attribute name="type" type="PresentationType" default="static"/>
 *   <xs:attribute name="availabilityStartTime" type="xs:dateTime"/>
 *   <xs:attribute name="availabilityEndTime" type="xs:dateTime"/>
 *   <xs:attribute name="publishTime" type="xs:dateTime"/>
 *   <xs:attribute name="mediaPresentationDuration" type="xs:duration"/>
 *   <xs:attribute name="minimumUpdatePeriod" type="xs:duration"/>
 *   <xs:attribute name="minBufferTime" type="xs:duration" use="required"/>
 *   <xs:attribute name="timeShiftBufferDepth" type="xs:duration"/>
 *   <xs:attribute name="suggestedPresentationDelay" type="xs:duration"/>
 *   <xs:attribute name="maxSegmentDuration" type="xs:duration"/>
 *   <xs:attribute name="maxSubsegmentDuration" type="xs:duration"/>
 *   <xs:anyAttribute namespace="##other" processContents="lax"/>
 * </xs:complexType>
 *
 * <!-- Presentation Type enumeration -->
 * <xs:simpleType name="PresentationType">
 *   <xs:restriction base="xs:string">
 *      <xs:enumeration value="static"/>
 *      <xs:enumeration value="dynamic"/>
 *   </xs:restriction>
 * </xs:simpleType>
 * ~~~~
 *
 * Java: com.triveni.gb.server.standards.atsc3.route.mpd.model.MPD
 *
 * @see ISO/IEC 23009-1:2014(E) 5.3.1.2 Semantics
 * @see ISO/IEC 23009-1:2014(E) 5.3.2 Period
 */
export class MPD extends TreeElement {
  /**
   * Where this MPD was fetched from. This comes from the MPD status REST call. The actual name of the MPD file should not appear here.
   *
   * @type {string}
   */
  public sourceURL = 'http://mpdserver.com/'; // TODO here for testing

  /**
   * Identifier for the Media Presentation. It is recommended to use an identifier that is unique within the scope in which the Media Presentation is published.
   * If not specified, no MPD-internal identifier is provided. However, for example the URL to the MPD may be used as an identifier for the Media Presentation.
   *
   * @type {string}
   */
  public id: string;

  /**
   * A list of Media Presentation profiles. Conforms to either the pro-simple or pro-fancy productions of RFC6381
   *
   * @type {string}
   * @see ISO/IEC 23009-1:2014(E) 8 Profiles
   * @see RFC6381
   */
  public profiles: string; // required

  /**
   * Type of the Media Presentation, `dynamic` or `static`. For `static` [[MPD]]s, all Segments are available between the availabilityStartTime
   * and the availabilityEndTime. For `dynamic` [[MPD]]s Segments typically have different availability times.
   *
   * In addition the [[MPD]]s may be updated in dynamic Media Presentations, i.e. the @minimumUpdatePeriod may be present.
   *
   * NOTE static` Media Presentations are typically used for On-Demand services, whereas dynamic Media Presentations are used for live services.
   *
   * @type {string}
   * @see ISO/IEC 23009-1:2014(E) 5.3.9.5.3 Media Segment information
   */
  public type: string; // TODO enum null, dynamic, static

  /**
   * Required for `dynamic`. Specifies the anchor for the computation of the earliest availability time (in UTC) for any Segment in the [[MPD]].
   *
   * For `static`, specifies the Segment availability start time for all Segments referred to in this [[MPD]]. If not present, all Segments
   * described in the [[MPD]] shall become available at the time the [[MPD]] becomes available.
   *
   * @type {Date}
   */
  public availabilityStartTime: Date;

  /**
   * Latest Segment availability end time for any Segment in the [[MPD]]. When not present, the value is unknown.
   *
   * @type {Date}
   */
  public availabilityEndTime: Date;

  /**
   * Wall-clock time when the [[MPD]] was generated and published at the origin server. [[MPD]]s with a later value of @publishTime shall be
   * an update to [[MPD]]s with earlier @publishTime.
   *
   * @type {Date}
   * @see ISO/IEC 23009-1:2014(E) 5.4 Media Presentation Description updates
   */
  public publishTime: Date;

  /**
   * Duration of the entire [[MPD]]. If the attribute is not present, the duration of the [[MPD]] is unknown.
   * This attribute shall be present when neither the attribute [[MPD]] @minimumUpdatePeriod nor the [[Period]] @duration of the last Period are present.
   *
   * @type {number}
   */
  public mediaPresentationDuration: string; // duration

  /**
   * Smallest period between potential changes to the [[MPD]]. This can be useful to control the frequency at which a client checks for updates.
   * If this attribute is not present it indicates that the [[MPD]] does not change. If MPD@type is ‘static’, @minimumUpdatePeriod shall not be present.
   *
   * @type {number}
   * @see ISO/IEC 23009-1:2014(E) 5.4 Media Presentation Description updates
   */
  public minimumUpdatePeriod: string; // duration

  /**
   * Common duration used in the definition of the [[Representation]] data rate.
   *
   * @type {number}
   * @see ISO/IEC 23009-1:2014(E) 5.3.5.2 Semantics @bandwidth
   */
  public minBufferTime: string; // duration, required

  /**
   * Duration of the smallest time shifting buffer for any [[Representation]] in the [[MPD]] that is guaranteed to be available
   * for a [[MPD]] with type 'dynamic'. When not present, the value is infinite. This value of the attribute is undefined if the
   * type attribute is equal to ‘static’.
   *
   * @type {number}
   */
  public timeShiftBufferDepth: string; // duration

  /**
   * When @type is 'dynamic', it specifies a fixed delay offset in time from the presentation time of each access unit that is
   * suggested to be used for presentation of each access unit. When not specified, then no value is provided and the client is
   * expected to choose a suitable value.
   *
   * When @type is 'static' the value of the attribute is undefined and may be ignored.
   *
   * @type {number}
   * @see ISO/IEC 23009-1:2014(E) 7.2.1 Media Presentation timeline
   */
  public suggestedPresentationDelay: string; // duration

  /**
   * Maximum duration of any Segment in any [[Representation]] in this, or any future update to, this [[MPD]], If not present, then
   * the maximum Segment duration shall be the maximum duration of any Segment documented in this [[MPD]].
   *
   * @type {number}
   */
  public maxSegmentDuration: string; // duration

  /**
   * Maximum duration of any Media Subsegment in any [[Representation]] in the [[MPD]]. If not present, the same value as for
   * the maximum Segment duration is implied.
   */
  public maxSubsegmentDuration: string; // duration

  public utcTimingList: UTCTiming[] = [];

  /**
   * Descriptive information about the program.
   *
   * @type {ProgramInformation[]}
   * @see ISO/IEC 23009-1:2014(E) 5.7 Program Information
   */
  public programInformation: ProgramInformation[] = [];

  /**
   * Base URLs that can be used for reference resolution and alternative URL selection.
   *
   * @type {BaseURL[]}
   * @see ISO/IEC 23009-1:2014(E) 5.6 Base URL Processing
   */
  public baseURLs: BaseURL[] = [];

  /**
   * Locations where the [[MPD]] is available.
   *
   * @type {string[]}
   */
  public locations: string[] = [];

  /**
   * Information of a [[Period]]. At least one is required.
   *
   * @type {Period[]}
   * @see ISO/IEC 23009-1:2014(E) 5.3.2 Period
   */
  public periodList: Period[] = [];

  /**
   * DASH Metrics.
   *
   * @type {Metrics[]}
   * @see ISO/IEC 23009-1:2014(E) 5.9 DASH Metirics descriptor
   */
  public metrics: Metrics[] = [];

  /**
   * Returns `true` if this MPD tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return isArrayEmpty(this.programInformation) &&
      isArrayEmpty(this.baseURLs) &&
      isArrayEmpty(this.locations) &&
      isArrayEmpty(this.periodList) &&
      isArrayEmpty(this.metrics) &&
      isArrayEmpty(this.utcTimingList);
  }

  /**
   * Title of this node in the MPD tree.
   *
   * @returns {string} MPD tree node title
   */
  public nodeTitle(): string {
    return `MPD ${this.id ?? ''}`;
  }

  /**
   * HTML-formatted simple contents of this MPD tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this MPD tree node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('id', this.id)}
                ${formatTreeItem('profiles', this.profiles)}
                ${formatTreeItem('type', this.type)}
                ${formatTreeItem('availability start time', printDateWithLocalTime(this.availabilityStartTime))}
                ${formatTreeItem('availability end time', printDateWithLocalTime(this.availabilityEndTime))}
                ${formatTreeItem('publish time', printDateWithLocalTime(this.publishTime))}
                ${formatTreeItem('media presentation duration',
      XMLUtils.interpretISODuration(this.mediaPresentationDuration))}
                ${formatTreeItem('minimum update period', XMLUtils.interpretISODuration(this.minimumUpdatePeriod))}
                ${formatTreeItem('minimum buffer time', XMLUtils.interpretISODuration(this.minBufferTime))}
                ${formatTreeItem('time shift buffer depth', XMLUtils.interpretISODuration(this.timeShiftBufferDepth))}
                ${formatTreeItem('suggested presentation delay',
      XMLUtils.interpretISODuration(this.suggestedPresentationDelay))}
                ${formatTreeItem('maximum segment duration', XMLUtils.interpretISODuration(this.maxSegmentDuration))}
                ${formatTreeItem('maximum subsegment duration',
      XMLUtils.interpretISODuration(this.maxSubsegmentDuration))}
              </ul>`;
  }

  /**
   * Returns `true` if the object is deep equal to this.
   *
   * @param {ServiceName} a - object to compare to
   * @returns {boolean} true if a === b
   */
  public isEqual(a: TreeElement): boolean {
    return isDefined(a) &&
      a instanceof MPD &&
      this.id === a.id &&
      this.profiles === a.profiles &&
      this.type === a.type &&
      datesEqual(this.availabilityStartTime, a.availabilityStartTime) &&
      datesEqual(this.availabilityEndTime, a.availabilityEndTime) &&
      arrayEquals(this.utcTimingList, a.utcTimingList) &&
      datesEqual(this.publishTime, a.publishTime) &&
      this.mediaPresentationDuration === a.mediaPresentationDuration &&
      this.minimumUpdatePeriod === a.minimumUpdatePeriod &&
      this.minBufferTime === a.minBufferTime &&
      this.timeShiftBufferDepth === a.timeShiftBufferDepth &&
      this.suggestedPresentationDelay === a.suggestedPresentationDelay &&
      this.maxSegmentDuration === a.maxSegmentDuration &&
      this.maxSubsegmentDuration === a.maxSubsegmentDuration &&
      arrayEquals(this.baseURLs, a.baseURLs) &&
      arrayEquals(this.programInformation, a.programInformation) &&
      arrayEquals(this.locations, a.locations) &&
      arrayEquals(this.periodList, a.periodList) &&
      arrayEquals(this.metrics, a.metrics);
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
                ${fieldString('profiles', this.profiles, newIndent)}
                ${fieldString('type', this.type, newIndent)}
                ${fieldString('availabilityStartTime', this.availabilityStartTime, newIndent)}
                ${fieldString('availabilityEndTime', this.availabilityEndTime, newIndent)}
                ${fieldString('publishTime', this.publishTime, newIndent)}
                ${fieldString('mediaPresentationDuration', this.mediaPresentationDuration, newIndent)}
                ${fieldString('minimumUpdatePeriod', this.minimumUpdatePeriod, newIndent)}
                ${fieldString('minBufferTime', this.minBufferTime, newIndent)}
                ${fieldString('timeShiftBufferDepth', this.timeShiftBufferDepth, newIndent)}
                ${fieldString('suggestedPresentationDelay', this.suggestedPresentationDelay, newIndent)}
                ${fieldString('maxSegmentDuration', this.maxSegmentDuration, newIndent)}
                ${fieldString('maxSubsegmentDuration', this.maxSubsegmentDuration, newIndent)}
                ${childrenString('programInformation', this.programInformation as unknown as TreeElement[], newIndent)}
                ${childrenString('baseURLs', this.baseURLs, newIndent)}
                ${childrenString('locations', this.locations, newIndent)}
                ${childrenString('periodList', this.periodList as unknown as TreeElement[], newIndent)}
                ${childrenString('metrics', this.metrics, newIndent)}`;
  }
}
