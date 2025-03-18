/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {appendChildString} from '../../../../utils/TreeUtils';
import {isDefined, isUndefined} from '../../../../utils/Utils';
import {AEAMedia, AEAMediaJSON} from './AEAMedia';
import {MediaInfo, MediaInfoJSON} from './MediaInfo';

/**
 * XSD
 * ~~~~
 *  <xs:complexType name="ContentInfoType">
 *    <xs:choice>
 *      <xs:element name="MediaInfo" type="stsid:MediaInfoType"/>
 *      <xs:element name="AEAMedia" type="stsid:AEAMediaType"/>
 *      <xs:any namespace="##other" processContents="strict" minOccurs="0" maxOccurs="unbounded"/>
 *    </xs:choice>
 *    <xs:anyAttribute namespace="##other" processContents="strict"/>
 *  </xs:complexType>
 * ~~~~
 */
export class ContentInfo extends TreeElement {
  public mediaInfo: MediaInfo;
  public aeaMedia: AEAMedia;

  // TODO other attributes/elements

  /**
   * Returns `true` if this tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return isUndefined(this.mediaInfo) && isUndefined(this.aeaMedia);
  }

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return 'Content Info';
  }

  /**
   * Returns `true` if the object is deep equal to this.
   *
   * @param {ContentInfo} a - object to compare to
   * @returns {boolean} true if a === b
   */
  public isEqual(a: TreeElement): boolean {
    return isDefined(a) &&
      a instanceof ContentInfo &&
      MediaInfo.isEqual(this.mediaInfo, a.mediaInfo) &&
      AEAMedia.isEqual(this.aeaMedia, a.aeaMedia);
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
    result = appendChildString(result, 'mediaInfo', this.mediaInfo, newIndent);
    result = appendChildString(result, 'aeaMedia', this.aeaMedia, newIndent);

    return result;
  }
}

export interface ContentInfoJSON {
  mediaInfo?: MediaInfoJSON;
  aeaMedia?: AEAMediaJSON;
}

