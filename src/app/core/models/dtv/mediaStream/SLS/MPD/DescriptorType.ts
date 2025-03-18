// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

/* tslint:disable:no-redundant-jsdoc */
import {TreeElement} from '../../../../../../core/models/dtv/utils/TreeElement';
import {fieldString, formatTreeItem} from '../../../../../../core/models/dtv/utils/TreeUtils';
import {isDefined} from '../../../../../../core/models/dtv/utils/Utils';

/**
 * Base class for descriptor-style types. SUper class for [[Accessibility]], [[AssetIdentifier]], [[AudioChannelConfiguration]],
 * [[ContentProtection]], [[EssentialProperty]], [[FramePacking]], [[InbandEventStream]], [[Rating]], [[Reporting]], [[Role]],
 * [[SupplementalProperty]], and [[Viewpoint]].
 *
 * This class is never created on its own.
 *
 * XML
 * ~~~~
 * <xs:complexType name="DescriptorType">
 *    <xs:sequence>
 *       <xs:any namespace="##other" processContents="lax" minOccurs="0" maxOccurs="unbounded"/>
 *    </xs:sequence>
 *    <xs:attribute name="schemeIDURI" type="xs:anyURI" use="required"/>
 *    <xs:attribute name="value" type="xs:string"/>
 *    <xs:attribute name="id" type="xs:string"/>
 *    <xs:anyAttribute namespace="##other" processContents="lax"/>
 * </xs:complexType>
 * ~~~~
 */
export class DescriptorType extends TreeElement {
  /** Name of the subclass XML element. */
  public elementName: string;
  public schemeIDURI: string;
  public value: string;
  public id: string;

  /**
   * Human-readable title for this node.
   *
   * @returns {string} title
   */
  public nodeTitle(): string {
    return `${this.elementName} ${this.id ?? ''}`;
  }

  /**
   * Human-readable content of this node.
   *
   */
  public treeNodeText(): string {
    return `<ul class="nodeInfo">
                ${formatTreeItem('scheme ID URI', this.schemeIDURI)}
                ${formatTreeItem('value', this.value)}
                ${formatTreeItem('ID', this.id)}
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
      a instanceof DescriptorType &&
      this.elementName === a.elementName &&
      this.schemeIDURI === a.schemeIDURI &&
      this.value === a.value &&
      this.id === a.id;
  }

  /**
   * Return a human-readable string useful for debugging.
   *
   * @param {string} indent
   * @returns {string}
   */
  public toString(indent: string): string {
    const newIndent = `${indent}  `;
    return `${indent}${this.elementName}:
               ${fieldString('schemeIDURI', this.schemeIDURI, newIndent)}
               ${fieldString('value', this.value, newIndent)}
               ${fieldString('id', this.id, newIndent)}`;
  }
}
