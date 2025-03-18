// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import * as _swal from 'sweetalert';
import {numberOnly} from '../../../../../../helpers/appWideFunctions';
import {AbstractPSIPTransport} from '../../../../../../../core/models/dtv/network/physical/Transport';
import {inRangeCheck} from '../../../../../../helpers/mathHelprrs';
import {ratingRegionType} from 'src/app/shared/helpers/transportTypes';
import {numberToHex} from '../../../../../../helpers/decimalToHexadecimal';
import {cloneDeep} from 'lodash';
import {SweetAlert} from 'sweetalert/typings/core';

const swal: SweetAlert = _swal as any;
declare var _: any;
declare var $;

@Component({
    selector: 'app-modal-edit-psip-table-settings',
    templateUrl: './modal-edit-psip-table-settings.component.html',
    styleUrls: ['./modal-edit-psip-table-settings.component.scss']
})
export class ModalEditPsipTableSettingsComponent implements OnInit {
    @Input() psipTransportStream: AbstractPSIPTransport;
    @Output() psipSettingsChanged: EventEmitter<AbstractPSIPTransport> = new EventEmitter();
    public localPsipTransportStream: AbstractPSIPTransport;
    public readonly ratingRegionType = ratingRegionType;
    public readonly numberToHex = numberToHex;
    public readonly numberOnly = numberOnly;
    public modalTitle = 'Edit PSIP Table Settings';
    public mgtIntervalIconText: string;
    public vctIntervalIconText: string;
    public sttIntervalIconText: string;
    public eitStartPidIconText: string;
    public eitCountIconText: string;
    public eitIntervalIconText: string;
    public eitKModifierIconText: string;
    public ettStartPidIconText: string;
    public channelEttPidIconText: string;
    public ettIntervalIconText: string;
    public ettKModifierIconText: string;
    public rrtIntervalIconText: string;
    public updateEnabled: boolean;
    private mgtValid: boolean;
    private vctValid: boolean;
    private sttValid: boolean;
    private eitStartPidValid: boolean;
    private eitCountValid: boolean;
    private eitIntervalValid: boolean;
    private eitKModifierValid: boolean;
    private ettStartPidValid: boolean;
    private channelEttPidValid: boolean;
    private ettIntervalValid: boolean;
    private ettKModifierValid: boolean;
    private rrtIntervalValid: boolean;

    constructor() {
        this.modalTitle = 'Edit PSIP Table Settings';
        this.ratingRegionType = ratingRegionType;
    }

    public ngOnInit(): void {
        this.modalTitle = this.psipTransportStream.name ? this.modalTitle + ' - ' + this.psipTransportStream.name : this.modalTitle;
        this.localPsipTransportStream = cloneDeep(this.psipTransportStream);
        this.inputPSIP();
        console.log('ModalEditPsipTableSettingsComponent, this.localPsipTransportStream: ',
            this.localPsipTransportStream);
    }

    public updatePSIPTableSettings(): void {
        this.closeModal();
        this.psipSettingsChanged.emit(this.localPsipTransportStream);
    }

    public closeModal() {
        $('#editPsipTableSettings').modal('hide');
    }

    public setDefaultSettings() {
        swal({
            title: 'Are you sure you want to reset PSIP settings to system defaults?',
            buttons: ['No', 'Yes'],
            icon: 'warning',
        }).then((isConfirm) => {
            if (isConfirm) {
                this.initializeDefaults();
            }
        });
    }

    public inputPSIP() {
        this.updateMGTIntervalValid();
        this.updateVCTIntervalValid();
        this.updateSTTIntervalValid();
        this.updateEITStartPIDValid();
        this.updateEITCountValid();
        this.updateEITIntervalValid();
        this.updateEITKModifierValid();
        this.updateETTStartPIDValid();
        this.updateETTIntervalValid();
        this.updateETTKModifierValid();
        this.updateRRTIntervalValid();
        this.updateChannelPIDValid();
        this.checkButtonDisabled();
    }

    private updateMGTIntervalValid(): void {
        this.mgtValid = inRangeCheck(this.localPsipTransportStream.mgtInterval, 1, 150);
        this.mgtIntervalIconText = this.mgtValid ? 'text-success' : 'text-danger';
    }

    private updateVCTIntervalValid(): void {
        this.vctValid = inRangeCheck(this.localPsipTransportStream.vctInterval, 1, 400);
        this.vctIntervalIconText = this.vctValid ? 'text-success' : 'text-danger';
    }

    private updateSTTIntervalValid(): void {
        this.sttValid = inRangeCheck(this.localPsipTransportStream.sttInterval, 1, 1000);
        this.sttIntervalIconText = this.sttValid ? 'text-success' : 'text-danger';
    }

    private updateEITStartPIDValid(): void {
        this.eitStartPidValid = inRangeCheck(this.localPsipTransportStream.eitStartPid, 1, 8191);
        this.eitStartPidIconText = this.eitStartPidValid ? 'text-success' : 'text-danger';
    }

    private updateEITCountValid(): void {
        this.eitCountValid = inRangeCheck(this.localPsipTransportStream.eitCount, 4, 128);
        this.eitCountIconText = this.eitCountValid ? 'text-success' : 'text-danger';
    }

    private updateEITIntervalValid(): void {
        this.eitIntervalValid = inRangeCheck(this.localPsipTransportStream.eitInterval, 1, 500);
        this.eitIntervalIconText = this.eitIntervalValid ? 'text-success' : 'text-danger';
    }

    private updateEITKModifierValid(): void {
        this.eitKModifierValid = inRangeCheck(this.localPsipTransportStream.eitKModifier, 1, 60000);
        this.eitKModifierIconText = this.eitKModifierValid ? 'text-success' : 'text-danger';
    }

    private updateETTStartPIDValid(): void {
        this.ettStartPidValid = inRangeCheck(this.localPsipTransportStream.ettStartPid, 1, 8191);
        this.ettStartPidIconText = this.ettStartPidValid ? 'text-success' : 'text-danger';
    }

    private updateETTIntervalValid(): void {
        this.ettIntervalValid = inRangeCheck(this.localPsipTransportStream.ettInterval, 1, 60000);
        this.ettIntervalIconText = this.ettIntervalValid ? 'text-success' : 'text-danger';
    }

    private updateETTKModifierValid(): void {
        this.ettKModifierValid = inRangeCheck(this.localPsipTransportStream.ettKModifier, 1, 60000);
        this.ettKModifierIconText = this.ettKModifierValid ? 'text-success' : 'text-danger';
    }

    private updateRRTIntervalValid(): void {
        this.rrtIntervalValid = inRangeCheck(this.localPsipTransportStream.rrtInterval, 1, 60000);
        this.rrtIntervalIconText = this.rrtIntervalValid ? 'text-success' : 'text-danger';
    }

    private updateChannelPIDValid(): void {
        this.channelEttPidValid = inRangeCheck(this.localPsipTransportStream.channelEttPid, 1, 8191);
        this.channelEttPidIconText = this.channelEttPidValid ? 'text-success' : 'text-danger';
    }

    private checkButtonDisabled() {
        this.updateEnabled = this.mgtValid && this.vctValid && this.sttValid && this.eitStartPidValid &&
            this.eitCountValid && this.eitIntervalValid && this.eitKModifierValid && this.ettStartPidValid &&
            this.channelEttPidValid && this.ettIntervalValid && this.ettKModifierValid && this.rrtIntervalValid;
    }

    private initializeDefaults() {
        this.localPsipTransportStream.sttInterval = 1000;
        this.localPsipTransportStream.mgtInterval = 150;
        this.localPsipTransportStream.vctInterval = 400;
        this.localPsipTransportStream.encodeHiddenServices = true;
        this.localPsipTransportStream.rrtEnabled = false;
        this.localPsipTransportStream.ratingRegion = 1;
        this.localPsipTransportStream.rrtInterval = 60000;
        this.localPsipTransportStream.eitStartPid = 7424;
        this.localPsipTransportStream.eitCount = 4;
        this.localPsipTransportStream.eitInterval = 500;
        this.localPsipTransportStream.eitKModifier = 1000;
        this.localPsipTransportStream.ettEnabled = true;
        this.localPsipTransportStream.ettStartPid = 7680;
        this.localPsipTransportStream.channelEttPid = 7808;
        this.localPsipTransportStream.ettInterval = 500;
        this.localPsipTransportStream.ettKModifier = 1000;
        this.localPsipTransportStream.ettEnabled = true;
        this.localPsipTransportStream.rrtEnabled = false;
        this.inputPSIP();
    }
}
