// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ButtonType, ButtonTypes, ImageType, MultipleTableColumns} from 'src/app/core/models/ui/dynamicTable';
import {EASRoute, MPEGRoute, UDPOutput} from 'src/app/core/models/dtv/output/Output';
import {isIPAddressValid} from 'src/app/shared/helpers/check-ip-address';
import {ModalDynamicTbTranslateComponent} from '../../../modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {AbstractMPEGTransport, AbstractTransport, getTransportTypeDisplayName, TransportType} from 'src/app/core/models/dtv/network/physical/Transport';
import {DtvNetworkComponent} from '../../../../../../pages/main/dtv-services/dtv-network/dtv-network.component';
import {inRangeCheck} from '../../../../../helpers/mathHelprrs';
import {isDefined} from '../../../../../../core/models/dtv/utils/Utils';
import {NICDescriptor} from '../../../../../../core/models/server/NetworkSetting';
import {cloneDeep} from 'lodash';

declare var $: (arg0: string) => { (): any; new(): any; modal: { (arg0: string): void; new(): any; }; };

@Component({
  selector: 'app-modal-outputs-udp-route-select',
  templateUrl: './modal-outputs-udp-route-select.component.html',
  styleUrls: ['./modal-outputs-udp-route-select.component.scss'],
})
export class ModalOutputsUdpRouteSelectComponent implements OnInit {
  @ViewChild(ModalDynamicTbTranslateComponent) transportsTableComponent: ModalDynamicTbTranslateComponent;
  @Input() editMode: boolean;
  @Input() currentUdpRoute: MPEGRoute;
  @Input() udpOutput: UDPOutput;
  @Input() mpegTransports: AbstractMPEGTransport[];
  @Input() nics: NICDescriptor[];
  @Input() objectType: string;
  @Output() modalClosed: EventEmitter<any> = new EventEmitter();
  @Output() okEnabledChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() udpRouteChanged: EventEmitter<MPEGRoute> = new EventEmitter<MPEGRoute>();
  public buttonList: ButtonTypes[] = [
    {name: ButtonType.VIEW, imgSrc: ImageType.view},
  ];
  public tableHeaders: MultipleTableColumns[] = [
    {header: 'Name', key: 'name', visible: true},
    {header: 'TSID', key: 'tsid', visible: true},
    {header: 'Type', key: 'transportType', visible: true, function: this.getTransportTypeDisplayName},
    {header: 'Number of Programs', key: 'programs', visible: true, translateField: true, showDataCount: true}
  ];
  public selectableTransports: AbstractMPEGTransport[];
  public transportName = '';
  public tsid = '';
  public ipAddressIconText: string;
  public portIconText: string;
  public maxBitrateIconText: string;
  public addUpdateEasModal = false;
  public modalTitle = 'Add UDP Route';
  @Input() selectedTransport: AbstractTransport;
  public enableEASPassThru: boolean;
  public enableEASAddress = false;
  public formattedEASAddress = '';
  public showViewTransportModal = false;
  public okEnabled: boolean;
  public udpRoute: MPEGRoute;
  private ipAddressValid: boolean;
  private portValid: boolean;
  private maxBitrateValid: boolean;
  private easAddressValid: boolean;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              @Inject(DtvNetworkComponent) private dtvNetworkComponent: DtvNetworkComponent) {
  }

  public ngOnInit(): void {
    this.udpRoute = cloneDeep(this.currentUdpRoute);
    this.setTableRowSelection();
    this.updateSelectableTransports();
    this.updateEASAddress();
    this.updateModalTitle();
    this.inputSettings();
  }

  public getTransportTypeDisplayName(transportType: TransportType): string {
    return getTransportTypeDisplayName(transportType);
  }

  public inputSettings(): void {
    this.updateEASAddressValid();
    this.updateIPAddressValid();
    this.updatePortValid();
    this.updateMaxBitrateValid();
    this.updateOkEnabled();
  }

  public selectTransport(transport: AbstractMPEGTransport) {
    this.selectedTransport = cloneDeep(transport);
    if (isDefined(this.selectedTransport)) {
      this.transportName = this.selectedTransport.name;
      this.tsid = this.selectedTransport.tsid.toString();
      this.enableEASPassThru = this.selectedTransport.transportType === TransportType.ATSC_PSIP_CABLE;
      if (isDefined(this.selectedTransport.id)) {
        this.udpRoute.transportId = this.selectedTransport.id;
      }
      if (isDefined(this.selectedTransport.clientId)) {
        this.udpRoute.clientTransportId = this.selectedTransport.clientId;
      }
      if (!this.editMode) {
        this.udpRoute.maxBitrate = this.selectedTransport.transportType === TransportType.ATSC_PSIP_TERRESTRIAL ?
          200000 : 500000;
        this.udpRoute.enabled = true;
      }
      this.changeDetectorRef.detectChanges();
    }
  }

  public viewTransport() {
    this.showViewTransportModal = true;
    $('#modalViewTransportMaterial').modal('show');
  }

  public closeModalHandler() {
    this.showViewTransportModal = false;
    $('#modalViewTransportMaterial').modal('hide');
  }

  public addUpdateUDPRoute() {
    console.log('addUpdateUDPRoute this.udpRoute', this.udpRoute);
    this.udpRouteChanged.emit(this.udpRoute);
    this.closeModal();
  }

  public closeModal() {
    $('#addUpdateUDPModal').modal('hide');
    this.modalClosed.emit();
  }

  public toggleEASAddressCheck() {
    this.enableEASAddress = !this.enableEASAddress;
    this.inputSettings();
  }

  public easRouteUpdateHandler(easRoute: EASRoute): void {
    this.udpRoute.easRoute = easRoute;
    this.updateEASAddress();
    this.inputSettings();
  }

  public openEASSettings() {
    this.addUpdateEasModal = true;
    $('#easSettingsModal').modal('show');
  }

  private updateEASAddress() {
    if (isDefined(this.udpRoute.easRoute)) {
      const multicastAddress = isDefined(
        this.udpRoute.easRoute.multicastAddress) ? this.udpRoute.easRoute.multicastAddress : '0.0.0.0';
      if (isDefined(this.udpRoute.easRoute.port)) {
        this.formattedEASAddress = `${multicastAddress}:${this.udpRoute.easRoute.port}`;
        this.enableEASAddress = true;
      }
    } else {
      this.formattedEASAddress = '';
    }
  }

  private updateSelectedTransport(): void {
    console.log('updateSelectedTransport this.udpRoute: ', this.udpRoute);
    const foundIndex = this.mpegTransports.findIndex(transport => {
      const idMatch = isDefined(
        this.udpRoute.transportId) && this.udpRoute.transportId > 0 && this.udpRoute.transportId === transport.id;
      const clientIdMatch = isDefined(
        this.udpRoute.clientId) && this.udpRoute.clientTransportId === transport.clientId;
      console.log('updateSelectedTransport idMatch: ', idMatch, ', clientIdMatch: ', clientIdMatch);
      return idMatch || clientIdMatch;
    });
    console.log('updateSelectedTransport foundIndex: ', foundIndex);
  }

  private updateSelectableTransports(): void {
    console.log('updateSelectableTransports this.mpegTransports: ', this.mpegTransports);
    this.selectableTransports = this.editMode ? this.mpegTransports : this.mpegTransports.filter(
      transport => !this.isTransportLinked(transport));
    if (this.transportsTableComponent) {
      this.selectedTransport = cloneDeep(this.mpegTransports.find(transport => transport.id === this.selectedTransport.id));
      this.transportsTableComponent.selectedRow = this.selectedTransport;
      this.transportsTableComponent.selectRow(this.transportsTableComponent.selectedRow, new MouseEvent('click'));
      this.changeDetectorRef.detectChanges();
    }

  }

  private isTransportLinked(transport: AbstractTransport): boolean {
    const linkedRoute: MPEGRoute = this.udpOutput.udpRoutes?.find(udpRoute => {
      return udpRoute.transportId > 0 ? udpRoute.transportId === transport.id :
        udpRoute.clientTransportId === transport.clientId;
    });
    return isDefined(linkedRoute);
  }

  private updateModalTitle(): void {
    this.modalTitle =
      (this.editMode ? 'Edit ' : 'Add ') + ' UDP Route ' +
      (this.transportName.length > 0 ? ' - ' : '') +
      this.transportName;
  }

  private updateIPAddressValid(): void {
    this.ipAddressValid = isIPAddressValid(this.udpRoute.address);
    this.ipAddressIconText = this.ipAddressValid ? 'text-success' : 'text-danger';
  }

  private updatePortValid(): void {
    this.portValid = inRangeCheck(this.udpRoute.port, 1, 65535);
    this.portIconText = this.portValid ? 'text-success' : 'text-danger';
  }

  private updateMaxBitrateValid(): void {
    this.maxBitrateValid = inRangeCheck(this.udpRoute.maxBitrate, 1, 10528000);
    this.maxBitrateIconText = this.maxBitrateValid ? 'text-success' : 'text-danger';
  }

  private updateEASAddressValid(): void {
    this.easAddressValid = !this.enableEASPassThru || !this.enableEASAddress || this.formattedEASAddress?.length > 0;
  }

  private updateOkEnabled(): void {
    const oldOkEnabled = this.okEnabled;
    this.okEnabled = this.ipAddressValid && this.portValid && this.maxBitrateValid && this.easAddressValid;
    if (oldOkEnabled !== this.okEnabled) {
      this.okEnabledChanged.emit(this.okEnabled);
    }
  }

  private setTableRowSelection(){
    let selectedIndex = this.mpegTransports.findIndex(transport => transport.id === this.udpRoute.transportId);
    selectedIndex = selectedIndex !== -1 ? selectedIndex : 0;
    setTimeout(() => {
      this.transportsTableComponent.setRowSelection(selectedIndex);
      this.transportsTableComponent.setDefaultTableSelection();
    }, 100);
  }
}
