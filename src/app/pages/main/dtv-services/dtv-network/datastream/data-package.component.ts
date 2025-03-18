/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChange,
    ViewChild
} from '@angular/core';
import {isIPAddressValid, validateIPAddressKeyEvent} from '../../../../../shared/helpers';
import {numberOnly} from '../../../../../shared/helpers/appWideFunctions';
import {
    BroadcastAttributes,
    DataPackage,
    DefaultBroadcastAttributes,
    DefaultDataPackage,
    DeliveryMode,
    ElementSchedulingMode,
    PACKAGE_TYPES,
    PackageType
} from '../../../../../core/models/dtv/network/physical/stream/ip/data/DataPackage';
import {ActionMessage, ButtonType, ImageType} from '../../../../../core/models/ui/dynamicTable';
import {validateAlphanumeric} from '../../../../../shared/helpers/alphaNumericValidator';
import {AbstractCommitRevertComponent} from '../../../abstracts/abstract-commit-revert.component';
import {ClientModelListener} from '../../../../../core/models/ClientModelListener';
import {MatDialog} from '@angular/material/dialog';
import {cloneDeep, isEqual} from 'lodash';
import {ClientDataPackagesModel} from '../../../../../core/models/ClientDataPackagesModel';
import {
    ModalTransportSelectServiceGroupComponent
} from '../../../../../shared/components/modals/modal-data-package/modal-transport-select-service-group/modal-transport-select-service-group.component';
import {isDefined} from '../../../../../core/models/dtv/utils/Utils';
import {v4 as uuidv4} from 'uuid';
import {
    AbstractTransport,
    ATSC3Transport,
    ResolvedATSC3Transport,
    TransportType
} from '../../../../../core/models/dtv/network/physical/Transport';
import {ATSC3Service, ResolvedATSC3Service} from '../../../../../core/models/dtv/network/logical/Service';
import {AbstractNetwork} from '../../../../../core/models/dtv/network/logical/Network';
import {
    ModalDataAddElementsComponent
} from '../../../../../shared/components/modals/modal-data-package/modal-data-add-elements/modal-data-add-elements.component';
import {
    ModalDynamicTbTranslateComponent
} from '../../../../../shared/components/modals/modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';

declare var $;

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-data-package',
    templateUrl: './data-package.component.html',
    styleUrls: ['./data-package.component.scss']
})
export class DataPackageComponent extends AbstractCommitRevertComponent implements OnInit, OnChanges, OnDestroy, ClientModelListener {
    @ViewChild(ModalDynamicTbTranslateComponent) dataStreamTableComponent: ModalDynamicTbTranslateComponent;
    @ViewChild(ModalTransportSelectServiceGroupComponent,
        {static: false}) selectTransportComponent: ModalTransportSelectServiceGroupComponent;
    @ViewChild(ModalDataAddElementsComponent) dataElementListComponent: ModalDataAddElementsComponent;
    @Output() dataPackageChanged: EventEmitter<any> = new EventEmitter();
    @Input() serverDataPackages: DataPackage[] = [];
    @Input() transportList: AbstractTransport[] = [];
    @Input() networkList: AbstractNetwork[] = [];
    atsc3Transports: ATSC3Transport[] = [];
    atscResolvedTransports: ResolvedATSC3Transport [] = [];
    public title = 'Add Data Stream ';
    public editMode: boolean;
    public okButtonEnabled = false;
    localDataPackages: DataPackage[] = [];
    broadcastAttributes: BroadcastAttributes;
    currentDataPackage: DataPackage;
    public tableHeaders = [
        {header: 'Stream Name', key: 'name', visible: true},
        {header: 'Delivery Mode', key: 'packageType', visible: true},
        {header: 'Enabled', key: 'enabled', visible: true}
    ];
    public buttonList = [
        {name: ButtonType.ADD, imgSrc: ImageType.add, disable: false},
        {name: ButtonType.EDIT, imgSrc: ImageType.edit, disable: false},
        {name: ButtonType.DELETE, imgSrc: ImageType.delete, disable: false}
    ];
    deliveryModes = Object.values(DeliveryMode);
    transmitModes = Object.values(ElementSchedulingMode);
    dataPackageTypes = Object.values(PACKAGE_TYPES);
    dataPackageType: any;
    ipPattern = '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$';
    isHiddenAdd: boolean;
    maxRateCalculated: string;
    transportDetails: string;
    modalName = '#dataStreamModal';
    elementModalName = '#dataElementModal';

    constructor(private dataPackageModel: ClientDataPackagesModel,
                public dialog: MatDialog) {
        super();
        this.getTransportList();
    }

    ngOnInit(): void {
        this.editMode = false;
        this.getTransportList();
        this.loadServerDataPackages();
        this.createDefaultDataPackage();
    }

    ngOnDestroy(): void {
    }

    public onRevert() {
        this.loadServerDataPackages();
    }

    public onCommit() {
        console.log('DataPackageComponent onCommit...');
        // use the commit only incase of enabled disable stream or use the bulk commit check with Dave
        // this.dataPackageModel.update(this.localDataPackages).then(() => this.dirty = false);
    }

    public updateDirty() {
        this.dirty = !isEqual(this.localDataPackages, this.serverDataPackages);
        if (this.dirty) {
            const message = ActionMessage.DIRTY;
            const updatedData = this.localDataPackages;
            const data = {message, updatedData};
            this.dataPackageChanged.emit(data);
        }
    }

    getMaxRateCalculated() {
        if (this.currentDataPackage.broadcastAttributes.maxTransmitBitsPerSecond > 0) {
            this.maxRateCalculated = this.currentDataPackage.broadcastAttributes.maxTransmitBitsPerSecond < 1000 ?
                `(${this.currentDataPackage.broadcastAttributes.maxTransmitBitsPerSecond} Kbits/sec)` :
                `(${this.currentDataPackage.broadcastAttributes.maxTransmitBitsPerSecond / 1000} Mbits/sec)`;
        }
        return this.maxRateCalculated;
    }

    getTransportList(): void {
        this.atsc3Transports = this.transportList.filter(
            transport => transport.transportType === TransportType.ATSC_3) as ATSC3Transport[];
        this.atscResolvedTransports = this.getResolvedTransport();
    }

    public notifyModelUpdated(): void {
        console.log('DataPackageComponent notifyModelUpdated');
        if (this.dirty) {
            // TODO Display warning message to dataPackage explaining remote client did a commit and local changes are going to be lost
        }
        this.loadServerDataPackages();
    }

    /***
     *  Add or Update Data Package
     */
    public addUpdateCurrentDataPackage() {
        if (this.dataStreamTableComponent.selectedRow !== null) {
            Object.assign(this.dataStreamTableComponent.selectedRow, this.currentDataPackage);
            this.updateCurrentDataPackage();
        } else {
            this.currentDataPackage.clientId = uuidv4();
            this.localDataPackages = [...this.localDataPackages, this.currentDataPackage];
        }
        this.updateDirty();
        this.createDefaultDataPackage();
    }

    public checkAlphanumeric(event) {
        return validateAlphanumeric(event);
    }

    private loadServerDataPackages(): void {
        this.updateDataPackages(this.dataPackageModel.getDataPackages());
    }

    /**
     * update the local and server object along with dynamic table object from the data from server
     */
    private updateDataPackages(dataPackages: DataPackage[]) {
        console.log('DataPackageComponent dataPackages: ', dataPackages);
        this.serverDataPackages = cloneDeep(dataPackages);
        this.localDataPackages = cloneDeep(this.serverDataPackages);
        this.dirty = false;
    }

    private updateCurrentDataPackage() {
        const index = this.localDataPackages.findIndex(
            (dataPackage) => this.currentDataPackage?.id > 0 ? dataPackage.id === this.currentDataPackage.id :
                dataPackage.clientId === this.currentDataPackage.clientId);
        if (index !== -1) {
            this.localDataPackages = [...this.localDataPackages.slice(0,
                index), this.currentDataPackage, ...this.localDataPackages.slice(
                index + 1)];
        }
    }

    public validIpAddress(ipAddress: string) {
        return isIPAddressValid(ipAddress);
    }

    ngOnChanges(changes: { [property: string]: SimpleChange }) {
        console.log('ngOnChanges===============DATASTREAM======================', changes);
        // Resolve new and existing transport to including linked services from network for the binding trabsport model
        this.atsc3Transports = this.transportList.filter(
            transport => transport.transportType === TransportType.ATSC_3) as ATSC3Transport[];
        this.atscResolvedTransports = [];
        this.atscResolvedTransports = this.getResolvedTransport();
        this.selectTransportComponent.atsc3Transports = this.atscResolvedTransports;
        //  console.log('Resolved Transport List: --' + JSON.stringify(this.atscResolvedTransports));
    }

    getResolvedTransport(): ResolvedATSC3Transport[] {
        this.atsc3Transports.forEach((trans) => {
            this.networkList.forEach((network) => {
                let services: ResolvedATSC3Service[] = [];
                network.channels.forEach((ch) => {
                    // check with Dave do we need to compare transport links
                    // if (ch.transportLinks.transportId === trans.id) {
                    services = [];
                    ch.services.forEach((srv) => {
                        trans.serviceGroups.forEach((srvGrp) => {
                            srvGrp.ipStreams.forEach((ipStream) => {
                                const atscSrv = srv as ATSC3Service;
                                if (srv.physicalLink !== null && ipStream.id === srv.physicalLink.physicalId) {
                                    const service = new ResolvedATSC3Service(atscSrv.id, atscSrv.id, trans.id,
                                        atscSrv.name, atscSrv.name,
                                        null, atscSrv.majorNumber, atscSrv.minorNumber, null);
                                    services.push(service);
                                }
                            });
                        });
                    });
                    // }
                });
                const resolvedTransports: ResolvedATSC3Transport = new ResolvedATSC3Transport(trans.serviceGroups,
                    services,
                    null, null, trans.id, trans.name, null, trans.id, null);
                this.atscResolvedTransports.push(resolvedTransports);
            });
        });
        return this.atscResolvedTransports;
    }

    ipAddressOnly(event) {
        return validateIPAddressKeyEvent(event);
    }

    onInputNumber(event) {
        numberOnly(event);
    }

    public onButtonClicked($event: any) {
        if (this.dataStreamTableComponent.selectedRow !== null) {
            if ($event.message === ActionMessage.EDIT) {
                this.currentDataPackage = cloneDeep(this.dataStreamTableComponent.selectedRow);
                this.title = 'Edit Data Stream - ' + this.currentDataPackage.name;
                this.okButtonEnabled = true;
                this.editMode = true;
            } else if ($event.message === ActionMessage.DELETE) {
                if (this.dataStreamTableComponent.selectedRow?.id > 0) {
                    this.localDataPackages = this.localDataPackages.filter(
                        dataPackage => dataPackage.id !== this.dataStreamTableComponent.selectedRow.id);
                } else {
                    this.localDataPackages = this.localDataPackages.filter(
                        dataPackage => dataPackage.clientId !== this.dataStreamTableComponent.selectedRow.clientId);
                }
                this.updateDirty();
            } else if ($event.message === ActionMessage.ENABLE_DISABLE) {
                this.currentDataPackage = cloneDeep(this.dataStreamTableComponent.selectedRow);
                this.currentDataPackage.enabled ? this.currentDataPackage.enabled = false : this.currentDataPackage.enabled = true;
                this.updateCurrentDataPackage();
                this.updateRow();
                this.updateDirty();
            } else if ($event.message === ActionMessage.UPDATE_ROW) { // dynamically update the button's current state on row selection
                this.currentDataPackage = cloneDeep(this.dataStreamTableComponent.selectedRow);
                this.updateRow();
            }
        } else {
            this.editMode = false;
            this.createDefaultDataPackage();
        }
        //  this.updateOkButtonEnabled();
    }

    public updateDataElementList() {
        // console.log('updating data in dataTSreadm' + JSON.stringify(this.currentDataPackage.dataElements));
    }

    public createDefaultDataPackage(): void {
        this.broadcastAttributes = new DefaultBroadcastAttributes();
        this.currentDataPackage = new DefaultDataPackage();
        this.currentDataPackage.broadcastAttributes = this.broadcastAttributes;
    }

    public bindedTransportValid(): boolean {
        let transportValid = false;
        if (this.currentDataPackage.transportId > 0 && this.currentDataPackage.packageType !== null) {
            if (this.currentDataPackage.packageType === PackageType.ATSC3_APP_NRT) {
                transportValid = this.currentDataPackage.transportId !== null && this.currentDataPackage.serviceGroupId !== null
                    && this.currentDataPackage.serviceIds !== null;
            } else if (this.currentDataPackage.packageType === PackageType.USER_DEFINED_NDP) {
                transportValid = this.currentDataPackage.transportId !== null && this.currentDataPackage.serviceGroupId !== null;
            }
        } else {
            if (this.currentDataPackage.packageType === PackageType.ATSC3_APP_NRT) {
                transportValid = this.currentDataPackage.clientTransportId !== null && this.currentDataPackage.clientServiceGroupId !== null
                    && this.currentDataPackage.clientServiceIds !== null;
            } else if (this.currentDataPackage.packageType === PackageType.USER_DEFINED_NDP) {
                transportValid = this.currentDataPackage.clientTransportId !== null && this.currentDataPackage.clientServiceGroupId !== null;
            }
        }
        console.log('Binded Transport valid:-' + transportValid);
        return transportValid;
    }

    public updateOkButtonEnabled(): boolean {
        this.okButtonEnabled = (isDefined(
                this.currentDataPackage.name) && this.currentDataPackage.name.length > 0) && this.currentDataPackage.deliveryMode !== null
            && (isDefined(this.currentDataPackage.broadcastAttributes.dstAddress) ? isIPAddressValid(
                this.currentDataPackage.broadcastAttributes.dstAddress) : false)
            && (isDefined(
                this.currentDataPackage.broadcastAttributes.dstPort) && this.currentDataPackage.broadcastAttributes.dstPort < 65536)
            && (isDefined(
                this.currentDataPackage.broadcastAttributes.maxTransmitBitsPerSecond)) && this.bindedTransportValid();
        return this.okButtonEnabled;
    }

    private updateRow(): void {
        if (this.currentDataPackage.enabled) {
            this.dataStreamTableComponent.buttonImage = ImageType.disable;
            this.dataStreamTableComponent.buttonText = ButtonType.DISABLE;
        } else {
            this.dataStreamTableComponent.buttonImage = ImageType.enable;
            this.dataStreamTableComponent.buttonText = ButtonType.ENABLE;
        }
    }

    /**
     * opens modal for select Transport/Service Binding Group
     */
    openSelectServiceGroup() {
        this.selectTransportComponent.transportID = this.currentDataPackage.transportId;
        setTimeout(() => {
            $('#serviceGroupModal').modal({
                keyboard: true,
                show: true
            });
        }, 0);
        if (this.currentDataPackage.packageType === PackageType.USER_DEFINED_NDP) {
            this.currentDataPackage.deliveryMode = DeliveryMode.BROADCAST;
        }
    }

    closeModal() {
        $('#dataStreamModal').modal('hide');
    }
}
