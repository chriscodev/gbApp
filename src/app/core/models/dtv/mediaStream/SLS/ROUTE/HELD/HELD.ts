/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {childrenString, isArrayEmpty} from '../../../../utils/TreeUtils';
import {isDefined} from '../../../../utils/Utils';
import {HTMLEntryPackage} from './HTMLEntryPackage';

/**
 * HTML Entry pages Location Description for requested service(s)
 *
 * Provides application-related metadata that enables the loading and unloading of an application
 * including the information about application-related files, such as an application entry page,
 * files associated with the entry page, media assets expected to be consumed by the application,
 * or a combination of these content types for one or more applications associated with a service
 * as defined in A/337, Application Signaling
 *
 * XSD
 * ~~~~
 *  <xs:element name="HELD" type="held:HELDType"/>
 *
 *  <xs:complexType name="HELDType">
 *    <xs:sequence>
 *      <xs:element name="HTMLEntryPackage" type="held:HTMLEntryPackageType" maxOccurs="unbounded"/>
 *      <xs:any namespace="##other" processContents="strict" minOccurs="0" maxOccurs="unbounded"/>
 *    </xs:sequence>
 *    <xs:anyAttribute processContents="strict"/>
 *  </xs:complexType>
 * ~~~~
 *
 * XML
 * ~~~~
 * <?xml version="1.0" encoding="UTF-8"?>
 * <HELD>
 *    <HTMLEntryPackage appContextId="testapp",
 *                      bcastEntryPackageUrl="samplebcastapp.zip.multipart",
 *                      bcastEntryPageUrl="samplebcastapp/home.html"/>
 * </HELD>
 * ~~~~
 *
 * @see A/337 4 SIGNALING OF APPLICATION PROPERTIES
 * @see A/331 7 SERVICE LAYER SIGNALING
 */
export class HELD extends TreeElement {
  public htmlEntryPackages: HTMLEntryPackage[];

  // TODO other attributes/elements

  /**
   * Returns `true` if this tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return isArrayEmpty(this.htmlEntryPackages);
  }

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return 'HELD';
  }

  /**
   * Returns `true` if the object is deep equal to this.
   *
   * @param {TreeElement} a - object to compare to
   * @returns {boolean} true if a === b
   */
  public isEqual(a: TreeElement): boolean {
    return isDefined(a) &&
      a instanceof HELD &&
      HTMLEntryPackage.isEqualArray(this.htmlEntryPackages, a.htmlEntryPackages);
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
                ${childrenString('htmlEntryPackages', this.htmlEntryPackages, newIndent)}`;
  }
}
