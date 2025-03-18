// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.

import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import {isIPAddressValid, validateIP} from '../../../../../../../helpers';
import {inRangeCheck} from '../../../../../../../helpers/mathHelprrs';
import {cloneDeep} from 'lodash';
import {isDefined} from '../../../../../../../../core/models/dtv/utils/Utils';
import {
    ATSC3DSTPSettings,
    DefaultATSC3DSTPSettings,
    DSTP_TUNNEL_MODE_TYPES,
    DSTPTunnelMode,
    SRT_AUTO_RESPONSE_REQUEST_TYPES,
    SRT_FEC_LAYOUT_TYPES,
    SRT_KEY_LENGTH_TYPES,
    SRTAutoRepeatRequest,
    SRTFECLayout,
    SRTKeyLength
} from '../../../../../../../../core/models/dtv/network/physical/stream/ip/service-group/ServiceGroup';
import {numberOnly} from 'src/app/shared/helpers/appWideFunctions';
import {BootstrapFunction} from '../../../../../../../../core/interfaces/interfaces';
import {ClientNetworkSettingsModel} from '../../../../../../../../core/models/ClientNetworkSettingsModel';
import {NICDescriptor} from '../../../../../../../../core/models/server/NetworkSetting';

declare var $: BootstrapFunction;

@Component({
    selector: 'app-modal-transport-edit-dstp-settings',
    templateUrl: './modal-transport-edit-dstp-settings.component.html',
    styleUrl: './modal-transport-edit-dstp-settings.component.scss'
})
export class ModalTransportEditDstpSettingsComponent implements OnInit, OnChanges {

    @Input() dstpSettings: ATSC3DSTPSettings;
    @Output() dstpSettingsChanged: EventEmitter<ATSC3DSTPSettings> = new EventEmitter();
    public localDSTPSSettings: ATSC3DSTPSettings = new DefaultATSC3DSTPSettings();
    public updateEnabled: boolean;
    public dstpAddressIconText: string;
    public dstpPortIconText: string;
    public dstpBindNicPortIconText: string;
    public dstpBindPortIconText: string;
    public dstpFecColumnsIconText: string;
    public dstpFecRowsIconText: string;
    public dstpMTUIconText: string;
    public dstpTTLIconText: string;
    public dstpLatencyIconText: string;
    public dstpPassPhraseIconText: string;
    public enableBindFields = false;
    public enableBindPortFields = false;
    public dstpenableFECLantencyields = false;
    public enableFECEncryptionFields = false;
    public showFieldValue: boolean;
    public nics: NICDescriptor[] = [];
    public readonly numberOnly = numberOnly;
    public readonly validateIP = validateIP;
    public networkInterface: NICDescriptor[];
    public readonly keyLengthTypes: SRTKeyLength[] = Object.values(SRTKeyLength);
    public readonly fecLayoutTypes: SRTFECLayout[] = Object.values(SRTFECLayout);
    public readonly tunnelModeTypes: DSTPTunnelMode[] = Object.values(DSTPTunnelMode);
    public readonly autoRepeatRequestTypes: SRTAutoRepeatRequest[] = Object.values(SRTAutoRepeatRequest);
    protected readonly DSTP_TUNNEL_MODE_TYPES = DSTP_TUNNEL_MODE_TYPES;
    protected readonly SRT_KEY_LENGTH_TYPES = SRT_KEY_LENGTH_TYPES;
    protected readonly SRT_AUTO_RESPONSE_REQUEST_TYPES = SRT_AUTO_RESPONSE_REQUEST_TYPES;
    protected readonly SRT_FEC_LAYOUT_TYPES = SRT_FEC_LAYOUT_TYPES;
    private dstpAddressValid: boolean;
    private dstpPortValid: boolean;
    private dstpFecColumnsValid: boolean;
    private dstpFecRowsValid: boolean;
    private dstpBindPortValid: boolean;
    private dstpMTUValid: boolean;
    private dstpTTLValid: boolean;
    private dstpLatencyValid: boolean;
    private dstpPassPhraseValid: boolean;

    constructor(private cdr: ChangeDetectorRef, private clientNetworkSettingsModel: ClientNetworkSettingsModel) {
      this.networkInterface = this.clientNetworkSettingsModel.getNetworkList();
    }

    public ngOnInit(): void {
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (isDefined(changes.dstpSettings?.currentValue)) {
            this.localDSTPSSettings = cloneDeep(changes.dstpSettings?.currentValue);
            this.localDSTPSSettings = this.updateObjectValues(this.localDSTPSSettings) as ATSC3DSTPSettings;
            this.inputDSTPSettings();
            this.onChangeTunnelMode()
            this.cdr.detectChanges();
        }
    }

    public inputDSTPSettings(): void {
        this.updateDstpAddressValid();
        this.updateDstpPortValid();
        this.updateDstpBindPortValid();
        this.updateDstpFecColumnsValid();
        this.updateDstpFecRowsValid();
        this.updatePassPhraseValid();
        this.updateDstpMTUValid();
        this.updateDstpTTLValid();
        this.updateDstpLatencyValid();
        this.updateOkEnabled();
    }

    public closeModal() {
        $('#modalEditDSTPSettings').modal('hide');
    }

    public updateDSTPSettings() {
        this.closeModal();
        this.localDSTPSSettings = this.updateObjectValues(this.localDSTPSSettings) as ATSC3DSTPSettings;
        this.dstpSettingsChanged.emit(this.localDSTPSSettings);
    }

    public onChangeTunnelMode() {

        this.enableBindFields = false;
        this.enableBindPortFields = false;
        this.dstpenableFECLantencyields = true;
        if (this.localDSTPSSettings.tunnelMode === DSTPTunnelMode.RENDEZVOUS ||
          this.localDSTPSSettings.tunnelMode === DSTPTunnelMode.LISTENER ) {
            this.enableBindFields = true;
            this.enableFECEncryptionFields = true;
            this.enableBindPortFields = true;

        }  else if ( this.localDSTPSSettings.tunnelMode === DSTPTunnelMode.CALLER){
            this.enableBindFields = true;
            this.enableFECEncryptionFields = true;
            this.enableBindPortFields = false;
        } else if ( this.localDSTPSSettings.tunnelMode === DSTPTunnelMode.DSTP){
          this.dstpenableFECLantencyields = false;
        }
        this.inputDSTPSettings();
    }

    public toggleFieldVisibility() {
        this.showFieldValue = !this.showFieldValue;
    }

    private updateOkEnabled(): void {
        const fecValid = this.localDSTPSSettings.fecEnabled ? this.dstpFecColumnsValid
            && this.dstpFecRowsValid : true;
        const encryptionValid = this.localDSTPSSettings.encryptionEnabled ? this.dstpPassPhraseValid : true;
        const tunnelModeFieldValid = this.enableBindFields ? this.dstpLatencyValid && (this.enableBindPortFields ? this.dstpBindPortValid : true) : true;
        this.updateEnabled = this.dstpPortValid && this.dstpAddressValid && fecValid && encryptionValid && tunnelModeFieldValid;
    }

    private updateDstpAddressValid(): void {
        this.dstpAddressValid = !this.localDSTPSSettings.enabled || isIPAddressValid(
            this.localDSTPSSettings.dstAddress);
        this.dstpAddressIconText = this.dstpAddressValid ? 'text-success' : 'text-danger';
    }

    private updateDstpPortValid(): void {
        this.dstpPortValid = !this.localDSTPSSettings.enabled || inRangeCheck(this.localDSTPSSettings.dstPort, 1,
            65535);
        this.dstpPortIconText = this.dstpPortValid ? 'text-success' : 'text-danger';
    }

    private updateDstpBindPortValid(): void {
        this.dstpBindPortValid = !this.enableBindFields || inRangeCheck(this.localDSTPSSettings.bindPort, 1,
            65535);
        this.dstpBindPortIconText = this.dstpBindPortValid ? 'text-success' : 'text-danger';
    }

    private updateDstpFecColumnsValid(): void {
        this.dstpFecColumnsValid = !this.localDSTPSSettings.fecEnabled || inRangeCheck(this.localDSTPSSettings.fecColumns, 2,
            65535);
        this.dstpFecColumnsIconText = this.dstpFecColumnsValid ? 'text-success' : 'text-danger';

    }

    private updateDstpFecRowsValid(): void {
        this.dstpFecRowsValid = !this.localDSTPSSettings.fecEnabled || inRangeCheck(this.localDSTPSSettings.fecRows, 1,
            65535);
        this.dstpFecRowsIconText = this.dstpFecRowsValid ? 'text-success' : 'text-danger';
    }

    private updateDstpMTUValid(): void {
        this.dstpMTUValid = !this.localDSTPSSettings.enabled || inRangeCheck(this.localDSTPSSettings.mtu, 68,
            1500);
        this.dstpMTUIconText = this.dstpMTUValid ? 'text-success' : 'text-danger';
    }

    private updateDstpTTLValid(): void {
        this.dstpTTLValid = !this.localDSTPSSettings.enabled || inRangeCheck(this.localDSTPSSettings.ttl, 1,
            255);
        this.dstpTTLIconText = this.dstpTTLValid ? 'text-success' : 'text-danger';
    }

    private updateDstpLatencyValid(): void {
        this.dstpLatencyValid = !this.enableBindFields || inRangeCheck(this.localDSTPSSettings.latency, 1,
            2147483647);
        this.dstpLatencyIconText = this.dstpLatencyValid ? 'text-success' : 'text-danger';
    }

    private updatePassPhraseValid(): void {
        this.dstpPassPhraseValid = !!this.localDSTPSSettings.passphrase && this.localDSTPSSettings.passphrase.length >= 10;
        this.dstpPassPhraseIconText = this.dstpPassPhraseValid ? 'text-success' : 'text-danger';
    }

    private convertZeroToNull(value) {
      return value === 0 ? null : value;
    }

    private updateObjectValues(obj: ATSC3DSTPSettings) {
      const updatedObj = {};
      Object.keys(obj).forEach(key => {
        updatedObj[key] = this.convertZeroToNull(obj[key]);
      });
      return updatedObj;
    }
}
