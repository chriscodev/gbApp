// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {numberOnly} from '../../../../../shared/helpers/appWideFunctions';
import {cloneDeep, isEqual} from 'lodash';
import {
  AbstractPSIPTransport,
  AbstractTransport,
  ATSC3TranslatedTransport,
  ATSC3Transport,
  DefaultATSC3TranslatedTransport,
  DefaultATSC3Transport,
  DefaultCablePSIPTransport,
  DefaultTerrestialPSIPTransport,
  TRANSPORT_TYPES,
  TransportsChangedEvent,
  TransportType
} from 'src/app/core/models/dtv/network/physical/Transport';
import {
  ActionMessage,
  ButtonType,
  ButtonTypes,
  ImageType,
  MultipleTableColumns
} from '../../../../../core/models/ui/dynamicTable';
import {ClientTransportsModel} from 'src/app/core/models/ClientTransportsModel';
import {ClientLicenseModel} from 'src/app/core/models/ClientLicenseModel';
import {
  ModalDynamicTbTranslateComponent
} from 'src/app/shared/components/modals/modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {LicensedNetworkType, ServerLicense, ServerLicenseInfo} from 'src/app/core/models/server/License';
import {isDefined} from 'src/app/core/models/dtv/utils/Utils';
import {isElementNameUnique} from '../../../../../core/models/AbstractElement';
import {TransportCSVHandler} from '../../../../../shared/CSVHandlers/TransportCSVHandler';
import {
  ModalPsipTransportStreamComponent
} from '../../../../../shared/components/modals/modal-transport/atsc/psip/modal-psip-transport-stream/modal-psip-transport-stream.component';
import {numberToHex} from '../../../../../shared/helpers/decimalToHexadecimal';
import {
  ModalTransportAtsc3TransportStreamComponent
} from '../../../../../shared/components/modals/modal-transport/atsc/atsc3/modal-transport-atsc3-transport-stream/modal-transport-atsc3-transport-stream.component';
import {BootstrapFunction, ClickEvent} from '../../../../../core/interfaces/interfaces';
import {TransportService} from '../../../../../core/services/transport.service';
import {Subscription} from 'rxjs';
import {MediaStream} from '../../../../../core/models/dtv/network/physical/stream/ip/media/MediaStream';
import {ClientMediaStreamsModel} from '../../../../../core/models/ClientMediaStreamsModel';
import {ServiceGroup} from '../../../../../core/models/dtv/network/physical/stream/ip/service-group/ServiceGroup';
import {
  ModalTransportAtsc3TranslatedTransportStreamComponent
} from '../../../../../shared/components/modals/modal-transport/atsc/atsc3/modal-transport-atsc3-translated-transport-stream/modal-transport-atsc3-translated-transport-stream.component';
import {ProgressBarDataInterface, ProgressBarType} from '../../../../../core/interfaces/ProgressBarDataInterface';
import {FileUploadService} from '../../../../../core/services/file-upload.service';
import {clearFileImportInput} from '../../../../../shared/helpers/fileImportClearHelper';

declare var _: any;
declare var $: BootstrapFunction;

// TODO resolve issue with testing private things (nameValid, tsidValid, addRow, loadServerTransports)
@Component({
  selector: 'app-transport',
  templateUrl: './transport.component.html',
  styleUrls: ['./transport.component.scss'],
})
export class TransportComponent implements OnInit, OnDestroy {
  @ViewChild('fileTransportInput', {static: false}) fileInput: ElementRef;
  @ViewChild(ModalDynamicTbTranslateComponent) transportsDynamicTable: ModalDynamicTbTranslateComponent;
  @ViewChild(ModalPsipTransportStreamComponent) modalPsipTransportStreamComponent: ModalPsipTransportStreamComponent;
  @ViewChild(
    ModalTransportAtsc3TransportStreamComponent) modalAtsc3TransportStreamComponent: ModalTransportAtsc3TransportStreamComponent;
  @ViewChild(
    ModalTransportAtsc3TranslatedTransportStreamComponent) modalAtsc3TranslatedTransportStreamComponent: ModalTransportAtsc3TranslatedTransportStreamComponent;
  @Output() transportsChanged: EventEmitter<TransportsChangedEvent> = new EventEmitter<TransportsChangedEvent>();
  public readonly TransportType = TransportType;
  public readonly TRANSPORT_TYPES = TRANSPORT_TYPES;
  public readonly transportTypes: TransportType[] = [];
  public readonly numberOnly = numberOnly;
  public readonly numberToHex = numberToHex;
  public localTransports: AbstractTransport[] = [];
  public currentTransportStream: AbstractTransport;
  public tsidLabel = 'TSID';
  public editMode: boolean;
  public buttonList: ButtonTypes[] = [
    {name: ButtonType.ADD, imgSrc: ImageType.add, alwaysEnabled: true},
    {name: ButtonType.EDIT, imgSrc: ImageType.edit},
    {name: ButtonType.DELETE, imgSrc: ImageType.delete, supportsMultiSelect: true},
    {name: ButtonType.IMPORT, imgSrc: ImageType.import, alwaysEnabled: true},
    {name: ButtonType.EXPORT, imgSrc: ImageType.export, supportsMultiSelect: true},
  ];
  public tableHeaders: MultipleTableColumns[] = [
    {header: 'Name', key: 'name', visible: true},
    {header: 'Type', key: 'transportType', visible: true, function: this.getTransportTypeDisplayName},
    {header: 'TSID/BSID', key: 'tsid', visible: true, translateField: true, showHex: true}
  ];
  public readonly modalName = '#transportModal';
  public addUpdateNextEnabled = false;
  public nameExists = false;
  public nameIconText: string;
  public tsidIconText: string;
  public modalTitle: string;
  public initialPage = true;
  public modalImportCSVData = {};
  public modalChildImportCSVData = false;
  public serverTransports: AbstractTransport[] = [];
  // TODO file progress variables for import
  public viewProgressBar = false;
  public progressModalData: ProgressBarDataInterface;
  private nameValid = false;
  private tsidValid = false;
  private transportCSVHandler: TransportCSVHandler = new TransportCSVHandler(this.transportService,
    this.fileUploadService);
  private dirty = false;
  private maxTransports: number;
  private subscriptions: Subscription [] = [];
  private fileEvent: HTMLInputElement;

  public constructor(
    private changeDetectorRef: ChangeDetectorRef, private clientTransportsModel: ClientTransportsModel,
    private clientLicenseModel: ClientLicenseModel, private clientMediaStreamsModel: ClientMediaStreamsModel,
    private transportService: TransportService,
    private fileUploadService: FileUploadService
  ) {
    this.subscriptions.push(this.clientLicenseModel.serverLicenseInfo$.subscribe((serverLicenseInfo) => {
      this.initializeLicensableVariables(serverLicenseInfo);
      this.currentTransportStream = this.createDefaultTransport(false);
      this.updateTSIDLabel();
    }));

    this.subscriptions.push(this.transportService.getDataTransportCSV().subscribe((data) => {
      if (data !== undefined) {
        this.editMode = true;
        this.modalChildImportCSVData = true;
        this.modalImportCSVData = data;
        this.reconcileCurrentTransport();
        this.openModalImportCSV();
      }
    }));

    this.subscriptions.push(this.fileUploadService.getImportProgress().subscribe((data) => {
      if (data !== undefined) {
        console.log('getImportProgress', data);
        this.progressModalData = data;
      }
    }));
  }

  public ngOnInit(): void {
    this.loadServerTransports();
    this.validateMaxTransportsLimitCheck();
  }

  public ngOnDestroy(): void {
    this.subscriptions?.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public onChangeTransportType(): void {
    this.currentTransportStream = this.createDefaultTransport(true);
    this.updateTSIDLabel();
    this.updateTSIDValid();
    this.updateModalTitle();
    this.updateOkNextEnabled();
  }

  public onRevert(): void {
    this.loadServerTransports();
  }

  public validateName(): void {
    this.updateModalTitle();
    this.updateNameValid();
    this.updateOkNextEnabled();
  }

  public validateTSID(): void {
    this.updateTSIDValid();
    this.updateOkNextEnabled();
  }

  public isPSIPTransport(): boolean {
    return this.currentTransportStream.transportType === TransportType.ATSC_PSIP_TERRESTRIAL ||
      this.currentTransportStream.transportType === TransportType.ATSC_PSIP_CABLE;
  }

  public addUpdateCurrentTransport(): void {
    this.reconcileCurrentTransport();
    if (this.transportsDynamicTable.selectedRow !== null && this.editMode) {
      this.updateCurrentTransport();
    } else {
      this.localTransports = [...this.localTransports, this.currentTransportStream];
    }
    this.updateDirty();
    this.validateMaxTransportsLimitCheck();
    this.initialPage = true;
  }

  public onButtonClicked($event: ClickEvent): void {
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
      case ActionMessage.EXPORT:
        this.onExport();
        break;
      case ActionMessage.IMPORT:
        clearFileImportInput(this.fileInput.nativeElement);
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  public clickNext(): void {
    this.initialPage = false;
  }

  public clickPrev(): void {
    this.initialPage = true;
    this.updateModalTitle();
  }

  public closeModal(): void {
    this.initialPage = true;
    this.changeDetectorRef.detectChanges();
  }

  public getTransportTypeDisplayName(transportType: TransportType): string {
    return TRANSPORT_TYPES[transportType]?.displayName || transportType.toString();
  }

  public openModalImportCSV(): void {
    this.modalChildImportCSVData = true;
    setTimeout(() => {
      $('#modalTransportImportCSv').modal('show');
    }, 0);
  }

  public transportImportChangedHandler($event): void {
    if ($event.action === 'importButton') {
      this.localTransports = [...this.localTransports, ...$event.dataParent];
      this.modalChildImportCSVData = false;
      $('#modalTransportImportCSv').modal('hide');
      this.addUpdateCurrentTransport();
    } else if ($event.action === 'closeImportButton') {
      this.modalChildImportCSVData = false;
      $('#modalTransportImportCSv').modal('hide');
    }
  }

  public clickTransportRow(): void {
    const transportDynamicTable = this.transportsDynamicTable;
    if (transportDynamicTable?.tableData && transportDynamicTable.selectedRows?.length > 0) {
      const uniqueTransportTypes = [...new Set(transportDynamicTable.selectedRows.map(item => item.transportType))];
      const exportButton: HTMLElement = document.getElementById('Export-Transport');
      if (exportButton.hasAttribute('disabled')) {
        exportButton.removeAttribute('disabled');
      }
      if (uniqueTransportTypes.includes(TransportType.ATSC_3) || uniqueTransportTypes.includes(
        TransportType.ATSC_3_TRANSLATED)) {
        exportButton.setAttribute('disabled', 'true');
      }
    }
  }

  public fileProgressModalHandler(): void {
    console.log('progressModalHandler');
    setTimeout(() => {
      $('#modal-progress-bar').modal('hide');
      this.viewProgressBar = false;

    }, 100);

  }

  private onAddRow(): void {
    this.editMode = false;
    this.currentTransportStream = this.createDefaultTransport(false);
    this.updateCurrentTransportFields();
  }

  private loadServerTransports(): void {
    this.subscriptions.push(this.clientTransportsModel.transports$.subscribe((transportList: AbstractTransport[]) => {
        const transportCommitInProcess: boolean = localStorage.getItem('transportCommitInProcess') === 'true';
        this.localTransports = transportList;
        this.serverTransports = transportList;
        if (this.dirty && !transportCommitInProcess) {
          this.validateIPStreamLinks();
        } else {
          this.localTransports = cloneDeep(this.serverTransports);
        }
        this.updateDirty();
        localStorage.setItem('transportCommitInProcess', 'false');
        this.validateMaxTransportsLimitCheck();
        this.changeDetectorRef.detectChanges();
      })
    );
  }

  private onEditRow(): void {
    this.editMode = true;
    this.currentTransportStream = cloneDeep(this.transportsDynamicTable.selectedRow);
    this.updateCurrentTransportFields();
  }

  private onDeleteRow(): void {
    this.multipleDeletion();
    this.updateDirty();
    this.validateMaxTransportsLimitCheck();
  }

  private onExport(): void {
    this.openFileUploadModal(ProgressBarType.EXPORT);
  }

  public openImportFile(event): void {

    this.fileEvent = event?.target as HTMLInputElement;
    if (this.fileEvent.files && this.fileEvent.files.length > 0) {
      this.openFileUploadModal(ProgressBarType.IMPORT);
    }
  }

  private openFileUploadModal(type: ProgressBarType): void {
    this.viewProgressBar = true;
    setTimeout(() => {
      $('#modal-progress-bar').modal('show');
    }, 100);

    if (type === ProgressBarType.IMPORT) {
      const maxAdditionalTransportStreams = this.maxTransports - this.localTransports.length;
      this.transportCSVHandler.openImportFileHandler(this.fileEvent, maxAdditionalTransportStreams,
        cloneDeep(this.localTransports));
    } else {
      this.transportCSVHandler.onExport(this.transportsDynamicTable.selectedRows);
    }
  }

  private multipleDeletion(): void {
    this.localTransports = this.transportsDynamicTable.deleteRows();
  }

  private getSelectedTransportStreams(): AbstractTransport[] {
    const selectedTransportStreams: AbstractTransport[] = [];
    if (isDefined(this.transportsDynamicTable.selectedRowIds)) {
      for (let i = 0; i < this.transportsDynamicTable.selectedRowIds.length; i++) {
        const selectID = this.transportsDynamicTable?.selectedRowIds[i];
        const selectedTransportStream = this.localTransports.find(transportStream => {
          const idMatch = transportStream.id.toString() !== selectID.toString();
          const clientIdMatch = transportStream.clientId !== selectID.toString();
          return idMatch && clientIdMatch;
        });
        if (isDefined(selectedTransportStream)) {
          selectedTransportStreams.push(selectedTransportStream);
        }
      }
    }
    console.log('getSelectedTransportStreams', selectedTransportStreams);
    return selectedTransportStreams;
  }

  private updateDirty(): void {
    this.dirty = !isEqual(this.localTransports, this.serverTransports);
    if (this.dirty) {
      console.log('transport.component updateDirty is dirty ' + this.dirty);
      console.log('transport.component this.localTransports: ', this.localTransports);
      console.log('transport.component this.serverTransports: ', this.serverTransports);
    }
    this.transportsChanged.emit(new TransportsChangedEvent(this.dirty, this.localTransports));
  }

  private reconcileCurrentTransport(): void {
    switch (this.currentTransportStream.transportType) {
      case TransportType.ATSC_PSIP_CABLE:
      case TransportType.ATSC_PSIP_TERRESTRIAL:
        this.reconcileCurrentPSIPTransport();
        break;
      case TransportType.ATSC_3:
        this.reconcileCurrentATSC3Transport();
        break;
      case TransportType.ATSC_3_TRANSLATED:
        this.reconcileCurrentATSC3TranslatedTransport();
        break;
    }
  }

  private reconcileCurrentPSIPTransport(): void {
    const localPsipTransport: AbstractPSIPTransport = isDefined(
      this.modalPsipTransportStreamComponent) ? this.modalPsipTransportStreamComponent.getLocalPsipTransportStream() : undefined;
    const reconciledTransport: AbstractPSIPTransport = isDefined(
      localPsipTransport) ? localPsipTransport : this.currentTransportStream as AbstractPSIPTransport;
    reconciledTransport.name = this.currentTransportStream.name;
    reconciledTransport.tsid = this.currentTransportStream.tsid;
    this.currentTransportStream = reconciledTransport;
    console.log('reconcileCurrentPSIPTransport, this.currentTransportStream: ', this.currentTransportStream);
  }

  private reconcileCurrentATSC3Transport(): void {
    const localAtsc3Transport: ATSC3Transport = isDefined(
      this.modalPsipTransportStreamComponent) ? this.modalAtsc3TransportStreamComponent.getAtsc3TransportStream() : undefined;
    const reconciledTransport: ATSC3Transport = isDefined(
      localAtsc3Transport) ? localAtsc3Transport : this.currentTransportStream as ATSC3Transport;
    reconciledTransport.name = this.currentTransportStream.name;
    reconciledTransport.tsid = this.currentTransportStream.tsid;
    this.currentTransportStream = reconciledTransport;
    console.log('reconcileCurrentATSC3Transport, this.currentTransportStream: ', this.currentTransportStream);
  }


  private reconcileCurrentATSC3TranslatedTransport(): void {
    const localAtsc3TranslatedTransport: ATSC3TranslatedTransport = isDefined(
      this.modalAtsc3TranslatedTransportStreamComponent) ? this.modalAtsc3TranslatedTransportStreamComponent.getAtsc3TranslatedTransportStream() : undefined;
    const reconciledTransport: ATSC3TranslatedTransport = isDefined(
      localAtsc3TranslatedTransport) ? localAtsc3TranslatedTransport : this.currentTransportStream as ATSC3TranslatedTransport;
    reconciledTransport.name = this.currentTransportStream.name;
    reconciledTransport.tsid = this.currentTransportStream.tsid;
    this.currentTransportStream = reconciledTransport;
    console.log('reconcileCurrentATSC3TranslatedTransport, this.currentTransportStream: ', this.currentTransportStream);
  }

  private updateCurrentTransport(): void {
    const index = this.localTransports.findIndex(
      (transport) => this.currentTransportStream?.id > 0 ?
        transport?.id === this.currentTransportStream.id :
        transport.clientId === this.currentTransportStream.clientId);
    if (index !== -1) {
      this.localTransports = [...this.localTransports.slice(0,
        index), this.currentTransportStream, ...this.localTransports.slice(
        index + 1)];
    }
  }

  private initializeLicensableVariables(serverLicenseInfo: ServerLicenseInfo): void {
    if (isDefined(serverLicenseInfo?.serverLicense)) {
      this.initializeTransportTypes(serverLicenseInfo.serverLicense);
      this.maxTransports = serverLicenseInfo.serverLicense.maxTransports;
    }
  }

  private initializeTransportTypes(serverLicense: ServerLicense): void {
    serverLicense.licensedNetworkTypes.forEach(licensedNetworkType => {
      switch (licensedNetworkType) {
        case LicensedNetworkType.PSIP:
          this.transportTypes.push(TransportType.ATSC_PSIP_TERRESTRIAL);
          this.transportTypes.push(TransportType.ATSC_PSIP_CABLE);
          break;
        case LicensedNetworkType.ATSC_3:
          this.transportTypes.push(TransportType.ATSC_3);
          break;
        case LicensedNetworkType.ATSC_3_TRANSLATED:
          this.transportTypes.push(TransportType.ATSC_3_TRANSLATED);
          break;
      }
    });
    if (this.transportTypes.length === 0) {
      this.transportsDynamicTable.disableButtons([ButtonType.ADD]);
    }
  }

  private validateMaxTransportsLimitCheck(): void {
    const limitReached = this.localTransports?.length >= this.maxTransports;
    this.buttonList[0].restricted = limitReached;
    if (limitReached) {
      this.transportsDynamicTable.disableButtons([ButtonType.ADD]);
    }
  }

  private updateCurrentTransportFields(): void {
    this.updateTSIDLabel();
    this.updateTransportValid();
  }

  private updateTransportValid(): void {
    this.updateModalTitle();
    this.updateNameValid();
    this.updateTSIDValid();
    this.updateOkNextEnabled();
  }

  private updateModalTitle(): void {
    this.modalTitle =
      (this.editMode ? 'Edit ' : 'Add ') + ' Transport Stream ' +
      (this.currentTransportStream?.name.length > 0 ? ' - ' : '') +
      this.currentTransportStream?.name;
  }

  private updateNameValid(): void {
    this.updateNameExists();
    this.nameValid = !this.nameExists && this.currentTransportStream?.name.length > 0;
    this.nameIconText = this.nameValid ? 'text-success' : 'text-danger';
  }

  private updateTSIDValid(): void {
    const zeroAllowed = this.currentTransportStream?.transportType === TransportType.ATSC_PSIP_CABLE;
    const minValue = zeroAllowed ? 0 : 1;
    this.tsidValid = isDefined(this.currentTransportStream?.tsid) && this.currentTransportStream?.tsid >= minValue;
    this.tsidIconText = this.tsidValid ? 'text-success' : 'text-danger';
  }

  private updateTSIDLabel(): void {
    this.tsidLabel = this.currentTransportStream?.transportType === TransportType.ATSC_3 || this.currentTransportStream?.transportType === TransportType.ATSC_3_TRANSLATED ? 'BSID' : 'TSID';
  }

  private updateOkNextEnabled(): void {
    this.addUpdateNextEnabled = this.nameValid && this.tsidValid;
  }

  private updateNameExists(): void {
    this.nameExists = isElementNameUnique(this.currentTransportStream, this.localTransports, this.editMode);
  }

  private createDefaultTransport(preserveFields: boolean): AbstractTransport {
    const transportStreamExists = isDefined(this.currentTransportStream);
    const tsid = preserveFields && transportStreamExists ? this.currentTransportStream.tsid : undefined;
    const name = preserveFields && transportStreamExists ? this.currentTransportStream.name : '';
    const transportType = transportStreamExists ? this.currentTransportStream.transportType :
      this.transportTypes.length > 0 ? this.transportTypes[0] : undefined;
    let defaultTransport: AbstractTransport;
    switch (transportType) {
      case TransportType.ATSC_PSIP_TERRESTRIAL:
        defaultTransport = new DefaultTerrestialPSIPTransport(tsid, name);
        break;
      case TransportType.ATSC_PSIP_CABLE:
        defaultTransport = new DefaultCablePSIPTransport(tsid, name);
        break;
      case TransportType.ATSC_3:
        defaultTransport = new DefaultATSC3Transport(tsid, name);
        break;
      case TransportType.ATSC_3_TRANSLATED:
        defaultTransport = new DefaultATSC3TranslatedTransport(tsid, name);
        break;
    }
    return defaultTransport !== undefined ? defaultTransport : new DefaultTerrestialPSIPTransport(tsid, name);
  }

  private validateIPStreamLinks(): void {
    const mediaStreams: MediaStream[] = this.clientMediaStreamsModel.getMediaStreams();
    if (this.currentTransportStream.transportType === TransportType.ATSC_3) {
      this.validateTransportIPStreamLinks(this.currentTransportStream as ATSC3Transport, mediaStreams);
    }
    this.localTransports.forEach(transport => {
      if (transport.transportType === TransportType.ATSC_3) {
        this.validateTransportIPStreamLinks(transport as ATSC3Transport, mediaStreams);
      }
    });
    this.refreshServerTransports();
  }

  private validateTransportIPStreamLinks(atsc3Transport: ATSC3Transport, mediaStreams: MediaStream[]): void {
    atsc3Transport.serviceGroups.forEach(
      serviceGroup => this.validateServiceGroupIPStreamLinks(serviceGroup, mediaStreams));
  }

  private validateServiceGroupIPStreamLinks(serviceGroup: ServiceGroup, mediaStreams: MediaStream[]): void {
    this.validateIPStreamLink(serviceGroup, mediaStreams);
  }

  private validateIPStreamLink(serviceGroup: ServiceGroup, mediaStreams: MediaStream[]): void {
    serviceGroup.ipStreams = serviceGroup.ipStreams.filter(atsc3Stream => {
      let streamValid = true;
      if (atsc3Stream.linkedStreamId > 0) {
        streamValid = isDefined(
          mediaStreams.find(mediaStream => mediaStream.id === atsc3Stream.linkedStreamId));
        if (!streamValid) {
          console.log('transport validateIPStreamLink, removing atsc3Stream: ', atsc3Stream);
        }
      }
      return streamValid;
    });
  }

  private refreshServerTransports(): void {
    this.serverTransports = this.clientTransportsModel.getTransports();
    this.updateDirty();
  }
}
