/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {AbstractElement} from '../../../../../../../AbstractElement';
import {IngestAttributes} from './Ingest';
import {TransmitAttributes} from './Transmit';
import {AppAttributes} from './App';
import {SigningAttributes} from './Singing';

export class DataElement extends AbstractElement {
  public constructor(public name: string, public ingestAttributes: IngestAttributes,
                     public transmitAttributes: TransmitAttributes, public appAttributes: AppAttributes,
                     public signingAttributes: SigningAttributes, public id?: number,
                     public clientId?: string) {
    super(id, clientId);
  }
}
