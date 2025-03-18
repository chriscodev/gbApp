// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../../../core/models/dtv/utils/TreeElement';
import {
  childrenString,
  fieldString,
  formatTreeItem,
  isArrayEmpty
} from '../../../../../../core/models/dtv/utils/TreeUtils';
import {isDefined} from '../../../../../../core/models/dtv/utils/Utils';
import {Accessibility} from './Accessibility';
import {Rating} from './Rating';
import {Role} from './Role';
import {Viewpoint} from './Viewpoint';

/**
 * Each Adaptation Set contains one or more media content components. The properties of each media content
 * component are described by a ContentComponent element or may be described directly on the AdaptationSet
 * element if only one media content component is present in the Adaptation Set.
 *
 * XSL
 * ~~~~
 * <xs:complexType name="ContentComponentType">
 *    <xs:sequence>
 *       <xs:element name="Accessibility" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:element name="Role" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:element name="Rating" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:element name="Viewpoint" type="DescriptorType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:any namespace="##other" processContents="lax" minOccurs="0" maxOccurs="unbounded"/>
 *    </xs:sequence>
 *    <xs:attribute name="id" type="xs:unsignedInt"/>
 *    <xs:attribute name="lang" type="xs:language"/>
 *    <xs:attribute name="contentType" type="xs:string"/>
 *    <xs:attribute name="par" type="RatioType"/>
 *    <xs:anyAttribute namespace="##other" processContents="lax"/>
 * </xs:complexType>
 * ~~~~
 *
 * @see ISO/IEC 23009-1:2014 5.3.4 Media Content Component
 */
export class ContentComponent extends TreeElement {
  /**
   * An identifier for this media component. The attribute shall be unique in the scope of the containing Adaptation Set.
   */
  public id: number;

  /**
   * Declares the language code for this Adaptation Set. If not present, the language code may be defined for
   * each media component or it may be unknown.
   *
   * @see IETF RFC 5646
   * @see RFC 1766
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
   * Identifies the accessibility scheme employed. Accessibility is a general term used to describe the degree to which
   * the DASH Media Presentation is available to as many people as possible.
   *
   * @type {Accessibility[]}
   * @see ISO/IEC 23009-1:2014 5.8.1 Descriptors General
   * @see ISO/IEC 23009-1:2014 5.8.4.3 Accessibility
   */
  public accessibilityList: Accessibility[] = [];

  /**
   * Identifies the roles of the media content component. Roles define and describe characteristics and/or structural
   * functions of media content components.
   *
   * @type {Role[]}
   * @see ISO/IEC 23009-1:2014 5.8.1 Descriptors General
   * @see ISO/IEC 23009-1:2014 5.8.4.2 Role
   */
  public roleList: Role[] = [];

  /**
   * Ratings specify that content is suitable for presentation to audiences for which that rating is known to be
   * appropriate, or for unrestricted audiences.
   *
   * @type {Rating[]}
   * @see ISO/IEC 23009-1:2014 5.8.1 Descriptors General
   * @see ISO/IEC 23009-1:2014 5.8.4.4 Rating
   */
  public ratingList: Rating[] = [];

  /**
   * Identifies the viewpoint scheme employed. Adaptation Sets containing non-equivalent Viewpoint element values
   * contain different media content components. The Viewpoint elements may equally be applied to media content types
   * that are not video. Adaptation Sets with equivalent Viewpoint element values are intended to be presented together.
   *
   * @type {Viewpoint[]}
   * @see ISO/IEC 23009-1:2014 5.8.1 Descriptors General
   * @see ISO/IEC 23009-1:2014 5.8.4.5 Viewpoint
   */
  public viewpointList: Viewpoint[] = [];

  /**
   * Returns `true` if this MPD tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return isArrayEmpty(this.accessibilityList) &&
      isArrayEmpty(this.roleList) &&
      isArrayEmpty(this.ratingList) &&
      isArrayEmpty(this.viewpointList);
  }

  /**
   * Title of this node in the MPD tree.
   *
   * @returns {string} MPD tree node title
   */
  public nodeTitle(): string {
    return `Content Component ${this.id ?? ''}`;
  }

  /**
   * HTML-formatted simple contents of this MPD tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this MPD tree node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('ID', `${this.id}`)}
                ${formatTreeItem('language', this.lang)}
                ${formatTreeItem('content type', this.contentType)}
                ${formatTreeItem('PAR', this.par)}
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
      a instanceof ContentComponent &&
      this.id === a.id &&
      this.lang === a.lang &&
      this.contentType === a.contentType &&
      this.par === a.par;
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
                ${fieldString('lang', this.lang, newIndent)}
                ${fieldString('content type', this.contentType, newIndent)}
                ${fieldString('par', this.par, newIndent)}
                ${childrenString('accessibilities', this.accessibilityList as unknown as TreeElement[], newIndent)}
                ${childrenString('roles', this.roleList as unknown as TreeElement[], newIndent)}
                ${childrenString('ratings', this.ratingList as unknown as TreeElement[], newIndent)}
                ${childrenString('viewpoints', this.viewpointList as unknown as TreeElement[], newIndent)}`;
  }
}
