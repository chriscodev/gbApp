// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.

import {AbstractElement, UNINITIALIZED_ID} from '../../AbstractElement';
import {DefaultLanguage, Language} from '../common/Language';
import {v4 as uuidv4} from 'uuid';

export enum CaptionType {
  CEA_608 = 'CEA_608', CEA_708 = 'CEA_708'
}

export type DisplayNameWithValueType = {
  displayName: string,
  captionValue: number
};

export const CAPTION_TYPES: Record<CaptionType, DisplayNameWithValueType> = {
  [CaptionType.CEA_608]: {displayName: 'CEA-608', captionValue: 0},
  [CaptionType.CEA_708]: {displayName: 'CEA-708', captionValue: 1}
};

export class CaptionDescription extends AbstractElement {
  public constructor(public serviceNumber: number, public language: Language, public digital: boolean,
                     public easyReader: boolean, public wide: boolean, public caption: string, public id?: number,
                     public clientId?: string) {
    super(id, clientId);
  }
}
export class DefaultCaption extends CaptionDescription {
  public constructor() {
    super(0, new DefaultLanguage(), false, false, false, 'CEA-608', UNINITIALIZED_ID, uuidv4());
  }

}
