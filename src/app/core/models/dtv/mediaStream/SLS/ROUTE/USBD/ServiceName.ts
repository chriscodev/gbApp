/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {fieldString, formatTreeItem} from '../../../../utils/TreeUtils';
import {isDefined, isUndefined} from '../../../../utils/Utils';

export interface ServiceNameJSON {
  name: string;
  lang: string;
}

// TODO all fromJSON calls should be in a Factory like this
export class ServiceNameFactory {
  private static readonly KEYS: string[] = ['name', 'lang'];

  public static fromJSON(json: ServiceNameJSON): ServiceName {
    if (isUndefined(json)) {
      return undefined;
    }

    const newServiceName: ServiceName = new ServiceName();

    newServiceName.name = json.name;
    newServiceName.lang = json.lang;
    newServiceName.parseOtherChildren(json, ServiceNameFactory.KEYS);

    return newServiceName;
  }
}

/**
 * Name of the ATSC 3.0 service.
 *
 * XSD
 * ~~~~
 *  <xs:complexType name="NameType">
 *    <xs:simpleContent>
 *      <xs:extension base="xs:string">
 *        <xs:attribute ref="xml:lang" use="required"/>
 *        <xs:anyAttribute processContents="strict"/>
 *      </xs:extension>
 *    </xs:simpleContent>
 *  </xs:complexType>
 * ~~~~
 */
export class ServiceName extends TreeElement {
  /** Service name in lang. */
  public name: string;
  /** Language of the ATSC 3.0 service name. */
  public lang: string;

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return 'Service Name';
  }

  /**
   * HTML-formatted simple contents of this node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this node.
   */
  public treeNodeText(): string {
    // TODO unknown elements
    const unknownKeys: string = this.children.reduce((acc, c: string) =>
      `${acc}${formatTreeItem(c, JSON.stringify(this.children[c]))} (unparsed)\n`, '') as string;
    return `<ul class="nodeInfo">
                ${formatTreeItem('name', this.name)}
                ${formatTreeItem('language', this.lang)}
                ${unknownKeys}
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
      a instanceof ServiceName &&
      this.name === a.name &&
      this.lang === a.lang;
  }

  /**
   * Return a human-readable string useful for debugging.
   *
   * @param {string} indent - indent size for children
   * @returns {string} - human-readable string representation of this object
   */
  public toString(indent: string): string {
    // TODO unknown elements
    const newIndent = `${indent}  `;
    const unknownKeys: string = this.children.reduce((acc, c: string) =>
      `${acc}${fieldString(c, JSON.stringify(this.children[c]))} (unparsed)\n`, '') as string;
    return `${indent}${this.nodeTitle()}:
                ${fieldString('name', this.name, newIndent)}
                ${fieldString('lang', this.lang, newIndent)}
                ${unknownKeys}`;
  }
}
