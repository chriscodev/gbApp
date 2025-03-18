/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {appendChildString} from '../../../../utils/TreeUtils';
import {isDefined, isUndefined} from '../../../../utils/Utils';
import {FDTInstance} from './FDTInstance';

/**
 * Specifies the details of the file delivery data in the form of the Extended FDT instance
 * which includes nominal FDT instance parameters.
 *
 * The EFDT may either be embedded or may be provided as a reference. If provided as a reference the EFDT
 * may be updated independently of the signaling metadata.
 *
 * If referenced, and delivered as an in-band object of the included source flow which is delivered on an
 * LCT channel separate from the LCT channel carrying the signaling metadata , its TOI value shall be “0”.
 *
 * If the referenced EFDT is delivered on a different LCT channel from the LCTchannel carrying the contents
 * of the referencing SrcFlow, its TOI value shall be “1”.
 *
 * XSD
 * ~~~~
 *  <xs:complexType name="EFDTType">
 *    <xs:sequence>
 *      <xs:element name="FDT-Instance" type="fdt:FDT-InstanceType" minOccurs="0"/>
 *      <xs:any namespace="##other" processContents="strict" minOccurs="0" maxOccurs="unbounded"/>
 *    </xs:sequence>
 *    <xs:anyAttribute namespace="##other" processContents="strict"/>
 *  </xs:complexType>
 * ~~~~
 */
export class EFDT extends TreeElement {
  /**
   * Any parameters allowed in the FLUTE FDT instance from RFC 6726.
   *
   * XML: optional
   */
  public fdtInstance: FDTInstance;

  /**
   * Returns `true` if this tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return isUndefined(this.fdtInstance);
  }

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return 'EFDT';
  }

  /**
   * Returns `true` if the object is deep equal to this.
   *
   * @param {TreeElement} a - object to compare to
   * @returns {boolean} true if a === b
   */
  public isEqual(a: TreeElement): boolean {
    return isDefined(a) &&
      a instanceof EFDT &&
      FDTInstance.isEqual(this.fdtInstance, a.fdtInstance);
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
    result = appendChildString(result, 'FDT instance', this.fdtInstance, newIndent);
    return result;
  }
}
