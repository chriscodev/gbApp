// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.

import {Component, OnDestroy, OnInit} from '@angular/core';
import {AbstractCommitRevertComponent} from '../abstracts/abstract-commit-revert.component';
import {
  DefaultRedundancySettings,
  DefaultRedundancyStatus,
  GpiSettings,
  REDUNDANCY_STATE_TYPES,
  REDUNDANCY_SYSTEM_STATE_TYPES,
  RedundancySettings,
  RedundancyStatus
} from '../../../core/models/server/Redundancy';
import {cloneDeep, isEqual} from 'lodash';
import {BootstrapFunction} from '../../../core/interfaces/interfaces';
import {
  InitLevel,
  REDUNDANT_DISABLED_SERVER_RESTART_MODES,
  REDUNDANT_ENABLED_SERVER_RESTART_MODES,
  RESTART_SERVER_MODES,
  RestartServerMode
} from '../../../core/models/server/Server';
import {isIPAddressValid, validateIP} from '../../../shared/helpers';
import {updateSchemeBasedOnPort} from '../../../shared/helpers/appWideFunctions';
import {ClientLicenseModel} from 'src/app/core/models/ClientLicenseModel';
import {ServerService} from '../../../core/services/server.service';
import {SweetAlert} from 'sweetalert/typings/core';
import * as _swal from '../../../../assets/node_modules/sweetalert/sweetalert';
import {SystemType} from '../../../core/models/server/License';
import {isDefined} from '../../../core/models/dtv/utils/Utils';
import {RedundancyService} from '../../../core/services/redundancy-service';
import {ClientRedundancyModel} from '../../../core/models/ClientRedundancyModel';

const swal: SweetAlert = _swal as any;
declare var $: BootstrapFunction;

@Component({
  selector: 'app-redundancy',
  templateUrl: './redundancy.component.html',
  styleUrl: './redundancy.component.scss'
})
export class RedundancyComponent extends AbstractCommitRevertComponent implements OnInit, OnDestroy {
  public readonly REDUNDANCY_STATE_TYPES = REDUNDANCY_STATE_TYPES;
  public readonly REDUNDANCY_SYSTEM_STATE_TYPES = REDUNDANCY_SYSTEM_STATE_TYPES;
  public readonly RESTART_SERVER_MODES = RESTART_SERVER_MODES;
  public restartServerModes: RestartServerMode[] = Object.values(RestartServerMode);
  public readonly SystemType = SystemType;
  public readonly RestartServerMode = RestartServerMode;
  public readonly validateIP = validateIP;
  public localRedundancySettings: RedundancySettings = new DefaultRedundancySettings();
  public serverRedundancySettings: RedundancySettings;
  public editRedundancySettings: RedundancySettings;
  public redundancyStatus: RedundancyStatus = new DefaultRedundancyStatus();
  public nameIconText: string;
  public enableTestButton: boolean;
  public loading: boolean;
  public cssClass: string;
  public errorMessage: string;
  public systemType: string;
  private systemMode: string;
  private validHost: boolean;
  private validPort: boolean;

  constructor(private redundancyService: RedundancyService, private clientRedundancyModel: ClientRedundancyModel,
              private clientLicenseModel: ClientLicenseModel, private serverService: ServerService
  ) {
    super();
  }

  public ngOnInit(): void {
    this.loadServerRedundancy();
  }

  public ngOnDestroy(): void {
    this.cleanUpSubscriptions();
  }

  public loadServerRedundancy() {
    this.subscriptions.push(
      this.clientRedundancyModel.redundancySettings$.subscribe(redundancySettings => {
        this.localRedundancySettings = cloneDeep(redundancySettings);
        this.serverRedundancySettings = cloneDeep(this.localRedundancySettings);
        this.updateRedundancySettings(cloneDeep(redundancySettings));
        this.editRedundancySettings = cloneDeep(this.localRedundancySettings);
        this.toggleRedundancyEnabled();
        this.restartServerModes = this.localRedundancySettings.enabled ?
          REDUNDANT_ENABLED_SERVER_RESTART_MODES : REDUNDANT_DISABLED_SERVER_RESTART_MODES;
        this.localRedundancySettings.target = this.restartServerModes[0];

        this.loading = false;
      })
    );
    this.subscriptions.push(
      this.clientRedundancyModel.redundancyStatus$.subscribe(redundancyStatus => {
        this.redundancyStatus = redundancyStatus;
      })
    );

    this.clientLicenseModel.serverLicenseInfo$.subscribe((serverLicenseInfo) => {
      this.systemType = serverLicenseInfo?.serverLicense?.systemType;
    });

    this.serverService.getServerInfo().subscribe((serverStatusInfo) => {
      this.systemMode = serverStatusInfo.initLevel;
      this.restartServerModes = this.systemMode === InitLevel.LEVEL2 ?
        REDUNDANT_ENABLED_SERVER_RESTART_MODES : REDUNDANT_DISABLED_SERVER_RESTART_MODES;
    });

  }

  public canDeactivate() {
    return !this.dirty;
  }

  public onCommit(): void {
    this.dirty = false;
    localStorage.setItem('initLevel', this.localRedundancySettings.target);
    this.localRedundancySettings = updateSchemeBasedOnPort(this.localRedundancySettings);
    this.clientRedundancyModel.update(this.localRedundancySettings);
  }

  public updateDirty(): void {
    this.dirty = !isEqual(this.localRedundancySettings, this.serverRedundancySettings);
  }

  public onRevert() {
    this.loadServerRedundancy();
  }

  public openModalEditRedundancySettings() {
    this.editRedundancySettings = cloneDeep(this.localRedundancySettings);
    this.restartServerModes = this.editRedundancySettings.enabled ?
      REDUNDANT_ENABLED_SERVER_RESTART_MODES : REDUNDANT_DISABLED_SERVER_RESTART_MODES;
    this.editRedundancySettings.target = this.restartServerModes[0];
    if (this.editRedundancySettings.enabled === false) {
      this.editRedundancySettings.target = this.localRedundancySettings.target;
    }
  }

  public doUpdateEditRedundancySettings() {
    this.localRedundancySettings = this.editRedundancySettings;
    this.restartServerModes = this.localRedundancySettings.enabled ?
      REDUNDANT_ENABLED_SERVER_RESTART_MODES : REDUNDANT_DISABLED_SERVER_RESTART_MODES;
    this.updateDirty();
  }

  public openTestDialog() {
    this.loading = true;
    this.redundancyService.testRedundancySettings(this.editRedundancySettings).subscribe(
      (res) => {
        this.errorMessage = 'Success';
        this.cssClass = 'success';
        this.loading = false;
      },
      (error) => {
        this.errorMessage = error.error;
        this.cssClass = 'danger';
        this.loading = false;
      }
    );

    this.errorMessage = '';
    $('#testConnectionRedundancy').modal('show');
  }

  public closeTestDialog() {
    $('#testConnectionRedundancy').modal('hide');
  }

  public inputRedundancy() {
    this.updateValidHost();
    this.updateValidPort();
    this.updateTestEnabled();
  }

  public toggleRedundancyEnabled() {
    if (isDefined(this.editRedundancySettings)) {
      this.editRedundancySettings.enabled = !this.editRedundancySettings.enabled;
      this.restartServerModes = this.editRedundancySettings.enabled ?
        REDUNDANT_ENABLED_SERVER_RESTART_MODES : REDUNDANT_DISABLED_SERVER_RESTART_MODES;
      this.editRedundancySettings.target = this.restartServerModes[0];
      this.inputRedundancy();
    }
  }

  public checkHostValid() {
    return this.getValidIcon(this.validHost);
  }

  public checkPortValid() {
    return this.getValidIcon(this.validPort);
  }

  public switchDialog() {
    // TODO DAC Check below
    // const targetSwitch = this.localRedundancySettings.target === RestartServerMode.ACTIVE_MODE ? RestartServerMode.REDUNDANCY_MODE : RestartServerMode.ACTIVE_MODE;
    const targetSwitch = this.localRedundancySettings.target === RestartServerMode.ACTIVE_MODE ? RestartServerMode.PASSIVE_MODE : RestartServerMode.ACTIVE_MODE;
    swal({
      title: 'Redundancy Switch Confirmation',
      text: 'To Switch to ' + (RESTART_SERVER_MODES[targetSwitch].displayName || targetSwitch) + ', the system needs to restart. Do You wish to continue?',
      buttons: ['Cancel', 'Ok'],
      icon: 'warning',
    }).then((isConfirm) => {
      if (isConfirm) {
        console.log('isConfirm', isConfirm);
        $('.swal-overlay').remove();
        $('.fixed-layout').removeAttr('style');
        this.localRedundancySettings.enabled = targetSwitch !== RestartServerMode.ACTIVE_MODE;
        // this.localRedundancySettings.target = this.localRedundancySettings.target === RestartServerMode.ACTIVE_MODE ? RestartServerMode.REDUNDANCY_MODE : RestartServerMode.ACTIVE_MODE;
        this.localRedundancySettings.target = this.localRedundancySettings.target === RestartServerMode.ACTIVE_MODE ? RestartServerMode.PASSIVE_MODE : RestartServerMode.ACTIVE_MODE;
        this.updateDirty();
        this.onCommit();
      }
    });
  }

  private updateRedundancySettings(redundancySettings: RedundancySettings) {
    this.localRedundancySettings = redundancySettings;
    this.localRedundancySettings.gpiSetting = new GpiSettings(false, '');
    this.serverRedundancySettings = cloneDeep(this.localRedundancySettings);
    this.editRedundancySettings = cloneDeep(this.localRedundancySettings);
    this.updateDirty();
    this.inputRedundancy();
  }

  private getValidIcon(valid: boolean): string {
    return valid ? 'fa-check-circle text-success' : 'fa-times-circle text-danger';
  }

  private updateValidHost(): void {
    this.validHost = this.editRedundancySettings.enabled ? isIPAddressValid(this.editRedundancySettings.host) : true;
  }

  private updateValidPort(): void {
    this.validPort = this.editRedundancySettings.enabled ? this.editRedundancySettings.port > 0 : true;
  }

  private updateTestEnabled(): void {
    this.enableTestButton = this.validHost && this.validPort && this.editRedundancySettings?.enabled;
  }

}
