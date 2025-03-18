/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {AbstractElement, UNINITIALIZED_ID} from '../../../../../AbstractElement';
import {v4 as uuidv4} from 'uuid';

export enum IPStreamType {
    ROUTE = 'ROUTE',
    MMTP = 'MMTP'
}

export class IPStream extends AbstractElement {
    public constructor(
        public type: IPStreamType,
        public name: string,
        public bitrate: number,
        public sourceNIC: string,
        public sourceIP: string,
        public sourcePort: number,
        public destinationIP: string,
        public destinationPort: number,
        public external: boolean,
        public serviceId?: number,
        public id?: number,
        public clientId?: string,
    ) {
        super(id, clientId);
    }
}

export class DefaultIPStream extends IPStream {
    public constructor() {
        super(IPStreamType.ROUTE, undefined, 0, undefined, undefined, undefined, undefined, 0, false, undefined,
            UNINITIALIZED_ID, uuidv4());
    }
}

export class ATSC3Stream extends IPStream {
    public constructor(public serviceId: number, public linkedStreamId: number, public type: IPStreamType,
                       public name: string, public bitrate: number, public sourceNIC: string,
                       public sourceIP: string, public sourcePort: number, public destinationIP: string,
                       public destinationPort: number, public external: boolean, public id?: number,
                       public clientId?: string) {
        super(type, name, bitrate, sourceNIC, sourceIP, sourcePort, destinationIP, destinationPort, external, serviceId,
            id, clientId);
    }
}

export class DefaultATSC3Stream extends ATSC3Stream {
    public constructor() {
        super(undefined, undefined, IPStreamType.ROUTE, undefined, undefined, undefined, undefined, undefined,
            undefined, undefined, undefined, UNINITIALIZED_ID, uuidv4());
    }
}

export class ESGStream extends ATSC3Stream {
    public constructor(public basePort: number, public baseTSI, public serviceId: number, public linkedStreamId: number,
                       public type: IPStreamType,
                       public name: string, public bitrate: number, public sourceNIC: string,
                       public sourceIP: string, public sourcePort: number, public destinationIP: string,
                       public destinationPort: number, public external: boolean,
                       public id?: number,
                       public clientId?: string) {
        super(serviceId, linkedStreamId, type, name, bitrate, sourceNIC, sourceIP, sourcePort, destinationIP,
            destinationPort, external, id, clientId);
    }
}
