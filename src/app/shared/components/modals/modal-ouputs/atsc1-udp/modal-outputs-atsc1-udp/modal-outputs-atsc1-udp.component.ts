// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.

import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {
  AbstractOutput,
  DefaultMPEGRoute,
  getTranslatedUDPRoutes,
  MPEGRoute,
  TranslatedUDPRoute,
  UDPOutput,
  UDPRoute
} from 'src/app/core/models/dtv/output/Output';
import {
  ActionMessage,
  ButtonType,
  ButtonTypes,
  ImageType,
  MultipleTableColumns
} from 'src/app/core/models/ui/dynamicTable';
import {
  AbstractMPEGTransport,
  AbstractTransport,
  TransportType
} from '../../../../../../core/models/dtv/network/physical/Transport';
import {convertBytesToSpeed} from '../../../../../helpers/appWideFunctions';
import {DtvNetworkComponent} from '../../../../../../pages/main/dtv-services/dtv-network/dtv-network.component';
import {NICDescriptor} from '../../../../../../core/models/server/NetworkSetting';
import {ClientNetworkSettingsModel} from '../../../../../../core/models/ClientNetworkSettingsModel';
import {
  ModalDynamicTbTranslateComponent
} from '../../../modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {insertIntoElementList, updateElementList} from '../../../../../../core/models/AbstractElement';
import {inRangeCheck} from '../../../../../helpers/mathHelprrs';
import {isDefined} from '../../../../../../core/models/dtv/utils/Utils';
import {OutputUdpRouteCSVHandler} from '../../../../../CSVHandlers/OutputUdpRouteCSVHandler';
import {OutputsService} from '../../../../../../core/services/outputs.service';
import {Subscription} from 'rxjs';
import {UdpRouteData} from '../../../../../../core/models/dtv/output/OutputUdpCsvInterface';
import {BootstrapFunction} from '../../../../../../core/interfaces/interfaces';
import {ProgressBarDataInterface, ProgressBarType} from '../../../../../../core/interfaces/ProgressBarDataInterface';
import {FileUploadService} from '../../../../../../core/services/file-upload.service';
import {clearFileImportInput} from '../../../../../helpers/fileImportClearHelper';

declare var $: BootstrapFunction;

@Component({
  selector: 'app-modal-outputs-atsc1-udp',
  templateUrl: './modal-outputs-atsc1-udp.component.html',
  styleUrls: ['./modal-outputs-atsc1-udp.component.scss'],
})
export class ModalOutputsAtsc1UdpComponent implements OnInit {
  @ViewChild('fileOutputUDPInput', {static: false}) fileInput: ElementRef;
  @ViewChild(ModalDynamicTbTranslateComponent) udpRoutesDynamicTable: ModalDynamicTbTranslateComponent;
  @Input() output: AbstractOutput;
  @Output() okEnabledChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() udpOutputChanged: EventEmitter<UDPOutput> = new EventEmitter<UDPOutput>();
  public udpOutput: UDPOutput;
  public udpRoutes: MPEGRoute[];
  public translatedUDPRoutes: TranslatedUDPRoute[];
  public localMPEGTransports: AbstractMPEGTransport[];
  public selectedTransport: AbstractTransport;
  public nics: NICDescriptor[] = [];
  public editMode: boolean;
  public showAddEditModal = false;
  public tableHeaders: MultipleTableColumns[] = [
    {header: 'Transport Name', key: 'transportName', visible: true, translateField: true},
    {header: 'TSID', key: 'tsid', visible: true, translateField: true},
    {header: 'Address', key: 'address', visible: true},
    {header: 'Port', key: 'port', visible: true},
    {header: 'Bitrate', key: 'maxBitrate', visible: true, function: this.convertBytesFormat},
    {header: 'Enabled', key: 'enabled', visible: true, showOnline: true},
  ];
  public buttonList: ButtonTypes[] = [
    {name: ButtonType.ADD, imgSrc: ImageType.add, alwaysEnabled: true},
    {name: ButtonType.EDIT, imgSrc: ImageType.edit},
    {name: ButtonType.DELETE, imgSrc: ImageType.delete, supportsMultiSelect: true},
    {name: ButtonType.UPDATEROW, imgSrc: ImageType.disable, supportsMultiSelect: true},
    {name: ButtonType.IMPORT, imgSrc: ImageType.import, alwaysEnabled: true},
    {name: ButtonType.EXPORT, imgSrc: ImageType.export, supportsMultiSelect: true}
  ];
  public modalName = '#addUpdateUDPModal';
  public currentUDPRoute: MPEGRoute;
  public ttlIconText: string;
  public objectTableType = 'OutputUdpRoute-';
  public viewProgressBar = false;
  public progressModalData: ProgressBarDataInterface;
  private ttlValid: boolean;
  private okEnabled: boolean;
  public modalChildImportUdpCsv = false;
  public importUdpCsvData: UdpRouteData[];
  private outputUdpRouteCsvHandler: OutputUdpRouteCSVHandler = new OutputUdpRouteCSVHandler(this.outputsService,
    this.fileUploadService);
  private subscriptions: Subscription [] = [];
  private fileEvent: HTMLInputElement;

  // TODO finalize how non-committed (local) DTV Services data gets shared
  constructor(private clientNetworkSettingsModel: ClientNetworkSettingsModel, private outputsService: OutputsService,
              private fileUploadService: FileUploadService,
              @Inject(DtvNetworkComponent) private dtvNetworkComponent: DtvNetworkComponent,
              private cdr: ChangeDetectorRef) {
    this.nics = this.clientNetworkSettingsModel.getNetworkList();
    this.subscribeGetUdpRouteCsv();
    this.subscribeGetImportProgress();
  }

  public ngOnInit(): void {
    this.udpOutput = this.output as UDPOutput;
    this.udpRoutes = this.udpOutput.udpRoutes;
    this.getLocalMPEGTransports();
    this.updateRouteTranslateTable();
    this.inputSettings();
  }

  public ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  public modelClosedHandler(): void {
    this.showAddEditModal = false;
  }

  public udpRouteChangedHandler(udpRoute: MPEGRoute): void {
    this.udpRoutes = updateElementList(this.udpRoutes, udpRoute, this.editMode) as MPEGRoute[];
    this.udpOutput.udpRoutes = this.udpRoutes;
    this.updateRouteTranslateTable();
  }

  public convertBytesFormat(bytes: number) {
    return convertBytesToSpeed(bytes);
  }

  public onRowClicked(selectedRoute: MPEGRoute): void {
    this.currentUDPRoute = selectedRoute;
    this.onUpdateRows();
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
        this.onDeleteRows();
        break;
      case ActionMessage.ENABLE_DISABLE:
        this.onEnabledDisable();
        break;
      case ActionMessage.IMPORT:
        clearFileImportInput(this.fileInput.nativeElement);
        break;
      case ActionMessage.EXPORT:
        this.onExport();
        break;
    }
  }

  public inputSettings(): void {
    this.updateTTLValid();
    this.updateOkEnabled();
  }

  public openModalUdpImportCSV() {
    this.modalChildImportUdpCsv = true;
    setTimeout(() => {
      $('#modalChildImportUdpCsv').modal('show');
    }, 0);
  }

  public outputUdpImportChangeHandler($event: { action: string; data: UDPOutput; }) {
    if ($event.action === 'importCsvOutputUdpData') {
      const importData = $event.data;
      this.modalChildImportUdpCsv = false;
      this.udpOutput = importData;
      importData.udpRoutes.forEach((udpRoute: UDPRoute) => {
        this.currentUDPRoute = udpRoute as MPEGRoute;
        this.updateCurrentUDPRoute();
      });
      this.updateRouteTranslateTable();

    }
    if ($event.action === 'closeImportButton') {
      this.modalChildImportUdpCsv = false;
      $('#modalChildImportUdpCsv').modal('hide');
    }
  }

  public fileProgressModalHandler() {
    console.log('progressModalHandler');
    setTimeout(() => {
      $('#modal-progress-bar').modal('hide');
      this.viewProgressBar = false;
    }, 100);
  }

  private onEnabledDisable() {
    if (this.udpRoutesDynamicTable.selectedRowIds.length > 1) {
      this.onUpdateAllRows();
    } else if (this.udpRoutesDynamicTable.selectedRowIds.length === 1) {
      this.currentUDPRoute.enabled = !this.currentUDPRoute.enabled;
      this.updateCurrentUDPRoute();
      this.onUpdateRows();
    }
  }

  private updateCurrentUDPRoute() {
    if (isDefined(this.udpRoutes)) {
      this.udpRoutes = insertIntoElementList(this.udpRoutes, this.currentUDPRoute) as MPEGRoute[];
    } else {
      this.udpRoutes = updateElementList(this.udpRoutes, this.currentUDPRoute, this.editMode) as MPEGRoute[];
    }
    this.udpOutput.udpRoutes = this.udpRoutes;
  }

  private onUpdateAllRows() {
    const updateDataCopy = this.udpRoutesDynamicTable.disableEnableRows('enabled');
    this.udpRoutes = [...updateDataCopy];
    this.udpOutput.udpRoutes = this.udpRoutes;
    this.onUpdateRows();
    this.cdr.detectChanges();
  }

  private onUpdateRows() {
    if (isDefined(this.udpRoutesDynamicTable)) {
      if (this.currentUDPRoute?.enabled) {
        this.udpRoutesDynamicTable.buttonImage = ImageType.disable;
        this.udpRoutesDynamicTable.buttonText = ButtonType.DISABLE;
      } else {
        this.udpRoutesDynamicTable.buttonImage = ImageType.enable;
        this.udpRoutesDynamicTable.buttonText = ButtonType.ENABLE;
      }
    }
  }

  private onAddRow() {
    this.editMode = false;
    this.currentUDPRoute = new DefaultMPEGRoute(this.output.id);
    this.objectTableType = 'OutputUdpRoute-' + this.currentUDPRoute.transportId;
    this.showAddEditModal = true;
  }

  private onEditRow() {
    this.editMode = true;
    this.currentUDPRoute = this.udpRoutesDynamicTable.selectedRow;
    this.objectTableType = 'OutputUdpRoute-' + this.currentUDPRoute.transportId;
    this.selectedTransport = this.localMPEGTransports.find(
      transport => transport.id === this.currentUDPRoute.transportId);
    this.showAddEditModal = true;
  }

  private onDeleteRows() {
    this.udpOutput.udpRoutes = this.udpRoutesDynamicTable.deleteRows();
    this.cdr.detectChanges();
  }

  public onImport(event: Event) {
    this.fileEvent = event?.target as HTMLInputElement;
    if (this.fileEvent.files && this.fileEvent.files.length > 0) {
      this.openFileUploadModal(ProgressBarType.IMPORT);
    }
  }

  private openFileUploadModal(type: ProgressBarType) {
    this.viewProgressBar = true;
    setTimeout(() => {
      $('#modal-progress-bar').modal('show');
    }, 100);
    if (type === ProgressBarType.IMPORT) {
      this.outputUdpRouteCsvHandler.onImportFileHandler(this.fileEvent, this.udpRoutes, this.localMPEGTransports);
    } else {
      this.outputUdpRouteCsvHandler.onExport(this.udpRoutes, this.translatedUDPRoutes);
    }
  }

  private onExport() {
    this.openFileUploadModal(ProgressBarType.EXPORT);
  }

  private updateTTLValid(): void {
    this.ttlValid = inRangeCheck(this.udpOutput.ttl, 1, 255);
    this.ttlIconText = this.ttlValid ? 'text-success' : 'text-danger';
  }

  private updateOkEnabled(): void {
    const oldOkEnabled = this.okEnabled;
    this.okEnabled = this.ttlValid && isDefined(this.udpOutput.networkInterfaceName);
    if (oldOkEnabled !== this.okEnabled) {
      this.okEnabledChanged.emit(this.okEnabled);
    }
  }

  private getLocalMPEGTransports(): void {
    this.localMPEGTransports = this.dtvNetworkComponent.localTransports.filter(
      transport => transport.transportType === TransportType.ATSC_PSIP_TERRESTRIAL ||
        transport.transportType === TransportType.ATSC_PSIP_CABLE) as AbstractMPEGTransport[];
  }

  private updateRouteTranslateTable(): void {
    this.translatedUDPRoutes = getTranslatedUDPRoutes(this.udpRoutes, this.localMPEGTransports);
  }

  private subscribeGetUdpRouteCsv() {
    this.subscriptions.push(this.outputsService.getDataOutputUdpRouteCSV().subscribe((data) => {
      if (data !== undefined) {
        this.importUdpCsvData = data;
        this.openModalUdpImportCSV();
      }
    }));
  }

  private subscribeGetImportProgress() {
    this.subscriptions.push(this.fileUploadService.getImportProgress().subscribe((data) => {
      if (data !== undefined) {
        console.log('getImportProgress', data);
        this.progressModalData = data;
      }
    }));
  }
}
