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
import {isDefined, isUndefined} from '../../../../utils/Utils';
import {AppServiceFactory, AppServiceJSON} from './AppService';
import {DeliveryMethod, DeliveryMethodJSON} from './DeliveryMethod';
import {ServiceLanguage, ServiceLanguageFactory, ServiceLanguageJSON} from './ServiceLanguage';
import {ServiceName, ServiceNameFactory, ServiceNameJSON} from './ServiceName';

/**
 * {
 *  "serviceId": 65,
 *  "globalServiceID": "3veni://atsc30/us/1234/65",
 *  "sTSIDUri": "stsid65.xml",
 *  "serviceStatus": true,
 *  "deliveryMethods":
 *  [
 *     {
 *        "broadcastAppService":
 *           "basePattern": [
 *              video/,
 *              audio/
 *           ]
 *     }
 *   ]
 * }
 */
export interface UserServiceDescriptionJSON {
  serviceId: number;
  globalServiceID?: string;
  sTSIDUri?: string;
  serviceStatus?: boolean;

  names?: ServiceNameJSON[];
  serviceLanguage?: ServiceLanguageJSON[];
  deliveryMethod?: DeliveryMethodJSON[];
}

export class UserServiceDescriptionFactory {
  public static fromJSON(json: UserServiceDescriptionJSON): UserServiceDescription {
    if (isUndefined(json)) {
      return undefined;
    }

    const newUSBD: UserServiceDescription = new UserServiceDescription();

    newUSBD.serviceId = json.serviceId;
    newUSBD.globalServiceID = json.globalServiceID;
    newUSBD.sTSIDUri = json.sTSIDUri;
    newUSBD.serviceStatus = json.serviceStatus;

    newUSBD.serviceNames = json.names?.map((r: ServiceNameJSON) => ServiceNameFactory.fromJSON(r)) ?? [];
    newUSBD.serviceLanguages = json.serviceLanguage?.map(
      (r: ServiceLanguageJSON) => ServiceLanguageFactory.fromJSON(r)) ?? [];
    newUSBD.deliveryMethods = json.deliveryMethod?.map((r: DeliveryMethodJSON) => fromDeliveryMethodJSON(r)) ?? [];

    return newUSBD;
  }
}

/**
 * A single instance of an ATSC 3.0 Service.
 *
 * XSD
 * ~~~~
 *  <xs:complexType name="UserServiceDescriptionType">
 *    <xs:sequence>
 *      <xs:element name="Name" type="routeusd:NameType" minOccurs="0" maxOccurs="unbounded"/>
 *      <xs:element name="ServiceLanguage" type="routeusd:ServiceLangType" minOccurs="0" maxOccurs="unbounded"/>
 *      <xs:element name="DeliveryMethod" type="routeusd:DeliveryMethodType" minOccurs="0" maxOccurs="unbounded"/>
 *      <xs:any namespace="##other" processContents="strict" minOccurs="0" maxOccurs="unbounded"/>
 *    </xs:sequence>
 *    <xs:attribute name="serviceId" type="xs:unsignedShort" use="required"/>
 *    <xs:attribute name="serviceStatus" type="xs:boolean" default="true"/>
 *    <xs:anyAttribute processContents="strict"/>
 *  </xs:complexType>
 * ~~~~
 *
 * @see A/331 7.1.3 User Service Description
 */
export class UserServiceDescription extends TreeElement {
  /**
   * Reference to corresponding service entry in the SLT.
   *
   * XML: unsigned short, required
   */
  public serviceId: number;

  /**
   * XML: not in the standard
   */
  public globalServiceID: string;

  /**
   * XML: not in the standard
   */
  public sTSIDUri: string;

  /**
   * Specify the status of this service as active or inactive.
   *
   * XML: boolean, 0-1, default: true
   */
  public serviceStatus: boolean;

  /**
   * Name of the ATSC 3.0 service.
   */
  public serviceNames: ServiceName[];

  /**
   * Available languages of the ATSC 3.0 service.
   */
  public serviceLanguages: ServiceLanguage[];

  /**
   * Transport-related information pertaining to the contents of the service over
   * broadcast and/or broadband modes of access.
   */
  public deliveryMethods: DeliveryMethod[];

  /**
   * Returns `true` if this tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return isArrayEmpty(this.serviceNames) &&
      isArrayEmpty(this.serviceLanguages) &&
      isArrayEmpty(this.deliveryMethods);
  }

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return 'User Service Description (USD)';
  }

  /**
   * HTML-formatted simple contents of this MPD tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this MPD tree node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('service ID', formatInt(this.serviceId))}
                ${formatTreeItem('global service ID', this.globalServiceID)}
                ${formatTreeItem('S-TSID URI', this.sTSIDUri)}
                ${formatTreeItem('service status', formatBoolean(this.serviceStatus))}
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
      a instanceof UserServiceDescription &&
      this.serviceId === a.serviceId &&
      this.globalServiceID === a.globalServiceID &&
      this.serviceStatus === a.serviceStatus &&
      this.sTSIDUri === a.sTSIDUri &&
      ServiceName.isEqualArray(this.serviceNames, a.serviceNames) &&
      ServiceLanguage.isEqualArray(this.serviceLanguages, a.serviceLanguages) &&
      DeliveryMethod.isEqualArray(this.deliveryMethods, a.deliveryMethods);
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
                ${fieldString('serviceId', this.serviceId, newIndent)}
                ${fieldString('globalServiceID', this.globalServiceID, newIndent)}
                ${fieldString('sTSIDUri', this.sTSIDUri, newIndent)}
                ${fieldString('serviceStatus', this.serviceStatus, newIndent)}
                ${childrenString('serviceNames', this.serviceNames, newIndent)}
                ${childrenString('serviceNames', this.serviceLanguages, newIndent)}
                ${childrenString('serviceNames', this.deliveryMethods, newIndent)}`;
  }
}

function fromDeliveryMethodJSON(json: DeliveryMethodJSON): DeliveryMethod {
  if (isUndefined(json)) {
    return undefined;
  }

  const newDeliveryMethod: DeliveryMethod = new DeliveryMethod();
  newDeliveryMethod.broadcastAppServices = json.broadcastAppServices?.map(
    (p: AppServiceJSON) => AppServiceFactory.fromJSON(p)) ?? [];
  newDeliveryMethod.unicastAppServices = json.unicastAppServices?.map(
    (p: AppServiceJSON) => AppServiceFactory.fromJSON(p)) ?? [];

  return newDeliveryMethod;
}

