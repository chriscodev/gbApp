/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {fieldString, formatTreeItem} from '../../../../utils/TreeUtils';
import {arrayEquals, checkUndefinedCompatible, isDefined, isUndefined} from '../../../../utils/Utils';

export interface AppServiceJSON {
  basePatterns: string[];
}

export class AppServiceFactory {
  public static fromJSON(json: AppServiceJSON): AppService {
    if (isUndefined(json)) {
      return undefined;
    }

    const newFileType: AppService = new AppService();
    newFileType.basePatterns = json.basePatterns;

    const allItems: string[] = ['basePatterns'];
    newFileType.parseOtherChildren(json, allItems);
    newFileType.adopt();

    return newFileType;
  }
}

/**
 * XSD
 * ~~~~
 *  <xs:complexType name="AppServiceType">
 *    <xs:sequence>
 *      <xs:element name="BasePattern" type="xs:string" maxOccurs="unbounded"/>
 *      <xs:any namespace="##other" processContents="strict" minOccurs="0" maxOccurs="unbounded"/>
 *    </xs:sequence>
 *    <xs:anyAttribute processContents="strict"/>
 *  </xs:complexType>
 * ~~~~
 */
export class AppService extends TreeElement {
  /**
   * A character pattern for use by the ATSC receiver to match against any portion of the Segment URL
   * used by the DASH Client to request DASH Media Segments of a parent DASH Representation.
   */
  public basePatterns: string[] = [];

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return 'App Service';
  }

  /**
   * HTML-formatted simple contents of this tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this tree node.
   */
  public treeNodeText(): string {
    const patterns: string = this.basePatterns.join(' ');
    // TODO vertical list, not horizontal
    return `<ul class="nodeInfo">
                ${formatTreeItem('base patterns', patterns)}
              </ul>`;
  }

  /**
   * Returns `true` if the object is deep equal to this.
   *
   * @param {ServiceName} a - object to compare to
   * @returns {boolean} true if a === b
   */
  public isEqual(a: TreeElement): boolean {
    return isDefined(a) &&
      a instanceof AppService &&
      checkUndefinedCompatible(this, a) &&
      arrayEquals(this.basePatterns, a.basePatterns);
  }

  /**
   * Return a human-readable string useful for debugging.
   *
   * @param {string} indent
   * @returns {string}
   */
  public toString(indent: string): string {
    return `${indent}${this.nodeTitle()}:
                ${fieldString('basePatterns', this.basePatterns.join(' '), `${indent}  `)}`;
  }
}
