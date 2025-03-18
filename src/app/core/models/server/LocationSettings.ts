/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */
import {AbstractElement, UNINITIALIZED_ID} from '../AbstractElement';
import {v4 as uuidv4} from 'uuid';

export class LocationSettings extends AbstractElement {
    constructor(public welcomeMessage: string, public locationName: string, public locationAddress: string,
                public locationCity: string,
                public locationState: string, public contactName: string, public contactPhone: string,
                public notes: string, public id?: number) {
        super(id, 'Loc-' + uuidv4());
    }
}

export class DefaultLocationSettings extends LocationSettings {
    public constructor() {
        super(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, UNINITIALIZED_ID);
    }
}
