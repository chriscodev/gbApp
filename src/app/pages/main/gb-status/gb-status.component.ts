// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.

import {Component, OnDestroy, OnInit} from '@angular/core';
import {ClientServerModel} from '../../../core/models/ClientServerModel';
import {cloneDeep, isEqual} from 'lodash';
import {
  DefaultRestartOptionsRequest,
  PRIMARY_SERVER_RESTART_MODES,
  RESTART_SERVER_MODES,
  RestartOptionsRequest,
  RestartServerMode,
  ServerInfo,
  ServerStatus
} from '../../../core/models/server/Server';
import {AbstractCommitRevertComponent} from '../abstracts/abstract-commit-revert.component';
import {DefaultLocationSettings, LocationSettings} from '../../../core/models/server/LocationSettings';
import {ClientLocationSettingsModel} from '../../../core/models/ClientLocationSettingsModel';
import {isDefined} from '../../../core/models/dtv/utils/Utils';
import * as _swal from '../../../../assets/node_modules/sweetalert/sweetalert';
import {SweetAlert} from '../../../../assets/node_modules/sweetalert/sweetalert/typings/core';
import * as JSZip from 'jszip';
import {swalErrorLogoutFunction} from '../../../shared/helpers/appWideFunctions';
import {BootstrapFunction} from '../../../core/interfaces/interfaces';
import {Observable} from 'rxjs';
import {ComponentCanDeactivate} from '../../../core/guards/canDeactivateGuard';
import {clearFileImportInput} from '../../../shared/helpers/fileImportClearHelper';
import {FileUploadService} from '../../../core/services/file-upload.service';
import {ProgressBarDataInterface} from '../../../core/interfaces/ProgressBarDataInterface';

const swal: SweetAlert = _swal as any;

declare var $: BootstrapFunction;

@Component({
  selector: 'app-gb-status',
  templateUrl: './gb-status.component.html',
  styleUrls: ['./gb-status.component.scss'],
  providers: [],
})
export class GBStatusComponent extends AbstractCommitRevertComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
  public readonly RESTART_SERVER_MODES = RESTART_SERVER_MODES;
  public restartServerModes: RestartServerMode[] = PRIMARY_SERVER_RESTART_MODES;
  public serverInfo: ServerInfo;
  public serverStatus: ServerStatus;
  public serverLocationSettings: LocationSettings = new DefaultLocationSettings();
  public localLocationSettings: LocationSettings = new DefaultLocationSettings();
  public todayDate: Date;
  public restoreDate: Date;
  public restoreVersion = '';
  public restoreDescription = '';
  public backupDesc = '';
  public backupFile = '';
  public backupFormStatus = true;
  public restartOptionsRequest: RestartOptionsRequest = new DefaultRestartOptionsRequest();
  public messageAlert: string;
  // TODO file progress variables for import
  public viewProgressBar = false;
  public progressModalData: ProgressBarDataInterface;
  private uploadedFile: File;

  constructor(private serverModel: ClientServerModel,
              private locationSettingsModel: ClientLocationSettingsModel,
              private fileUploadService: FileUploadService) {
    super();
    this.todayDate = new Date();
    this.updateData();
    this.subscriptions.push(this.fileUploadService.getImportProgress().subscribe((data) => {
      if (data !== undefined) {
        console.log('getImportProgress', data);
        this.progressModalData = data;
      }
    }));
  }

  public ngOnInit(): void {
    this.backupFormInit();
    this.subscriptions.push(this.locationSettingsModel.locationSettings$.subscribe((locSettings: LocationSettings) => {
      if (isDefined(locSettings) && locSettings.id !== -1) {
        this.serverLocationSettings = cloneDeep(this.locationSettingsModel.locationSubject.getValue());
        this.localLocationSettings = cloneDeep(this.locationSettingsModel.locationSubject.getValue());
      } else {
        this.serverLocationSettings = new DefaultLocationSettings();
        this.localLocationSettings = new DefaultLocationSettings();
      }
    }));
    this.subscriptions.push(this.serverModel.serverInfo$.subscribe(() => {
      this.serverInfo = this.serverModel.serverInfoSubject.getValue();
    }));
    this.subscriptions.push(this.serverModel.serverStatus$.subscribe(() => {
      this.serverStatus = this.serverModel.serverStatusSubject.getValue();
    }));
  }

  public openRestoreModal($event: Event) {
    this.uploadFile($event).then();
  }

  public onRevert() {
    this.dirty = false;
    this.updateData();
  }

  public onCommit() {
    this.locationSettingsModel.updateLocationSettings(this.localLocationSettings).then(
      () => {
        this.updateData();
        this.dirty = false;
      },
      (error) => {
        // TODO show error dialog
        console.log('postLocationSettings Update  ERROR', error);
      }
    );
  }

  public updateDirty() {
    this.dirty = !isEqual(this.localLocationSettings, this.serverLocationSettings);
  }

  public updateFileName() {
    this.backupFormStatus = this.backupFile === '';
  }

  public updateDesc($event: any) {
    if (isDefined($event.target.value)) {
      this.backupDesc = $event.target.value;
    }
  }

  public getBackupFile() {
    if (isDefined(this.backupFile)) {
      this.openFileUploadModal();
      this.backupFile = this.backupFile + '.zip';
      this.locationSettingsModel.createBackup(this.backupDesc, this.backupFile);
      $('#backupDialog').modal('hide');
      this.backupFile = '';
      this.backupDesc = '';
    }
  }

  public openFileUploadModal() {
    this.viewProgressBar = true;
    setTimeout(() => {
      $('#modal-progress-bar').modal('show');
    }, 100);
  }

  public fileProgressModalHandler(event: string) {
    setTimeout(() => {
      $('#modal-progress-bar').modal('hide');
      this.viewProgressBar = false;
    }, 100);
    if (event === 'restart') {
      this.messageAlert =
        'The GuideBuilder Server is restoring database. The application will now close. Please refresh the web page in a few minutes.';
      swalErrorLogoutFunction(this.messageAlert);
    }

  }

  public onSettingsChange() {
    if (this.localLocationSettings !== null) {
      this.updateDirty();
    }
  }

  async uploadFile($event: Event) {
    const uploadedFiles = $event.target as HTMLInputElement;
    if (uploadedFiles.files && uploadedFiles.files.length > 0) {
      this.uploadedFile = uploadedFiles.files[0];
      const zip = new JSZip();
      const zipData = await zip.loadAsync(this.uploadedFile);
      if (!zipData.files['MANIFEST.MF']) {
        const messageAlert = 'The selected file does not appear to be a valid GuideBuilder Archive.  ' +
          'Please select another file.';
        swal({
          title: 'GuideBuilder Restore Error',
          text: messageAlert,
          icon: 'warning',
        });
        return false;
      } else {
        const manifestFile = zipData.file('MANIFEST.MF');
        manifestFile.async('text').then((content) => {
          const archiveCreationDate = 'Creation-Date:';
          const archiveDescription = 'Archive-Description:';
          const archiveVersion = 'GB-Version:';
          const parts: string[] = content.split('\r\n');
          parts.forEach(part => {
            if (part.startsWith(archiveDescription)) {
              this.restoreDescription = part.substring(archiveDescription.length + 1).trim();
            }
            if (part.startsWith(archiveVersion)) {
              this.restoreVersion = part.substring(archiveVersion.length + 1).trim();
            }
            if (part.startsWith(archiveCreationDate)) {
              this.restoreDate = new Date(part.substring(archiveCreationDate.length + 1).trim());
            }
          });
        });
        setTimeout(() => {
          $('#fileUploadModal').modal('show');
        }, 0);
      }
    }
  }

  doRestore() {
    this.messageAlert =
      'The GuideBuilder Server is restoring DB. The application will now close. Please refresh the web page in a few minutes.';
    if (this.uploadedFile) {
      this.restartOptionsRequest = new RestartOptionsRequest(false, false,
        this.restartOptionsRequest.removeLicense, false, this.restartOptionsRequest.restartServerMode);
      // TODO
      this.openFileUploadModal();
      const observable: Observable<ProgressBarDataInterface> = this.locationSettingsModel.doRestore(this.uploadedFile,
        this.restartOptionsRequest);
      const observer = {
        next: (value: ProgressBarDataInterface) => {
          console.log('ProgressBarDataInterface', value);
          // swalErrorLogoutFunction(messageAlert);
          if (value !== undefined) {
            this.progressModalData = value;
          }
          // this.cdr.detectChanges();
        },
        error: () => {
          swalErrorLogoutFunction(this.messageAlert);
        },
        complete: () => {
        }
      };
      this.subscriptions.push(observable.subscribe(observer));
    }
  }

  toggleRemoveLicense($event: any) {
    this.restartServerModes = this.restartOptionsRequest.removeLicense ?
      [RestartServerMode.MAINTENANCE_MODE, RestartServerMode.PASSIVE_MODE] : PRIMARY_SERVER_RESTART_MODES;
    this.restartOptionsRequest.restartServerMode = this.restartOptionsRequest.removeLicense ?  RestartServerMode.PASSIVE_MODE : RestartServerMode.ACTIVE_MODE;
  }

  ngOnDestroy() {
    this.subscriptions?.forEach((sub) => sub.unsubscribe());
  }

  resetBackupData() {
    this.backupFile = '';
    this.backupDesc = '';
  }

  resetRestoreData() {
    this.restoreDescription = '';
    this.restoreVersion = '';
    this.restartOptionsRequest.removeLicense = false;
  }

  public canDeactivate(): boolean {
    return !this.dirty;
  }

  public resetFileImport(fileRestoreInput: HTMLInputElement) {
    clearFileImportInput(fileRestoreInput);
  }

  private backupFormInit() {
    this.backupFile = '';
    this.backupDesc = '';
  }

  private updateData() {
    this.serverInfo = cloneDeep(this.serverModel.serverInfoSubject.getValue());
    this.localLocationSettings = cloneDeep(this.locationSettingsModel.locationSubject.getValue());
    this.serverLocationSettings = cloneDeep(this.locationSettingsModel.locationSubject.getValue());
  }
}
