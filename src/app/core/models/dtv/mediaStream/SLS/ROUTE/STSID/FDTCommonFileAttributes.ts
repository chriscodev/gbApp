/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../utils/TreeElement';
import {appendFieldString, formatInt, formatTreeItem} from '../../../../utils/TreeUtils';
import {isDefined} from '../../../../utils/Utils';

export class FDTCommonFileAttributes extends TreeElement {
  public static definedItems: readonly string[] = ['contentType', 'contentEncoding', 'fecEncodingID',
    'maximumSourceBlockLength', 'encodingSymbolLength', 'maxNumberOfEncodingSymbols',
    'schemeSpecificInfo'];
  /**
   * MIME type.
   *
   * XML: string, optional
   */
  public contentType: string;
  /**
   * Compression type.
   *
   * XML: string, optional
   */
  public contentEncoding: string;
  /**
   * the "FEC Encoding ID" Object Transmission Information element defined in [RFC5052], as carried
   * in the Codepoint field of the ALC/LCT header.
   *
   * XML: unsigned byte, optional
   *
   * @see RFC 5052
   */
  public fecEncodingID: number;
  /**
   * the "FEC Instance ID" Object Transmission Information element defined in [RFC5052] for
   * Under-Specified FEC Schemes.
   *
   * XML: unsigned long, optional
   *
   * @see RFC 5052
   */
  public fecInstanceID: number;
  /**
   * the "Maximum-Source-Block-Length" Object Transmission Information
   * element defined in [RFC5052], if required by the FEC Scheme.
   *
   * XML: unsigned long, optional
   *
   * @see RFC 5052
   */
  public maximumSourceBlockLength: number;
  /**
   * the "Encoding-Symbol-Length" Object Transmission Information element
   * defined in [RFC5052], if required by the FEC Scheme.
   *
   * XML: unsigned long, optional
   *
   * @see RFC 5052
   */
  public encodingSymbolLength: number;
  /**
   * the "Max-Number-of-Encoding-Symbols" Object Transmission Information
   * element defined in [RFC5052], if required by the FEC Scheme.
   *
   * XML: unsigned long, optional
   *
   * @see RFC 5052
   */
  public maxNumberOfEncodingSymbols: number;
  /**
   * the "encoded Scheme-specific FEC Object Transmission Information" as defined in
   * [RFC5052], if required by the FEC Scheme.
   *
   * XML: BASE64 string, optional
   *
   * @see RFC 5052
   */
  public schemeSpecificInfo: string;

  /**
   * Returns `true` if this tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return false;
  }

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public nodeTitle(): string {
    return '';
  }

  /**
   * HTML-formatted simple contents of this node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this node.
   */
  public treeNodeText(): string {
    return `  ${formatTreeItem('contentType', this.contentType)}
                ${formatTreeItem('contentEncoding', this.contentEncoding)}
                ${formatTreeItem('fecEncodingID', formatInt(this.fecEncodingID))}
                ${formatTreeItem('fecInstanceID', formatInt(this.fecInstanceID))}
                ${formatTreeItem('maximumSourceBlockLength', formatInt(this.maximumSourceBlockLength))}
                ${formatTreeItem('encodingSymbolLength', formatInt(this.encodingSymbolLength))}
                ${formatTreeItem('maxNumberOfEncodingSymbols', formatInt(this.maxNumberOfEncodingSymbols))}
                ${formatTreeItem('schemeSpecificInfo', this.schemeSpecificInfo)}`;
  }

  /**
   * Returns `true` if the object is deep equal to this.
   *
   * @param {FDTCommonFileAttributes} a - object to compare to
   * @returns {boolean} true if a === b
   */
  public isEqual(a: TreeElement): boolean {
    return isDefined(a) &&
      a instanceof FDTCommonFileAttributes &&
      this.contentType === a.contentType &&
      this.contentEncoding === a.contentEncoding &&
      this.fecEncodingID === a.fecEncodingID &&
      this.fecInstanceID === a.fecInstanceID &&
      this.maximumSourceBlockLength === a.maximumSourceBlockLength &&
      this.encodingSymbolLength === a.encodingSymbolLength &&
      this.maxNumberOfEncodingSymbols === a.maxNumberOfEncodingSymbols &&
      this.schemeSpecificInfo === a.schemeSpecificInfo;
  }

  /**
   * Return a human-readable string useful for debugging.
   *
   * @param {string} indent - indent size for children
   * @returns {string} - human-readable string representation of this object
   */
  public toString(indent: string): string {
    let result = '';
    result = appendFieldString(result, 'contentType', this.contentType, indent);
    result = appendFieldString(result, 'contentEncoding', this.contentEncoding, indent);
    result = appendFieldString(result, 'fecEncodingID', this.fecEncodingID, indent);
    result = appendFieldString(result, 'fecInstanceID', this.fecInstanceID, indent);
    result = appendFieldString(result, 'maximumSourceBlockLength', this.maximumSourceBlockLength, indent);
    result = appendFieldString(result, 'encodingSymbolLength', this.encodingSymbolLength, indent);
    result = appendFieldString(result, 'maxNumberOfEncodingSymbols', this.maxNumberOfEncodingSymbols, indent);
    result = appendFieldString(result, 'schemeSpecificInfo', this.schemeSpecificInfo, indent);

    return result;
  }
}
