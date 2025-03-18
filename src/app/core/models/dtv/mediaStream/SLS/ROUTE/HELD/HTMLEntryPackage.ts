/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {datesEqual} from '../../../../utils/DateTimeUtils';
import {TreeElement} from '../../../../utils/TreeElement';
import {
  fieldString,
  formatTreeItemBoolean,
  formatTreeItemDate,
  formatTreeItemString
} from '../../../../utils/TreeUtils';
import {arrayEquals, isDefined} from '../../../../utils/Utils';

/**
 * XSD
 * ~~~~
 *  <xs:complexType name="HTMLEntryPackageType">
 *    <xs:sequence>
 *      <xs:any namespace="##other" processContents="strict" minOccurs="0" maxOccurs="unbounded"/>
 *    </xs:sequence>
 *    <xs:attribute name="appContextID" type="xs:anyURI" use="required"/>
 *    <xs:attribute name="appID" type="xs:anyURI" use="required"/>
 *    <xs:attribute name="defaultApp" type="xs:boolean"/>
 *    <xs:attribute name="requiredCapabilities" type="sa:CapabilitiesType"/>
 *    <xs:attribute name="appRendering" type="xs:boolean"/>
 *    <xs:attribute name="clearAppContextCacheDate" type="xs:dateTime"/>
 *    <xs:attribute name="bcastEntryPackageUrl" type="xs:anyURI"/>
 *    <xs:attribute name="bcastEntryPageUrl" type="xs:anyURI"/>
 *    <xs:attribute name="bbandEntryPageUrl" type="xs:anyURI"/>
 *    <xs:attribute name="validFrom" type="xs:dateTime"/>
 *    <xs:attribute name="validUntil" type="xs:dateTime"/>
 *    <xs:attribute name="coupledServices" type="held:listOfUnsignedShort"/>
 *    <xs:attribute name="lctTSIRef" type="held:listOfUnsignedInt"/>
 *    <xs:anyAttribute processContents="strict"/>
 *  </xs:complexType>
 *
 * <xs:simpleType name="CapabilitiesType">
 *    <xs:restriction base="xs:string"/>
 * </xs:simpleType>
 * ~~~~
 *
 * TODO expand to all contents
 * JSON
 * ~~~~
 * {
 *     appContextId: "testapp",
 *     bcastEntryPackageUrl: "samplebcastapp.zip.multipart",
 *     bcastEntryPageUrl: "samplebcastapp/home.html"
 *  }
 * ~~~~
 */
export class HTMLEntryPackage extends TreeElement {
  public appContextID: string;
  public appID: string;
  public defaultApp: boolean;
  public requiredCapabilities: string;
  public appRendering: boolean;
  public clearAppContextCacheDate: Date;
  public bcastEntryPackageUrl: string;
  public bcastEntryPageUrl: string;
  public bbandEntryPageUrl: string;
  public validFrom: Date;
  public validUntil: Date;
  public coupledServices: number[];
  public lctTSIRef: number[];

  // TODO attributes/elements

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return 'HTML Entry Package';
  }

  /**
   * HTML-formatted simple contents of this node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItemString('app context ID', this.appContextID)}
                ${formatTreeItemString('app ID', this.appID)}
                ${formatTreeItemBoolean('default', this.defaultApp)}
                ${formatTreeItemString('required capabilities', this.requiredCapabilities)}
                ${formatTreeItemBoolean('app rendering', this.appRendering)}
                ${formatTreeItemDate('clear app context cache date', this.clearAppContextCacheDate)}
                ${formatTreeItemString('broadcast entry package URL', this.bcastEntryPackageUrl)}
                ${formatTreeItemString('broadcast entry page URL', this.bcastEntryPageUrl)}
                ${formatTreeItemString('broadband entry page URL', this.bbandEntryPageUrl)}
                ${formatTreeItemDate('valid from', this.validFrom)}
                ${formatTreeItemDate('valid until', this.validUntil)}
                ${formatTreeItemString('coupled services', this.coupledServices.join(' '))}
                ${formatTreeItemString('LCT TSI references', this.lctTSIRef.join(' '))}
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
      a instanceof HTMLEntryPackage &&
      this.appContextID === a.appContextID &&
      this.appID === a.appID &&
      this.defaultApp === a.defaultApp &&
      this.requiredCapabilities === a.requiredCapabilities &&
      this.appRendering === a.appRendering &&
      datesEqual(this.clearAppContextCacheDate, a.clearAppContextCacheDate) &&
      this.bcastEntryPackageUrl === a.bcastEntryPackageUrl &&
      this.bcastEntryPageUrl === a.bcastEntryPageUrl &&
      this.bbandEntryPageUrl === a.bbandEntryPageUrl &&
      datesEqual(this.validFrom, a.validFrom) &&
      datesEqual(this.validUntil, a.validUntil) &&
      arrayEquals(this.coupledServices, a.coupledServices) &&
      arrayEquals(this.lctTSIRef, a.lctTSIRef);
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
                ${fieldString('appContextID', this.appContextID, newIndent)}
                ${fieldString('requiredCapabilities', this.requiredCapabilities, newIndent)}
                ${fieldString('appRendering', this.appRendering, newIndent)}
                ${fieldString('clearAppContextCacheDate', this.clearAppContextCacheDate, newIndent)}
                ${fieldString('bcastEntryPackageUrl', this.bcastEntryPackageUrl, newIndent)}
                ${fieldString('bcastEntryPageUrl', this.bcastEntryPageUrl, newIndent)}
                ${fieldString('bbandEntryPageUrl', this.bbandEntryPageUrl, newIndent)}
                ${fieldString('validFrom', this.validFrom, newIndent)}
                ${fieldString('validUntil', this.validUntil, newIndent)}
                ${fieldString('coupledServices', this.coupledServices.join(' '), newIndent)}
                ${fieldString('lctTSIRef', this.lctTSIRef.join(' '), newIndent)}`;
  }
}
