/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {Component, EventEmitter, Input, Output} from '@angular/core';
import {BootstrapFunction} from '../../../../../../core/interfaces/interfaces';
import {AbstractOutput, ICDVersion, ICDVERSION_TYPES, MNAOutput} from '../../../../../../core/models/dtv/output/Output';
import {AbstractTransport} from '../../../../../../core/models/dtv/network/physical/Transport';
import {isIPAddressValid} from '../../../../../helpers';
import {NICDescriptor} from '../../../../../../core/models/server/NetworkSetting';
import {ClientNetworkSettingsModel} from '../../../../../../core/models/ClientNetworkSettingsModel';

declare var $: BootstrapFunction;

@Component({
    selector: 'app-modal-outputs-mna',
    templateUrl: './modal-outputs-mna.component.html',
    styleUrl: './modal-outputs-mna.component.scss'
})
export class ModalOutputsMnaComponent {
    @Input() output: AbstractOutput;
    @Output() okEnabledChanged: EventEmitter<boolean> = new EventEmitter();
    public readonly ICDVERSION_TYPES = ICDVERSION_TYPES;
    public readonly icdVersions: ICDVersion[] = Object.values(ICDVersion);
    public mnaOutput: MNAOutput;
    public selectedTransport: AbstractTransport;
    public nics: NICDescriptor[] = [];
    public ipAddressIconText: string;
    public showTestConnection: boolean;
    public okEnabled: boolean;
    private ipAddressValid: boolean;

    constructor(private clientNetworkSettingsModel: ClientNetworkSettingsModel) {
        this.nics = this.clientNetworkSettingsModel.getNetworkList();
    }

    public ngOnInit(): void {
        this.mnaOutput = this.output as MNAOutput;
        this.inputSettings();
    }

    public inputSettings(): void {
        this.updateIPAddressValid();
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
        this.ipAddressValid = isIPAddressValid(this.mnaOutput.outputAddress);
        this.ipAddressIconText = this.ipAddressValid ? 'text-success' : 'text-danger';
    }

    private updateOkEnabled(): void {
        const oldOkEnabled = this.okEnabled;
        this.okEnabled = this.ipAddressValid;
        if (oldOkEnabled !== this.okEnabled) {
            this.okEnabledChanged.emit(this.okEnabled);
        }
    }
}
