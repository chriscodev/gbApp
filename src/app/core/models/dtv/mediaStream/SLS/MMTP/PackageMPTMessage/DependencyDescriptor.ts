/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {childrenString, formatInt, formatTreeItem, isArrayEmpty} from '../../../../utils/TreeUtils';
import {isDefined} from '../../../../utils/Utils';
import {AbstractDescriptor} from './AbstractDescriptor';
import {AssetID} from './AssetID';

export class DependencyDescriptor extends AbstractDescriptor {
  public assetIDs: AssetID[];

  constructor(tag: number) {
    super(tag);
  }

  /**
   * Returns `true` if this tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return isArrayEmpty(this.assetIDs);
  }

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return `Dependency Descriptor ${isDefined(this.assetIDs) ? `${this.assetIDs[0].assetIDValue}` : ''}`;
  }

  /**
   * HTML-formatted simple contents of this node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('tag', formatInt(this.tag))}
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
      a instanceof DependencyDescriptor &&
      AssetID.isEqualArray(this.assetIDs, a.assetIDs) &&
      super.isEqual(a);
  }

  /**
   * Return a human-readable string useful for debugging.
   *
   * @param {string} indent - indent size for children
   * @returns {string} - human-readable string representation of this object
   */
  public toString(indent: string): string {
    return `${indent}${this.nodeTitle()}:
                 ${childrenString('asset IDs', this.assetIDs, `${indent}  `)}`;
  }
}
