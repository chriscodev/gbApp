/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {childrenString, fieldString} from '../../../../utils/TreeUtils';
import {isDefined, isUndefined} from '../../../../utils/Utils';
import {
  UserServiceDescription,
  UserServiceDescriptionFactory,
  UserServiceDescriptionJSON
} from './UserServiceDescription';

export interface USBDJSON {
  userServiceDescription: UserServiceDescriptionJSON;
}

export class USBDFactory {
  private static readonly KEYS: string[] = ['userServiceDescription'];

  public static fromJSON(json: USBDJSON): USBD {
    if (isUndefined(json)) {
      return undefined;
    }

    const newUSBD: USBD = new USBD();

    newUSBD.userServiceDescription = UserServiceDescriptionFactory.fromJSON(json.userServiceDescription);
    newUSBD.parseOtherChildren(json, this.KEYS);

    return newUSBD;
  }
}

/**
 * User Service Bundle Description. Provides entry point information for the description and discovery of the
 * technical details of an ATSC 3.0 service.
 *
 * XSD
 * ~~~~
 *  <xs:element name="BundleDescriptionROUTE" type="routeusd:BundleDescriptionROUTEType"/>
 *
 *  <xs:complexType name="BundleDescriptionROUTEType">
 *    <xs:sequence>
 *      <xs:element name="UserServiceDescription" type="routeusd:UserServiceDescriptionType"/>
 *      <xs:any namespace="##other" processContents="strict" minOccurs="0" maxOccurs="unbounded"/>
 *    </xs:sequence>
 *  </xs:complexType>
 *
 * ~~~~
 */
export class USBD extends TreeElement {
  public userServiceDescription: UserServiceDescription;

  /**
   * `Returns true` if this tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return isUndefined(this.userServiceDescription);
  }

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return 'USBD';
  }

  /**
   * Returns `true` if the object is deep equal to this.
   *
   * @param {TreeElement} a - object to compare to
   * @returns {boolean} true if a === b
   */
  public isEqual(a: TreeElement): boolean {
    return isDefined(a) &&
      a instanceof USBD &&
      UserServiceDescription.isEqual(this.userServiceDescription, a.userServiceDescription);
  }

  /**
   * Return a human-readable string useful for debugging.
   *
   * @param {string} indent
   * @returns {string}
   */
  public toString(indent: string): string {
    const newIndent = `${indent}  `;
    const unknownKeys: string = this.children.reduce((acc, c: string) =>
      `${acc}${fieldString(c, JSON.stringify(this.children[c]))} (unparsed)\n`, '') as string;
    return `${indent}${this.nodeTitle()}:
                ${childrenString('user service descriptions', this.userServiceDescription, newIndent)}
                ${unknownKeys}`;
  }
}
