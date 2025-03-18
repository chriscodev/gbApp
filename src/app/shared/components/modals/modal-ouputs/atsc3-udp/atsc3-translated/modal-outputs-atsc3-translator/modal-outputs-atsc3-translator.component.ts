// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {
  AbstractOutput,
  ATSC3TranslatorOutput,
  ATSC3TranslatorRoute,
  DefaultATSC3TranslatorRoute
} from '../../../../../../../core/models/dtv/output/Output';
import {
  AbstractTransport,
  ATSC3Transport,
  TranslatedRoute,
  TransportType
} from '../../../../../../../core/models/dtv/network/physical/Transport';
import {NICDescriptor} from '../../../../../../../core/models/server/NetworkSetting';
import {ClientNetworkSettingsModel} from '../../../../../../../core/models/ClientNetworkSettingsModel';
import {isDefined} from '../../../../../../../core/models/dtv/utils/Utils';
import {inRangeCheck} from '../../../../../../helpers/mathHelprrs';
import {isIPAddressValid} from '../../../../../../helpers';
import {
  ActionMessage,
  ButtonType,
  ButtonTypes,
  ImageType,
  MultipleTableColumns
} from '../../../../../../../core/models/ui/dynamicTable';
import {cloneDeep} from 'lodash';
import {
  ModalDynamicTbTranslateComponent
} from '../../../../modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {
  ModalOutputsAtsc3TranslatedRoutesComponent
} from '../modal-outputs-atsc3-translated-routes/modal-outputs-atsc3-translated-routes.component';
import {updateElementList} from '../../../../../../../core/models/AbstractElement';
import {ClientTransportsModel} from '../../../../../../../core/models/ClientTransportsModel';
import {DtvNetworkComponent} from '../../../../../../../pages/main/dtv-services/dtv-network/dtv-network.component';
import {isUndefined} from '@datorama/akita';

@Component({
  selector: 'app-modal-outputs-atsc3-translator',
  templateUrl: './modal-outputs-atsc3-translator.component.html',
  styleUrl: './modal-outputs-atsc3-translator.component.scss'
})
export class ModalOutputsAtsc3TranslatorComponent implements OnInit, OnChanges {
  @Input() output: AbstractOutput;
  @Output() okEnabledChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild(ModalDynamicTbTranslateComponent) routeDynamicTable: ModalDynamicTbTranslateComponent;
  @ViewChild(
    ModalOutputsAtsc3TranslatedRoutesComponent) translatedRoutesComponent: ModalOutputsAtsc3TranslatedRoutesComponent;
  public atsc3TranslatorOutput: ATSC3TranslatorOutput;
  public selectedTransport: AbstractTransport;
  public selectedTranslatedTransport: AbstractTransport;
  public nics: NICDescriptor[] = [];
  public translatedRoutes: TranslatedRoute[];
  public serverATSC3TranslatedTransports: ATSC3Transport[];
  public bouquetPortIconText: string;
  private bouquetPortValid = false;
  public bouquetIPIconText: string;
  private bouquetIPValid = false;
  public llsPortIconText: string;
  private llsPortValid = true;
  private okEnabled: boolean;
  public currentRoute: ATSC3TranslatorRoute;
  public tableHeaders: MultipleTableColumns[] = [
    {header: 'Transport Name', key: 'transportName', visible: true, translateField: true},
    {header: 'ID', key: 'transportId', visible: true},
    {header: 'LLS Src Port', key: 'llsSrcPort', visible: true},
    {header: 'Enabled', key: 'enabled', visible: true, showOnline: true},
  ];

  public buttonList: ButtonTypes[] = [
    {name: ButtonType.ADD, imgSrc: ImageType.add, alwaysEnabled: true},
    {name: ButtonType.EDIT, imgSrc: ImageType.edit},
    {name: ButtonType.DELETE, imgSrc: ImageType.delete, supportsMultiSelect: true},
    {name: ButtonType.UPDATEROW, imgSrc: ImageType.disable, supportsMultiSelect: true}
  ];
  localTranslatedRoutes: ATSC3TranslatorRoute [] = [];
  serverTranslatedRoutes: ATSC3TranslatorRoute[] = [];
  editMode = false;
  modalTitle = 'Add Route';
  modalName = '#addTranslatedRoute';

  constructor(@Inject(DtvNetworkComponent) private dtvNetworkComponent: DtvNetworkComponent,
              private clientNetworkSettingsModel: ClientNetworkSettingsModel,
              private cdr: ChangeDetectorRef, public transportModel: ClientTransportsModel) {
    this.nics = this.clientNetworkSettingsModel.getNetworkList();
  }

  public ngOnInit(): void {
    this.loadTranslatedRoutes();
    this.inputSettings();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.output) {
      this.output = changes.output.currentValue;
      this.loadTranslatedRoutes();
      this.loadTranslatedRowData();
    }
  }

  public inputSettings(): void {
    this.updateBouquetPortValid();
    this.updateBouquetIPValid();
    this.updateLLSPortValid();
    this.updateOkEnabled();
  }

  public updateBouquetPortValid(): void {
    this.bouquetPortValid = inRangeCheck(this.atsc3TranslatorOutput.bouquetPort, 1025, 65535);
    this.bouquetPortIconText = this.bouquetPortValid ? 'text-success' : 'text-danger';
  }

  public updateLLSPortValid(): void {
    this.llsPortValid = inRangeCheck(this.atsc3TranslatorOutput.srcPort, 1025, 65535);
    this.llsPortIconText = this.llsPortValid ? 'text-success' : 'text-danger';
  }

  public updateBouquetIPValid(): void {
    this.bouquetIPValid = isIPAddressValid(this.atsc3TranslatorOutput.bouquetIP);
    this.bouquetIPIconText = this.bouquetIPValid ? 'text-success' : 'text-danger';
  }

  private updateOkEnabled(): void {
    const oldOkEnabled = this.okEnabled;
    this.okEnabled = this.bouquetIPValid && this.bouquetPortValid && this.llsPortValid && isDefined(
      this.atsc3TranslatorOutput?.nic);
    if (oldOkEnabled !== this.okEnabled) {
      this.okEnabledChanged.emit(this.okEnabled);
    }
  }

  onButtonClicked(event) {
    switch (event.message) {
      case ActionMessage.ADD:
        this.onAddRow();
        break;
      case ActionMessage.EDIT:
        this.onEditRow();
        break;
      case ActionMessage.DELETE:
        this.onDeleteRow();
        break;
      case ActionMessage.ENABLE_DISABLE:
        this.onEnabledDisable();
        break;
    }
    this.cdr.detectChanges();
  }

  onAddRow() {
    this.editMode = false;
    this.modalTitle = 'Add Route';
    this.currentRoute = new DefaultATSC3TranslatorRoute(this.atsc3TranslatorOutput?.id);
    this.selectedTranslatedTransport = null;
    this.translatedRoutesComponent.editMode = this.editMode;
    this.translatedRoutesComponent.openModal();
  }

  onEditRow() {
    this.modalTitle = 'Edit Route';
    this.editMode = true;
    this.currentRoute = this.routeDynamicTable.selectedRow;
    this.selectedTranslatedTransport = this.getTransportForRoute(this.currentRoute);
    this.translatedRoutesComponent.updateData(this.currentRoute);
    this.translatedRoutesComponent.editMode = this.editMode;
  }

  onDeleteRow() {
    this.atsc3TranslatorOutput.routes = this.routeDynamicTable.deleteRows();
    this.cdr.detectChanges();
  }

  public onRowClicked(selectedRoute: ATSC3TranslatorRoute): void {
    if (isDefined(this.routeDynamicTable)) {
      this.currentRoute = selectedRoute;
      if (this.routeDynamicTable.selectedRowIds.length > 1) {
        if (!this.checkAllOnlineStatusMatch()) {
          this.routeDynamicTable.disableButtons([ButtonType.UPDATEROW]);
        }
      }
    }
  }

  private onEnabledDisable() {
    const updateDataCopy = this.routeDynamicTable.disableEnableRows('enabled');
    this.localTranslatedRoutes = [...updateDataCopy];
    this.atsc3TranslatorOutput.routes = this.localTranslatedRoutes;
    this.onUpdateRows();
    this.cdr.detectChanges();
  }

  private onUpdateRows() {
    if (isDefined(this.routeDynamicTable)) {
      if (!this.currentRoute.enabled) {
        this.routeDynamicTable.buttonImage = ImageType.disable;
        this.routeDynamicTable.buttonText = ButtonType.DISABLE;
      } else {
        this.routeDynamicTable.buttonImage = ImageType.enable;
        this.routeDynamicTable.buttonText = ButtonType.ENABLE;
      }
    }
  }

  private loadTranslatedRoutes() {
    this.atsc3TranslatorOutput = this.output as ATSC3TranslatorOutput;
    this.localTranslatedRoutes = this.atsc3TranslatorOutput.routes;
    this.serverTranslatedRoutes = this.localTranslatedRoutes;
    this.getATSC3Transports(this.transportModel.transportsSubject.getValue());
    this.currentRoute = new DefaultATSC3TranslatorRoute(this.atsc3TranslatorOutput?.id);
    this.translatedRoutes = this.loadTranslatedRowData();
  }

  getATSC3Transports(transports: AbstractTransport[]) {
    const atscTransports: ATSC3Transport [] = [];
    transports.forEach(transport => {
      if (transport.transportType.includes(TransportType.ATSC_3_TRANSLATED)) {
        atscTransports.push(transport as ATSC3Transport);
      }
    });
    this.serverATSC3TranslatedTransports = cloneDeep(atscTransports);
  }

  private loadTranslatedRowData() {
    const translatedRoutes: TranslatedRoute[] = [];
    this.localTranslatedRoutes = this.atsc3TranslatorOutput.routes;
    this.localTranslatedRoutes?.forEach(route => {
      const transport = this.getTransportForRoute(route);
      if (isDefined(transport)) {
        translatedRoutes.push(new TranslatedRoute(route.id, route.clientId, transport.name,
          transport.id, transport?.clientId));
      }
    });
    return translatedRoutes;
  }

  private getTransportForRoute(route: ATSC3TranslatorRoute): AbstractTransport {
    let transport: AbstractTransport = undefined;
    if (isDefined((route.transportId) && route.transportId > 0)) {
      transport = this.dtvNetworkComponent.localTransports.find(transport => transport.id === route.transportId
        && transport.transportType === TransportType.ATSC_3_TRANSLATED);
    } else if (isDefined((route.clientTransportId) && isUndefined(route.transportId))) {
      transport = this.dtvNetworkComponent.localTransports.find(
        transport => transport.clientId === route.clientTransportId
          && transport.transportType === TransportType.ATSC_3_TRANSLATED);
    }
    return transport;
  }

  routeRecordHandler(route: ATSC3TranslatorRoute) {
    this.localTranslatedRoutes = updateElementList(this.localTranslatedRoutes, route,
      this.editMode) as ATSC3TranslatorRoute[];
    this.atsc3TranslatorOutput.routes = this.localTranslatedRoutes;
    this.updateTranslateRowData();
    this.cdr.detectChanges();
  }

  private updateTranslateRowData() {
    const selectedTranslatedTransport = this.getTransportForRoute(this.currentRoute);
    const index = this.translatedRoutes.findIndex(rt =>
      this.currentRoute.id > 0 ? this.currentRoute.id === rt.id : this.currentRoute.clientId === rt.clientId
    );

    if (index !== -1) {
      this.translatedRoutes[index].transportName = selectedTranslatedTransport.name;
      this.translatedRoutes[index].transportId = selectedTranslatedTransport?.id;
      this.translatedRoutes[index].clientTransportId = selectedTranslatedTransport?.clientId;
      this.translatedRoutes = [...this.translatedRoutes];
    } else {
      const transportRoute = new TranslatedRoute(
        this.currentRoute.id,
        this.currentRoute.clientId,
        selectedTranslatedTransport.name,
        selectedTranslatedTransport.id,
        selectedTranslatedTransport?.clientId
      );
      this.translatedRoutes.push(transportRoute);
    }
    this.cdr.detectChanges();
  }

  checkAllOnlineStatusMatch(): boolean {
    const selectedRows = this.routeDynamicTable.selectedRowIds;
    if (selectedRows.length === 0) {
      return true;
    }
    const selectedRoutes = this.localTranslatedRoutes.filter(rt =>
      selectedRows.includes(rt.id)
    );
    if (selectedRoutes.length === 0) {
      return true;
    }
    const initialStatus = selectedRoutes[0].enabled;
    return selectedRoutes.every(rt => rt.enabled === initialStatus);
  }
}

