// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../../../core/models/dtv/utils/TreeElement';
import {fieldString, formatTreeItem} from '../../../../../../core/models/dtv/utils/TreeUtils';
import {isDefined} from '../../../../../../core/models/dtv/utils/Utils';
import {UTCTimingScheme} from './UTCTimingScheme';

/**
 * TODO
 *
 * Java: com.triveni.gb.server.standards.atsc3.route.mpd.model.UTCTiming
 *
 * @see http://dashif.org/wp-content/uploads/2017/09/DASH-IF-IOP-v4.1-clean.pdf 4.7.2. Service Provider Requirements and Guidelines
 */
export class UTCTiming extends TreeElement {
  public schemeIDURI: UTCTimingScheme = UTCTimingScheme.UNKNOWN;
  public value: string;

  /**
   * Title of this node in the MPD tree.
   *
   * @returns {string} MPD tree node title
   */
  public nodeTitle(): string {
    return 'UTCTiming';
  }

  /**
   * HTML-formatted simple contents of this MPD tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this MPD tree node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('scheme ID URI', this.schemeIDURI)}
                ${formatTreeItem('value', this.value)}
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
      a instanceof UTCTiming &&
      this.schemeIDURI === a.schemeIDURI &&
      this.value === a.value;
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
                ${fieldString('schemeIDURI', this.schemeIDURI, newIndent)}
                ${fieldString('value', this.value, newIndent)}`;
  }
}
