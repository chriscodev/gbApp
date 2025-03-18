// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../../../core/models/dtv/utils/TreeElement';
import {fieldString, formatTreeItem, isArrayEmpty} from '../../../../../../core/models/dtv/utils/TreeUtils';
import {arrayEquals, isDefined} from '../../../../../../core/models/dtv/utils/Utils';
import {NagraPRMSignalization} from './NargaPRMSignalization';

export class NagraPRM extends TreeElement {
  public xmlNameSpace?: string;
  public prmSignalizationList?: NagraPRMSignalization[];

  /**
   * Returns `true` if this tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return isArrayEmpty(this.prmSignalizationList);
  }

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return `PRM ${this.xmlNameSpace ?? ''}`;
  }

  /**
   * HTML-formatted simple contents of this node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('xmlNameSpace', this.xmlNameSpace)}
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
      a instanceof NagraPRM &&
      this.xmlNameSpace === a.xmlNameSpace &&
      arrayEquals(this.prmSignalizationList, a.prmSignalizationList);
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
                ${fieldString('xmlNameSpace', this.xmlNameSpace, newIndent)}`;
  }
}
