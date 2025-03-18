/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {appendChildString} from '../../../../utils/TreeUtils';
import {isDefined, isUndefined} from '../../../../utils/Utils';
import {FECParameters} from './FECParameters';

/**
 * Repair flow carried in the LCT channel referenced by signaling metadata.
 *
 * XSD
 * ~~~~
 *  <xs:element name="RepairFlow" type="stsid:rprFlowType"/>
 *
 *  <xs:complexType name="rprFlowType">
 *    <xs:sequence>
 *      <xs:element name="FECParameters" type="stsid:fecParametersType" minOccurs="0"/>
 *      <xs:any namespace="##other" processContents="strict" minOccurs="0" maxOccurs="unbounded"/>
 *    </xs:sequence>
 *    <xs:anyAttribute processContents="strict"/>
 *  </xs:complexType>
 * ~~~~
 *
 * @see A/331 A.4.3.2 Semantics
 */
export class RepairFlow extends TreeElement {
  public fecParameters: FECParameters;

  /**
   * Returns `true` if this tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return isUndefined(this.fecParameters);
  }

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return 'RepairFlow';
  }

  /**
   * HTML-formatted simple contents of this MPD tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this MPD tree node.
   */
  public treeNodeText(): string {
    return '<ul class="nodeInfo"></ul>';
  }

  /**
   * Returns `true` if the object is deep equal to this.
   *
   * @param {TreeElement} a - object to compare to
   * @returns {boolean} true if a === b
   */
  public isEqual(a: TreeElement): boolean {
    return isDefined(a) &&
      a instanceof RepairFlow &&
      FECParameters.isEqual(this.fecParameters, a.fecParameters);
  }

  /**
   * Return a human-readable string useful for debugging.
   *
   * @param {string} indent
   * @returns {string}
   */
  public toString(indent: string): string {
    const newIndent = `${indent}  `;
    let result = `${indent}${this.nodeTitle()}:`;
    result = appendChildString(result, 'fecParameters', this.fecParameters, newIndent);

    return result;
  }
}
