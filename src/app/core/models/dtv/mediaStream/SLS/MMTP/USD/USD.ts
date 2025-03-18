/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {childrenString, fieldString, formatInt, formatTreeItem, isArrayEmpty} from '../../../../utils/TreeUtils';
import {isDefined, isUndefined} from '../../../../utils/Utils';
import {ComponentInfo} from './ComponentInfo';
import {MPUComponent} from './MPUComponent';
import {RouteComponent} from './RouteComponent';

/**
 * @see S33-174r1-Signaling-Delivery-Sync-FEC
 */
export class USD extends TreeElement {
  public globalServiceID: string;
  public serviceID: number;
  public mpuComponent: MPUComponent;
  public routeComponent: RouteComponent;
  public componentInfos: ComponentInfo[];

  /**
   * Returns `true` if this tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return isUndefined(this.mpuComponent) &&
      isUndefined(this.routeComponent) &&
      isArrayEmpty(this.componentInfos);
  }

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return `USD ${(this.serviceID ?? '')}`;
  }

  /**
   * HTML-formatted simple contents of this node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('global service ID', this.globalServiceID)}
                ${formatTreeItem('service ID', formatInt(this.serviceID))}
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
      a instanceof USD &&
      this.globalServiceID === a.globalServiceID &&
      this.serviceID === a.serviceID &&
      MPUComponent.isEqual(this.mpuComponent, a.mpuComponent) &&
      RouteComponent.isEqual(this.routeComponent, a.routeComponent) &&
      ComponentInfo.isEqualArray(this.componentInfos, a.componentInfos);
  }

  /**
   * Return a human-readable string useful for debugging.
   *
   * @param {string} indent - indent size for children
   * @returns {string} - human-readable string representation of this object
   */
  public toString(indent: string): string {
    const newIndent: string = `${indent}  `;
    return `${indent}${this.nodeTitle()}:
                ${fieldString('globalServiceID', this.globalServiceID, newIndent)}
                ${fieldString('serviceID', this.serviceID, newIndent)}
                ${childrenString('mpuComponent', this.mpuComponent, newIndent)}
                ${childrenString('routeComponent', this.routeComponent, newIndent)}
                ${childrenString('componentInfos', this.componentInfos, newIndent)}`;
  }
}

