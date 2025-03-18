// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

/* tslint:disable:no-redundant-jsdoc */
// import {BaseURL} from '../mediaStream/SLS/MPD/BaseURL';
import {checkUndefinedCompatible, isDefined} from './Utils';
import {BaseURL} from '../mediaStream/SLS/MPD/BaseURL';

/**
 * Base methods on tree elements.
 */
export abstract class TreeElement {
  /** Container MPD tree element. */
  public parent: TreeElement;

  /** Arbitrary children elements for this node, not explicitly parsed. Includes both XML attributes and elements. */
  public children: any[] = [];

  /**
   * Returns `true` if the elements are exactly equal. True if both undefined.
   *
   * @param {TreeElement} a - first tree element
   * @param {TreeElement} b - second tree element
   * @returns {boolean} true if a === b
   */
  public static isEqual<T extends TreeElement>(a: T, b: T): boolean {
    return checkUndefinedCompatible(a, b) || a.isEqual(b);
  }

  /**
   * Returns `true` if the two arrays have all elements in common, in exactly the same order.
   *
   * @param {ServiceName[]} a - first array
   * @param {ServiceName[]} b - second array
   * @returns {boolean} - true if the arrays are deep equal
   */
  public static isEqualArray<T extends TreeElement>(a: T[], b: T[]): boolean {
    return checkUndefinedCompatible(a, b) &&
      isDefined(a) &&
      a.length === b.length &&
      a.reduce((acc, c, i) => acc && a[i].isEqual(b[i]), true);
  }

  public parseOtherChildren(json: any, definedItems: readonly string[]): void {
    // TODO keys() not defined sometimes
    // json.keys().filter( k => !definedItems.includes( k ) ).foreach( k => { this.children[ k ] = json[ k ] } )
  }

  /**
   * Sets this [[TreeElement]] as the parent to all the [[TreeElement]] children.
   */
  public adopt(): void {
    for (const value of Object.values(this)) {
      if (value instanceof TreeElement) {
        value.parent = this;
      } else if (Array.isArray(value) && value.length > 0 && value[0] instanceof TreeElement) {
        for (const c of value as TreeElement[]) {
          c.parent = this;
        }
      }
    }
  }

  // TODO isLeaf(), nodeText(), and toString() need to be children-aware

  /**
   * Walks up the parent chain looking for the first [[BaseURL]] array that has any defined.
   *
   * TODO move this to an MPD-specific tree class
   *
   * @returns {BaseURL[]}
   */
  public findNearestBaseURLs(): BaseURL[] {
    let nodeParent: TreeElement = this.parent;
    while (isDefined(nodeParent)) {
      const urls: BaseURL[] = (nodeParent as any).baseURLs as BaseURL[];
      if (urls && urls.length > 0) {
        return urls;
      }
      nodeParent = nodeParent.parent;
    }

    return [];
  }

  public findNearestResolvedBaseURLStrings(): string[] {
    return this.findNearestBaseURLs().reduce((acc: string[], b: BaseURL) => {
      acc.push(...b.resolvedURLs());
      return acc;
    }, []);
  }

  /**
   * Returns `true` if this tree node has no children.
   *
   * @returns {boolean} `true` if tree leaf
   */
  public isLeaf(): boolean {
    return true;
  }

  /**
   * Title of this node in the tree.
   *
   * @returns {string} tree node title
   */
  public abstract nodeTitle(): string;

  /**
   * HTML-formatted simple contents of this tree node. Children will be displayed elsewhere.
   *
   * TODO rename this as it conflicts with various HTML functions
   *
   * @returns {string} HTML-formatted simple parts of this tree node.
   */
  public treeNodeText(): string {
    return '';
  }

  /**
   * Return a human-readable string useful for debugging.
   *
   * @param {string} indent
   * @returns {string}
   */
  public abstract toString(indent: string): string;

  /**
   * Returns `true` if the object is deep equal to this.
   *
   * @param {TreeElement} t - object to compare to
   * @returns {boolean} true if a === b
   */
  public abstract isEqual(t: TreeElement): boolean;
}
