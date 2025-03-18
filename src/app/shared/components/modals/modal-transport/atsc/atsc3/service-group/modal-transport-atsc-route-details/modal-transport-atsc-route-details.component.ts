/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {DefaultMediaStream, MediaStream} from 'src/app/core/models/dtv/network/physical/stream/ip/media/MediaStream';
import {isDefined} from '../../../../../../../../core/models/dtv/utils/Utils';
import {cloneDeep} from 'lodash';

declare var $;

@Component({
    selector: 'app-modal-transport-atsc-route-details',
    templateUrl: './modal-transport-atsc-route-details.component.html',
    styleUrls: ['./modal-transport-atsc-route-details.component.scss']
})
export class ModalTransportAtscRouteDetailsComponent implements OnChanges {
    @Input() mediaStream: MediaStream;
    public localMediaStream: MediaStream = new DefaultMediaStream();

    constructor() {
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (isDefined(changes.mediaStream?.currentValue)) {
            this.localMediaStream = cloneDeep(changes.mediaStream.currentValue);
        }
    }

    public closeModal() {
        $('#modalTransportRouteDetails').modal('hide');
    }
}
