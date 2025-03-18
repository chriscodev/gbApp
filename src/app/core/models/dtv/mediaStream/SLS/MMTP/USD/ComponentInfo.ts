/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {fieldString, formatBoolean, formatTreeItem} from '../../../../utils/TreeUtils';
import {isDefined} from '../../../../utils/Utils';

/**
 * @see S33-174r1-Signaling-Delivery-Sync-FEC
 */
export class ComponentInfo extends TreeElement {
  public componentType: string;
  public componentRole: string;
  public componentID: string;
  public componentProtectionFlag: boolean;

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return `Component ${isDefined(this.componentID) ? `${this.componentID}` : ''}`;
  }

  /**
   * HTML-formatted simple contents of this node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('type', this.componentType)}
                ${formatTreeItem('role', this.componentRole)}
                ${formatTreeItem('ID', this.componentID)}
                ${formatTreeItem('protection flag', formatBoolean(this.componentProtectionFlag))}
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
      a instanceof ComponentInfo &&
      this.componentType === a.componentType &&
      this.componentRole === a.componentRole &&
      this.componentID === a.componentID &&
      this.componentProtectionFlag === a.componentProtectionFlag;
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
                ${fieldString('componentType', this.componentType, newIndent)}
                ${fieldString('componentRole', this.componentRole, newIndent)}
                ${fieldString('componentID', this.componentID, newIndent)}
                ${fieldString('componentProtectionFlag', this.componentProtectionFlag, newIndent)}`;
  }
}

