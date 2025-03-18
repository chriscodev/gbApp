/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {AbstractTransport} from './dtv/network/physical/Transport';
import {AbstractNetwork} from './dtv/network/logical/Network';
import {DataPackage} from './dtv/network/physical/stream/ip/data/DataPackage';
import {AbstractOutput} from './dtv/output/Output';
import {MediaStream} from './dtv/network/physical/stream/ip/media/MediaStream';

/**
 * Base class for REST POST calls that can operated on a collection of objects to add, update, and/or delete.
 */
export abstract class AbstractCommitUpdate<T> {
    protected constructor(public added: T[], public updated: T[], public deleted: number[]) {
    }
}

export class DTVServiceCommitUpdate {
    public constructor(
        public mediaStreamsUpdate: AbstractCommitUpdate<MediaStream>,
        public transportsUpdate: AbstractCommitUpdate<AbstractTransport>,
        public networksUpdate: AbstractCommitUpdate<AbstractNetwork>,
        public dataPackagesUpdate: AbstractCommitUpdate<DataPackage>,
        public outputsUpdate: AbstractCommitUpdate<AbstractOutput>) {
    }
}
