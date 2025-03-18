/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {ElementCompareListener} from './ElementCompareListener';
import {AbstractElement} from './AbstractElement';

export class DefaultElementCompareHandler<T extends AbstractElement> implements ElementCompareListener<AbstractElement> {
  public added: T[] = [];
  public updated: T[] = [];
  public deleted: T[] = [];
  public deletedIds: number[] = [];

  elementAdded(element: T) {
    this.added.push(element);
  }

  elementUpdated(newElement: T, oldElement: T) {
    this.updated.push(newElement);
  }

  elementDeleted(element: T) {
    this.deleted.push(element);
    this.deletedIds.push(element.id);
  }
}
