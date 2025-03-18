/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {AbstractElement, UNINITIALIZED_ID} from '../../../../../AbstractElement';
import {ElementaryStream} from './ElementaryStream';
import {v4 as uuidv4} from 'uuid';

export class Program extends AbstractElement {
    public constructor(public programNumber: number,
                       public pmtPid: number,
                       public pcrPid: number,
                       public elementaryStreams: ElementaryStream[],
                       public id?: number,
                       public clientId?: string) {
        super(id, clientId);
    }
}

export class DefaultProgram extends Program {
    public constructor(public programNumber: number,
                       public pmtPid: number,
                       public pcrPid: number) {
        super(programNumber, pmtPid, pcrPid, [], UNINITIALIZED_ID, uuidv4());
    }
}
