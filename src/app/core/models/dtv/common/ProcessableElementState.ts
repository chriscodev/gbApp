// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

export enum ProcessableElementState {
  UPDATE_PENDING = 'UPDATE_PENDING',
  UPDATE_PROCESSING = 'UPDATE_PROCESSING',
  UPDATE_ERROR = 'UPDATE_ERROR',
  UPDATE_COMPLETE = 'UPDATE_COMPLETE'
}

export interface ProcessableElementStateWithDisplayName {
  readonly elementState: ProcessableElementState;
  readonly displayName: string;
}

export const PROCESSABLE_ELEMENT_STATES: ProcessableElementStateWithDisplayName[] = [
  {elementState: ProcessableElementState.UPDATE_PENDING, displayName: 'Pending'},
  {elementState: ProcessableElementState.UPDATE_PROCESSING, displayName: 'Processing'},
  {elementState: ProcessableElementState.UPDATE_ERROR, displayName: 'Error'},
  {elementState: ProcessableElementState.UPDATE_COMPLETE, displayName: 'Complete'}
];

export function getProcessDisplayName(state: ProcessableElementState): string | undefined {
  const foundState = PROCESSABLE_ELEMENT_STATES.find(
    (item) => item.elementState === state
  );
  return foundState?.displayName;
}
