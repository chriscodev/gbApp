// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../../../core/models/dtv/utils/TreeElement';
import {fieldString, formatTreeItem} from '../../../../../../core/models/dtv/utils/TreeUtils';
import {isDefined} from '../../../../../../core/models/dtv/utils/Utils';

/**
 *
 * XML
 * ~~~~
 * <SegmentURL media="bunny_2s_50kbit/bunny_50kbit_dashNonSeg.mp4" mediaRange="13827-22232" index="something.idx" indexRange="1430-1474" />
 * ~~~~
 *
 * XSL
 * ~~~~
 * <xs:complexType name="SegmentURLType">
 *   <xs:sequence>
 *     <xs:any namespace="##other" processContents="lax" minOccurs="0" maxOccurs="unbounded"/>
 *   </xs:sequence>
 *    <xs:attribute name="media" type="xs:anyURI"/>
 *    <xs:attribute name="mediaRange" type="xs:string"/>
 *    <xs:attribute name="index" type="xs:anyURI"/>
 *    <xs:attribute name="indexRange" type="xs:string"/>
 *    <xs:anyAttribute namespace="##other" processContents="lax"/>
 * </xs:complexType>
 * ~~~~
 *
 * @see ISO/IEC 23009-1:2014 5.3.9.3.2 Segment list Semantics
 */
export class SegmentURL extends TreeElement {
  /**
   * In combination with the @mediaRange attribute specifies the HTTP-URL for the Media Segment. It shall be
   * formatted as an <absolute-URI> according to RFC 3986, Clause 4.3, with a fixed scheme of “http” or “https”
   * or as a <relative-ref> according to RFC 3986, Clause 4.2.
   *
   * If not present, then any [[BaseURL]] element is mapped to the @media attribute and the range attribute shall be present.
   *
   * @see RFC 3986, Clause 4.3
   * @see RFC 3986, Clause 4.2
   */
  public media: string;

  /**
   * Specifies the byte range within the resource identified by the @media corresponding to the Media Segment.
   * The byte range shall be expressed and formatted as a byte-range-spec as defined in RFC 2616, Clause 14.35.1.
   * It is restricted to a single expression identifying a contiguous range of bytes.
   * If not present, the Media Segment is the entire resource referenced by the @media attribute.
   *
   * @see RFC 2616, Clause 14.35.1
   */
  public mediaRange: string;

  /**
   * in combination with the @indexRange attribute specifies the HTTP-URL for the Index Segment.
   *
   * It shall be formatted as an <absolute-URI> according to RFC 3986, Clause 4.3, with a fixed scheme of “http” or
   * “https” or as a <relative- ref> according to RFC 3986, Clause 4.2.
   * If not present and the @indexRange not present either, then no Index Segment information is provided for this
   * Media Segment.
   *
   * If not present and the @indexRange present, then the @media attribute is mapped to the @index. If the @media
   * attribute is not present either, then any [[BaseURL]] element is mapped to the @index attribute and the @indexRange
   * attribute shall be present.
   *
   * @see RFC 3986, Clause 4.3
   * @see RFC 3986, Clause 4.2
   */
  public index: string;

  /**
   * Specifies the byte range within the resource identified by the @index corresponding to the Index Segment. If @index
   * is not present, it specifies the byte range of the Segment Index in Media Segment.
   * The byte range shall be expressed and formatted as a byte-range-spec as defined in RFC 2616, Clause 14.35.1. It is
   * restricted to a single expression identifying a contiguous range of bytes.
   * If not present, the Index Segment is the entire resource referenced by the @index attribute.
   *
   * @see RFC 2616, Clause 14.35.1
   */
  public indexRange: string;

  /**
   * Title of this node in the MPD tree.
   *
   * @returns {string} MPD tree node title
   */
  public nodeTitle(): string {
    return 'Segment URL';
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
                ${formatTreeItem('media', this.media)}
                ${resolvedMediaURLStrings}
                ${formatTreeItem('media range', this.mediaRange)}
                ${formatTreeItem('index', this.index)}
                ${resolvedIndexURLStrings}
                ${formatTreeItem('index range', this.indexRange)}
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
      a instanceof SegmentURL &&
      this.media === a.media &&
      this.mediaRange === a.mediaRange &&
      this.index === a.index &&
      this.indexRange === a.indexRange;
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
                ${fieldString('mediaRange', this.mediaRange, newIndent)}
                ${fieldString('index', this.index, newIndent)}
                ${fieldString('indexRange', this.indexRange, newIndent)}`;
  }
}
