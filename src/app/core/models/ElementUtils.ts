/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {isDefined} from './dtv/utils/Utils';
import {ElementCompareListener} from './ElementCompareListener';
import {isEqual} from 'lodash';
import {AbstractElement} from './AbstractElement';
export class ElementUtils {
  static compareElements(oldElements: AbstractElement[], newElements: AbstractElement[], listener: ElementCompareListener<AbstractElement>) {
    const oldElementMap: Map<number, AbstractElement> = this.createElementMap(oldElements);
    const newElementMap: Map<number, AbstractElement> = this.createElementMap(newElements);

    if (isDefined(oldElements)) {
      oldElements.forEach(oldElement => {
        const newElement: AbstractElement = newElementMap.get(oldElement.id);
        if (isDefined(newElement)) {
          if (!isEqual(newElement, oldElement)) {
            listener.elementUpdated(newElement, oldElement);
          }
        }
        else {
          listener.elementDeleted(oldElement);
        }
      });
    }

    if (isDefined(newElements)) {

      newElements.forEach(newElement => {
        if (!isDefined(newElement.id)) {
          listener.elementAdded(newElement);
        }
        else {
          const oldElement: AbstractElement = oldElementMap.get(newElement.id);
          if (!isDefined(oldElement)) {
            listener.elementAdded(newElement);
          }
        }
      });
    }

  }
  static createElementMap(elements: AbstractElement[]): Map<number, AbstractElement> {
    const elementMap: Map<number, AbstractElement> = new Map<number, AbstractElement>();
    if (isDefined(elements)) {
      elements.forEach(element => {
        elementMap.set(element.id, element);
      });
    }
    return elementMap;
  }
}
