// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../../../core/models/dtv/utils/TreeElement';
import {fieldString, formatTreeItem} from '../../../../../../core/models/dtv/utils/TreeUtils';
import {isUndefined} from '../../../../../../core/models/dtv/utils/Utils';

/**
 * @see ISO/IEC 23009-1:2014 5.3.9.2.2 Semantics Table 13
 */
export class URLType extends TreeElement {
  /** Name of the subclass XML element. */
  public elementName: string;
  /**
   * Source URL part and shall be formatted either as an <absolute-URI> according to RFC 3986, Clause 4.3, with
   * a fixed scheme of “http” or “https” or as a <relative-ref> according to RFC 3986, Clause 4.2.
   * If not present, then any [[BaseURL]] element is mapped to the @sourceURL attribute and the range attribute shall be present.
   *
   * @see RFC 3986, Clause 4.3
   * @see RFC 3986, Clause 4.2
   */
  public sourceURL: string;
  /**
   * byte range restricting the sourceURL.
   * The byte range shall be expressed and formatted as a byte-range-spec as defined in RFC 2616, Clause 14.35.1. It is
   * restricted to a single expression identifying a contiguous range of bytes.
   * If not present, the element refers to the entire resource referenced in the @sourceURL attribute.
   *
   * ex. "bytes=500-999", "bytes=500-600,601-999", "bytes=9500-", "bytes=-500"
   *
   * @see RFC 2616, Clause 14.35.1
   */
  public range: string;

  /**
   * Human-readable title for this node.
   *
   * @returns {string} title
   */
  public nodeTitle(): string {
    return this.elementName;
  }

  /**
   * Human-readable content of this node.
   *
   * @returns {string}
   */
  public treeNodeText(): string {
    const resolvedURLs: string[] = this.findNearestResolvedBaseURLStrings();
    const resolvedURLStrings: string = resolvedURLs.reduce((acc: string, url: string) =>
      `${acc} ${formatTreeItem('resolved source URL', url + this.sourceURL)}`, '');

    return `<ul class="nodeInfo">
                ${formatTreeItem('source URL', this.sourceURL)}
                ${resolvedURLStrings}
                ${formatTreeItem('range', this.range)}
              </ul>`;
  }

  /**
   * Returns `true` if the object is deep equal to this.
   *
   * @param {ServiceName} a - object to compare to
   * @returns {boolean} true if a === b
   */
  public isEqual(a: TreeElement): boolean {
    return isUndefined(a) &&
      a instanceof URLType &&
      this.elementName === a.elementName &&
      this.sourceURL === a.sourceURL &&
      this.range === a.range;
  }

  /**
   * Return a human-readable string useful for debugging.
   *
   * @param {string} indent
   * @returns {string}
   */
  public toString(indent: string): string {
    const newIndent = `${indent}  `;
    return `${indent}${this.elementName}:
               ${fieldString('source URL', this.sourceURL, newIndent)}
               ${fieldString('range', this.range, newIndent)}`;
  }
}
