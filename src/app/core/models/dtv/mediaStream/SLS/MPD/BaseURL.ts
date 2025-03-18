// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../../../core/models/dtv/utils/TreeElement';
import {
  fieldString,
  formatTreeItem,
  formatTreeItemBoolean,
  formatTreeItemNumber
} from '../../../../../../core/models/dtv/utils/TreeUtils';
import {isDefined, isUndefined} from '../../../../../../core/models/dtv/utils/Utils';
import {MPD} from './MPD';

/**
 * A base URL for MPD segments. Available at [[MPD]], [[Period]], [[AdaptationSet]], and [[Representation]] levels, they
 * append with other [[BaseURL]]s above them to form a complete path to the segments.
 *
 * URLs at each level of the MPD are resolved according to RFC 3986 with respect to the [[BaseURL]] element specified at that level
 * of the document or the level above in the case of resolving base URLs themselves (the document “base URI” as defined in
 * RFC 3986 Section 5.1 is considered to be the level above the MPD level). If only relative URLs are specified and the document
 * base URI cannot be established according to RFC 3986 then the MPD should not be interpreted. URL resolution applies to all URLs
 * found in MPD documents.
 *
 * In addition to the document level (the level above the MPD level), base URL information may be present on the following levels:
 * - On MPD level in MPD.BaseURL element. For details refer to 5.3.1.2.
 * - On Period level in Period.BaseURL element. For details refer to 5.3.2.2.
 * - On Adaptation Set level in AdaptationSet.BaseURL element. For details refer to 5.3.3.2.
 * - On Representation level in Representation.BaseURL. For details refer to 5.3.5.2.
 *
 * Alternative base URLs
 * ---
 *
 * If alternative base URLs are provided through the [[BaseURL]] element at any level, identical Segments shall be accessible at multiple
 * locations. In the absence of other criteria, the DASH Client may use the first BaseURL element as “base URI". The DASH Client may
 * use base URLs provided in the BaseURL element as “base URI” and may implement any suitable algorithm to determine which URLs it uses
 * for requests.
 *
 * [[BaseURL]]s are resolved using the following rules (these rules come from ExoPlayer: https://github.com/google/ExoPlayer/issues/771)
 *
 * - If a [[BaseURL]] element contains a relative URL, it is interpreted relatively to the resolved base URL of the next higher level.
 * - If a [[BaseURL]] element contains an absolute URL, it is set as the resolved base URL of that level (i.e. resolved base URLs of higher levels are not considered).
 * - If multiple [[BaseURL]] elements are present on one level, they are:
 * -- Taken directly as resolved base URLs of that level if they are absolute URLs, or
 * -- Interpreted relatively to the resolved base URL of the next higher level, and the results are the resolved base URLs of that level.
 * - All relative [[BaseURL]] elements are resolved using all absolute [[BaseURL]] elements of the above level. Two relative [[BaseURL]]s with three resolved
 *     [[BaseURL]]s on the level above would lead to six new resolved [[BaseURL]]s on that level.
 *
 * XSL
 * ~~~~
 *  <xs:complexType name="BaseURLType">
 *     <xs:simpleContent>
 *     <xs:extension base="xs:anyURI">
 *        <xs:attribute name="serviceLocation" type="xs:string"/>
 *        <xs:attribute name="byteRange" type="xs:string"/>
 *        <xs:attribute name="availabilityTimeOffset" type="xs:double" />
 *        <xs:attribute name="availabilityTimeComplete" type="xs:boolean" />
 *        <xs:anyAttribute namespace="##other" processContents="lax"/>
 *     </xs:extension>
 *     </xs:simpleContent>
 *  </xs:complexType>
 * ~~~~
 *
 * XML
 * ~~~~
 * <BaseURL serviceLocation="sl" byteRange="br" availabilityTimeOffset="INF" availabilityTimeComplete="atc">http://cdn2.example.com/</BaseURL>
 * ~~~~
 *
 * @see RFC 3986
 * @see 5.3.1.2
 * @see 5.3.2.2
 * @see 5.3.3.2
 * @see 5.3.5.2
 * @see 5.6
 */
export class BaseURL extends TreeElement {
  /**
   * Location to look for content. May be chained with [[BaseURL]]s from elements above to create a complete URL.
   */
  public url: string;

  /**
   * Specifies a relationship between Base URLs such that [[BaseURL]] elements with the same @serviceLocation value are likely to have their URLs resolve to
   * services at a common network location, for example a common Content Delivery Network. If not present, no relationship to any other Base URL is known.
   */
  public serviceLocation: string;

  /**
   * Specifies HTTP partial GET requests may alternatively be issued by adding the byte range into a regular HTTP-URL based on the value of this attribute and
   * the construction rules in Annex E.2. If not present, HTTP partial GET requests may not be converted into regular GET requests. NOTE Such alternative
   * requests are expected to not be used unless the DASH application requires this.
   *
   * @see ISO IEC 23009-1 2014 Annex E.
   */
  public byteRange: string;

  /**
   * Specifies an offset to define the adjusted segment availability time. If the value is present in [[SegmentBase]] then this attribute
   * should not be present. If present in [[SegmentBase]] and [[BaseURL]] the value in [[BaseURL]] shall be ignored.
   *
   * This value may be Double.MAX_VALUE, indicating "INF" in the XML spec. See Section 5.3.9.2.2 Table 11 page 48, @availabilityTimeOffset comment.
   */
  public availabilityTimeOffset: number;

  /**
   * Specifies if all Segments of all associated [[Representation]]s are complete at the adjusted availability start time. If the value is
   * present in [[SegmentBase]]s then this attribute should not be present. If present in [[SegmentBase]] and [[BaseURL]] the value in [[BaseURL]] shall be ignored.
   */
  public availabilityTimeComplete: boolean;

  public getMPDRoot(): MPD {
    let parent: TreeElement = this.parent;
    while (!(parent instanceof MPD)) {
      parent = parent.parent;
    }
    return parent;
  }

  public resolvedURLs(): string[] {
    if (isUndefined(this.url)) {
      return [];
    }
    let result: string[] = [this.url];
    if (this.url.startsWith('http://') || this.url.startsWith('https://')) {
      return result;
    }

    // Don't select the immediate parent, as that will have this [[BaseURL]]s peers
    let elementParent: any = this.parent;
    if (isUndefined(elementParent.parent)) {
      return result;
    }
    elementParent = elementParent.parent;

    while (isDefined(elementParent)) {
      if (elementParent.baseURLs && elementParent.baseURLs.length > 0) {
        const newURLs: string[] = [];
        for (const b of elementParent.baseURLs) {
          for (const s of b.resolvedURLs()) {
            newURLs.push(`${s}${this.url}`);
          }
        }

        result = newURLs;
      }

      elementParent = elementParent.parent;
    }

    const rootURL: string = this.getMPDRoot().sourceURL;
    return result.map((url: string) => {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      return rootURL + url;
    });
  }

  /**
   * Title of this node in the MPD tree.
   *
   * @returns {string} MPD tree node title
   */
  public nodeTitle(): string {
    return 'Base URL';
  }

  /**
   * HTML-formatted simple contents of this MPD tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this MPD tree node.
   */
  public treeNodeText(): string {
    const resolvedURLs: string[] = this.resolvedURLs();
    let resolvedURLStrings = '';
    if (resolvedURLs[0] !== this.url) {
      resolvedURLStrings = resolvedURLs.reduce((acc: string, url: string) =>
        `${acc} ${formatTreeItem('resolved URI', url)}`, '');
    }

    return `<ul class="nodeInfo">
                ${formatTreeItem('URL', this.url)}
                ${resolvedURLStrings}
                ${formatTreeItem('service location', this.serviceLocation)}
                ${formatTreeItem('byte range', this.byteRange)}
                ${formatTreeItemNumber('availability time offset', this.availabilityTimeOffset)}
                ${formatTreeItemBoolean('availability time complete', this.availabilityTimeComplete)}
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
      a instanceof BaseURL &&
      this.url === a.url &&
      this.serviceLocation === a.serviceLocation &&
      this.byteRange === a.byteRange &&
      this.availabilityTimeOffset === a.availabilityTimeOffset &&
      this.availabilityTimeComplete === a.availabilityTimeComplete;
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
                ${fieldString('url', this.url, newIndent)}
                ${fieldString('serviceLocation', this.serviceLocation, newIndent)}
                ${fieldString('byteRange', this.byteRange, newIndent)}
                ${fieldString('availabilityTimeOffset', this.availabilityTimeOffset, newIndent)}
                ${fieldString('availabilityTimeComplete', this.availabilityTimeComplete, newIndent)}`;
  }
}
