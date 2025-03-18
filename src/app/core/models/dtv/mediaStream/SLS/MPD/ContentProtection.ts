// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {TreeElement} from '../../../../../../core/models/dtv/utils/TreeElement';
import {fieldString, formatTreeItem, isArrayEmpty} from '../../../../../../core/models/dtv/utils/TreeUtils';
import {arrayEquals, isDefined} from '../../../../../../core/models/dtv/utils/Utils';
import {DashIfLaurl} from './DashIfLaurl';
import {NagraPRM} from './NagraPRM';

/* tslint:disable:no-redundant-jsdoc */

/**
 * The @schemeIdUri attribute is used to identify a content protection scheme. This attribute should provide
 * sufficient information, possibly in conjunction with the @value and/or extension attributes and elements,
 * such as the DRM system(s), encryption algorithm(s), and key distribution scheme(s) employed, to enable a
 * client to determine whether it can possibly play the protected content. The ContentProtection element can
 * be extended in a separate namespace to provide information specific to the content protection scheme (e.g.,
 * particular key management systems or encryption methods).
 * When the ContentProtection element is not present the content shall not be content-protected.
 * When multiple ContentProtection elements are present, each element shall describe a content protection
 * scheme that is sufficient to access and present the Representation.
 *
 * @see ISO/IEC 23009-1:2014 5.8.4.1 Content protection
 * @see ISO/IEC 23009-1:2014 5.8.5.2 Content protection
 */
export class ContentProtection extends TreeElement {
  public schemeIdUri?: string;
  public id?: string;
  public value?: string;
  public extra?: string;
  public prmList?: NagraPRM[];
  public laurlList?: DashIfLaurl[];

  /**
   * Returns `true` if this tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return isArrayEmpty(this.prmList) && isArrayEmpty(this.laurlList);
  }

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return `Content Protection ${(this.schemeIdUri ?? '')}`;
  }

  /**
   * HTML-formatted simple contents of this node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('schemeIdUri', this.schemeIdUri)}
                ${formatTreeItem('ID', this.id)}
                ${formatTreeItem('value', this.value)}
                ${formatTreeItem('extra', this.extra)}
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
      a instanceof ContentProtection &&
      this.id === a.id &&
      this.schemeIdUri === a.schemeIdUri &&
      this.value === a.value &&
      this.extra === a.extra &&
      arrayEquals(this.prmList, a.prmList) &&
      arrayEquals(this.laurlList, a.laurlList);
  }

  /**
   * Return a human-readable string useful for debugging.
   *
   * @param {string} indent - indent size for children
   * @returns {string} - human-readable string representation of this object
   */
  public toString(indent: string): string {
    const newIndent = `${indent}  `;
    return `${indent}${this.nodeTitle()}:
                ${fieldString('id', this.id, newIndent)}
                ${fieldString('schemeIdUri', this.schemeIdUri, newIndent)}
                ${fieldString('value', this.value, newIndent)}
                ${fieldString('extra', this.extra, newIndent)}`;
  }
}

