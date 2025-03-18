// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

/* tslint:disable:no-redundant-jsdoc */

import {TreeElement} from '../../../../../../core/models/dtv/utils/TreeElement';
import {
  childrenString,
  fieldString,
  formatTreeItem,
  isArrayEmpty
} from '../../../../../../core/models/dtv/utils/TreeUtils';
import {arrayEquals, isDefined} from '../../../../../../core/models/dtv/utils/Utils';
import {MetricsRange} from './MetricsRange';
import {Reporting} from './Reporting';

/**
 * Information that the server wants collected. The mechanism for returning the metrics data is not defined in the MPD.
 *
 * XSL
 * ~~~~
 * <xs:complexType name="MetricsType">
 *    <xs:sequence>
 *       <xs:element name="Reporting" type="DescriptorType" maxOccurs="unbounded"/>
 *       <xs:element name="Range" type="RangeType" minOccurs="0" maxOccurs="unbounded"/>
 *       <xs:any namespace="##other" processContents="lax" minOccurs="0" maxOccurs="unbounded"/
 *    </xs:sequence>
 *    <xs:attribute name="metrics" type="xs:string" use="required"/>
 *    <xs:anyAttribute namespace="##other" processContents="lax"/>
 * </xs:complexType>
 * ~~~~
 *
 * @see "ISO IEC 23009-1 2014 Section 5.9 DASH metrics descriptor and Annex D DASH Metrics"
 */
export class Metrics extends TreeElement {
  /** DASH metric keys the client wants reported. TcpList|HttpList|RepSwitchList|BufferLevel|PlayList */
  public metrics: string;

  /** How to report the metrics. */
  public reportingList: Reporting[] = [];

  /** Time periods for metrics capture. If missing, capture for the whole period. */
  public rangeList: MetricsRange[] = [];

  /**
   * Returns `true` if this MPD tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return isArrayEmpty(this.reportingList) && isArrayEmpty(this.rangeList);
  }

  /**
   * Title of this node in the MPD tree.
   *
   * @returns {string} MPD tree node title
   */
  public nodeTitle(): string {
    return 'Metrics';
  }

  /**
   * HTML-formatted simple contents of this MPD tree node. Children will be displayed elsewhere.
   *
   * @returns {string} HTML-formatted simple parts of this MPD tree node.
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('metrics', this.metrics)}
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
      a instanceof Metrics &&
      this.metrics === a.metrics &&
      Reporting.isEqualArray(this.reportingList, a.reportingList) &&
      arrayEquals(this.rangeList, a.rangeList);
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
                ${fieldString('metrics', this.metrics, newIndent)}
                ${childrenString('reportingList', this.reportingList, newIndent)}
                ${childrenString('rangeList', this.rangeList as unknown as TreeElement[], newIndent)}`;
  }
}
