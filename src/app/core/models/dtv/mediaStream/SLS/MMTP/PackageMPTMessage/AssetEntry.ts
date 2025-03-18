/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {
  childrenString,
  fieldString,
  formatBoolean,
  formatInt,
  formatTreeItem,
  isArrayEmpty
} from '../../../../utils/TreeUtils';
import {isUndefined} from '../../../../utils/Utils';
import {AbstractDescriptor} from './AbstractDescriptor';
import {GeneralLocation} from './GeneralLocation';
import {IdentifierMapping} from './IdentifierMapping';

/**
 * @see S33-174r1-Signaling-Delivery-Sync-FEC
 */
export class AssetEntry extends TreeElement {
  public identifierMapping: IdentifierMapping;
  public assetType: string;
  public defaultAsset: boolean;
  public assetClockRelation: boolean;
  public assetClockRelationID: number;
  public assetTimescale: number;
  public generalLocations: GeneralLocation[];
  public descriptors: AbstractDescriptor[];

  /**
   * Returns `true` if this tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return isUndefined(this.identifierMapping) &&
      isArrayEmpty(this.generalLocations) &&
      isArrayEmpty(this.descriptors);
  }

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return `Asset Entry ${this.assetType ?? ''}`;
  }

  /**
   * HTML-formatted simple contents of this node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('asset type', this.assetType)}
                ${formatTreeItem('default asset', formatBoolean(this.defaultAsset))}
                ${formatTreeItem('asset clock relation', formatBoolean(this.assetClockRelation))}
                ${formatTreeItem('asset clock relation ID', formatInt(this.assetClockRelationID))}
                ${formatTreeItem('asset timescale', formatInt(this.assetTimescale))}
              </ul>`;
  }

  /**
   * Returns `true` if the object is deep equal to this.
   *
   * @param {TreeElement} a - object to compare to
   * @returns {boolean} true if a === b
   */
  public isEqual(a: TreeElement): boolean {
    return isUndefined(a) &&
      a instanceof AssetEntry &&
      this.assetType === a.assetType &&
      this.defaultAsset === a.defaultAsset &&
      this.assetClockRelation === a.assetClockRelation &&
      this.assetClockRelationID === a.assetClockRelationID &&
      this.assetTimescale === a.assetTimescale &&
      GeneralLocation.isEqualArray(this.generalLocations, a.generalLocations) &&
      AbstractDescriptor.isEqualArray(this.descriptors, a.descriptors);
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
                ${childrenString('identifierMapping', this.identifierMapping, newIndent)}
                ${fieldString('assetType', this.assetType, newIndent)}
                ${fieldString('defaultAsset', this.defaultAsset, newIndent)}
                ${fieldString('assetClockRelation', this.assetClockRelation, newIndent)}
                ${fieldString('assetClockRelationID', this.assetClockRelationID, newIndent)}
                ${fieldString('assetTimescale', this.assetTimescale, newIndent)}
                ${childrenString('generalLocations', this.generalLocations, newIndent)}`;
  }
}



