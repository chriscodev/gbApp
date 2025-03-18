// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../../../core/models/dtv/utils/TreeElement';
import {formatLang, formatTreeItem, isArrayEmpty} from '../../../../../../core/models/dtv/utils/TreeUtils';
import {isDefined} from '../../../../../../core/models/dtv/utils/Utils';
import {Accessibility} from './Accessibility';
import {CommonRepresentation} from './CommonRepresentation';
import {Label} from './Label';
import {Rating} from './Rating';
import {Role} from './Role';
import {Viewpoint} from './Viewpoint';

export class Preselection extends CommonRepresentation // implements TreeElement
{
  public id?: string;
  public lang?: string;
  public preselectionComponents?: string;
  public tag?: string;
  public accessibilityList: Accessibility[] = [];
  public roleList: Role[] = [];
  public ratingList: Rating[] = [];
  public viewpointList: Viewpoint[] = [];
  public labelList: Label[] = [];

  /**
   * Returns `true` if this tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return super.isLeaf() &&
      isArrayEmpty(this.accessibilityList) &&
      isArrayEmpty(this.roleList) &&
      isArrayEmpty(this.ratingList) &&
      isArrayEmpty(this.viewpointList) &&
      isArrayEmpty(this.labelList);
  }

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return `Preselection ${this.id ?? ''}`;
  }

  /**
   * HTML-formatted simple contents of this node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('id', this.id)}
                ${formatTreeItem('language', formatLang(this.lang))}
                ${formatTreeItem('preselection components', this.preselectionComponents)}
                ${formatTreeItem('tag', this.tag)}
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
      a instanceof Preselection &&
      this.id === a.id &&
      this.lang === a.lang &&
      this.preselectionComponents === a.preselectionComponents &&
      this.tag === a.tag &&
      this.lang === a.lang &&
      Accessibility.isEqualArray(this.accessibilityList, a.accessibilityList) &&
      Role.isEqualArray(this.roleList, a.roleList) &&
      Rating.isEqualArray(this.ratingList, a.ratingList) &&
      Viewpoint.isEqualArray(this.viewpointList, a.viewpointList) &&
      Label.isEqualArray(this.labelList, a.labelList) &&
      super.isEqual(a);
  }

  // TODO toString
}

