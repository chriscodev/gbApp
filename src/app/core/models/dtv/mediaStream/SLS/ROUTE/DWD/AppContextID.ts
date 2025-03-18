/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {fieldString, formatTreeItemString} from '../../../../utils/TreeUtils';
import {isDefined} from '../../../../utils/Utils';

/**
 * AppContext element.
 */
export class AppContextID extends TreeElement {
  public appContextId: string;
  public filterCodes: string;

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return 'AppContextId';
  }

  /**
   * HTML-formatted simple contents of this node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItemString('app context ID', this.appContextId)}
                ${formatTreeItemString('filter codes', this.filterCodes)}
              </ul>`;
  }

  /**
   * Returns `true` if the object is deep equal to this.
   *
   * @param {ServiceName} a - object to compare to
   * @returns {boolean} true if a === b
   */
  public isEqual(a: TreeElement): boolean {
    return isDefined(a) &&
      a instanceof AppContextID &&
      this.appContextId === a.appContextId &&
      this.filterCodes === a.filterCodes;
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
                ${fieldString('appContextId', this.appContextId, newIndent)}
                ${fieldString('filterCodes', this.filterCodes, newIndent)}`;
  }
}
