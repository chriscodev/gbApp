/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {fieldString, formatTreeItem} from '../../../../utils/TreeUtils';
import {isDefined, isUndefined} from '../../../../utils/Utils';

export interface AEAMediaJSON {
  aeaID?: string[];
}

/**
 * XSD
 * ~~~~
 *  <xs:complexType name="AEAMediaType">
 *    <xs:sequence>
 *      <xs:element name="AEAId" type="xs:string" minOccurs="0" maxOccurs="unbounded"/>
 *      <xs:any namespace="##other" processContents="strict" minOccurs="0" maxOccurs="unbounded"/>
 *    </xs:sequence>
 *    <xs:anyAttribute namespace="##other" processContents="strict"/>
 *  </xs:complexType>
 * ~~~~
 */
export class AEAMediaFactory {
  private static readonly KEYS: string[] = ['aeaID'];

  /**
   * Creates a [[AEAMedia]] from JSON.
   *
   * @param {AEAMediaJSON} json
   * @returns {AEAMedia}
   */
  public static fromJSON(json: AEAMediaJSON): AEAMedia {
    if (isUndefined(json)) {
      return undefined;
    }

    const newAEAMedia: AEAMedia = new AEAMedia();
    newAEAMedia.aeaID = json.aeaID;
    newAEAMedia.parseOtherChildren(json, this.KEYS);

    return newAEAMedia;
  }
}

/**
 * XSD
 * ~~~~
 *  <xs:complexType name="AEAMediaType">
 *    <xs:sequence>
 *      <xs:element name="AEAId" type="xs:string" minOccurs="0" maxOccurs="unbounded"/>
 *      <xs:any namespace="##other" processContents="strict" minOccurs="0" maxOccurs="unbounded"/>
 *    </xs:sequence>
 *    <xs:anyAttribute namespace="##other" processContents="strict"/>
 *  </xs:complexType>
 * ~~~~
 */
export class AEAMedia extends TreeElement {
  public aeaID: string[];

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return 'AEA Media';
  }

  /**
   * HTML-formatted simple contents of this tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this MPD tree node.
   */
  public treeNodeText(): string {
    const ids: string = this.aeaID.join(', ');
    return `<ul class="nodeInfo">
                ${formatTreeItem('AEA ID', ids)}
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
      a instanceof AEAMedia &&
      this.aeaID.join(',') === a.aeaID.join(',');
  }

  /**
   * Return a human-readable string useful for debugging.
   *
   * @param {string} indent
   * @returns {string}
   */
  public toString(indent: string): string {
    return `${indent}${this.nodeTitle()}:
                ${fieldString('AEA ID', this.aeaID.join(', '), `${indent}  `)}`;
  }
}
