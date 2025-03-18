/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {ATSC3AEASettings, ATSC3BroadbandSettings, ATSC3DSTPSettings, ATSC3ESGSettings, ATSC3LLSSettings, ATSC3RecoverySettings, DefaultServiceGroup, ServiceGroup} from '../../../../../../../../core/models/dtv/network/physical/stream/ip/service-group/ServiceGroup';
import {ModalDynamicTbTranslateComponent} from '../../../../../modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {ViewCertComponent} from '../../../../../view-cert/view-cert.component';
import {Cert} from '../../../../../../../../core/models/server/Cert';
import {ClientCertsModel} from '../../../../../../../../core/models/ClientCertsModel';
import {inRangeCheck} from '../../../../../../../helpers/mathHelprrs';
import {isElementIdMatch} from '../../../../../../../../core/models/AbstractElement';
import {validateIP} from '../../../../../../../helpers';
import {isDefined} from '../../../../../../../../core/models/dtv/utils/Utils';
import {numberOnly} from 'src/app/shared/helpers/appWideFunctions';
import {SweetAlert} from 'sweetalert/typings/core';
import * as _swal from 'sweetalert';
import {cloneDeep} from 'lodash';
import {ATSC3Transport} from '../../../../../../../../core/models/dtv/network/physical/Transport';
import {TransportComponent} from '../../../../../../../../pages/main/dtv-services/dtv-network/transport/transport.component';

const swal: SweetAlert = _swal as any;
declare var $;

@Component({
    selector: 'app-service-group-settings',
    templateUrl: './service-group-settings.component.html',
    styleUrl: './service-group-settings.component.scss'
})
export class ServiceGroupSettingsComponent implements OnInit, OnChanges {
    @Input() atsc3TransportStream: ATSC3Transport;
    @Input() serviceGroup: ServiceGroup;
    @Input() editMode: boolean;
    @Output() serviceGroupChanged: EventEmitter<ServiceGroup[]> = new EventEmitter();
    @Output() okEnabledChanged: EventEmitter<boolean> = new EventEmitter();
    @ViewChild(ModalDynamicTbTranslateComponent) serviceGroupTable: ModalDynamicTbTranslateComponent;
    @ViewChild(ViewCertComponent) viewCertComponent: ViewCertComponent;
    public readonly numberOnly = numberOnly;
    public readonly validateIP = validateIP;
    public localServiceGroups: ServiceGroup[];
    public localServiceGroup: ServiceGroup = new DefaultServiceGroup(0);
    public localLLSSettings: ATSC3LLSSettings;
    public localDSTPSettings: ATSC3DSTPSettings;
    public localBroadbandSettings: ATSC3BroadbandSettings;
    public localESGSettings: ATSC3ESGSettings;
    public localAEASettings: ATSC3AEASettings;
    public localRecoverySettings: ATSC3RecoverySettings;
    public currentCDTCert: Cert = null;
    public currentNextCert: Cert = null;
    public cdtCert: Cert = null;
    public cdtNextCert: Cert = null;
    public nameIconText: string;
    public groupIdIconText: string;
    public groupCountIconText: string;
    public statMuxBitrateIconText: string;
    public serverCerts: Cert[] = [];
    public certType = 'current';
    public viewCertRecord: Cert = null;
    public modalSelectCert = true;
    private nameValid: boolean;
    private groupIdValid: boolean;
    private groupIdExists: boolean;
    private groupCountValid: boolean;
    private statMuxBitrateValid: boolean;
    private okEnabled: boolean;

    constructor(@Inject(TransportComponent) private transportComponent: TransportComponent,
                private clientCertModel: ClientCertsModel, private cdr: ChangeDetectorRef) {
    }

    public getLocalServiceGroup(): ServiceGroup {
        return this.localServiceGroup;
    }

    public ngOnInit(): void {
        this.loadServiceGroups();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (isDefined(changes.atsc3TransportStream)) {
            this.atsc3TransportStream = cloneDeep(changes.atsc3TransportStream.currentValue);
            this.loadServiceGroups();
        }
        if (isDefined(changes.editMode)) {
            this.editMode = changes.editMode.currentValue;
        }
        if (isDefined(changes.serviceGroup)) {
            this.localServiceGroup = cloneDeep(changes.serviceGroup.currentValue);
            this.updateServiceGroupValid();
            this.cdr.detectChanges();
        }
    }

    public llsSettingsChangedHandler(updatedLLSSettings: ATSC3LLSSettings): void {
        this.localServiceGroup.llsSettings = updatedLLSSettings;
    }

    public broadbandSettingsChangedHandler(updatedBroadbandSettings: ATSC3BroadbandSettings): void {
        this.localServiceGroup.broadbandSettings = updatedBroadbandSettings;
    }

    public esgSettingsChangedHandler(updatedESGSettings: ATSC3ESGSettings): void {
        this.localServiceGroup.esgSettings = updatedESGSettings;
    }

    public aeaSettingsChangedHandler(updatedAEASettings: ATSC3AEASettings): void {
        this.localServiceGroup.aeaSettings = updatedAEASettings;
    }

    public recoverySettingsChangedHandler(updatedRecoverySettings: ATSC3RecoverySettings): void {
        this.localServiceGroup.recoverySettings = updatedRecoverySettings;
    }

    public dstpSettingsChangedHandler(updatedDSTPSettings: ATSC3DSTPSettings): void {
        this.localServiceGroup.dstpSettings = updatedDSTPSettings;
    }

    public inputServiceGroup() {
        this.updateServiceGroupValid();
    }

    public addUpdateServiceGroup() {
        this.closeModal();
        this.addUpdateCurrentServiceGroups();
        this.serviceGroupChanged.emit(this.localServiceGroups);
    }

    public closeModal() {
        $('#modalAddTransportServiceGroup').modal('hide');
    }

    public openModalEditLLSSettings() {
        this.localLLSSettings = this.localServiceGroup.llsSettings;
        this.cdr.detectChanges();
    }

    public openModalEditDSTPSettings() {
        this.localDSTPSettings = this.localServiceGroup.dstpSettings;
        this.cdr.detectChanges();
    }

    public openModalEditBroadbandSettings() {
        this.localBroadbandSettings = this.localServiceGroup.broadbandSettings;
        this.cdr.detectChanges();
    }

    public openModalEditESGSettings() {
        this.localESGSettings = this.localServiceGroup.esgSettings;
        this.cdr.detectChanges();
    }

    public openModalEditAEASettings() {
        this.localAEASettings = this.localServiceGroup.aeaSettings;
        this.cdr.detectChanges();
    }

    public openModalEditRecoverySettings() {
        this.localRecoverySettings = this.localServiceGroup.recoverySettings;
        this.cdr.detectChanges();
    }

    public openModalLinkCert(certType: string) {
        this.certType = certType;
        this.viewCertComponent.tsid = this.atsc3TransportStream.tsid;
        this.viewCertComponent.loadCertWithBSIDMatch();
        this.viewCertRecord = null;
        this.cdr.detectChanges();
    }

    public certRecordChangeHandler(updatedCert: Cert): void {
        if (updatedCert.id === this.localServiceGroup.currentCertId ||
            updatedCert.id === this.localServiceGroup.nextCertId ||
            updatedCert.id === this.localServiceGroup.cdtCertId ||
            updatedCert.id === this.localServiceGroup.cdtNextCertId) {
            swal('Error', 'This certificate has already been assigned. Please select another certificate ', 'error');
        } else {
            if (this.certType === 'current') {
                this.currentCDTCert = updatedCert;
                this.localServiceGroup.currentCertId = updatedCert.id;
            } else if (this.certType === 'current-next') {
                this.currentNextCert = updatedCert;
                this.localServiceGroup.nextCertId = updatedCert.id;
            } else if (this.certType === 'cdt') {
                this.cdtCert = updatedCert;
                this.localServiceGroup.cdtCertId = updatedCert.id;
            } else if (this.certType === 'cdt-next') {
                this.cdtNextCert = updatedCert;
                this.localServiceGroup.cdtNextCertId = updatedCert.id;
            }
            this.cdr.detectChanges();
        }
    }

    public unlinkCert(certType: string) {
        if (certType === 'current') {
            this.localServiceGroup.currentCertId = null;
            this.currentCDTCert = null;
        } else if (certType === 'current-next') {
            this.localServiceGroup.nextCertId = null;
            this.currentNextCert = null;
        } else if (certType === 'cdt') {
            this.localServiceGroup.cdtCertId = null;
            this.cdtCert = null;
        } else if (certType === 'cdt-next') {
            this.localServiceGroup.cdtNextCertId = null;
            this.cdtNextCert = null;
        }
        this.viewCertRecord = null;
    }

    public viewCert(certType: string) {
        if (certType === 'current') {
            this.viewCertRecord = this.currentCDTCert;
        } else if (certType === 'current-next') {
            this.viewCertRecord = this.currentNextCert;
        } else if (certType === 'cdt') {
            this.viewCertRecord = this.cdtCert;
        } else if (certType === 'cdt-next') {
            this.viewCertRecord = this.cdtNextCert;
        }
        this.viewCertComponent.openViewCertDialog();
    }

    private updateCertData() {
        this.currentCDTCert = null;
        this.currentNextCert = null;
        this.cdtCert = null;
        this.cdtNextCert = null;
        this.serverCerts.forEach(cert => {
            if (this.localServiceGroup.currentCertId === cert.id) {
                this.currentCDTCert = cloneDeep(cert);
            } else if (this.localServiceGroup.nextCertId === cert.id) {
                this.currentNextCert = cloneDeep(cert);
            } else if (this.localServiceGroup.cdtCertId === cert.id) {
                this.cdtCert = cloneDeep(cert);
            } else if (this.localServiceGroup.cdtNextCertId === cert.id) {
                this.cdtNextCert = cloneDeep(cert);
            }
        });
    }

    private loadServiceGroups() {
        if (isDefined(this.atsc3TransportStream)) {
            this.localServiceGroups = cloneDeep(this.atsc3TransportStream.serviceGroups);
            this.serverCerts = cloneDeep(this.clientCertModel.certsSubject.getValue());
            this.updateCertData();
        }
        this.updateServiceGroupValid();
    }

    private addUpdateCurrentServiceGroups() {
        if (this.editMode) {
            this.updateCurrentServiceGroups();
        } else {
            this.localServiceGroups = [...this.localServiceGroups, this.localServiceGroup];
        }
        this.atsc3TransportStream.serviceGroups = this.localServiceGroups;
        console.log('addUpdateCurrentServiceGroups this.localServiceGroups: ', this.localServiceGroups);
    }

    private updateServiceGroupValid(): void {
        this.updateNameValid();
        this.updateCertData();
        this.updateNumberValid();
        this.updateGroupCountValid();
        this.updateStatMuxBitrateValid();
        this.updateOkEnabled();
    }

    private updateOkEnabled(): void {
        const oldOkEnabled = this.okEnabled;
        this.okEnabled = this.nameValid && this.groupIdValid && this.groupCountValid && this.statMuxBitrateValid;
        if (oldOkEnabled !== this.okEnabled) {
            this.okEnabledChanged.emit(this.okEnabled);
        }
    }

    private updateNameValid(): void {
        this.nameValid = this.localServiceGroup?.name.length > 0;
        this.nameIconText = this.nameValid ? 'text-success' : 'text-danger';
    }

    private updateNumberValid(): void {
        this.updateNumberExists();
        this.groupIdValid = !this.groupIdExists && inRangeCheck(this.localServiceGroup.groupId, 0, 255);
        this.groupIdIconText = this.groupIdValid ? 'text-success' : 'text-danger';
    }

    private updateNumberExists() {
        let matchedServiceGroup: ServiceGroup;
        if (this.localServiceGroup?.groupId > -1) {
            matchedServiceGroup = this.localServiceGroups?.find(
                serviceGroup => {
                    const idMatch = this.editMode ? !isElementIdMatch(this.localServiceGroup,
                        serviceGroup) : true;
                    return idMatch && this.localServiceGroup.groupId === serviceGroup.groupId;
                });
        }
        this.groupIdExists = matchedServiceGroup !== undefined;
    }

    private updateGroupCountValid(): void {
        this.groupCountValid = inRangeCheck(this.localServiceGroup.groupCount, 1, 256);
        this.groupCountIconText = this.groupCountValid ? 'text-success' : 'text-danger';
    }

    private updateStatMuxBitrateValid(): void {
        this.statMuxBitrateValid = !this.localServiceGroup.statmuxed || inRangeCheck(this.localServiceGroup.statmuxRate,
            1, 100000000);
        this.statMuxBitrateIconText = this.statMuxBitrateValid ? 'text-success' : 'text-danger';
    }

    private updateCurrentServiceGroups() {
        const index = this.localServiceGroups.findIndex((program) =>
            this.localServiceGroup?.id > 0
                ? program.id === this.localServiceGroup.id
                : program.clientId === this.localServiceGroup.clientId
        );
        if (index !== -1) {
            this.localServiceGroups = [...this.localServiceGroups.slice(0,
                index), this.localServiceGroup, ...this.localServiceGroups.slice(index + 1),
            ];
        }
    }
}
