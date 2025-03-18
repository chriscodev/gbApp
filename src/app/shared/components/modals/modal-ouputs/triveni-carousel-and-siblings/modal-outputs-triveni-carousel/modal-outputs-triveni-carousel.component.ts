/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {isIPAddressValid} from 'src/app/shared/helpers';
import {AbstractOutput, isEricssonOutput, PortAddressableOutput} from '../../../../../../core/models/dtv/output/Output';
import {AbstractTransport} from '../../../../../../core/models/dtv/network/physical/Transport';
import {inRangeCheck} from '../../../../../helpers/mathHelprrs';

declare var $: (arg0: string) => {
    (): any;
    new(): any;
    show: {
        (arg0: {
            backdrop: string;
            keyboard: boolean;
        }): void;
        new(): any;
    };
    modal: {
        (arg0: string): void;
        new(): any;
    };
};

// TODO rename to something more generic
@Component({
    selector: 'app-modal-outputs-triveni-carousel',
    templateUrl: './modal-outputs-triveni-carousel.component.html',
    styleUrls: ['./modal-outputs-triveni-carousel.component.scss'],
})
export class ModalOutputsTriveniCarouselComponent implements OnInit {
    @Input() output: AbstractOutput;
    @Output() okEnabledChanged: EventEmitter<boolean> = new EventEmitter();
    public addressableOutput: PortAddressableOutput;
    public selectedTransport: AbstractTransport;
    public ipAddressIconText: string;
    public portRequired: boolean;
    public portIconText: string;
    public showTestConnection: boolean;
    public okEnabled: boolean;
    private ipAddressValid: boolean;
    private portValid: boolean;

    constructor() {
    }

    public ngOnInit(): void {
        this.addressableOutput = this.output as PortAddressableOutput;
        this.portRequired = !isEricssonOutput(this.output.outputType);
        this.inputSettings();
    }

    public inputSettings(): void {
        this.updateIPAddressValid();
        this.updatePortValid();
        this.updateOkEnabled();
    }

    public testConnection() {
        this.showTestConnection = true;
        setTimeout(() => {
            $('#test-connection-modal').show({
                backdrop: 'static',
                keyboard: false,
            });
        }, 100);
    }

    public closeModalEventHandler() {
        this.showTestConnection = false;
        $('#test-connection-modal').modal('hide');
    }

    private updateIPAddressValid(): void {
        this.ipAddressValid = isIPAddressValid(this.addressableOutput.outputAddress);
        this.ipAddressIconText = this.ipAddressValid ? 'text-success' : 'text-danger';
    }

    private updatePortValid(): void {
        this.portValid = !this.portRequired || inRangeCheck(this.addressableOutput.port, 1, 65535);
        this.portIconText = this.portValid ? 'text-success' : 'text-danger';
    }

    private updateOkEnabled(): void {
        const oldOkEnabled = this.okEnabled;
        this.okEnabled = this.ipAddressValid && this.portValid;
        if (oldOkEnabled !== this.okEnabled) {
            this.okEnabledChanged.emit(this.okEnabled);
        }
    }
}
