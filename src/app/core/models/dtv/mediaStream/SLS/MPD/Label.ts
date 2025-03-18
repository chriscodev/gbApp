// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../../../core/models/dtv/utils/TreeElement';
import {fieldString, formatTreeItem} from '../../../../../../core/models/dtv/utils/TreeUtils';
import {isDefined} from '../../../../../../core/models/dtv/utils/Utils';

export class Label extends TreeElement {
  public label?: string;

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return 'Label';
  }

  /**
   * HTML-formatted simple contents of this node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('label', this.label)}
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
      a instanceof Label &&
      this.label === a.label;
  }

  /**
   * Return a human-readable string useful for debugging.
   *
   * @param {string} indent - indent size for children
   * @returns {string} - human-readable string representation of this object
   */
  public toString(indent: string): string {
    return `${indent}${this.nodeTitle()}:
                ${fieldString('label', this.label, `${indent}  `)}`;
  }
}

