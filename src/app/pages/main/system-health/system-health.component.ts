// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.

import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {swalErrorLogoutFunction} from '../../../shared/helpers/appWideFunctions';
import {resetTabSelectedClass} from '../../../shared/helpers/tableSelection';
import {
  DebianPackage,
  DefaultRestartOptionsRequest,
  DefaultServerInfo,
  DiskPartition, INIT_LEVELS,
  InitLevel,
  POWER_SUPPLY_STATES,
  PRIMARY_SERVER_RESTART_MODES,
  RAIDState,
  REDUNDANT_ENABLED_SERVER_RESTART_MODES,
  RESTART_SERVER_MODES,
  RestartOptionsRequest,
  RestartServerMode,
  ServerInfo,
  ServerStatus
} from '../../../core/models/server/Server';
import {BootstrapFunction} from '../../../core/interfaces/interfaces';
import {ClientServerModel} from '../../../core/models/ClientServerModel';
import {ServerService} from '../../../core/services/server.service';
import {ClientLicenseModel} from '../../../core/models/ClientLicenseModel';
import {SystemType} from '../../../core/models/server/License';
import {MultipleTableColumns} from '../../../core/models/ui/dynamicTable';

declare var $: BootstrapFunction;

@Component({
  selector: 'app-system-health',
  templateUrl: './system-health.component.html',
  styleUrls: ['./system-health.component.scss'],
})
export class SystemHealthComponent implements OnInit, OnDestroy {
  public readonly RESTART_SERVER_MODES = RESTART_SERVER_MODES;
  public readonly POWER_SUPPLY_STATES = POWER_SUPPLY_STATES;
  public readonly RAIDState = RAIDState;
  public restartServerModes: RestartServerMode[] = PRIMARY_SERVER_RESTART_MODES;
  public restartOptionsRequest: RestartOptionsRequest = new DefaultRestartOptionsRequest();
  public serverInfo: ServerInfo = new DefaultServerInfo();
  public systemType: SystemType;
  public systemMode: InitLevel;
  public serverStatus: ServerStatus;
  public restartGuideBuilderTitle: string;
  public restartGuideBuilderTitleHead: string;
  public debianPackages: DebianPackage[] = [];
  public totalMemory: string;
  public diskTableHeaders: MultipleTableColumns[] = [
    {header: 'File System', key: 'fileSystem', visible: true},
    {header: 'Size', key: 'partitionSize', visible: true},
    {header: 'Used', key: 'amountUsed', visible: true},
    {header: 'Available', key: 'amountAvailable', visible: true},
    {header: 'Use %', key: 'percentUsed', visible: true},
    {header: 'Mounted', key: 'mountedOn', visible: true},
  ];
  public packagesTableHeaders: MultipleTableColumns[] = [
    {header: 'Name', key: 'name', visible: true},
    {header: 'Version', key: 'version', visible: true},
    {header: 'Status', key: 'status', visible: true},
    {header: 'Summary', key: 'summary', visible: true}
  ];
  public diskPartitions: DiskPartition[] = [];
  public headerTabs = [
    {tabName: 'Disk Utilization', activeId: 1},
    {tabName: 'Installed Packages', activeId: 2},
  ];
  public activeId = 1;
  private subscriptions: Subscription[] = [];

  constructor(private serverService: ServerService,
              private clientServerModel: ClientServerModel,
              private clientLicenseModel: ClientLicenseModel) {

    // check with Codev is this needed ?
    // this.router.events.subscribe((evt) => {
    //   if (evt instanceof NavigationEnd) {
    //     // trick the Router into believing it's last link wasn't previously loaded
    //     this.router.navigated = false;
    //     // if you need to scroll back to top, here is the right place
    //     window.scrollTo(0, 0);
    //   }
    // });
  }

  public ngOnInit(): void {
    this.getDebianPackage();
    this.getServerInfo();
    this.getServerStatus();
  }

  public ngOnDestroy(): void {
    this.subscriptions?.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public getServerInfo() {
    this.subscriptions.push(this.clientServerModel.serverInfo$.subscribe(() => {
      this.serverInfo = this.clientServerModel.serverInfoSubject.getValue();
      this.systemMode = this.serverInfo.initLevel;
      this.restartServerModes = this.systemMode === InitLevel.LEVEL2 ? REDUNDANT_ENABLED_SERVER_RESTART_MODES : PRIMARY_SERVER_RESTART_MODES;
      this.restartOptionsRequest.restartServerMode = this.restartServerModes[0];
      this.formatTotalMemory();
    }));
  }

  public formatTotalMemory() {
    if (this.serverInfo.totalMemory !== 'Unknown') {
      const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB'];
      const [size, unit] = this.serverInfo.totalMemory.split(' ');

      let value = parseFloat(size);
      let unitIndex = units.indexOf(unit);

      // Ensure the unit is valid
      if (unitIndex === -1) {
        this.totalMemory = this.serverInfo.totalMemory;
      }
      // Convert to bytes
      while (unitIndex > 0) {
        value *= 1024;
        unitIndex--;
      }
      this.totalMemory = this.formatBytes(value);
    } else {
      this.totalMemory = this.serverInfo.totalMemory;
    }
  }

  public formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i))?.toFixed(dm)) + ' ' + sizes[i];
  }

  public showRestartConfirmation(reboot: boolean) {
    this.restartGuideBuilderTitleHead = reboot ? 'Reboot' : 'Restart';
    this.restartGuideBuilderTitle = this.restartGuideBuilderTitleHead + ' GuideBuilder Confirmation';
    this.restartOptionsRequest.rebootWhenComplete = reboot;
  }

  public requestRestart() {
    this.subscriptions.push(
      this.serverService.postServerRestart(this.restartOptionsRequest).subscribe(restartOptionsRequest => {
        const messageAlert =
          'The GuideBuilder Server is restarting. The application will restart in a restartOptionsRequest minutes.';
        $('#restartRebootModal').modal('hide');
        swalErrorLogoutFunction(messageAlert);
      }));
  }

  public toggleRemoveLicense() {
    this.restartServerModes = this.restartOptionsRequest.removeLicense ?
      [RestartServerMode.PASSIVE_MODE, RestartServerMode.MAINTENANCE_MODE ] :
      (this.systemMode === InitLevel.LEVEL2 ? REDUNDANT_ENABLED_SERVER_RESTART_MODES : PRIMARY_SERVER_RESTART_MODES);
  }

  public showShutdownConfirmation() {
    this.restartGuideBuilderTitle = 'Shutdown GuideBuilder Confirmation';
  }

  public requestShutdown() {
    this.subscriptions.push(this.serverService.postServerShutdown().subscribe(restartOptionsRequest => {
      const messageAlert = 'The GuideBuilder Server is shutting down.';
      $('#shutdownModal').modal('hide');
      swalErrorLogoutFunction(messageAlert);
    }));
  }

  public refreshPackagesTable() {
    this.getDebianPackage();
  }

  public activeIdChangedHandler(id: number) {
    resetTabSelectedClass().then();
    this.activeId = id;
  }

  public resetRestartValue(){
    this.restartOptionsRequest.clearDatabase = false;
    this.restartOptionsRequest.removeLicense = false;
    this.toggleRemoveLicense();
  }

  private getServerStatus() {
    this.subscriptions.push(this.serverService.getServerStatus().subscribe(serverStatus => {
      this.serverStatus = serverStatus;
      this.diskPartitions = serverStatus.diskPartitions;
    }));
  }

  private getDebianPackage() {
    this.subscriptions.push(this.serverService.getDebianPackages().subscribe(debianPackages => {
      this.debianPackages = debianPackages;
    }));
  }
}
