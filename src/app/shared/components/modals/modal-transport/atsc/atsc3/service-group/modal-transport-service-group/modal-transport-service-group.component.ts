/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */
import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Inject,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {cloneDeep} from 'lodash';
import {ActionMessage, ButtonType, ButtonTypes, ImageType, MultipleTableColumns} from 'src/app/core/models/ui/dynamicTable';
import {
    ATSC3AEASettings,
    DefaultServiceGroup,
    ServiceGroup
} from '../../../../../../../../core/models/dtv/network/physical/stream/ip/service-group/ServiceGroup';
import {ATSC3Transport, TransportType} from '../../../../../../../../core/models/dtv/network/physical/Transport';
import {
    ModalDynamicTbTranslateComponent
} from '../../../../../modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {ClientMediaStreamsModel} from '../../../../../../../../core/models/ClientMediaStreamsModel';
import {isDefined} from '../../../../../../../../core/models/dtv/utils/Utils';
import {ViewCertComponent} from '../../../../../view-cert/view-cert.component';
import * as _swal from 'sweetalert';
import {SweetAlert} from 'sweetalert/typings/core';
import {ServiceGroupComponent} from '../service-group.component';
import {MediaStream} from '../../../../../../../../core/models/dtv/network/physical/stream/ip/media/MediaStream';
import {Subscription} from 'rxjs';
import {ClientNetworkSettingsModel} from '../../../../../../../../core/models/ClientNetworkSettingsModel';
import {isElementIdMatch, updateElementList} from '../../../../../../../../core/models/AbstractElement';
import {
    TransportComponent
} from '../../../../../../../../pages/main/dtv-services/dtv-network/transport/transport.component';

const swal: SweetAlert = _swal as any;
declare var $;

@Component({
    selector: 'app-modal-transport-service-group',
    templateUrl: './modal-transport-service-group.component.html',
    styleUrls: ['./modal-transport-service-group.component.scss']
})
export class ModalTransportServiceGroupComponent implements OnInit, OnDestroy, OnChanges {
    @Input() atsc3TransportStream: ATSC3Transport;
    @Output() serviceGroupChanged: EventEmitter<ServiceGroup[]> = new EventEmitter();
    @ViewChild(ModalDynamicTbTranslateComponent) serviceGroupTable: ModalDynamicTbTranslateComponent;
    @ViewChild(ViewCertComponent) viewCertComponent: ViewCertComponent;
    @ViewChild(ServiceGroupComponent) serviceGroupComponent: ServiceGroupComponent;
    public serviceGroupHeaders: MultipleTableColumns[] = [
        {header: 'Name', key: 'name', visible: true},
        {header: 'LLS Group ID', key: 'groupId', visible: true},
        {header: 'Number of Streams', key: 'ipStreams', visible: true, translateField: true, showDataCount: true},
    ];
    public serviceGroupButtonList: ButtonTypes[] = [
        {name: ButtonType.ADD, imgSrc: ImageType.add, supportsMultiSelect: false, alwaysEnabled: true},
        {name: ButtonType.EDIT, imgSrc: ImageType.edit},
        {name: ButtonType.DELETE, imgSrc: ImageType.delete, supportsMultiSelect: true}
    ];
    public objectTableType = 'ServiceGroup';
    public modalNameServiceGroup = '#modalAddTransportServiceGroup';
    public modalTitle: string;
    public localServiceGroup: ServiceGroup = new DefaultServiceGroup(0);
    public localServiceGroups: ServiceGroup[];
    public otherAEASettings: ATSC3AEASettings[];
    public okEnabled: boolean;
    public editMode: boolean;
    private subscriptions: Subscription [] = [];

    constructor(@Inject(TransportComponent) private transportComponent: TransportComponent,
                private clientMediaStreamsModel: ClientMediaStreamsModel,
                private clientNetworkSettingsModel: ClientNetworkSettingsModel, private cdr: ChangeDetectorRef) {
    }

    public ngOnInit(): void {
        this.loadServiceGroups();
        this.subscriptions.push(this.clientMediaStreamsModel.mediaStreams$.subscribe(
            (mediaStreams: MediaStream[]) => {
                this.validateIPStreamLinks();
            }));
    }

    public ngOnDestroy(): void {
        this.subscriptions?.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }

    public ngOnChanges(changes: SimpleChanges): void {
        console.log('ModalTransportServiceGroupComponent, onChanges changes: ', changes);
        if (isDefined(changes.atsc3TransportStream)) {
            console.log('ModalTransportServiceGroupComponent, onChanges changes.atsc3TransportStream.currentValue: ',
                changes.atsc3TransportStream.currentValue);
            this.atsc3TransportStream = changes.atsc3TransportStream.currentValue;
            this.loadServiceGroups();
            this.cdr.detectChanges();
        }
    }

    public okEnabledChangedHandler(okEnabled: boolean): void {
        this.okEnabled = okEnabled;
    }

    public onButtonClicked($event: any) {
        switch ($event.message) {
            case ActionMessage.ADD:
                this.onAddRow();
                break;
            case ActionMessage.EDIT:
                this.onEditRow();
                break;
            case ActionMessage.DELETE:
                this.onDeleteRow();
                break;
        }
        this.cdr.detectChanges();
    }

    public addUpdateServiceGroup() {
        this.closeModal();
        this.addUpdateCurrentServiceGroups();
        this.serviceGroupChanged.emit(this.localServiceGroups);
    }

    public closeModal() {
        $('#modalAddTransportServiceGroup').modal('hide');
    }

    private loadServiceGroups() {
        this.localServiceGroups = cloneDeep(this.atsc3TransportStream.serviceGroups);
        this.updateOtherAEASettings();
        this.updateServiceGroupValid();
    }

    private onAddRow() {
        this.editMode = false;
        this.localServiceGroup = new DefaultServiceGroup(this.getNextServiceGroupId());
        this.localServiceGroup.dstpSettings.bindNic = this.clientNetworkSettingsModel.getDefaultTrafficNICName();
        this.updateOtherAEASettings();
        this.updateServiceGroupValid();
    }

    private onEditRow() {
        this.editMode = true;
        this.localServiceGroup = cloneDeep(this.serviceGroupTable.selectedRow);
        this.updateOtherAEASettings();
        this.updateServiceGroupValid();
    }

    private onDeleteRow(): void {
        this.multipleDeletion();
    }

    private multipleDeletion() {
        const len = this.serviceGroupTable.selectedRowIds.length;
        for (let i = 0; i < len; i++) {
            const selectID = this.serviceGroupTable?.selectedRowIds[i];
            this.localServiceGroups = this.localServiceGroups.filter((serviceGroup) => {
                const idMatch = serviceGroup.id.toString() !== selectID.toString();
                const clientIdMatch = serviceGroup.clientId !== selectID.toString();
                return idMatch && clientIdMatch;
            });
        }
        this.atsc3TransportStream.serviceGroups = this.localServiceGroups;
        this.updateOtherAEASettings();
        this.serviceGroupChanged.emit(this.localServiceGroups);
    }

    private addUpdateCurrentServiceGroups() {
        this.localServiceGroup = this.serviceGroupComponent.getLocalServiceGroup();
        this.localServiceGroups = updateElementList(this.localServiceGroups, this.localServiceGroup,
            this.editMode) as ServiceGroup[];
        this.atsc3TransportStream.serviceGroups = this.localServiceGroups;
        this.updateOtherAEASettings();
    }

    private updateServiceGroupValid(): void {
        this.updateModalTitle();
    }

    private updateModalTitle(): void {
        const serviceName = this.localServiceGroup.name || '';
        this.modalTitle =
            (this.editMode ? 'Edit ' : 'Add ') + ' Service Group ' +
            (serviceName.length > 0 ? ' - ' : '') +
            serviceName;
    }

    private getNextServiceGroupId(): number {
        let maxGroupId = -1;
        this.localServiceGroups.forEach(serviceGroup => {
            if (serviceGroup.groupId > maxGroupId) {
                maxGroupId = serviceGroup.groupId;
            }
        });
        return maxGroupId > -1 ? maxGroupId + 1 : 0;
    }

    private validateIPStreamLinks(): void {
        const mediaStreams: MediaStream[] = this.clientMediaStreamsModel.getMediaStreams();
        this.validateIPStreamLink(mediaStreams, this.localServiceGroup);
        this.localServiceGroups.forEach(serviceGroup => this.validateIPStreamLink(mediaStreams, serviceGroup));
        this.serviceGroupChanged.emit(this.localServiceGroups);
    }

    private validateIPStreamLink(mediaStreams: MediaStream[], serviceGroup: ServiceGroup): void {
        serviceGroup.ipStreams = serviceGroup.ipStreams.filter(atsc3Stream => {
            let streamValid = true;
            if (atsc3Stream.linkedStreamId > 0) {
                streamValid = isDefined(
                    mediaStreams.find(mediaStream => mediaStream.id === atsc3Stream.linkedStreamId));
            }
            return streamValid;
        });
    }

    private updateOtherAEASettings(): void {
        this.otherAEASettings = [];
        this.updateOtherAEASettingsFromTransports();
        this.updateOtherAEASettingsFromLocalServiceGroups();
        console.log('updateOtherAEASettings this.otherAEASettings: ', this.otherAEASettings);
    }

    private updateOtherAEASettingsFromTransports(): void {
        this.transportComponent.localTransports.forEach(transport => {
            if (transport.transportType === TransportType.ATSC_3) {
                const atsc3Transport: ATSC3Transport = transport as ATSC3Transport;
                atsc3Transport.serviceGroups?.forEach(serviceGroup => {
                    if (!isElementIdMatch(this.localServiceGroup, serviceGroup)) {
                        this.otherAEASettings.push(serviceGroup.aeaSettings);
                    }
                });
            }
        });
    }

    private updateOtherAEASettingsFromLocalServiceGroups(): void {
        console.log('updateOtherAEASettingsFromLocalServiceGroup checking this.localServiceGroups: ',
            this.localServiceGroups);
        if (this.localServiceGroups?.length > 0) {
            this.localServiceGroups.forEach(
                serviceGroup => {
                    console.log('updateOtherAEASettingsFromLocalServiceGroup checking serviceGroup: ', serviceGroup);
                    if (this.editMode) {
                        if (!isElementIdMatch(this.localServiceGroup, serviceGroup)) {
                            this.otherAEASettings.push(serviceGroup.aeaSettings);
                        } else {
                            console.log('updateOtherAEASettingsFromLocalServiceGroup ignoring serviceGroup: ',
                                serviceGroup);
                        }
                    } else {
                        this.otherAEASettings.push(serviceGroup.aeaSettings);
                    }
                });
        }
    }
}
