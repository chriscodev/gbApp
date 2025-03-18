/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */
import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {numberOnly} from 'src/app/shared/helpers/appWideFunctions';
import {
  ATSC3LLSSettings,
  DefaultATSC3LLSSettings,
  RRT_RATING_REGIONS,
  RRTRatingRegion
} from '../../../../../../../../core/models/dtv/network/physical/stream/ip/service-group/ServiceGroup';
import {cloneDeep} from 'lodash';
import {inRangeCheck} from '../../../../../../../helpers/mathHelprrs';
import {isDefined} from '../../../../../../../../core/models/dtv/utils/Utils';
import {SweetAlert} from 'sweetalert/typings/core';
import * as _swal from 'sweetalert';

const swal: SweetAlert = _swal as any;
declare var _: any;
declare var $;

@Component({
    selector: 'app-modal-transport-edit-lls-settings',
    templateUrl: './modal-transport-edit-lls-settings.component.html',
    styleUrls: ['./modal-transport-edit-lls-settings.component.scss']
})
export class ModalTransportEditLlsSettingsComponent implements OnChanges {
    @Input() llsSettings: ATSC3LLSSettings;
    @Output() llsSettingsChanged: EventEmitter<ATSC3LLSSettings> = new EventEmitter();
    public readonly numberOnly = numberOnly;
    public readonly RRT_RATING_REGIONS = RRT_RATING_REGIONS;
    public readonly rrtRatingRegions: RRTRatingRegion[] = Object.values(RRTRatingRegion);
    public localLLSSettings: ATSC3LLSSettings = new DefaultATSC3LLSSettings();
    public sltIntervalIconText: string;
    public sttIntervalIconText: string;
    public cdtIntervalIconText: string;
    public rrtIntervalIconText: string;
    public updateEnabled: boolean;
    private sltValid: boolean;
    private sttValid: boolean;
    private cdtValid: boolean;
    private rrtValid: boolean;

    constructor() {
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (isDefined(changes.llsSettings?.currentValue)) {
            this.localLLSSettings = cloneDeep(changes.llsSettings.currentValue);
            this.inputLLS();
        }
    }

    public inputLLS(): void {
        this.updateSLTIntervalValid();
        this.updateSTTIntervalValid();
        this.updateCDTIntervalValid();
        this.updateRRTIntervalValid();
        this.updateOkEnabled();
    }

    public closeModal() {
        $('#modalEditLLSSettings').modal('hide');
    }

    public setDefaultSettings() {
        swal({
            title: 'Are you sure you want to reset LLS settings to system defaults?',
            buttons: ['No', 'Yes'],
            icon: 'warning',
        }).then((isConfirm) => {
            if (isConfirm) {
                this.localLLSSettings = new DefaultATSC3LLSSettings();
                this.inputLLS();
            }
        });
    }

    public updateLLSSettings() {
        this.closeModal();
        this.llsSettingsChanged.emit(this.localLLSSettings);
    }

    private updateSLTIntervalValid(): void {
        this.sltValid = inRangeCheck(this.localLLSSettings.sltInterval, 100, 5000);
        this.sltIntervalIconText = this.sltValid ? 'text-success' : 'text-danger';
    }

    private updateSTTIntervalValid(): void {
        this.sttValid = inRangeCheck(this.localLLSSettings.sttInterval, 100, 5000);
        this.sttIntervalIconText = this.sttValid ? 'text-success' : 'text-danger';
    }

    private updateCDTIntervalValid(): void {
        this.cdtValid = inRangeCheck(this.localLLSSettings.cdtInterval, 100, 5000);
        this.cdtIntervalIconText = this.cdtValid ? 'text-success' : 'text-danger';
    }

    private updateRRTIntervalValid(): void {
        this.rrtValid = !this.localLLSSettings.rrtEnabled || inRangeCheck(this.localLLSSettings.rrtInterval, 1000,
            300000);
        this.rrtIntervalIconText = this.rrtValid ? 'text-success' : 'text-danger';
    }

    private updateOkEnabled(): void {
        this.updateEnabled = this.sltValid && this.sttValid && this.cdtValid && this.rrtValid;
    }
}
