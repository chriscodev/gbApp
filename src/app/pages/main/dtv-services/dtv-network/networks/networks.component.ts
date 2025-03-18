// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.

import {Component, ElementRef, EventEmitter, Inject, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {
  AbstractNetwork,
  AbstractTerrestrialATSCNetwork,
  DefaultATSC3Network,
  DefaultCableATSCNetwork,
  DefaultTerrestrialATSCNetwork,
  NETWORK_TYPES,
  NetworksChangedEvent,
  NetworkTransportLinking,
  NetworkType
} from '../../../../../core/models/dtv/network/logical/Network';
import {Subscription} from 'rxjs';
import {ActionMessage, ButtonType, ImageType} from '../../../../../core/models/ui/dynamicTable';

import {ClientLicenseModel} from '../../../../../core/models/ClientLicenseModel';
import {LicensedNetworkType, ServerLicense, ServerLicenseInfo} from '../../../../../core/models/server/License';
import {isDefined} from '../../../../../core/models/dtv/utils/Utils';
import {ClientNetworksModel} from '../../../../../core/models/ClientNetworksModel';
import {cloneDeep, isEqual} from 'lodash';
import {isElementIdMatch} from '../../../../../core/models/AbstractElement';
import {
  ModalDynamicTbTranslateComponent
} from '../../../../../shared/components/modals/modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {
  ModalNetworksAtscNetworkComponent
} from '../../../../../shared/components/modals/modal-networks/modal-networks-atsc-network/modal-networks-atsc-network.component';
import {NetworkCSVHandler} from '../../../../../shared/CSVHandlers/NetworkCSVHandler';
import {AbstractATSCChannel} from '../../../../../core/models/dtv/network/logical/Channel';
import {AbstractATSCService, isATSCService} from '../../../../../core/models/dtv/network/logical/Service';
import {BootstrapFunction, ClickEvent} from '../../../../../core/interfaces/interfaces';
import {ProgressBarDataInterface, ProgressBarType} from '../../../../../core/interfaces/ProgressBarDataInterface';
import {FileUploadService} from '../../../../../core/services/file-upload.service';
import {DtvNetworkComponent} from '../dtv-network.component';
import {NON_ATSC3_SERVICE_TYPES_CODE} from '../../../../../core/models/dtv/importExport/importExport';
import {clearFileImportInput} from '../../../../../shared/helpers/fileImportClearHelper';

declare var $: BootstrapFunction;

@
  Component({
    selector: 'app-networks',
    templateUrl: './networks.component.html',
    styleUrls: ['./networks.component.scss']
  })
export class NetworksComponent implements OnInit, OnDestroy {
  @ViewChild('fileNetworkInput', {static: false}) fileInput: ElementRef;
  @ViewChild(ModalNetworksAtscNetworkComponent) myModalNetworksAtscNetworkComponent: ModalNetworksAtscNetworkComponent;
  @ViewChild(ModalDynamicTbTranslateComponent) networksDynamicTable: ModalDynamicTbTranslateComponent;
  @Output() networksChangedEmitter: EventEmitter<NetworksChangedEvent> = new EventEmitter();
  public readonly NETWORK_TYPES2 = NETWORK_TYPES;
  public readonly networkTypes: NetworkType[] = [];
  public readonly modalName = '#networkNewModal';
  public nameExists = false;
  public addUpdateNextEnabled = false;
  public iconTextName: string;
  public modalTitle: string;
  public subscriptions: Subscription[] = [];
  public editMode: boolean;
  public initialPage = true;
  public tableHeaders = [
    {header: 'Name', key: 'name', visible: true},
    {header: 'Type', key: 'networkType', visible: true, function: this.getNetworkTypeDisplayName},
  ];
  public buttonList = [
    {name: ButtonType.ADD, imgSrc: ImageType.add, supportsMultiSelect: true, alwaysEnabled: true},
    {name: ButtonType.EDIT, imgSrc: ImageType.edit, supportsMultiSelect: false},
    {name: ButtonType.DELETE, imgSrc: ImageType.delete, supportsMultiSelect: true},
    {name: ButtonType.IMPORT, imgSrc: ImageType.import, supportsMultiSelect: true, alwaysEnabled: true},
    {name: ButtonType.EXPORT, imgSrc: ImageType.export, supportsMultiSelect: true, disable: false},
  ];
  public localNetworks: AbstractNetwork[] = [];
  public currentNetworkStream: AbstractNetwork;
  public modalImportCSVData = {};
  public modalChildImportCSVData = false;
  public serverNetworks: AbstractNetwork[] = [];
  private nameValid = false;
  private dirty: boolean;
  private networkCSVHandler: NetworkCSVHandler = new NetworkCSVHandler(this.fileUploadService);

  // TODO file progress variables for import
  public viewProgressBar = false;
  public progressModalData: ProgressBarDataInterface;
  private fileEvent: HTMLInputElement;

  constructor(
    private clientNetworksModel: ClientNetworksModel,
    private clientLicenseModel: ClientLicenseModel,
    private networkTransportLinking: NetworkTransportLinking,
    private fileUploadService: FileUploadService,
    @Inject(DtvNetworkComponent) private dtvNetworkComponent: DtvNetworkComponent
  ) {
    this.subscriptions.push(this.networkTransportLinking.getDataNetworkCSV().subscribe((data) => {
      if (data !== undefined) {
        this.currentNetworkStream = cloneDeep(data);
        this.modalChildImportCSVData = true;
        this.modalImportCSVData = cloneDeep(data);
        this.reconcileCurrentNetworks();
        this.openModalImportCSV();
      }
    }));

    this.subscriptions.push(this.fileUploadService.getImportProgress().subscribe((data) => {
      if (data !== undefined) {
        this.progressModalData = data;
      }
    }));

  }

  public ngOnInit(): void {
    const val = 'Audio';
    console.log('test only darl: ', NON_ATSC3_SERVICE_TYPES_CODE[val].serviceCode);
    this.subscriptions.push(
      this.clientLicenseModel.serverLicenseInfo$.subscribe((serverLicenseInfo) => {
        this.initializeLicensableVariables(serverLicenseInfo);
        this.currentNetworkStream = this.createDefaultNetwork(false);
      })
    );
    this.loadServerNetworks();
  }

  public ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  public openModalImportCSV() {
    this.modalChildImportCSVData = true;
    setTimeout(() => {
      $('#modalNetworkImportCSv').modal('show');
    }, 0);
  }

  public networkImportChangedHandler($event) {
    if ($event.action === 'importButton') {
      this.modalChildImportCSVData = false;
      this.addUpdateCurrentNetwork();
    }
  }

  public addUpdateCurrentNetwork() {
    this.reconcileCurrentNetworks();
    if (this.networksDynamicTable.selectedRow !== null && this.editMode) {
      this.updateCurrentNetworks();
    } else {
      this.localNetworks = this.localNetworks.concat(this.currentNetworkStream);
    }
    this.updateDirty();
    this.initialPage = true;
  }

  public onRevert() {
    this.loadServerNetworks();
  }

  public clickNetworkRow() {
    if (this.networksDynamicTable?.tableData && this.networksDynamicTable.selectedRows?.length > 0) {
      const uniqueNetworkType = this.networksDynamicTable.selectedRows.map(item => item.networkType).filter(
        (value, index, self) => self.indexOf(value) === index);
      const exportButton = document.getElementById('Export-Network');
      if (exportButton.hasAttribute('disabled')) {
        exportButton.removeAttribute('disabled');
      }
      if (uniqueNetworkType.includes(NetworkType.ATSC_3)) {
        exportButton.setAttribute('disabled', 'true');
      }
    }
  }

  public onButtonClicked(event: ClickEvent) {
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
      case ActionMessage.EXPORT:
        this.onExport();
        break;
      case ActionMessage.IMPORT:
        clearFileImportInput(this.fileInput.nativeElement);
        break;
    }
  }

  public clickNext() {
    this.initialPage = false;
  }

  public clickPrev() {
    this.initialPage = true;
    this.updateModalTitle();
  }

  public isATSCNetworks(): boolean {
    return this.currentNetworkStream.networkType === NetworkType.ATSC_TERRESTRIAL ||
      this.currentNetworkStream.networkType === NetworkType.ATSC_CABLE ||
      this.currentNetworkStream.networkType === NetworkType.ATSC_3;
  }

  public validateName() {
    this.updateModalTitle();
    this.updateNameValid();
    this.updateOkNextEnabled();
  }

  public onChangeNetworkType() {
    this.currentNetworkStream = this.createDefaultNetwork(true);
    this.updateModalTitle();
  }

  public closeModal() {
    this.initialPage = true;
  }

  private getNetworkTypeDisplayName(networkType: NetworkType): string {
    return NETWORK_TYPES[networkType]?.displayName || networkType.toString();
  }

  loadServerNetworks() {
    this.subscriptions?.push(
      this.clientNetworksModel.networkList$.subscribe((networkList: AbstractNetwork[]) => {
        this.serverNetworks = networkList;
        this.localNetworks = cloneDeep(this.serverNetworks);
        this.updateDirty();
      })
    );
  }

  private updateCurrentNetworks() {
    const index = this.localNetworks.findIndex(
      (network) => this.currentNetworkStream?.id > 0 ?
        network?.id === this.currentNetworkStream.id :
        network.clientId === this.currentNetworkStream.clientId);
    if (index !== -1) {
      this.localNetworks = [...this.localNetworks.slice(0,
        index), this.currentNetworkStream, ...this.localNetworks.slice(
        index + 1)];
    }
  }

  private updateDirty() {
    this.dirty = !isEqual(this.localNetworks, this.serverNetworks);
    if (this.dirty) {
    }
    this.networksChangedEmitter.emit(new NetworksChangedEvent(this.dirty, this.localNetworks));
  }

  private reconcileCurrentNetworks(): void {
    // TODO Add NetworkType.ATSC_TERRESTRIAL and ATSC3
    if (isDefined(this.myModalNetworksAtscNetworkComponent)) {
      switch (this.currentNetworkStream.networkType) {
        case NetworkType.ATSC_CABLE:
        case NetworkType.ATSC_TERRESTRIAL:
          this.reconcileCurrentTerrestrialNetworks();
          break;
      }
    }
  }

  private reconcileCurrentTerrestrialNetworks(): void {
    const reconciledNetworks: AbstractTerrestrialATSCNetwork = this.myModalNetworksAtscNetworkComponent.getLocalATSCTerrestrialNetwork();
    reconciledNetworks.name = this.currentNetworkStream.name;
    this.currentNetworkStream = reconciledNetworks;
    this.cleanCurrentNetworkStreamUnknownProperties();
  }

  // TODO Temporary fix until refactor to 'network' to use objects w/o extra fields to server
  private cleanCurrentNetworkStreamUnknownProperties(): void {
    const channels: AbstractATSCChannel[] = this.currentNetworkStream.channels as AbstractATSCChannel[];
    channels.forEach(channel => {
      channel.services.forEach(service => {
        if (isATSCService(service)) {
          const atscService: AbstractATSCService = service as AbstractATSCService;
          if (atscService.minorNumber === -1) {
            delete atscService.minorNumber;
          }
        }
      });
    });
  }

  private updateModalTitle(): void {
    this.modalTitle =
      (this.editMode ? 'Edit ' : 'Add ') + ' Network ' +
      (this.currentNetworkStream?.name.length > 0 ? ' - ' : '') +
      this.currentNetworkStream?.name;
  }

  private updateOkNextEnabled(): void {
    this.addUpdateNextEnabled = this.nameValid;
  }

  private onAddRow() {
    this.editMode = false;
    this.currentNetworkStream = this.createDefaultNetwork(false);
    this.updateCurrentNetworkFields();
  }

  private onEditRow() {
    this.editMode = true;
    this.currentNetworkStream = cloneDeep(this.networksDynamicTable.selectedRow);
    this.updateCurrentNetworkFields();
  }

  private onDeleteRow() {
    this.multipleDeletion();
    this.updateDirty();
  }

  private onExport(): void {
    this.openFileUploadModal(ProgressBarType.EXPORT);
  }

  public openImportFile(event): void {
    // this.networkCSVHandler.openImportFileHandler(event, cloneDeep(this.localNetworks));
    this.fileEvent = event?.target as HTMLInputElement;
    if (this.fileEvent.files && this.fileEvent.files.length > 0) {
      this.openFileUploadModal(ProgressBarType.IMPORT);
    }
  }

  public openFileUploadModal(type: ProgressBarType) {
    this.viewProgressBar = true;
    setTimeout(() => {
      $('#modal-progress-bar').modal('show');
    }, 100);
    if (type === ProgressBarType.IMPORT) {
      this.networkCSVHandler.openImportFileHandler(this.fileEvent, cloneDeep(this.localNetworks));
    } else {
      this.networkCSVHandler.onExport(this.networksDynamicTable.selectedRows);
    }
  }

  public fileProgressModalHandler() {
    setTimeout(() => {
      $('#modal-progress-bar').modal('hide');
      this.viewProgressBar = false;
    }, 100);

  }


  private multipleDeletion() {
    const len = this.networksDynamicTable.selectedRowIds.length;
    for (let i = 0; i < len; i++) {
      const selectID = this.networksDynamicTable?.selectedRowIds[i];
      this.localNetworks = this.localNetworks.filter(network => {
        const idMatch = network.id.toString() !== selectID.toString();
        const clientIdMatch = network.clientId !== selectID.toString();
        return idMatch && clientIdMatch;
      });
    }
  }

  private updateNameExists() {
    let matchedNetworkStream: AbstractNetwork;
    if (this.currentNetworkStream?.name.length > 0) {
      if (this.editMode) {
        matchedNetworkStream = this.localNetworks?.find(
          networkStream => !isElementIdMatch(this.currentNetworkStream,
            networkStream) && this.currentNetworkStream.name === networkStream.name);
      } else {
        matchedNetworkStream = this.localNetworks?.find(
          networkStream => this.currentNetworkStream.name === networkStream.name);
      }
    }
    this.nameExists = matchedNetworkStream !== undefined;
  }

  private updateCurrentNetworkFields(): void {
    this.updateNetworkValid();
  }

  private updateNameValid(): void {
    this.updateNameExists();
    this.nameValid = !this.nameExists && this.currentNetworkStream?.name.length > 0;
    this.iconTextName = this.nameValid ? 'text-success' : 'text-danger';
  }

  private updateNetworkValid(): void {
    this.updateModalTitle();
    this.updateNameValid();
    this.updateOkNextEnabled();
  }

  private initializeLicensableVariables(serverLicenseInfo: ServerLicenseInfo): void {
    if (isDefined(serverLicenseInfo?.serverLicense)) {
      this.initializeNetworkTypes(serverLicenseInfo.serverLicense);
    }
  }

  private initializeNetworkTypes(serverLicense: ServerLicense): void {
    const licensedNetworkTypes: LicensedNetworkType[] = serverLicense.licensedNetworkTypes;
    licensedNetworkTypes.forEach(licensedNetworkType => {
      switch (licensedNetworkType) {
        case LicensedNetworkType.PSIP:
          this.networkTypes.push(NetworkType.ATSC_TERRESTRIAL);
          this.networkTypes.push(NetworkType.ATSC_CABLE);
          break;
        case LicensedNetworkType.ATSC_3:
          this.networkTypes.push(NetworkType.ATSC_3);
          break;
      }
    });
    if (this.networkTypes.length === 0) {
      this.networksDynamicTable.disableButtons([ButtonType.ADD]);
    }
  }

  private createDefaultNetwork(preserveFields: boolean): AbstractNetwork {
    const networkStreamExists = isDefined(this.currentNetworkStream);
    const name = preserveFields && networkStreamExists ? this.currentNetworkStream.name : '';
    const networkType = networkStreamExists ? this.currentNetworkStream.networkType :
      this.networkTypes.length > 0 ? this.networkTypes[0] : undefined;
    let defaultNetwork: AbstractNetwork;
    switch (networkType) {
      case NetworkType.ATSC_TERRESTRIAL:
        defaultNetwork = new DefaultTerrestrialATSCNetwork(name);
        break;
      case NetworkType.ATSC_CABLE:
        defaultNetwork = new DefaultCableATSCNetwork(name);
        break;
      case NetworkType.ATSC_3:
        defaultNetwork = new DefaultATSC3Network(name);
        break;
    }
    return defaultNetwork !== undefined ? defaultNetwork : new DefaultCableATSCNetwork(name);
  }
}
