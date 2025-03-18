// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.

import {ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import * as _swal from '../../../../assets/node_modules/sweetalert/sweetalert';
import {SweetAlert} from '../../../../assets/node_modules/sweetalert/sweetalert/typings/core';
import {Observable, Subscription} from 'rxjs';
import {swalErrorLogoutFunction} from '../../../shared/helpers/appWideFunctions';
import {
  DefaultRestartOptionsRequest,
  InitLevel,
  PRIMARY_SERVER_RESTART_MODES,
  REDUNDANT_ENABLED_SERVER_RESTART_MODES,
  RESTART_SERVER_MODES,
  RestartOptionsRequest,
  RestartServerMode,
  ServerInfo,
  SoftwareVersionInfo
} from '../../../core/models/server/Server';
import {isDefined} from '../../../core/models/dtv/utils/Utils';
import {ServerService} from '../../../core/services/server.service';
import {ClientServerModel} from '../../../core/models/ClientServerModel';
import {BootstrapFunction} from '../../../core/interfaces/interfaces';
import {ProgressBarDataInterface} from '../../../core/interfaces/ProgressBarDataInterface';
import {clearFileImportInput} from '../../../shared/helpers/fileImportClearHelper';

declare var $: BootstrapFunction;
const swal: SweetAlert = _swal as any;

@Component({
  selector: 'app-sw-update', templateUrl: './sw-update.component.html', styleUrls: ['./sw-update.component.scss'],
})
export class SwUpdateComponent implements OnInit, OnDestroy {
  @ViewChild('myModal') myModal: ElementRef;
  public restartOptionsRequest: RestartOptionsRequest = new DefaultRestartOptionsRequest();
  public restartModes = Object.values(RESTART_SERVER_MODES);
  public readonly RESTART_SERVER_MODES = RESTART_SERVER_MODES;
  public restartServerModes: RestartServerMode[] = PRIMARY_SERVER_RESTART_MODES;
  public newSoftwareVersion: string = undefined;
  public softwareVersionInfo: SoftwareVersionInfo;
  public progressModalData: ProgressBarDataInterface;
  public viewProgressBar = false;
  private fileToUpload: File = undefined;
  private subscriptions: Subscription[] = [];
  private serverStatusInfo: ServerInfo;

  constructor(private clientServerModel: ClientServerModel,
              private serverService: ServerService, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.softwareVersionInfo = this.clientServerModel.getServerSoftwareInfo();
    this.clientServerModel.softwareVersionInfo$.subscribe((SoftwareVersionInfo) => {
      this.softwareVersionInfo = SoftwareVersionInfo;
    });
    this.toggleRemoveLicense();
    this.getServerInfo();
  }


  /***
   * Destroys all subscribe data to avoid memory leak
   */
  ngOnDestroy() {
    this.subscriptions?.forEach((sub) => sub.unsubscribe());
  }

  public onFileInput(event: Event) {
    if (this.verifySoftwareUpdateImport(event)) {
      $(this.myModal.nativeElement).modal('show');
    } else {
      swal({
        title: 'Software Update Error',
        text: 'The selected file does not appear to be a valid GuideBuilder Software Update file. Please select a different file.',
        icon: 'warning',
      });
    }
  }

  public doSoftwareUpdate() {
    this.openFileUploadModal();
    const messageAlert = 'The GuideBuilder Server is installing new Software Update and restarting. The application will now close. Please refresh the web page in a few minutes.';
    const observable: Observable<ProgressBarDataInterface> = this.serverService.postSoftwareUpdateExperimental(
      this.restartOptionsRequest, this.fileToUpload);
    const observer = {
      next: (value: ProgressBarDataInterface) => {
        if (value !== undefined) {
          this.progressModalData = value;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        swalErrorLogoutFunction(messageAlert);
      },
      complete: () => {
      }
    };
    this.subscriptions.push(observable.subscribe(observer));
  }

  private openFileUploadModal() {
    this.viewProgressBar = true;
    setTimeout(() => {
      $('#modal-progress-bar').modal('show');
    }, 100);
  }

  public fileProgressModalHandler() {
    console.log('progressModalHandler');
    setTimeout(() => {
      $('#modal-progress-bar').modal('hide');
      this.viewProgressBar = false;
      const messageAlert = 'The GuideBuilder Server is installing new Software Update and restarting. The application will now close. Please refresh the web page in a few minutes.';
      swalErrorLogoutFunction(messageAlert);
    }, 100);

  }

  public togglePurge() {
    this.restartOptionsRequest.clearDatabase = this.restartOptionsRequest.purgeInstallation;
    this.restartOptionsRequest.removeLicense = this.restartOptionsRequest.purgeInstallation;
  }

  public toggleRemoveLicense() {
    if (this.restartOptionsRequest.removeLicense) {
      this.restartServerModes = PRIMARY_SERVER_RESTART_MODES;
      this.restartModes = [RESTART_SERVER_MODES[1], RESTART_SERVER_MODES[2]];
      this.restartOptionsRequest.restartServerMode = RestartServerMode.PASSIVE_MODE;
    } else {
      if (this.serverStatusInfo?.initLevel === InitLevel.LEVEL2){
        this.restartServerModes = REDUNDANT_ENABLED_SERVER_RESTART_MODES;
        this.restartOptionsRequest.restartServerMode = RestartServerMode.REDUNDANCY_MODE;
      }else{
        this.restartServerModes = PRIMARY_SERVER_RESTART_MODES;
        this.restartModes = Object.values(RESTART_SERVER_MODES);
        this.restartOptionsRequest.restartServerMode = RestartServerMode.ACTIVE_MODE;
      }
    }
  }

  public resetFileImport(fileInput?: HTMLInputElement){
    clearFileImportInput(fileInput);
  }

  private verifySoftwareUpdateImport(event: Event): boolean {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList = element.files;
    this.fileToUpload = undefined;
    if (isDefined(fileList) && fileList.length > 0) {
      const selectedFile: File = fileList.item(0);
      const fileName: string = selectedFile.name;
      const extensionValid = fileName?.endsWith('.deb');
      // i think it's too restrictive commenting now to verify with Dave
      /*
      const extensionValid = fileName?.startsWith('GuideBuilder_') && fileName?.endsWith('_amd64.deb');
      if (extensionValid) {
           const fileNameParts: string[] = fileName?.split('_');
           this.newSoftwareVersion = fileNameParts?.length > 1 ? fileNameParts[1] : undefined;
           this.fileToUpload = selectedFile;
       }*/
      if (extensionValid) {
        this.fileToUpload = selectedFile;
      }
    }
    return isDefined(this.fileToUpload);
  }

  private getServerInfo(){
    this.subscriptions.push(
      this.serverService.getServerInfo().subscribe((serverStatusInfo) => {
        this.serverStatusInfo = serverStatusInfo;
        if (serverStatusInfo.initLevel === InitLevel.LEVEL2){
          this.restartServerModes = REDUNDANT_ENABLED_SERVER_RESTART_MODES;
          this.restartOptionsRequest.restartServerMode = RestartServerMode.REDUNDANCY_MODE;
        }
      }));
  }


}
