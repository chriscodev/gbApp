/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {cloneDeep, isEqual} from 'lodash';
import {isIPAddressValid, validateIPAddressKeyEvent} from '../../../shared/helpers';
import {AbstractCommitRevertComponent} from '../abstracts/abstract-commit-revert.component';
import {
  DefaultIPSettings,
  DefaultNetworkSettings,
  IPSettings,
  IPSettingsType,
  NetworkSettings,
  UpdateNetworkSettings
} from '../../../core/models/server/NetworkSetting';
import {ClientNetworkSettingsModel} from '../../../core/models/ClientNetworkSettingsModel';
import {
  ModalCommitRevertDialogComponent
} from '../../../shared/components/modals/modal-commit-revert-dialog/modal-commit-revert-dialog.component';
import {isDefined, isEmptyValue} from '../../../core/models/dtv/utils/Utils';
import {ActionMessage, ButtonType, ImageType} from '../../../core/models/ui/dynamicTable';
import {swalErrorLogoutFunction} from '../../../shared/helpers/appWideFunctions';
import {
  ModalSimpleTableComponent
} from '../../../shared/components/modals/modal-simple-table/modal-simple-table.component';
import {NICState} from '../../../core/models/server/Server';
import {BootstrapFunction, ClickEvent} from '../../../core/interfaces/interfaces';
import {ElementStatusUpdate, StompEventListener} from '../../../core/services/sock-stomp.service';
import {StompVariables} from '../../../core/subscriptions/stompSubscriptions';
import {ComponentCanDeactivate} from '../../../core/guards/canDeactivateGuard';

declare var $: BootstrapFunction;

@Component({
  selector: 'app-networking',
  templateUrl: './networking.component.html',
  styleUrls: ['./networking.component.scss'],
  providers: []
})
export class NetworkingComponent extends AbstractCommitRevertComponent implements OnInit, OnDestroy, StompEventListener, ComponentCanDeactivate {

  constructor(
    private clientNetworkSettingsModel: ClientNetworkSettingsModel, private cdr: ChangeDetectorRef) {
    super();
  }

  @ViewChild(ModalSimpleTableComponent) networkingTableComponent: ModalSimpleTableComponent;
  @ViewChild(ModalCommitRevertDialogComponent) commitRevertDialogComponent: ModalCommitRevertDialogComponent;
  public editIPSettingsTitle: string;
  public editIPAddressValid = false;
  public editNetmaskValid = false;
  public editGatewayValid = false;
  public editDNS1Valid = false;
  public editDNS2Valid = false;
  // TODO friendly names
  public ipTypes = Object.values(IPSettingsType);
  public disableInputFields = false;
  public okButtonEnabled = false;
  public modalName = '#myModal';
  public currentIPSettings: IPSettings = new DefaultIPSettings();
  public buttonList = [
    {name: ButtonType.EDIT, imgSrc: ImageType.edit, disable: false}
  ];
  public tableHeaders = [
    {header: 'Interface', key: 'name', visible: true},
    {header: 'Link', key: 'nicState', visible: true, showOnline: true},
    {header: 'Type', key: 'type', visible: false},
    {header: 'MAC', key: 'mac', visible: true},
    {header: 'IP Address', key: 'address', visible: true},
    {header: 'Netmask', key: 'netmask', visible: true},
    {header: 'Gateway', key: 'gateway', visible: true}
  ];
  public localNetworkSettings: NetworkSettings = new DefaultNetworkSettings();
  private serverNetworkSettings: NetworkSettings = new DefaultNetworkSettings();
  private restartServer = false;
  private nicStateMap: Map<string, NICState> = new Map<string, NICState>();
  ipPattern = '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$';

  ngOnInit(): void {
    this.loadNetworkingData();
  }

  ngOnDestroy() {
    this.cleanUpSubscriptions();
  }

  loadNetworkingData() {
    this.nicStateMap = cloneDeep(this.clientNetworkSettingsModel.getNICStates());
    this.subscriptions.push(
      this.clientNetworkSettingsModel.networkSettings$.subscribe((networkSettings: NetworkSettings) => {
        console.log('NetworkingComponent subscribe networkSettings: ', networkSettings);
        this.updateNetworkSettings(networkSettings);
        this.cdr.detectChanges();
      }));
    this.subscriptions.push(this.clientNetworkSettingsModel.nicStateSubject$.subscribe((nicMap) => {
      this.nicStateMap = cloneDeep(nicMap);
      this.decorateUrlLinks(this.clientNetworkSettingsModel.networkSettingsSubject.getValue());
      this.cdr.detectChanges();
    }));
  }

  public onCommit() {
    $('#commitConfirmDialog').modal('show', {
      keyboard: true,
      backdrop: 'static'
    });
  }

  public onRevert() {
    this.clientNetworkSettingsModel.refresh();
    this.loadServerNetworkSettings();
    this.dirty = false;
  }

  public updateDirty(): void {
    this.dirty = !isEqual(this.localNetworkSettings, this.serverNetworkSettings);
  }

  public onButtonClicked(event: ClickEvent): void {
    if (this.networkingTableComponent.selectedRow !== null) {
      if (event.message === ActionMessage.EDIT) {
        this.currentIPSettings = cloneDeep(this.networkingTableComponent.selectedRow);
        this.editIPSettingsTitle = 'Edit IP Settings - ' + this.currentIPSettings.name;
        console.log('NetworkingComponent currentIPSettings: ', this.currentIPSettings);
        this.disableInputFields = this.currentIPSettings.type === IPSettingsType.DHCP || this.currentIPSettings.type === IPSettingsType.UNCONFIGURED;
        this.updateFieldsValid();
      }
    }
    console.log('onButtonClicked', event);
  }

  public closeEditIPSettings(okSelected: boolean): void {
    if (okSelected) {
      if (isDefined(this.currentIPSettings) && this.networkingTableComponent.selectedRow !== null) {
        Object.assign(this.networkingTableComponent.selectedRow, this.currentIPSettings);
        const index = this.localNetworkSettings.ipSettings.findIndex(ipSettings => {
          return ipSettings[this.networkingTableComponent.columnIdentifier] === this.currentIPSettings[this.networkingTableComponent.columnIdentifier];
        });
        if (index !== -1) {
          this.localNetworkSettings.ipSettings = [...this.localNetworkSettings.ipSettings.slice(0,
            index), this.currentIPSettings, ...this.localNetworkSettings.ipSettings.slice(index + 1)];
        }
        this.updateDirty();
      }
    }
  }

  public isIPSettingsStatic(): boolean {
    return this.currentIPSettings.type === IPSettingsType.STATIC;
  }

  public onIPSettingsChanged(): void {
    this.disableInputFields = this.currentIPSettings.type !== IPSettingsType.STATIC;
    console.log('onIPSettingsChanged disableInputFields: ', this.disableInputFields);
    this.updateOkButtonEnabled();
  }

  public ipAddressOnly(event: any): void {
    console.log('ipAddressOnly event: ', event, 'event.target.value: ', event.target.value);
    validateIPAddressKeyEvent(event);
  }

  public updateIPAddressValid(): void {
    this.editIPAddressValid = isIPAddressValid(this.currentIPSettings.address);
    console.log('updateIPAddressValid editIPAddressValid: ', this.editIPAddressValid);
    this.updateOkButtonEnabled();
  }

  public updateNetmaskValid(): void {
    this.editNetmaskValid = isIPAddressValid(this.currentIPSettings.netmask);
    console.log('updateNetmaskValid editNetmaskValid: ', this.editNetmaskValid);
    this.updateOkButtonEnabled();
  }

  public updateGatewayValid(): void {
    this.editGatewayValid = isIPAddressValid(this.currentIPSettings.gateway) || isEmptyValue(
      this.currentIPSettings.gateway);
    console.log('updateGatewayValid editNetmaskValid: ', this.editGatewayValid);
    console.log(isIPAddressValid(this.currentIPSettings.gateway), !isDefined(this.currentIPSettings.gateway));
    console.log(this.currentIPSettings.gateway);

    this.updateOkButtonEnabled();
  }

  public updateDNS1Valid(): void {
    this.editDNS1Valid = isIPAddressValid(this.currentIPSettings.nameServers[0]) || isEmptyValue(
      this.currentIPSettings.nameServers[0]);
    console.log('updateDNS1Valid editDNS1Valid: ', this.editDNS1Valid);

    this.updateOkButtonEnabled();
  }

  public updateDNS2Valid(): void {
    this.editDNS2Valid = isIPAddressValid(this.currentIPSettings.nameServers[1]) || isEmptyValue(
      this.currentIPSettings.nameServers[1]);
    console.log('updateDNS2Valid editDNS2Valid: ', this.editDNS2Valid);
    this.updateOkButtonEnabled();
  }

  private updateFieldsValid(): void {
    this.updateIPAddressValid();
    this.updateNetmaskValid();
    this.updateGatewayValid();
    this.updateDNS1Valid();
    this.updateDNS2Valid();
    this.updateOkButtonEnabled();
  }

  private updateOkButtonEnabled(): void {
    this.okButtonEnabled = this.disableInputFields ? true :
      this.editIPAddressValid && this.editNetmaskValid
      && this.editGatewayValid
      && this.editDNS1Valid
      && this.editDNS2Valid;
  }

  private loadServerNetworkSettings(): void {
    this.updateNetworkSettings(this.clientNetworkSettingsModel.networkSettingsSubject.getValue());
    this.updateNicStates(this.clientNetworkSettingsModel.nicStateSubject.getValue());

  }

  private decorateUrlLinks(networkSetting: NetworkSettings) {
    if (isDefined(networkSetting)) {
      networkSetting.ipSettings.forEach(ipSetting => {
        console.log('decorateUrlLinks, ipSetting: ', ipSetting);
        this.decorateUrlLink(ipSetting);
        /*  const index = this.localNetworkSettings.ipSettings.findIndex(localIpSetting => localIpSetting.name === ipSetting.name);
          if (index !== -1) {
            this.localNetworkSettings.ipSettings[index] = ipSetting;
          } else {
            this.localNetworkSettings.ipSettings.push(ipSetting);
          }*/
      });
    }
  }

  private decorateUrlLink(ipSetting: IPSettings) {
    const foundInterface = Object?.keys(this.nicStateMap ?? {}).find(key => key === ipSetting.name);
    if (isDefined(ipSetting) && foundInterface === ipSetting.name) {
      ipSetting.nicState = isDefined(foundInterface) ? NICState.UP : NICState.UNKNOWN;
    }
    console.log('NIC State: ' + ipSetting.name + '-' + ipSetting.nicState);
  }

  private findInterfaceValue(ipSetting: IPSettings): NICState | undefined {
    return this.nicStateMap.get(ipSetting.name);
  }

  private updateNetworkSettings(networkSettings: NetworkSettings) {
    this.decorateUrlLinks(networkSettings);
    this.localNetworkSettings = networkSettings;
    this.serverNetworkSettings = cloneDeep(this.localNetworkSettings);
  }

  private updateNicStates(nicStates: Map<string, NICState>) {
    console.log('NetworkingComponent NicStates : ' + JSON.stringify(this.nicStateMap), nicStates);
    this.nicStateMap = cloneDeep(nicStates);
    this.cdr.detectChanges();
  }

  updateServerNetworkSettings() {
    const messageAlert = 'The GuideBuilder Server is restarting. The application will now close.';
    this.localNetworkSettings.ipSettings.forEach(ip => {
      delete ip.nicState;
    });
    if (this.restartServer) {
      this.clientNetworkSettingsModel.update(
        new UpdateNetworkSettings(this.localNetworkSettings, this.restartServer)).then(() => {
        this.dirty = false;
        swalErrorLogoutFunction(messageAlert);
      });
    } else {
      this.clientNetworkSettingsModel.update(
        new UpdateNetworkSettings(this.localNetworkSettings, this.restartServer)).then(() => this.dirty = false);
    }
  }

  public notifyStompEvent(topic: string, messageJson: string) {
    console.log('ModalNetworkngComponent notifyStompEvent ', topic);
    if (topic === StompVariables.stompChannels.notifyServerStatusChanged) {
      const elementStatusUpdate: ElementStatusUpdate = JSON.parse(messageJson);
      this.clientNetworkSettingsModel.refreshNICStates();
      this.loadNetworkingData();
      this.nicStateMap = cloneDeep(this.clientNetworkSettingsModel.nicStateSubject.getValue());
      this.cdr.detectChanges();
    }
  }

  doRestart(restart: boolean) {
    this.restartServer = restart;
    this.updateServerNetworkSettings();
  }

  public canDeactivate(): boolean {
    return !this.dirty;
  }
}
