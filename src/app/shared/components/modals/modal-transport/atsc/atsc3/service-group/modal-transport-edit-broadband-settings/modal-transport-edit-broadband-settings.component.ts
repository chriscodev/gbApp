/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */
import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {numberOnly} from 'src/app/shared/helpers/appWideFunctions';
import {
    ATSC3BroadbandSettings,
    DefaultATSSC3BroadbandSettings
} from '../../../../../../../../core/models/dtv/network/physical/stream/ip/service-group/ServiceGroup';
import {cloneDeep} from 'lodash';
import {isDefined} from '../../../../../../../../core/models/dtv/utils/Utils';

declare var $;

@Component({
    selector: 'app-modal-transport-edit-broadband-settings',
    templateUrl: './modal-transport-edit-broadband-settings.component.html',
    styleUrls: ['./modal-transport-edit-broadband-settings.component.scss']
})
export class ModalTransportEditBroadbandSettingsComponent implements OnChanges {
    @Input() broadbandSettings: ATSC3BroadbandSettings;
    @Output() broadbandSettingsChanged: EventEmitter<ATSC3BroadbandSettings> = new EventEmitter();
    public localBroadbandSettings: ATSC3BroadbandSettings = new DefaultATSSC3BroadbandSettings();
    public readonly numberOnly = numberOnly;
    public primaryURLIconText: string;
    public backupURLIconText: string;
    public updateEnabled: boolean;
    private primaryURLValid: boolean;
    private backupURLValid: boolean;

    constructor() {
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (isDefined(changes?.broadbandSettings.currentValue)) {
            this.localBroadbandSettings = cloneDeep(changes.broadbandSettings.currentValue);
            this.inputBroadbandSettings();
        }
    }

    public inputBroadbandSettings(): void {
        this.updatePrimaryURLValid();
        this.updateBackupURLValid();
        this.updateOkEnabled();
    }

    public closeModal() {
        $('#modalEditBroadbandSettings').modal('hide');
    }

    public updateBroadbandSettings(): void {
        this.closeModal();
        this.broadbandSettingsChanged.emit(this.localBroadbandSettings);
    }

    private updatePrimaryURLValid(): void {
        this.primaryURLValid = !this.localBroadbandSettings.publishingEnabled ||
            this.localBroadbandSettings.primaryPublishUrl?.length > 0;
        this.primaryURLIconText = this.primaryURLValid ? 'text-success' : 'text-danger';
    }

    private updateBackupURLValid(): void {
        this.backupURLValid = !this.localBroadbandSettings.backupPublishingEnabled ||
            this.localBroadbandSettings.backupPublishUrl?.length > 0;
        this.backupURLIconText = this.backupURLValid ? 'text-success' : 'text-danger';
    }

    private updateOkEnabled(): void {
        const componentsEnabled = this.localBroadbandSettings.slsEnabled || this.localBroadbandSettings.esgEnabled;
        const urlsValid = this.primaryURLValid && this.backupURLValid;
        this.updateEnabled = componentsEnabled ? (this.localBroadbandSettings.publishingEnabled && urlsValid) : urlsValid;
    }
}
