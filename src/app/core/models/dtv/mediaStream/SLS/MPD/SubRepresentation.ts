// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {TreeElement} from '../../../../../../core/models/dtv/utils/TreeElement';
import {fieldString, formatTreeItem} from '../../../../../../core/models/dtv/utils/TreeUtils';
import {isDefined} from '../../../../../../core/models/dtv/utils/Utils';
import {CommonRepresentation} from './CommonRepresentation';

/* tslint:disable:no-redundant-jsdoc */


/**
 * Properties of one or several media content components that are embedded in the Representation. It may for
 * example describe the exact properties of an embedded audio component (e.g., codec, sampling rate, etc.), an
 * embedded sub-title (e.g., codec) or it may describe some embedded lower quality video layer (e.g. some lower
 * frame rate, etc.).
 *
 * SubRepresentations contain information that only applies to one media stream in a Representation. For example, if a Representation contain both
 * audio and video, it could have a SubRepresentation to give additional information which only applies to the audio. This additional information could
 * be specific codecs, sampling rates, embedded subtiles. SubRepresentations also provide information necessary to extract one stream from a
 * multiplexed container, or to extract a lower quality version of a stream (like only I-frames, which is useful in fast-forward mode).
 *
 * TODO on all other nodes
 * parent elements: [[Representation]]
 * child elements: [[FramePacking]]*, [[AudioChannelConfiguration]]*, [[ContentProtection]]*, [[EssentialProperty]]*, [[SupplimentalProperty]]*, [[InbandEventStream]]*
 *
 * XML
 * ~~~~
 *  <xs:complexType name="MergedSubRepresentationType">
 *     <xs:sequence>
 *        <xs:element name="FramePacking" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *        <xs:element name="AudioChannelConfiguration" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *        <xs:element name="ContentProtection" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *        <xs:element name="EssentialProperty" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *        <xs:element name="SupplementalProperty" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *        <xs:element name="InbandEventStream" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *        <xs:any namespace="##other" processContents="lax" minOccurs="0" maxOccurs="unbounded"/>
 *     </xs:sequence>
 *     <xs:attribute name="profiles" type="xs:string"/>
 *     <xs:attribute name="width" type="xs:unsignedInt"/>
 *     <xs:attribute name="height" type="xs:unsignedInt"/>
 *     <xs:attribute name="sar" type="RatioType"/>
 *     <xs:attribute name="frameRate" type="FrameRateType"/>
 *     <xs:attribute name="audioSamplingRate" type="xs:string"/>
 *     <xs:attribute name="mimeType" type="xs:string"/>
 *     <xs:attribute name="segmentProfiles" type="xs:string"/>
 *     <xs:attribute name="codecs" type="xs:string"/>
 *     <xs:attribute name="maximumSAPPeriod" type="xs:double"/>
 *     <xs:attribute name="startWithSAP" type="SAPType"/>
 *     <xs:attribute name="maxPlayoutRate" type="xs:double"/>
 *     <xs:attribute name="codingDependency" type="xs:boolean"/>
 *     <xs:attribute name="scanType" type="VideoScanType"/>
 *     <xs:anyAttribute namespace="##other" processContents="lax"/>
 *
 *     <xs:attribute name="level" type="xs:unsignedInt"/>
 *     <xs:attribute name="dependencyLevel" type="UIntVectorType"/>
 *     <xs:attribute name="bandwidth" type="xs:unsignedInt"/>
 *     <xs:attribute name="contentComponent" type="StringVectorType"/>
 *   </xs:complexType>
 * ~~~~
 *
 * @see ISO/IEC 23009-1:2014 5.3.6 Sub-Representations
 */
export class SubRepresentation extends CommonRepresentation {
  /**
   * Sub-Representation level. If @level attribute is present and for media formats used in this
   * Part of ISO/IEC 23009, a Subsegment Index as defined in 6.3.2.4 shall be available for each Media
   * Segment in the containing Representation.
   *
   * If not present, then the SubRepresentation element is solely used to provide a more detailed
   * description for media serverStreams that are embedded in the Representation.
   *
   * @see ISO/IEC 23009-1:2014 6.3.2.4 TODO
   */
  public level: number;

  /**
   * Set of Sub-Representations within this Representation that this Sub-Representation depends on in the
   * decoding and/or presentation process as a whitespace-separated list of @level values.
   *
   * If not present, the Sub-Representation can be decoded and presented independently of any other Representation.
   */
  public dependencyLevel: string;

  /**
   * Identical to the @bandwidth definition in Representation, but applied to this Sub-Representation.
   * This attribute shall be present if the @level attribute is present.
   */
  public bandwidth: number;

  /**
   * If present, specifies the set of all media content components that are contained in this Sub-Representation
   * as a whitespace-separated list of values of ContentComponent@id values.
   * if not present, the Sub-Representation is not assigned to a media content component.
   */
  public contentComponent: string;

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
    return 'SubRepresentation';
  }

  /**
   * HTML-formatted simple contents of this MPD tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this MPD tree node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${super.treeNodeText()}
                ${formatTreeItem('level', `${this.level}`)}
                ${formatTreeItem('dependency level', this.dependencyLevel)}
                ${formatTreeItem('bandwidth', `${this.bandwidth}`)}
                ${formatTreeItem('content component', this.contentComponent)}
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
      a instanceof SubRepresentation &&
      this.level === a.level &&
      this.dependencyLevel === a.dependencyLevel &&
      this.bandwidth === a.bandwidth &&
      this.contentComponent === a.contentComponent &&
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
                ${fieldString('level', this.level, newIndent)}
                ${fieldString('dependencyLevel', this.dependencyLevel, newIndent)}
                ${fieldString('bandwidth', this.bandwidth, newIndent)}
                ${fieldString('contentComponent', this.contentComponent, newIndent)}
                ${super.toString(newIndent)}}`;
  }
}
