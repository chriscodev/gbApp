/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */
import {Component, EventEmitter, Inject, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {numberOnly} from 'src/app/shared/helpers/appWideFunctions';
import {
  AEA_INGEST_TYPES,
  AEAIngestType,
  ATSC3AEASettings,
  DefaultATSC3AEASettings
} from 'src/app/core/models/dtv/network/physical/stream/ip/service-group/ServiceGroup';
import {cloneDeep} from 'lodash';
import {SweetAlert} from 'sweetalert/typings/core';
import * as _swal from 'sweetalert';
import {isDefined} from '../../../../../../../../core/models/dtv/utils/Utils';
import {inRangeCheck} from '../../../../../../../helpers/mathHelprrs';
import {
  ModalTransportServiceGroupComponent
} from '../modal-transport-service-group/modal-transport-service-group.component';

const swal: SweetAlert = _swal as any;
declare var _: any;
declare var $;

@Component({
  selector: 'app-modal-transport-edit-aea-settings',
  templateUrl: './modal-transport-edit-aea-settings.component.html',
  styleUrls: ['./modal-transport-edit-aea-settings.component.scss']
})
export class ModalTransportEditAeaSettingsComponent implements OnChanges {
  @Input() aeaSettings: ATSC3AEASettings;
  @Output() aeaSettingsChanged: EventEmitter<ATSC3AEASettings> = new EventEmitter();
  public readonly numberOnly = numberOnly;
  public readonly AEAIngestType = AEAIngestType;
  public readonly AEA_INGEST_TYPES = AEA_INGEST_TYPES;
  public readonly aeaIngestTypes: AEAIngestType[] = Object.values(AEAIngestType);
  public localAEASettings: ATSC3AEASettings = new DefaultATSC3AEASettings();
  public aeaIntervalIconText: string;
  public usernameIconText: string;
  public passwordIconText: string;
  public showPassword = false;
  public authenKeyIconText: string;
  public ftpBasedIngestType: boolean;
  public nrtBitrateIconText: string;
  public updateEnabled: boolean;
  private aeaIntervalValid: boolean;
  private usernameValid: boolean;
  private passwordValid: boolean;
  private authenKeyValid: boolean;
  private nrtBitrateValid: boolean;
  private pendingFTPUsernames: string[] = [];
  private pendingSFTPUsernames: string[] = [];

  constructor(@Inject(
    ModalTransportServiceGroupComponent) private serviceGroupComponent: ModalTransportServiceGroupComponent) {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (isDefined(changes.aeaSettings?.currentValue)) {
      this.localAEASettings = cloneDeep(changes.aeaSettings.currentValue);
    }
    this.updatePendingFTPNames();
    this.inputAEA();
  }

  public inputAEA(): void {
    this.updateFTPBasedIngestType();
    this.updateAEAIntervalValid();
    this.updateUsernameValid();
    this.updatePasswordValid();
    this.updateAuthenKeyValid();
    this.updateNRTBitrateValid();
    this.updateOkEnabled();
  }

  public onIngestTypeChanged(): void {
    this.inputAEA();
  }

  public toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  public closeModal() {
    $('#modalEditAEASettings').modal('hide');
  }

  public setDefaultSettings() {
    swal({
      title: 'Are you sure you want to reset AEA settings to system defaults?',
      buttons: ['No', 'Yes'],
      icon: 'warning',
    }).then((isConfirm) => {
      if (isConfirm) {
        this.localAEASettings = new DefaultATSC3AEASettings();
        this.inputAEA();
      }
    });
  }

  public updateAEASettings(): void {
    this.closeModal();
    this.aeaSettingsChanged.emit(this.localAEASettings);
  }

  public updateFTPBasedIngestType(): void {
    this.ftpBasedIngestType = this.localAEASettings.aeaIngestType === AEAIngestType.FTP ||
      this.localAEASettings.aeaIngestType === AEAIngestType.SFTP;
  }

  private updateAEAIntervalValid(): void {
    this.aeaIntervalValid = !this.localAEASettings.aeatEnabled || inRangeCheck(this.localAEASettings.aeatInterval,
      1000, 300000);
    this.aeaIntervalIconText = this.aeaIntervalValid ? 'text-success' : 'text-danger';
  }

  private updateUsernameValid(): void {
    const uniqueName = this.isUserNameUnique();
    this.usernameValid = !this.localAEASettings.aeatEnabled || !this.ftpBasedIngestType ||
      (uniqueName && this.ftpBasedIngestType && this.localAEASettings.aeaUserName?.length > 0);
    this.usernameIconText = this.usernameValid ? 'text-success' : 'text-danger';
  }

  private updatePasswordValid(): void {
    this.passwordValid = !this.localAEASettings.aeatEnabled || !this.ftpBasedIngestType ||
      (this.ftpBasedIngestType && this.localAEASettings?.aeaPassword?.length > 0);
    this.passwordIconText = this.passwordValid ? 'text-success' : 'text-danger';
  }

  private updateAuthenKeyValid(): void {
    const apiKeyNeeded = this.localAEASettings.aeaIngestType === AEAIngestType.API;
    this.authenKeyValid = !this.localAEASettings.aeatEnabled || !apiKeyNeeded ||
      (apiKeyNeeded && this.localAEASettings.aeaAuthenticationKey?.length > 0);
    this.authenKeyIconText = this.authenKeyValid ? 'text-success' : 'text-danger';
  }

  private updateNRTBitrateValid(): void {
    const nrtBitrateDisabled = !this.localAEASettings.aeatEnabled || !this.localAEASettings.aeatNrtEnabled;
    this.nrtBitrateValid = nrtBitrateDisabled ||
      inRangeCheck(this.localAEASettings.aeatNrtBitrate, 1000, 2147483647);
    this.nrtBitrateIconText = this.nrtBitrateValid ? 'text-success' : 'text-danger';
  }

  private updateOkEnabled(): void {
    this.updateEnabled = this.aeaIntervalValid && this.usernameValid && this.passwordValid && this.authenKeyValid && this.nrtBitrateValid;
  }

  private updatePendingFTPNames(): void {
    this.pendingFTPUsernames = [];
    this.pendingSFTPUsernames = [];
    this.serviceGroupComponent.otherAEASettings?.forEach(aeaSetting => {
      if (aeaSetting.aeatEnabled && aeaSetting.aeaIngestType === AEAIngestType.FTP) {
        if (!this.pendingFTPUsernames.includes(aeaSetting.aeaUserName)) {
          this.pendingFTPUsernames.push(aeaSetting.aeaUserName);
        }
      } else if (aeaSetting.aeatEnabled && aeaSetting.aeaIngestType === AEAIngestType.SFTP) {
        if (!this.pendingSFTPUsernames.includes(aeaSetting.aeaUserName)) {
          this.pendingSFTPUsernames.push(aeaSetting.aeaUserName);
        }
      }
    });
    console.log('updatePendingFTPNames this.pendingFTPUsernames: ', this.pendingFTPUsernames);
    console.log('updatePendingFTPNames this.pendingSFTPUsernames: ', this.pendingSFTPUsernames);
  }

  private isUserNameUnique(): boolean {
    let userNameUnique = true;
    if (this.localAEASettings.aeaIngestType === AEAIngestType.FTP) {
      userNameUnique = !isDefined(this.pendingFTPUsernames.find(
        ftpUserName => ftpUserName === this.localAEASettings.aeaUserName));
    } else if (this.localAEASettings.aeaIngestType === AEAIngestType.SFTP) {
      userNameUnique = !isDefined(this.pendingSFTPUsernames.find(
        ftpUserName => ftpUserName === this.localAEASettings.aeaUserName));
    }
    return userNameUnique;
  }
}
