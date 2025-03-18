// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.

import {ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {
  ModalDynamicTbTranslateComponent
} from '../../../../shared/components/modals/modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {
  DefaultExportStatus,
  DefaultFTPExportProfile,
  DefaultStreamScopeExportProfile,
  DefaultTCPExportProfile,
  EXPORT_FREQUENCY_TYPES,
  EXPORT_TYPES,
  ExportFrequency,
  ExportProfile,
  ExportProfileChangedEvent,
  ExportStatus,
  ExportType,
  FTPExportProfile,
  isExportTypeFTPSettingsBased,
  isExportTypeStreamScopeSettingsBased,
  isExportTypeTCPSettingsBased,
  StreamScopeExportProfile,
  TCPExportProfile,
  TranslatedExportStatus
} from '../../../../core/models/dtv/network/export/ExportProfile';
import {
  ActionMessage,
  ButtonType,
  ButtonTypes,
  ImageType,
  MultipleTableColumns
} from '../../../../core/models/ui/dynamicTable';
import {AbstractCommitRevertComponent} from '../../abstracts/abstract-commit-revert.component';
import {ComponentCanDeactivate} from '../../../../core/guards/canDeactivateGuard';
import {Observable} from 'rxjs';
import {ClientServiceExportModel} from '../../../../core/models/ClientServiceExportModel';
import {cloneDeep, isEqual} from 'lodash';
import {deleteElementList, isElementNameUnique, updateElementList} from '../../../../core/models/AbstractElement';
import {BootstrapFunction, ClickEvent} from '../../../../core/interfaces/interfaces';
import {isDefined} from '../../../../core/models/dtv/utils/Utils';
import {RemoteFileResource} from '../../../../core/models/dtv/schedule/ScheduleProvider';
import {SweetAlert} from 'sweetalert/typings/core';
import * as _swal from '../../../../../assets/node_modules/sweetalert/sweetalert';
import {ServiceExportService} from '../../../../core/services/service-export.service';

const swal: SweetAlert = _swal as any;
declare var $: BootstrapFunction;

@Component({
  selector: 'app-service-export',
  templateUrl: './service-export.component.html',
  styleUrl: './service-export.component.scss'
})
export class ServiceExportComponent extends AbstractCommitRevertComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
  @ViewChild(ModalDynamicTbTranslateComponent) serviceExportTableComponent: ModalDynamicTbTranslateComponent;
  @Output() exportProfileChanged: EventEmitter<ExportProfileChangedEvent> = new EventEmitter<ExportProfileChangedEvent>();
  public serverExportProfiles: ExportProfile[];
  public localExportProfiles: ExportProfile[];
  public modalName = '#exportProfileModal';
  public settingsModal = '#settingsModal';
  public exportTypes: ExportType[] = Object.values(ExportType);
  public exportFrequencies: ExportFrequency[] = Object.values(ExportFrequency);
  public readonly EXPORT_FREQUENCY_TYPES = EXPORT_FREQUENCY_TYPES;
  public readonly EXPORT_TYPES = EXPORT_TYPES;
  public translatedExportStatus: TranslatedExportStatus[];
  public editMode: boolean;
  public modalTitle: string;
  public modalStatusTitle: string;
  public currentExportProfile: ExportProfile | TCPExportProfile | StreamScopeExportProfile | FTPExportProfile;
  public currentExportStatus: ExportStatus;
  public objectType = 'service-export';
  public nameValid = false;
  public nameExists = false;
  public timeOfDayValid = false;
  public timeOfDayIconText: string;
  public nameIconText: string;
  public exportDaysValid = false;
  public exportDaysIconText: string;
  public initialPage = true;
  public addUpdateEnabled = false;
  public exportStatusMap: Map<number, ExportStatus> = new Map<number, ExportStatus>();
  public showTCPExport = false;
  public showFTPExport = false;
  public showStreamScopeExport = false;
  private childOkEnabled = true;
  public showSelectTransformer = false;

  public buttonList: ButtonTypes[] = [
    {name: ButtonType.ADD, imgSrc: ImageType.add, disable: false, alwaysEnabled: true},
    {name: ButtonType.EDIT, imgSrc: ImageType.edit, supportsMultiSelect: false},
    {name: ButtonType.DELETE, imgSrc: ImageType.delete, supportsMultiSelect: true},
    {name: ButtonType.EXPORT, imgSrc: ImageType.export, disable: false, requiresServerId: true},
    {name: ButtonType.STATUS, imgSrc: ImageType.status, disable: false},
    {name: ButtonType.UPDATEROW, imgSrc: ImageType.disable, supportsMultiSelect: true}
  ];
  public tableHeaders: MultipleTableColumns[] = [
    {header: 'Name', key: 'name', visible: true},
    {header: 'Online', key: 'onLine', visible: true, showOnline: true},
    {header: 'Type', key: 'type', visible: true},
    {header: 'Last Update', key: 'lastUpdateTime', visible: true, translateField: true, showDate: true},
  ];

  constructor(private serviceExportModel: ClientServiceExportModel, private cdr: ChangeDetectorRef,
              private serviceExportService: ServiceExportService) {
    super();
    this.currentExportProfile = this.createDefaultExportProfile(false);
    this.currentExportStatus = new DefaultExportStatus();
  }

  ngOnInit(): void {
    this.chooseToEmptyTransformer();
    this.loadExportProfileDetails();
    this.updateExportProfile();
    this.updateSettingsValid();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onCommit() {
    this.serviceExportModel.update(this.localExportProfiles).then(() => {
      this.dirty = false;
    });
  }

  onRevert() {
    this.dirty = false;
    this.loadExportProfileDetails();
  }

  updateDirty() {
    this.dirty = !isEqual(this.localExportProfiles, this.serverExportProfiles);
  }

  onChangeExportType() {
    if (this.currentExportProfile.type === ExportType.TCP) {
      this.currentExportProfile = this.currentExportProfile as TCPExportProfile;
    } else if (this.currentExportProfile.type === ExportType.FTP) {
      this.currentExportProfile = this.currentExportProfile as FTPExportProfile;
    } else if (this.currentExportProfile.type === ExportType.STREAMSCOPE) {
      this.currentExportProfile = this.currentExportProfile as StreamScopeExportProfile;
    }
    this.currentExportProfile = this.createDefaultExportProfile(true);
  }

  updateExportProfile() {
    this.showFTPExport = isExportTypeFTPSettingsBased(this.currentExportProfile.type);
    this.showTCPExport = isExportTypeTCPSettingsBased(this.currentExportProfile.type);
    this.showStreamScopeExport = isExportTypeStreamScopeSettingsBased(this.currentExportProfile.type);
  }

  canDeactivate(): boolean | Observable<boolean> {
    return !this.dirty;
  }

  public addUpdateCurrentExportProfile() {
    this.localExportProfiles = updateElementList(this.localExportProfiles, this.currentExportProfile,
      this.editMode) as ExportProfile[];
    this.updateDirty();
    this.initialPage = true;
  }

  public onButtonClicked($event: ClickEvent) {
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
      case ActionMessage.EXPORT:
        this.onExportData();
        break;
      case ActionMessage.ENABLE_DISABLE:
        this.onEnableDisable();
        break;
      case ActionMessage.STATUS:
        this.onViewOutputStatus();
        break;
    }
    this.cdr.detectChanges();
  }

  private onViewOutputStatus() {
    this.modalName = '#viewServiceExportStatus';
    this.editMode = false;
    this.updateSettingsValid();
    this.modalStatusTitle = 'View Service Export Status -' + this.currentExportProfile.name;
    this.currentExportProfile = cloneDeep(this.serviceExportTableComponent.selectedRow);
    this.currentExportStatus = this.exportStatusMap.get(this.currentExportProfile.id);
    this.cdr.detectChanges();
  }

  private onEnableDisable() {
    if (this.serviceExportTableComponent.selectedRowIds.length > 0) {
      this.onUpdateAllRows();
      this.setButtonOnlineStatus();
    }
    this.updateDirty();
  }


  private onUpdateAllRows() {
    const localCopy = this.serviceExportTableComponent.disableEnableRows('onLine');
    this.localExportProfiles = [...localCopy];
    this.cdr.detectChanges();
  }

  private setButtonOnlineStatus() {
    if (isDefined(this.serviceExportTableComponent)) {
      if (this.serviceExportTableComponent?.selectedRow?.onLine) {
        this.serviceExportTableComponent.buttonImage = ImageType.disable;
        this.serviceExportTableComponent.buttonText = ButtonType.DISABLE;
      } else {
        this.serviceExportTableComponent.buttonImage = ImageType.enable;
        this.serviceExportTableComponent.buttonText = ButtonType.ENABLE;
      }
    }
  }

  private onAddRow(): void {
    this.editMode = false;
    this.modalName = '#exportProfileModal';
    this.updateModalTitle();
    this.currentExportProfile = this.createDefaultExportProfile(false);
    this.updateSettingsValid();
  }

  private onEditRow(): void {
    this.editMode = true;
    this.modalName = '#exportProfileModal';
    this.currentExportProfile = cloneDeep(this.serviceExportTableComponent.selectedRow);
    this.updateExportProfile();
    this.updateSettingsValid();
  }

  public updateSettingsValid() {
    this.updateModalTitle();
    this.updateNameValid();
    this.updateDaysofExport();
    this.updateTimeOfDayValid();
    this.updateExportFrequencyFields();
    this.validateAddUpdateEnabled();
  }

  public updateNameValid(): void {
    this.updateNameExists();
    this.nameValid = !this.nameExists && this.currentExportProfile?.name.length > 0;
    this.nameIconText = this.nameValid ? 'text-success' : 'text-danger';
  }

  public updateDaysofExport() {
    this.exportDaysValid = this.currentExportProfile.numberOfDaysToExport > 0;
    this.exportDaysIconText = this.exportDaysIconText ? 'text-success' : 'text-danger';
  }

  private updateTimeOfDayValid(): void {
    this.timeOfDayValid = this.currentExportProfile.initialTime && this.currentExportProfile.initialTime?.length > 0;
    this.timeOfDayIconText = this.timeOfDayValid ? 'text-success' : 'text-danger';
  }

  public updateExportFrequencyFields(): void {
    const exportTime = document.getElementById('exportTime') as HTMLInputElement;
    const interval = document.getElementById('interval') as HTMLInputElement;
    if (this.currentExportProfile.exportFrequency === ExportFrequency.AUTOMATIC || this.currentExportProfile.exportFrequency === ExportFrequency.ON_DEMAND) {
      exportTime.disabled = true;
      interval.disabled = true;
    } else if (this.currentExportProfile.exportFrequency === ExportFrequency.INTERVAL) {
      exportTime.disabled = true;
      interval.disabled = false;
    } else if (this.currentExportProfile.exportFrequency === ExportFrequency.DAILY) {
      exportTime.disabled = false;
      interval.disabled = true;
    }
    this.updateExportProfile();
  }

  private updateModalTitle() {
    this.modalTitle =
      (this.editMode ? 'Edit ' : 'Add ') + ' Service Export ' +
      (this.editMode ? ' - ' : '') +
      (this.editMode ? this.currentExportProfile.name : '');
  }

  private updateNameExists() {
    this.nameExists = isElementNameUnique(this.currentExportProfile, this.localExportProfiles, this.editMode);
  }

  private validateAddUpdateEnabled(): void {
    const forceNext = !this.editMode && this.initialPage;
    if (forceNext) {
      this.addUpdateEnabled = false;
    } else {
      this.addUpdateEnabled = this.nameValid && this.childOkEnabled;
    }
  }

  public clickNext() {
    this.initialPage = false;
    this.updateExportProfile();
    this.validateAddUpdateEnabled();
  }

  public clickPrev() {
    this.initialPage = true;
    this.validateAddUpdateEnabled();
  }

  public closeModal(): void {
    this.initialPage = true;
    this.cdr.detectChanges();
  }

  private onDeleteRows(): void {
    this.multipleDeletion();
    this.updateDirty();
  }

  private multipleDeletion() {
    this.localExportProfiles = deleteElementList(this.localExportProfiles,
      this.serviceExportTableComponent) as ExportProfile[];
  }

  private loadExportProfiles(exportProfiles: ExportProfile[]) {
    this.serverExportProfiles = exportProfiles;
    this.localExportProfiles = cloneDeep(this.serverExportProfiles);
  }

  private loadExportProfileDetails() {
    this.subscriptions.push(this.serviceExportModel.serviceExport$.subscribe((exportProfiles) => {
      this.loadExportProfiles(exportProfiles);
      this.updateDirty();
      this.cdr.detectChanges();
    }));
    this.subscriptions.push(this.serviceExportModel.serviceExportStatus$.subscribe((allExportStatus) => {
      allExportStatus?.forEach((exportStatus) => {
        this.exportStatusMap.set(exportStatus.scheduleProfileId, exportStatus);
        this.updateTranslatedRowData();
      });
    }));
    this.cdr.detectChanges();
  }

  public updateTranslatedRowData(): void {
    this.translatedExportStatus = [];
    let exportStatusRecord = null;
    this.exportStatusMap.forEach(exportStatus => {
      const foundExportStatus = this.serverExportProfiles.find(o => o.id === exportStatus.scheduleProfileId);
      if (foundExportStatus) {
        exportStatusRecord = new TranslatedExportStatus(exportStatus.id, exportStatus.scheduleProfileId,
          exportStatus.lastExportTime);
      } else {
        exportStatusRecord = new TranslatedExportStatus(exportStatus.id, exportStatus.scheduleProfileId,
          exportStatus.lastExportTime !== null ? exportStatus.lastExportTime : null);
      }
      this.translatedExportStatus.push(exportStatusRecord);
    });
  }

  openSettings() {
    $(this.settingsModal).modal('show');
  }

  updateSettings() {
    $(this.settingsModal).modal('hide');
  }

  public onRowClicked(selectedExportProfile: ExportProfile) {
    if (isDefined(this.serviceExportTableComponent)) {
      if (!selectedExportProfile.onLine) {
        this.serviceExportTableComponent.disableButtons([ButtonType.EXPORT]);
      }
      this.setButtonOnlineStatus();
    }
  }

  private createDefaultExportProfile(preserveFields: boolean): ExportProfile {
    const profileExists = isDefined(this.currentExportProfile);
    const name = preserveFields && profileExists ? this.currentExportProfile.name : '';
    const onLine = preserveFields && profileExists ? this.currentExportProfile.onLine : true;
    const exportType = profileExists ? this.currentExportProfile.type : this.exportTypes.length > 0 ? this.exportTypes[0] : undefined;
    let defaultExportProfile: ExportProfile;
    switch (exportType) {
      case ExportType.TCP:
        defaultExportProfile = new DefaultTCPExportProfile(name, onLine);
        break;
      case ExportType.FTP:
        defaultExportProfile = new DefaultFTPExportProfile(name, onLine);
        break;
      case ExportType.STREAMSCOPE:
        defaultExportProfile = new DefaultStreamScopeExportProfile(name, onLine);
        break;
      default:
        break;
    }
    return defaultExportProfile !== undefined ? defaultExportProfile : new DefaultTCPExportProfile(name, onLine);
  }

  doChooseTransformer() {
    this.showSelectTransformer = true;
    $('#selectXSLTModal').modal('show');
  }

  public xlstSelectedHandler(remoteFileResource: RemoteFileResource): void {
    this.xlstClosedHandler();
    this.currentExportProfile.XSLT = remoteFileResource.name;
  }

  public xlstClosedHandler() {
    this.showSelectTransformer = false;
    $('#selectXSLTModal').modal('hide');
  }

  public chooseToEmptyTransformer() {
    this.currentExportProfile.XSLT = undefined;
  }

  private onExportData() {
    this.currentExportProfile = cloneDeep(this.serviceExportTableComponent.selectedRow);
    swal({
      title: 'Service Export Confirmation',
      text: 'Are you sure you want to export the selected Profile?',
      buttons: ['No', 'Yes'],
      icon: 'warning',
    }).then((isConfirm) => {
      if (isConfirm) {
        this.subscriptions.push(
          this.serviceExportService.exportProfileById(this.currentExportProfile.id).subscribe(() => {
            console.log('server export successful waiting for refresh');
          }));
      }
    });
  }

  public okEnabledChangedHandler(okEnabled: boolean): void {
    this.childOkEnabled = okEnabled;
    this.validateAddUpdateEnabled();
  }
}
