/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {AbstractElement} from './AbstractElement';

export interface ElementCompareListener<T extends AbstractElement> {
  elementAdded(element: T);
  elementUpdated(newElement: T, oldElement: T);
  elementDeleted(element: T);
}
