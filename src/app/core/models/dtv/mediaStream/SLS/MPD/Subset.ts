// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../../../core/models/dtv/utils/TreeElement';
import {fieldString, formatTreeItem} from '../../../../../../core/models/dtv/utils/TreeUtils';
import {arrayEquals, isDefined} from '../../../../../../core/models/dtv/utils/Utils';

/**
 * A set of one or more [[AdaptationSet]]s. [[Period]] may contain one or more [[Subset]]s that
 * restrict combination of [[AdaptationSet]]s for presentation.
 *
 * Subsets provide a mechanism to restrict the combination of active Adaptation Sets where an active
 * Adaptation Set is one for which the DASH client is presenting at least one of the contained Representations.
 *
 * A Subset defines a set of one or more Adaptation Sets. The presence of a Subset element within a Period element
 * expresses the intention of the creator of the Media Presentation that a client should act as follows: At any time,
 * the set of active Adaptation Sets shall be a subset of the Adaptation Sets of one of the specified Subsets. Any
 * Adaptation Set not explicitly contained in any Subset element is implicitly contained in all specified Subsets.
 *
 * Subsets enable the restriction of combinations of AdaptationSets and expresses the intention of the creator of
 * the MPD, e.g., allow high definition content only with 5.1 audio channel format.
 *
 * XML
 * ~~~~
 *   <xs:complexType name="SubsetType">
 *      <xs:attribute name="contains" type="UIntVectorType" use="required"/>
 *      <xs:attribute name="id" type="xs:string"/>
 *      <xs:anyAttribute namespace="##other" processContents="lax"/>
 *   </xs:complexType>
 * ~~~~
 *
 * @see ISO/IEC 23009-1:2014 5.3.8 Subsets
 */
export class Subset extends TreeElement {
  /** list of the @id values of the contained [[AdaptationSet]]s. */
  public contains: number[] = [];

  /** unique identifier for the Subset. */
  public id: string;

  /**
   * Title of this node in the MPD tree.
   *
   * @returns {string} MPD tree node title
   */
  public nodeTitle(): string {
    return `Subset ${this.id ?? ''}`;
  }

  /**
   * HTML-formatted simple contents of this MPD tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this MPD tree node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('ID', this.id)}
                ${formatTreeItem('contains', this.contains.join(' '))}
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
      a instanceof Subset &&
      this.id === a.id &&
      arrayEquals(this.contains, a.contains);
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
                ${fieldString('id', this.id, newIndent)}
                ${fieldString('contains', this.contains.join(' '), newIndent)}`;
  }
}
