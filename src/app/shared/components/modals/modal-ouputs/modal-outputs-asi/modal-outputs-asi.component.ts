/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AbstractOutput, ASIOutput} from '../../../../../core/models/dtv/output/Output';
import {AbstractTransport} from '../../../../../core/models/dtv/network/physical/Transport';
import {BootstrapFunction} from '../../../../../core/interfaces/interfaces';
import {inRangeCheck} from '../../../../helpers/mathHelprrs';

declare var $: BootstrapFunction;

@Component({
    selector: 'app-modal-outputs-asi',
    templateUrl: './modal-outputs-asi.component.html',
    styleUrl: './modal-outputs-asi.component.scss'
})
export class ModalOutputsAsiComponent implements OnInit {
    @Input() output: AbstractOutput;
    @Input() cardIds: number[] = [];
    @Output() okEnabledChanged: EventEmitter<boolean> = new EventEmitter();
    public asiOutput: ASIOutput;
    public selectedTransport: AbstractTransport;
    public bitrateIconText: string;
    private bitrateValid: boolean;
    public okEnabled: boolean;

    constructor() {
    }

    public ngOnInit(): void {
        this.asiOutput = this.output as ASIOutput;
        this.inputSettings();
    }

    public inputSettings(): void {
        this.updateMaxBitrateValid();
        this.updateOkEnabled();
    }

    private updateMaxBitrateValid(): void {
        this.bitrateValid = inRangeCheck(this.asiOutput.bitrate, 1, 20000000);
        this.bitrateIconText = this.bitrateValid ? 'text-success' : 'text-danger';
    }

    private updateOkEnabled(): void {
        const oldOkEnabled = this.okEnabled;
        this.okEnabled = this.bitrateValid;
        if (oldOkEnabled !== this.okEnabled) {
            this.okEnabledChanged.emit(this.okEnabled);
        }
    }
}
