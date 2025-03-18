// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.

import {
  AbstractFetchableScheduleProvider,
  AbstractScheduleProvider,
  DefaultGenericScheduleProvider,
  DefaultOnConnectScheduleProvider,
  DefaultOnV3CScheduleProvider,
  DefaultPMCPScheduleProvider,
  DefaultPMCPTCPScheduleProvider,
  DefaultRoviScheduleProvider,
  DefaultTMSDirectScheduleProvider,
  DefaultTMSScheduleProvider,
  isOnConnectScheduleProvider,
  isOnV3ScheduleProvider,
  isProviderListingsBased,
  isProviderTypeFTPSettingsBased,
  PMCPTCPScheduleProvider,
  SCHEDULE_PROVIDER_TYPES,
  ScheduleProviderType,
  TranslatedScheduleProvider
} from '../../../../core/models/dtv/schedule/ScheduleProvider';
import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SweetAlert} from '../../../../../assets/node_modules/sweetalert/sweetalert/typings/core';
import {
  ActionMessage,
  ButtonType,
  ButtonTypes,
  ImageType,
  MultipleTableColumns
} from 'src/app/core/models/ui/dynamicTable';
import * as _swal from '../../../../../assets/node_modules/sweetalert/sweetalert';
import {cloneDeep, isEqual} from 'lodash';

import {ScheduleProviderIdList, ScheduleProviderService} from '../../../../core/services/schedule-provider.service';
import {ClientLicenseModel} from '../../../../core/models/ClientLicenseModel';
import {ServerLicense, ServerLicenseInfo} from '../../../../core/models/server/License';
import {isDefined} from '../../../../core/models/dtv/utils/Utils';
import {
  ModalDynamicTbTranslateComponent
} from '../../../../shared/components/modals/modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {AbstractCommitRevertComponent} from '../../abstracts/abstract-commit-revert.component';
import {ClientScheduleProvidersModel} from '../../../../core/models/ClientScheduleProvidersModel';
import {insertIntoElementList, isElementNameUnique, updateElementList} from '../../../../core/models/AbstractElement';
import {ClientNetworkSettingsModel} from '../../../../core/models/ClientNetworkSettingsModel';


const swal: SweetAlert = _swal as any;
declare var $;

@Component({
  selector: 'app-schedule-provider',
  templateUrl: './schedule-provider.component.html',
  styleUrls: ['./schedule-provider.component.scss'],
})
export class ScheduleProviderComponent extends AbstractCommitRevertComponent implements OnInit, OnDestroy {
  @ViewChild(ModalDynamicTbTranslateComponent) scheduleProvidersDynamicTable: ModalDynamicTbTranslateComponent;
  public readonly ScheduleProviderType = ScheduleProviderType;
  public readonly SCHEDULE_PROVIDER_TYPES = SCHEDULE_PROVIDER_TYPES;
  public currentScheduleProvider: AbstractFetchableScheduleProvider;
  public scheduleProviderTypes: ScheduleProviderType[] = [];
  public editMode: boolean;
  public buttonList: ButtonTypes[] = [
    {name: ButtonType.ADD, imgSrc: ImageType.add, supportsMultiSelect: true, alwaysEnabled: true},
    {name: ButtonType.EDIT, imgSrc: ImageType.edit},
    {name: ButtonType.DELETE, imgSrc: ImageType.delete, supportsMultiSelect: true},
    {name: ButtonType.INGEST, imgSrc: ImageType.ingest, requiresServerId: true, supportsMultiSelect: true},
    {name: ButtonType.STATUS, imgSrc: ImageType.status, requiresServerId: true},
    {name: ButtonType.UPDATEROW, imgSrc: ImageType.disable, supportsMultiSelect: true, requiresServerId: true}
  ];
  public tableHeaders: MultipleTableColumns[] = [
    {header: 'Name', key: 'name', visible: true},
    {header: 'Online', key: 'onLine', visible: true, showOnline: true},
    {header: 'Details', key: 'urlLink', visible: true, translateField: true}
  ];
  public modalName = '#scheduleProviderModal';
  public modalTitle: string;
  public previousNextEnabled = false;
  public addUpdateEnabled = false;
  public nameExists = false;
  public nameIconText: string;
  public initialPage = true;
  public showListingsBasedScheduleProvider = false;
  public showFtpSettingsBasedScheduleProvider = false;
  public showOnConnectScheduleProvider = false;
  public showOnV3ScheduleProvider = false;
  public openModalScheduleProviderStatus = false;
  public localScheduleProviders: AbstractScheduleProvider[];
  public translatedSchProviders: TranslatedScheduleProvider[] = [];
  private nameValid = false;
  private childOkEnabled = false;
  private maxScheduleProviders: number;
  private serverScheduleProviders: AbstractScheduleProvider[];

  constructor(private scheduleProviderService: ScheduleProviderService,
              private clientLicenseModel: ClientLicenseModel,
              private clientNetworkSettingsModel: ClientNetworkSettingsModel,
              private clientScheduleProvidersModel: ClientScheduleProvidersModel, private cdr: ChangeDetectorRef) {
    super();
    this.subscriptions.push(this.clientLicenseModel.serverLicenseInfo$.subscribe((serverLicenseInfo) => {
      this.initializeLicensableVariables(serverLicenseInfo);
      this.currentScheduleProvider = this.createDefaultProvider(false);
      this.updateShowScheduleProvider();
    }));
  }

  public ngOnInit(): void {
    this.loadServerScheduleProviders();
  }

  public ngOnDestroy(): void {
    this.cleanUpSubscriptions();
  }

  public canDeactivate() {
    return !this.dirty;
  }

  public onCommit(): void {
    this.dirty = false;
    this.clientScheduleProvidersModel.update(this.localScheduleProviders);
  }

  public updateDirty(): void {
    this.dirty = !isEqual(this.localScheduleProviders, this.serverScheduleProviders);
  }


  public onRevert() {
    this.loadServerScheduleProviders();
  }

  public validateName() {
    this.updateModalTitle();
    this.updateNameValid();
    this.updateOkNextEnabled();
  }

  public onChangeProviderType(): void {
    this.currentScheduleProvider = this.createDefaultProvider(true);
    this.updateShowScheduleProvider();
    this.updateModalTitle();
    this.updateOkNextEnabled();
  }


  public onButtonClicked(event: any) {
    this.openModalScheduleProviderStatus = false;
    switch (event.message) {
      case ActionMessage.ADD:
        this.onAddRow();
        break;
      case ActionMessage.EDIT:
        this.onEditRow();
        break;
      case ActionMessage.DELETE:
        this.onDeleteRows();
        break;
      case ActionMessage.INGEST:
        this.onIngest();
        break;
      case ActionMessage.STATUS:
        this.onStatus();
        break;
      case ActionMessage.ENABLE_DISABLE:
        this.onEnabledDisable();
        break;
    }
    this.cdr.detectChanges();
    this.updateDirty();
  }

  public clickNext() {
    this.initialPage = false;
  }

  public clickPrev() {
    this.initialPage = true;
    this.updateModalTitle();
  }

  public addUpdateCurrentProvider() {
    console.log('local', this.localScheduleProviders);
    console.log('current local', this.currentScheduleProvider);
    this.localScheduleProviders = updateElementList(this.localScheduleProviders, this.currentScheduleProvider,
      this.editMode) as AbstractScheduleProvider[];
    this.updateTranslateTableData();
    this.updateDirty();
    this.validateMaxProviderLimitCheck();
    this.initialPage = true;
  }

  public closeModal() {
    this.initialPage = true;
    this.openModalScheduleProviderStatus = false;
    this.cdr.detectChanges();
  }

  // used by all other type of SP where the schedules are pulled and on sp settings fields changes
  public okEnabledChangedHandler(okEnabled: boolean): void {
    this.childOkEnabled = okEnabled;
    console.log('schedule-provider.component okEnabledChangedHandler this.childOkEnabled: ', this.childOkEnabled);
    this.updateOkNextEnabled();
  }

  // special case for Onconnect SP to send schedule provider and its schedules list also
  public scheduleProviderChangedHandler(scheduleProvider: AbstractFetchableScheduleProvider) {
    this.currentScheduleProvider = scheduleProvider;
    this.updateOkNextEnabled();
    this.updateDirty();
  }

  public rowClicked(row) {
    this.validateMaxProviderLimitCheck();
    this.onUpdateRows();
    if (isDefined(this.scheduleProvidersDynamicTable)) {
      if (this.scheduleProvidersDynamicTable.selectedRowIds.length > 1) {
        if (!this.checkAllOnlineStatusMatch()) {
          this.scheduleProvidersDynamicTable.disableButtons([ButtonType.UPDATEROW]);
        }
      } else {
        if ((!row?.onLine) && row?.id > 0) {
          this.scheduleProvidersDynamicTable.disableButtons([ButtonType.INGEST]);
        } else if (row?.id <= 0) {
          this.scheduleProvidersDynamicTable.disableButtons([ButtonType.INGEST, ButtonType.STATUS]);
        }
      }
    }
  }

  onUpdateAllRows() {
    const localCopy = this.scheduleProvidersDynamicTable.disableEnableRows('onLine');
    this.localScheduleProviders = [...localCopy];
    this.onUpdateRows();
    this.cdr.detectChanges();
  }

  getUrlLink(schProvider: AbstractFetchableScheduleProvider) {
    let urlLink = '';
    if (schProvider.scheduleProviderType === ScheduleProviderType.PMCP_TCP) {
      const pmcpTcpScheduleProvider: PMCPTCPScheduleProvider = schProvider as PMCPTCPScheduleProvider;
      urlLink = 'NIC: ' + pmcpTcpScheduleProvider.networkInterfaceName + '; port: ' + pmcpTcpScheduleProvider.port;
    } else {
      const protocol = schProvider.protocol;
      const name = schProvider?.user?.length > 0 ? schProvider.user + '@' : '';
      const host = schProvider.host;
      const port = schProvider.port;
      const path = schProvider.path?.length > 0 ? schProvider.path : '';
      urlLink = protocol + '://' + name + '' + host + ':' + port + '/' + path;
    }

    return urlLink;
  }

  checkAllOnlineStatusMatch(): boolean {
    const selectedRows = this.scheduleProvidersDynamicTable.selectedRowIds;
    if (selectedRows.length === 0) {
      return true;
    }
    const selectedProviders = this.localScheduleProviders.filter(provider =>
      selectedRows.includes(provider.id)
    );
    if (selectedProviders.length === 0) {
      return true;
    }
    const initialStatus = selectedProviders[0].onLine;
    return selectedProviders.every(provider => provider.onLine === initialStatus);
  }

  private updateScheduleProviderValid(): void {
    this.updateShowScheduleProvider();
    this.updateModalTitle();
    this.updateNameValid();
    this.updateOkNextEnabled();
  }

  private updateNameExists() {
    this.nameExists = isElementNameUnique(this.currentScheduleProvider, this.localScheduleProviders, this.editMode);
  }

  private updateOkNextEnabled(): void {
    this.addUpdateEnabled = this.nameValid && this.childOkEnabled;
    this.previousNextEnabled = this.nameValid;
    if (this.editMode && this.previousNextEnabled) {
      this.addUpdateEnabled = this.nameValid;
    }
  }

  private updateModalTitle(): void {
    this.modalTitle = (this.editMode ? 'Edit ' : 'Add ') + ' Schedule Provider ' + (this.currentScheduleProvider?.name.length > 0 ? ' - ' : '') + this.currentScheduleProvider?.name;
  }

  private updateNameValid(): void {
    this.updateNameExists();
    this.nameValid = !this.nameExists && this.currentScheduleProvider?.name.length > 0;
    this.nameIconText = this.nameValid ? 'text-success' : 'text-danger';
  }

  private onStatus() {
    this.currentScheduleProvider = cloneDeep(this.scheduleProvidersDynamicTable.selectedRow);
    this.modalName = '#scheduleProviderStatusModal';
    this.openModalScheduleProviderStatus = true;
    this.updateScheduleProviderValid();
    this.initialPage = true;
    this.editMode = false;
    this.modalTitle = 'View Schedule Provider Status';
    console.log('Onstatus this.currentScheduleProvider: ', this.currentScheduleProvider);
  }

  private onIngest() {
    swal({
      title: 'Ingest Schedule Provider Confirmation',
      text: 'Update schedule for selected Schedule Providers?',
      buttons: ['No', 'Yes'],
      icon: 'warning',
    }).then((isConfirm) => {
      if (isConfirm) {
        const providerIds: number[] = [];
        for (const rowIdString of this.scheduleProvidersDynamicTable.selectedRowIds) {
          console.log('btnIngestFunction rowIdString: ', rowIdString);
          if (!isNaN(+rowIdString)) {
            const providerId: number = +rowIdString;
            console.log('btnIngestFunction providerId: ', providerId);
            if (providerId > 0) {
              providerIds.push(providerId);
            }
          }
        }
        this.ingestTableData(new ScheduleProviderIdList(providerIds));
      }
    });
  }

  private onAddRow(): void {
    this.editMode = false;
    this.childOkEnabled = false;
    this.modalName = '#scheduleProviderModal';
    this.currentScheduleProvider = this.createDefaultProvider(false);
    this.updateScheduleProviderValid();
  }

  private onEditRow() {
    this.editMode = true;
    this.modalName = '#scheduleProviderModal';
    this.currentScheduleProvider = cloneDeep(this.scheduleProvidersDynamicTable.selectedRow);
    this.updateScheduleProviderValid();
    console.log('onEditRow this.currentScheduleProvider: ', this.currentScheduleProvider);
  }

  private onUpdateRows() {
    if (isDefined(this.scheduleProvidersDynamicTable)) {
      if (this.scheduleProvidersDynamicTable?.selectedRow?.onLine) {
        this.scheduleProvidersDynamicTable.buttonImage = ImageType.disable;
        this.scheduleProvidersDynamicTable.buttonText = ButtonType.DISABLE;
      } else {
        this.scheduleProvidersDynamicTable.buttonImage = ImageType.enable;
        this.scheduleProvidersDynamicTable.buttonText = ButtonType.ENABLE;
      }
    }
  }

  private onDeleteRows() {
    this.localScheduleProviders = this.scheduleProvidersDynamicTable.deleteRows();
    // this.localScheduleProviders.forEach((data: any) => {
    //   delete data.urlLink;
    // });

    this.validateMaxProviderLimitCheck();
    this.updateDirty();
  }

  private onEnabledDisable(): void {
    if (this.scheduleProvidersDynamicTable.selectedRowIds.length > 1) {
      this.onUpdateAllRows();
    } else if (this.scheduleProvidersDynamicTable.selectedRowIds.length === 1) {
      this.currentScheduleProvider = this.scheduleProvidersDynamicTable.selectedRow;
      this.currentScheduleProvider.onLine = !this.currentScheduleProvider.onLine;
      this.updateCurrentScheduleProvider();
      this.onUpdateRows();
    }
  }

  private updateCurrentScheduleProvider() {
    this.localScheduleProviders = insertIntoElementList(this.localScheduleProviders,
      this.currentScheduleProvider) as AbstractScheduleProvider[];
    this.updateTranslateTableData();
  }

  private validateMaxProviderLimitCheck(): void {
    const limitReached = this.localScheduleProviders?.length >= this.maxScheduleProviders;
    this.buttonList[0].restricted = limitReached;
    if (limitReached) {
      this.scheduleProvidersDynamicTable?.disableButtons([ButtonType.ADD]);
    }
  }

  // Request server to ingest specified schedule providers.
  private ingestTableData(scheduleProviderIdList: ScheduleProviderIdList) {
    this.scheduleProviderService.reconcileScheduleProviders(scheduleProviderIdList).subscribe(() => {
      console.log('SUCCESS post reconcileScheduleProviders:');
    }, (err) => {
      console.log('[schedule-provider.component.ts] ingestTableData() error: ' + err);
    });
  }

  private initializeLicensableVariables(serverLicenseInfo: ServerLicenseInfo): void {
    if (isDefined(serverLicenseInfo?.serverLicense)) {
      this.initializeScheduleProviderTypes(serverLicenseInfo.serverLicense);
      this.maxScheduleProviders = serverLicenseInfo.serverLicense.maxInputs;
    }
  }

  private initializeScheduleProviderTypes(serverLicense: ServerLicense): void {
    const licensedScheduleProviderTypes: ScheduleProviderType[] = serverLicense.licensedInputTypes;
    licensedScheduleProviderTypes.forEach(scheduleProviderType => {
      if (isDefined(SCHEDULE_PROVIDER_TYPES[scheduleProviderType])) {
        if (scheduleProviderType !== ScheduleProviderType.OMA_INGEST &&
          this.scheduleProviderTypes.indexOf(scheduleProviderType) === -1) {
          this.scheduleProviderTypes.push(scheduleProviderType);
        }
      }
    });
    if (this.scheduleProviderTypes.length === 0) {
      this.scheduleProvidersDynamicTable.disableButtons([ButtonType.ADD]);
    }
  }

  private decorateUrlLinks() {
    this.localScheduleProviders.forEach(scheduleProvider => {
      this.decorateUrlLink(scheduleProvider);
    });
  }

  private decorateUrlLink(scheduleProvider: AbstractScheduleProvider) {
    console.log('decorateUrlLink, scheduleProvider: ', scheduleProvider);
    const fetchableScheduleProvider: AbstractFetchableScheduleProvider = scheduleProvider as AbstractFetchableScheduleProvider;
    if (isDefined(fetchableScheduleProvider)) {
      const protocol = fetchableScheduleProvider.protocol;
      const name = fetchableScheduleProvider?.user?.length > 0 ? fetchableScheduleProvider.user + '@' : '';
      const host = fetchableScheduleProvider.host;
      const port = fetchableScheduleProvider.port;
      const path = fetchableScheduleProvider.path?.length > 0 ? fetchableScheduleProvider.path : '';
      const urlLink = protocol + '://' + name + '' + host + ':' + port + '/' + path;
      let translatedScheduleProvider = null;
      translatedScheduleProvider = new TranslatedScheduleProvider(scheduleProvider.id,
        this.getUrlLink(fetchableScheduleProvider));
      this.translatedSchProviders.push(translatedScheduleProvider);
      console.log('translatedSchProviders', this.translatedSchProviders);

    }
  }

  private createDefaultProvider(preserveFields: boolean): AbstractFetchableScheduleProvider {
    const scheduleProviderExists = isDefined(this.currentScheduleProvider);
    const name = preserveFields && scheduleProviderExists ? this.currentScheduleProvider.name : '';
    const onLine = preserveFields && scheduleProviderExists ? this.currentScheduleProvider.onLine : true;
    const scheduleProviderType = scheduleProviderExists ? this.currentScheduleProvider.scheduleProviderType : this.scheduleProviderTypes.length > 0 ? this.scheduleProviderTypes[0] : undefined;
    let defaultScheduleProvider: AbstractFetchableScheduleProvider;
    switch (scheduleProviderType) {
      case ScheduleProviderType.GENERIC:
        defaultScheduleProvider = new DefaultGenericScheduleProvider(name, onLine);
        break;
      case ScheduleProviderType.PMCP:
        defaultScheduleProvider = new DefaultPMCPScheduleProvider(name, onLine);
        break;
      case ScheduleProviderType.ROVI:
        defaultScheduleProvider = new DefaultRoviScheduleProvider(name, onLine);
        break;
      case ScheduleProviderType.TMS:
        defaultScheduleProvider = new DefaultTMSScheduleProvider(name, onLine);
        break;
      case ScheduleProviderType.PMCP_TCP:
        const defaultPMCPTCPScheduleProvider = new DefaultPMCPTCPScheduleProvider(name, onLine);
        defaultPMCPTCPScheduleProvider.networkInterfaceName = this.clientNetworkSettingsModel.getDefaultTrafficNICName();
        defaultScheduleProvider = defaultPMCPTCPScheduleProvider;
        break;
      case ScheduleProviderType.TMS_DIRECT:
        defaultScheduleProvider = new DefaultTMSDirectScheduleProvider(name, onLine);
        break;
      case ScheduleProviderType.ON_V3:
        defaultScheduleProvider = new DefaultOnV3CScheduleProvider(name, onLine);
        break;
      case ScheduleProviderType.ON_CONNECT:
        defaultScheduleProvider = new DefaultOnConnectScheduleProvider(name, onLine);
        break;
      default:
        break;
    }
    return defaultScheduleProvider;
  }

  private updateShowScheduleProvider(): void {
    this.showListingsBasedScheduleProvider = isProviderListingsBased(this.currentScheduleProvider.scheduleProviderType);
    this.showFtpSettingsBasedScheduleProvider = isProviderTypeFTPSettingsBased(
      this.currentScheduleProvider.scheduleProviderType);
    this.showOnConnectScheduleProvider = isOnConnectScheduleProvider(this.currentScheduleProvider.scheduleProviderType);
    this.showOnV3ScheduleProvider = isOnV3ScheduleProvider(this.currentScheduleProvider.scheduleProviderType);
  }

  private loadServerScheduleProviders(): void {
    this.translatedSchProviders = [];
    this.clientScheduleProvidersModel.schedProvider$.subscribe((scheduleProviders: AbstractScheduleProvider[]) => {
      this.serverScheduleProviders = scheduleProviders;
      this.localScheduleProviders = cloneDeep(this.serverScheduleProviders);
      this.decorateUrlLinks();
      this.updateDirty();
      this.cdr.detectChanges();
    });

  }

  private updateTranslateTableData() {
    this.translatedSchProviders.find(tblSchProvider => this.currentScheduleProvider.id === tblSchProvider.id);
    const index = this.translatedSchProviders.findIndex(
      schProvider => this.currentScheduleProvider.id === schProvider.id);
    if (index !== -1) {
      this.translatedSchProviders[index].urlLink = this.getUrlLink(this.currentScheduleProvider);
    } else {
      const translatedProviders = new TranslatedScheduleProvider(this.currentScheduleProvider.id,
        this.getUrlLink(this.currentScheduleProvider));
      this.translatedSchProviders.push(translatedProviders);
    }
    this.cdr.detectChanges();
  }

}
