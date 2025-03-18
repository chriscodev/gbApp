/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {fieldString, formatTreeItem} from '../../../../utils/TreeUtils';
import {isDefined, isUndefined} from '../../../../utils/Utils';

export interface ServiceLanguageJSON {
  lang: string;
}

export class ServiceLanguageFactory {
  public static fromJSON(json: ServiceLanguageJSON): ServiceLanguage {
    if (isUndefined(json)) {
      return undefined;
    }

    const newServiceLanguage: ServiceLanguage = new ServiceLanguage();
    newServiceLanguage.lang = json.lang;

    return newServiceLanguage;
  }
}

/**
 * Available languages of the ATSC 3.0 service.
 *
 * XSD
 * ~~~~
 *  <xs:complexType name="ServiceLangType">
 *    <xs:simpleContent>
 *      <xs:extension base="xs:string">
 *        <xs:anyAttribute processContents="strict"/>
 *      </xs:extension>
 *    </xs:simpleContent>
 *  </xs:complexType>
 * ~~~~
 */
export class ServiceLanguage extends TreeElement {
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
   * HTML-formatted simple contents of this MPD tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this MPD tree node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('language', this.lang)}
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
      a instanceof ServiceLanguage &&
      this.lang === a.lang;
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
                ${fieldString('lang', this.lang, newIndent)}`;
  }
}
