/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AbstractOutput, HarrisSlotMuxOutput} from '../../../../../../core/models/dtv/output/Output';
import {AbstractTransport} from '../../../../../../core/models/dtv/network/physical/Transport';
import {isIPAddressValid} from '../../../../../helpers';
import {BootstrapFunction} from '../../../../../../core/interfaces/interfaces';

declare var $: BootstrapFunction;

@Component({
    selector: 'app-modal-outputs-harris',
    templateUrl: './modal-outputs-harris.component.html',
    styleUrl: './modal-outputs-harris.component.scss'
})
export class ModalOutputsHarrisComponent implements OnInit {
    @Input() output: AbstractOutput;
    @Output() okEnabledChanged: EventEmitter<boolean> = new EventEmitter();
    public slotMuxOutput: HarrisSlotMuxOutput;
    public selectedTransport: AbstractTransport;
    public ipAddressIconText: string;
    public muxIdIconText: string;
    public slots: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
    public showTestConnection: boolean;
    public okEnabled: boolean;
    private ipAddressValid: boolean;
    private muxIdValid: boolean;

    constructor() {
    }

    public ngOnInit(): void {
        this.slotMuxOutput = this.output as HarrisSlotMuxOutput;
        this.inputSettings();
    }

    public inputSettings(): void {
        this.updateIPAddressValid();
        this.updateMuxIdValid();
        this.updateOkEnabled();
    }

    public testConnection() {
        this.showTestConnection = true;
        $('#test-connection-modal').modal('show');
    }

    public closeModalEventHandler() {
        this.showTestConnection = false;
        $('#test-connection-modal').modal('hide');
    }

    private updateIPAddressValid(): void {
        this.ipAddressValid = isIPAddressValid(this.slotMuxOutput.outputAddress);
        this.ipAddressIconText = this.ipAddressValid ? 'text-success' : 'text-danger';
    }

    private updateMuxIdValid(): void {
        this.muxIdValid = this.slotMuxOutput.multiplexerId?.length > 0;
        this.muxIdIconText = this.muxIdValid ? 'text-success' : 'text-danger';
    }

    private updateOkEnabled(): void {
        const oldOkEnabled = this.okEnabled;
        this.okEnabled = this.ipAddressValid && this.muxIdValid;
        if (oldOkEnabled !== this.okEnabled) {
            this.okEnabledChanged.emit(this.okEnabled);
        }
    }
}
