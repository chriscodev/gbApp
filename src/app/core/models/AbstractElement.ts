/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {isDefined} from './dtv/utils/Utils';
import {
    ModalDynamicTbTranslateComponent
} from '../../shared/components/modals/modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';

/**
 * Base class for any object that is stored in the Server database that has an {{id}} associated with it.
 * {{clientId}} is used for reference linking for REST calls that required it.
 */
export abstract class AbstractElement {
  protected constructor(public readonly id?: number, public readonly clientId?: string) {
    this.id = isDefined(id) ? id : UNINITIALIZED_ID;
    this.clientId = clientId;
  }
}

export abstract class NamedElement extends AbstractElement {
  protected constructor(public name: string, public readonly id?: number, public readonly clientId?: string) {
    super(id, clientId);
  }
}

// TODO DAC after refactoring, try to make this a member function
export function isElementIdMatch(firstElement: AbstractElement, otherElement: AbstractElement): boolean {
  return firstElement.id > 0 ? firstElement.id === otherElement?.id :
    (isDefined(firstElement.clientId) && firstElement.clientId === otherElement?.clientId);
}

export function isElementNameUnique(currentElement: NamedElement, elements: NamedElement[],
                                    editMode: boolean): boolean {
  let matchedElement: AbstractElement;
  if (currentElement?.name.length > 0) {
    if (editMode) {
      matchedElement = elements?.find(
        element => !isElementIdMatch(currentElement, element) && currentElement.name === element.name);
    } else {
      matchedElement = elements?.find(element => currentElement.name === element.name);
    }
  }
  return isDefined(matchedElement);
}

// TODO Discuss with Lovina on how keep this type safe and remove dynamicTable as input and instead an array rowID[] (number | string)?
export function deleteElementList(elements: AbstractElement[], dynamicTable: ModalDynamicTbTranslateComponent) {
  const len = dynamicTable.selectedRowIds.length;
  for (let i = 0; i < len; i++) {
    const selectID = dynamicTable.selectedRowIds[i];
    elements = elements.filter((element) => {
      const idMatch = element.id.toString() !== selectID.toString();
      const clientIdMatch = element.clientId !== selectID.toString();
      return idMatch && clientIdMatch;
    });
  }
  return elements;
}


export function updateElementList(elements: AbstractElement[], newElement: AbstractElement,
                                  editMode: boolean): AbstractElement[] {
  if (isDefined(newElement) && editMode) {
    elements = insertIntoElementList(elements, newElement);
  } else {
    if (isDefined(elements)) {
      elements = [...elements, newElement];
    } else {
      elements = [];
      elements.push(newElement);
    }
  }
  return elements;
}

export function insertIntoElementList(elements: AbstractElement[], newElement: AbstractElement): AbstractElement[] {
  const index = elements.findIndex(
    element => newElement?.id > 0 ?
      element.id === newElement.id : element.clientId === newElement.clientId);
  if (index !== -1) {
    elements = [...elements.slice(0, index), newElement, ...elements.slice(index + 1)];
  }
  return elements;
}

/**
 * Committed Server {{id}}s start from value 1. {{UNINITIALIZED_ID}} indicates the {{AbstractElement}} has
 * not yet been committed to the Server.
 */
export const UNINITIALIZED_ID = -1;

export type DisplayNameType = {
  displayName: string
};

export type IntegerValue = {
  value: number
};


export class ElementIds {
  public constructor(public ids: number[]) {
  }
}
