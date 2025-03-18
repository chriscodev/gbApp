// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {LicenseService} from '../../../core/services/license.service';
import {DOCUMENT} from '@angular/common';
import {errorLogoutFunction} from '../../../shared/helpers/appWideFunctions';
import {
  FeatureType,
  LICENSED_NETWORK_TYPES,
  LicensedNetworkType,
  LicenseRequest,
  NODE_LOCK_TYPES,
  OfflineLicenseRequest,
  OfflineLicenseResponse,
  OnlineResponse,
  ServerLicenseInfo,
  SYSTEM_TYPES
} from '../../../core/models/server/License';
import {ClientLicenseModel} from 'src/app/core/models/ClientLicenseModel';
import {isDefined} from '../../../core/models/dtv/utils/Utils';
import {SCHEDULE_PROVIDER_TYPES, ScheduleProviderType} from '../../../core/models/dtv/schedule/ScheduleProvider';
import {OUTPUT_TYPES, OutputType} from '../../../core/models/dtv/output/Output';
import {BootstrapFunction} from '../../../core/interfaces/interfaces';

declare var $: BootstrapFunction;

@Component({
  selector: 'app-features', templateUrl: './features.component.html', styleUrls: ['./features.component.scss'],
})
export class FeaturesComponent implements OnInit, OnDestroy {
  @ViewChild('statusSpinner', {read: ElementRef, static: false}) statusSpinnerElement: ElementRef;
  @ViewChild('statusSpinner2', {read: ElementRef, static: false}) statusSpinnerElement2: ElementRef;
  @ViewChild('serverRestartModal') serverRestartModal: ElementRef;
  public readonly NODE_LOCK_TYPES = NODE_LOCK_TYPES;
  public readonly SYSTEM_TYPES = SYSTEM_TYPES;
  public serverLicenseInfo: ServerLicenseInfo;
  public activatedLicensed = false;
  public networkTypeList: FeatureType[] = [];
  public enabledProvidersList: FeatureType[] = [];
  public enabledOutputsList: FeatureType[] = [];
  public MAX_JAVA_INT = 2147483647;
  public formTitle: string;
  public formButton: string;
  public buttonAct1: string;
  public buttonAct2: string;
  public buttonAct3: string;
  public activateRefreshModalInfo: ActivateRefreshModalInfo;
  public requestPending = false;
  public resultMessage: string;
  public responseStringToUpload: string;
  public applyResponseValid = false;

  private activateRefreshOperation: ActivateRefreshOperation;
  private subscriptions: Subscription[] = [];

  constructor(private licenseService: LicenseService, private clientLicenseModel: ClientLicenseModel,
              @Inject(DOCUMENT) private document: Document) {
    this.document.body.classList.add('featureComponent');
    this.subscriptions.push(this.clientLicenseModel.serverLicenseInfo$.subscribe((serverLicenseInfo) => {
      this.serverLicenseInfo = serverLicenseInfo;
      this.loadLicenseData();
    }));
  }

  public ngOnInit(): void {
    for (const [enumAsString, licensedNetworkType] of Object.entries(LicensedNetworkType)) {
      this.networkTypeList.push(
        new FeatureType(enumAsString, LICENSED_NETWORK_TYPES[licensedNetworkType].displayName));
    }
    for (const [enumAsString, scheduleProviderType] of Object.entries(ScheduleProviderType)) {
      this.enabledProvidersList.push(
        new FeatureType(enumAsString, SCHEDULE_PROVIDER_TYPES[scheduleProviderType].displayName));
    }
    for (const [enumAsString, outputType] of Object.entries(OutputType)) {
      this.enabledOutputsList.push(new FeatureType(enumAsString, OUTPUT_TYPES[outputType].displayName));
    }
  }

  public ngOnDestroy() {
    this.subscriptions?.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
    this.document.body.classList.remove('featureComponent');
  }

  public updateRefreshActivateOnlineNames(): void {
    this.formTitle = this.activatedLicensed ? 'Refresh License Online' : 'Activate License Online';
    this.formButton = this.activatedLicensed ? 'Refresh Online' : 'Activate Online';
    this.activateRefreshOperation = ActivateRefreshOperation.ActivateRefreshOnline;
  }

  public updateRefreshActivateOfflineNames(): void {
    this.formTitle = this.activatedLicensed ? 'Refresh License Offline (Manual Request)' : 'Activate License Offline (Manual Request)';
    this.formButton = this.activatedLicensed ? 'Refresh Offline' : 'Activate Offline';
    this.activateRefreshOperation = ActivateRefreshOperation.ActivateRefreshOffline;
  }

  public updateResponseOfflineNames(): void {
    this.formTitle = 'Apply Response Offline (Manual Request)';
    this.formButton = 'Refresh Offline';
    this.activateRefreshOperation = ActivateRefreshOperation.ApplyResponseOffline;
    this.responseStringToUpload = '';
    this.validateResponseValid();
    $('#file').val('');
  }

  public validateNumbersOnly($event: KeyboardEvent): void {
    if ($event.key === '-' || $event.key === '.') {
      $event.preventDefault();
    }
  }

  public doActivateRefresh() {
    this.requestPending = false;
    this.resultMessage = '';
    switch (this.activateRefreshOperation) {
      case ActivateRefreshOperation.ActivateRefreshOnline:
        $(this.serverRestartModal.nativeElement).modal('show');
        break;
      case ActivateRefreshOperation.ActivateRefreshOffline:
        this.activateRefreshOffline(
          new LicenseRequest(this.activateRefreshModalInfo.licenseId,
            this.activateRefreshModalInfo.activationPassword,
            this.activateRefreshModalInfo.installationName, false));
        break;
    }
  }

  public doApplyResponse() {
    this.requestPending = false;
    this.resultMessage = '';
    // calls for server restart yes no
    $(this.serverRestartModal.nativeElement).modal('show');
  }

  public closeModal(): void {
    this.requestPending = false;
    this.resultMessage = '';
    this.statusSpinnerElement.nativeElement.classList.remove('fa-spin');
  }

  public doServerRestart(restartOnSuccess: boolean) {
    const offlineLicenseRequest = new LicenseRequest(this.activateRefreshModalInfo.licenseId,
      this.activateRefreshModalInfo.activationPassword, this.activateRefreshModalInfo.installationName,
      restartOnSuccess);
    switch (this.activateRefreshOperation) {
      case ActivateRefreshOperation.ActivateRefreshOnline:
        this.activateRefreshOnline(offlineLicenseRequest, restartOnSuccess);
        break;
      case ActivateRefreshOperation.ActivateRefreshOffline:
        this.activateRefreshOffline(offlineLicenseRequest);
        break;
      case ActivateRefreshOperation.ApplyResponseOffline:
        this.activateResponseOffline(restartOnSuccess);
        break;
    }
  }

  public fileChanged(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList = element.files;
    if (isDefined(fileList) && fileList.length > 0) {
      const selectedFile: File = fileList.item(0);
      const fileReader = new FileReader();
      fileReader.onload = (): void => {
        this.responseStringToUpload = fileReader.result as string;
        this.validateResponseValid();
      };
      fileReader.readAsText(selectedFile);
    }
  }

  public findInArray(list: string[], item: string): boolean {
    if (item === OutputType.ATSC3_UDP) {
      const additionalTypes = [OutputType.ATSC3_UDP.toString(), OutputType.ATSC3_TRANSLATOR.toString()];
      return additionalTypes.some(type => list.includes(type));
    } else if (item === OutputType.ATSC3_TRANSLATOR) {
      return list.includes(OutputType.ATSC3_UDP.toString()) || list.includes(item);
    } else {
      return list?.includes(item);
    }
  }

  public validateResponseValid() {
    this.applyResponseValid = this.responseStringToUpload !== '';
  }

  private activateRefreshOnline(onlineLicenseRequest: LicenseRequest, restartOnSuccess: boolean) {
    this.requestPending = true;
    this.resultMessage = '';
    this.statusSpinnerElement.nativeElement.classList.add('fa-spin');
    if (this.activatedLicensed) {
      const successMessage = 'License Refreshed';
      const observable: Observable<OnlineResponse> = this.licenseService.refreshLicenseOnline(
        onlineLicenseRequest);
      const observer = {
        next: (onlineResponse: OnlineResponse) => {
          this.processLicenseResponse(onlineResponse.accepted,
            onlineResponse.accepted ? successMessage : onlineResponse.message, this.statusSpinnerElement,
            restartOnSuccess);
        },
        error: (err) => {
          // This happens if server shuts down immediately
          this.processLicenseResponseDisconnect(successMessage, this.statusSpinnerElement);
        }
      };
      this.subscriptions.push(observable.subscribe(observer));
    } else {
      const successMessage = 'License Activated';
      const observable: Observable<OnlineResponse> = this.licenseService.activateLicenseOnline(
        onlineLicenseRequest);
      const observer = {
        next: (onlineResponse: OnlineResponse) => {
          this.processLicenseResponse(onlineResponse.accepted,
            onlineResponse.accepted ? successMessage : onlineResponse.message, this.statusSpinnerElement,
            restartOnSuccess);
        },
        error: (err) => {
          // This happens if server shuts down immediately
          this.processLicenseResponseDisconnect(successMessage, this.statusSpinnerElement);
        }
      };
      this.subscriptions.push(observable.subscribe(observer));
    }
  }

  private activateRefreshOffline(licenseRequest: LicenseRequest) {
    this.requestPending = true;
    this.resultMessage = '';
    this.statusSpinnerElement.nativeElement.classList.add('fa-spin');
    if (this.activatedLicensed) {
      // OFFLINE REFRESH API
      const successMessage = 'License Refreshed';
      this.subscriptions.push(
        this.licenseService.createOfflineRefreshRequest(licenseRequest).subscribe((offlineLicenseResponse) => {
          this.resultMessage = offlineLicenseResponse.message;
          this.requestPending = false;
          this.statusSpinnerElement.nativeElement.classList.remove('fa-spin');
          if (offlineLicenseResponse.accepted === true) {
            this.resultMessage = successMessage;
            this.doDownloadOfflineLicenseResponse(offlineLicenseResponse);
          } else {
            this.resultMessage = offlineLicenseResponse.message;
          }
        }));
    } else {
      const successMessage = 'License Activated';
      this.subscriptions.push(
        this.licenseService.createOfflineActivationRequest(licenseRequest).subscribe(
          (offlineLicenseResponse) => {
            this.requestPending = false;
            this.statusSpinnerElement.nativeElement.classList.remove('fa-spin');
            if (offlineLicenseResponse.accepted === true) {
              this.resultMessage = successMessage;
              this.doDownloadOfflineLicenseResponse(offlineLicenseResponse);
            } else {
              this.resultMessage = offlineLicenseResponse.message;
            }
          }));
    }
  }

  private activateResponseOffline(restartOnSuccess: boolean) {
    console.log('activateResponseOfflineAPI, fileToUpload\n', this.responseStringToUpload);
    const fileResponseB64String: string = window.btoa(this.responseStringToUpload);
    console.log('activateResponseOfflineAPI, fileResponseB64String\n', fileResponseB64String);
    const offlineLicenseRequest: OfflineLicenseRequest = new OfflineLicenseRequest(fileResponseB64String, true,
      restartOnSuccess);
    this.resultMessage = '';
    this.requestPending = true;
    this.statusSpinnerElement2.nativeElement.classList.add('fa-spin');
    if (this.activatedLicensed) {
      const successMessage = 'License Refreshed';
      const observable: Observable<OfflineLicenseResponse> = this.licenseService.applyOfflineRefreshResponse(
        offlineLicenseRequest);
      const observer = {
        next: (offlineLicenseResponse: OfflineLicenseResponse) => {
          this.processLicenseResponse(offlineLicenseResponse.accepted,
            offlineLicenseResponse.accepted ? successMessage : offlineLicenseResponse.message,
            this.statusSpinnerElement2, restartOnSuccess);
        },
        error: (err) => {
          // This happens if server shuts down immediately
          this.processLicenseResponseDisconnect(successMessage, this.statusSpinnerElement2);
        }
      };
      this.subscriptions.push(observable.subscribe(observer));
    } else {
      const successMessage = 'License Activated';
      const observable: Observable<OfflineLicenseResponse> = this.licenseService.applyOfflineActivationResponse(
        offlineLicenseRequest);
      const observer = {
        next: (offlineLicenseResponse: OfflineLicenseResponse) => {
          this.processLicenseResponse(offlineLicenseResponse.accepted,
            offlineLicenseResponse.accepted ? successMessage : offlineLicenseResponse.message,
            this.statusSpinnerElement2, restartOnSuccess);
        },
        error: () => {
          // This happens if server shuts down immediately
          this.processLicenseResponseDisconnect(successMessage, this.statusSpinnerElement2);
        }
      };
      this.subscriptions.push(observable.subscribe(observer));
    }
  }

  private processLicenseResponse(success: boolean, resultMessage: string, spinner: ElementRef,
                                 restartOnSuccess: boolean): void {
    this.requestPending = false;
    spinner.nativeElement.classList.remove('fa-spin');
    this.resultMessage = resultMessage;
    if (success && restartOnSuccess) {
      errorLogoutFunction(200);
    }
  }

  private processLicenseResponseDisconnect(successMessage: string, spinner: ElementRef): void {
    this.requestPending = false;
    spinner.nativeElement.classList.remove('fa-spin');
    this.resultMessage = successMessage;
    errorLogoutFunction(200);
  }

  private loadLicenseData() {
    if (isDefined(this.serverLicenseInfo?.serverLicense)) {
      this.activatedLicensed = true;
      this.buttonAct1 = 'Refresh License Online';
      this.buttonAct2 = 'Refresh License Offline (Manual Request)';
      this.buttonAct3 = 'Apply Response Offline (Manual Response)';
    } else {
      this.activatedLicensed = false;
      this.buttonAct1 = 'Activate License Online';
      this.buttonAct2 = 'Activate License Offline (Manual Request)';
      this.buttonAct3 = 'Apply Response Offline (Manual Response)';
    }
    this.activateRefreshModalInfo = new ActivateRefreshModalInfo(this.serverLicenseInfo?.serverLicense?.licenseId,
      this.serverLicenseInfo?.serverLicense?.activationPassword,
      this.serverLicenseInfo?.serverLicense?.installationName);
    console.log('Features loadLicenseData this.activatedLicensed: ', this.activatedLicensed);
  }

  private doDownloadOfflineLicenseResponse(offlineLicenseResponse: OfflineLicenseResponse): void {
    $('.fixed-layout').removeAttr('style');
    this.requestPending = false;
    this.resultMessage = offlineLicenseResponse.message;
    const htmlString = window.atob(offlineLicenseResponse.activationRequestString);
    const blob = new Blob([htmlString], {type: 'application/octet-stream'});
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.download = 'licenseActivateOffline.html';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
}

class ActivateRefreshModalInfo {
  constructor(public licenseId: number, public activationPassword: string, public installationName: string) {
  }

  public isValid(): boolean {
    return this.licenseId > 0 && this.activationPassword?.length > 0 && this.installationName?.length > 0;
  }
}

enum ActivateRefreshOperation {
  ActivateRefreshOnline, ActivateRefreshOffline, ApplyResponseOffline
}
