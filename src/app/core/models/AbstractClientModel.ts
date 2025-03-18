/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {DefaultElementCompareHandler} from './DefaultElementCompareHandler';
import {ElementUtils} from './ElementUtils';
import {AbstractElement} from './AbstractElement';
import {AbstractCommitUpdate} from './CommitUpdate';
import {StompEventListener} from '../services/sock-stomp.service';

/**
 * All ClientModels are used as singletons which contain objects retrieved from the server REST calls. Typically,
 * subclasses are Injectable have the appropriate service class passed in via dependency injection.
 */
export abstract class AbstractClientModel {
  protected lastRequestId: string;
  private modelEventListeners: ClientModelEventListener[] = [];

  /**
   * Reacquire corresponding data from server using associated REST call.
   */
  public abstract refresh(): void;

  public addEventListener(modelEventListener: ClientModelEventListener): void {
    this.modelEventListeners.push(modelEventListener);
    console.log('AbstractClientModel addEventListener modelEventListener: ', modelEventListener,
      ', modelEventListeners: ', this.modelEventListeners);
  }

  public removeEventListener(modelEventListener: ClientModelEventListener): void {
    const index = this.modelEventListeners.indexOf(modelEventListener);
    if (index > -1) {
      this.modelEventListeners = [...this.modelEventListeners.slice(0, index), ...this.modelEventListeners.slice(
        index + 1)];
      this.modelEventListeners = this.modelEventListeners.slice(index, index);
    }
    console.log('AbstractClientModel removeEventListener modelEventListener: ', modelEventListener,
      ', modelEventListeners: ', this.modelEventListeners);
  }

  protected fireModelChangedEvent(): void {
    this.modelEventListeners.forEach(modelEventListener => {
      console.log('AbstractClientModel fireModelChangedEvent modelEventListener: ', modelEventListener,
        ', modelEventListeners: ', this.modelEventListeners);
      modelEventListener.notifyModelUpdated();
    });
  }
}

export abstract class AbstractMutableElementsClientModel extends AbstractClientModel implements StompEventListener {
  public abstract update(newElements: AbstractElement | AbstractElement[] | any): void;

  // Override as needed
  public notifyStompEvent(topic: string, messageJson: string) {
  }

  protected createElementsUpdate<T>(oldElements: T[], newElements: T[]): DefaultElementCompareHandler<T> {
    const elementCompareResults: DefaultElementCompareHandler<T> = new DefaultElementCompareHandler<T>();
    ElementUtils.compareElements(oldElements, newElements, elementCompareResults);
    return elementCompareResults;
  }
}

export abstract class AbstractDTVServiceClientModel extends AbstractMutableElementsClientModel {
  public abstract createElementCommitUpdate(elementCommitUpdate: AbstractElement[]): AbstractCommitUpdate<AbstractElement>;
}

export interface ClientModelEventListener {
  notifyModelUpdated: () => void;
}

