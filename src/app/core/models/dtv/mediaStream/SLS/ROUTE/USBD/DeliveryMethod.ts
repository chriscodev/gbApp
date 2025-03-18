/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {childrenString, isArrayEmpty} from '../../../../utils/TreeUtils';
import {isDefined} from '../../../../utils/Utils';
import {AppService, AppServiceJSON} from './AppService';


/**
 * Container of transport-related information pertaining to the contents of the service over
 * broadcast and (optionally) broadband modes of access. This element is not applicable to and
 * therefore shall be absent for ESG and EAS services.
 *
 * XSD
 * ~~~~
 *  <xs:complexType name="DeliveryMethodType">
 *    <xs:sequence>
 *      <xs:element name="BroadcastAppService" type="routeusd:AppServiceType" minOccurs="0" maxOccurs="unbounded"/>
 *      <xs:element name="UnicastAppService" type="routeusd:AppServiceType" minOccurs="0" maxOccurs="unbounded"/>
 *      <xs:any namespace="##other" processContents="strict" minOccurs="0" maxOccurs="unbounded"/>
 *    </xs:sequence>
 *    <xs:anyAttribute processContents="strict"/>
 *  </xs:complexType>
 * ~~~~
 */
export class DeliveryMethod extends TreeElement {
  /**
   * A DASH Representation delivered over broadcast containing the corresponding media component(s)
   * belonging to the ATSC 3.0 Service.
   */
  public broadcastAppServices: AppService[];

  /**
   * A DASH Representation delivered over broadband containing the constituent media content component(s)
   * belonging to the ATSC 3.0 Service.
   */
  public unicastAppServices: AppService[];

  // TODO other attributes/elements

  /**
   * Returns `true` if this tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return isArrayEmpty(this.broadcastAppServices) && isArrayEmpty(this.unicastAppServices);
  }

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return 'Delivery Method';
  }

  /**
   * Returns `true` if the object is deep equal to this.
   *
   * @param {TreeElement} a - object to compare to
   * @returns {boolean} true if a === b
   */
  public isEqual(a: TreeElement): boolean {
    return isDefined(a) &&
      a instanceof DeliveryMethod &&
      AppService.isEqualArray(this.broadcastAppServices, a.broadcastAppServices) &&
      AppService.isEqualArray(this.unicastAppServices, a.unicastAppServices);
  }

  /**
   * Return a human-readable string useful for debugging.
   *
   * @param {string} indent
   * @returns {string}
   */
  public toString(indent: string): string {
    const newIndent = `${indent}  `;
    return `${indent}${this.nodeTitle()}:
                ${childrenString('Broadcast App Services', this.broadcastAppServices, newIndent)}
                ${childrenString('Unicast App Services', this.unicastAppServices, newIndent)}`;
  }
}

export interface DeliveryMethodJSON {
  broadcastAppServices?: AppServiceJSON[];
  unicastAppServices?: AppServiceJSON[];
}

