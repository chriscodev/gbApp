/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {ActionMessage, ButtonType, ButtonTypes, ImageType, MultipleTableColumns} from 'src/app/core/models/ui/dynamicTable';
import {numberOnly} from 'src/app/shared/helpers/appWideFunctions';
import {
  ModalDynamicTbTranslateComponent
} from '../../../modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {
  AbstractFetchableScheduleProvider,
  HTTP_SCHEMES,
  OnConnectScheduleProvider,
  ScheduleProviderType
} from '../../../../../../core/models/dtv/schedule/ScheduleProvider';
import {inRangeCheck} from '../../../../../helpers/mathHelprrs';
import {isDefined} from '../../../../../../core/models/dtv/utils/Utils';
import {BootstrapFunction, ClickEvent} from '../../../../../../core/interfaces/interfaces';
import {Schedule} from '../../../../../../core/models/dtv/schedule/Schedule';
import {cloneDeep} from 'lodash';
import {
  ModalSpScheduleDownloadSettingsComponent
} from '../../modal-sp-schedule-download-settings/modal-sp-schedule-download-settings.component';

declare var $: BootstrapFunction;

@Component({
  selector: 'app-modal-sp-onconnect',
  templateUrl: './modal-sp-onconnect.component.html',
  styleUrls: ['./modal-sp-onconnect.component.scss'],
})
export class ModalSpOnconnectComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() scheduleProvider: AbstractFetchableScheduleProvider;
  @Output() okEnabledChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() scheduleProviderChanged: EventEmitter<AbstractFetchableScheduleProvider> = new EventEmitter();
  @ViewChild(ModalDynamicTbTranslateComponent) schedulesDynamicComponentTable: ModalDynamicTbTranslateComponent;
  @ViewChild(ModalSpScheduleDownloadSettingsComponent) downloadComponent: ModalSpScheduleDownloadSettingsComponent;
  public readonly numberOnly = numberOnly;
  public readonly httpSchemes = Object.values(HTTP_SCHEMES);
  public passText: string;
  public localScheduleProvider: OnConnectScheduleProvider;
  public okEnabled = false;
  public onConnectSettingsValid = false;
  public showAddSchedules = false;
  public showTestConnection = false;
  public showSearchSchedule = false;
  public hostIconText: string;
  public portIconText: string;
  public apiKeyIconText: string;
  public showPassword: boolean;
  public buttonList: ButtonTypes[] = [{
    name: ButtonType.ADD, imgSrc: ImageType.add, alwaysEnabled: true
  }, {name: ButtonType.DELETE, imgSrc: ImageType.delete, supportsMultiSelect: true}];
  public tableHeaders: MultipleTableColumns[] = [{
    header: 'Station ID', key: 'listingsId', visible: true
  }, {header: 'Name', key: 'name', visible: true}];
  public schedules: Schedule[] = [];
  public modalName = '#onConnectSearchModal';
  public apiKeyValid: boolean;
  private hostValid: boolean;
  private portValid: boolean;
  private downloadSettingsOkEnabled = true;

  constructor(private cdr: ChangeDetectorRef) {
  }

  public ngOnInit(): void {
    if (isDefined(this.scheduleProvider)) {
      this.localScheduleProvider = this.scheduleProvider as OnConnectScheduleProvider;
      this.schedules = isDefined(this.localScheduleProvider.schedules) ? cloneDeep(
        this.localScheduleProvider.schedules) : [];
      this.validateScheduleProvider();
    }
  }

  // to update the changes from download component to sp component use subscribe
  ngAfterViewInit() {
    this.downloadComponent.downloadSettingsChanged.subscribe((scheduleProvider) => {
      this.downloadSettingsUpdated(scheduleProvider);
    });
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (isDefined(changes.scheduleProvider)) {
      this.localScheduleProvider = changes.scheduleProvider.currentValue as OnConnectScheduleProvider;
      this.validateScheduleProvider();
      this.cdr.detectChanges();
    }
  }

  public doTestConnection(): void {
    this.showTestConnection = true;
  }

  public testConnectionClosedHandler($event) {
    this.showTestConnection = false;
    $('#testConnectionModal').modal('hide');
  }

  public inputSettings(): void {
    this.updateSettingsValid();
  }

  public onButtonClicked($event: ClickEvent) {
    switch ($event.message) {
      case ActionMessage.ADD:
        this.onAddRow();
        break;
      case ActionMessage.DELETE:
        this.onDeleteRows();
        break;
    }
    this.cdr.detectChanges();
  }

  public toggleView() {
    this.showPassword = !this.showPassword;
  }

  public scheduleSearchClosedHandler(selectedSchedules: Schedule[]) {
    console.log('OnConnect Component scheduleSearchClosedHandler schedules: ', selectedSchedules);
    selectedSchedules.forEach(selectedSchedule => {
      const exists = this.schedules?.some(schedule => schedule.listingsId === selectedSchedule.listingsId);
      if (!exists) {
        this.schedules.push(selectedSchedule);
      }
    });
    this.localScheduleProvider.schedules = cloneDeep(this.schedules);
    this.scheduleProvider.schedules = cloneDeep(this.localScheduleProvider.schedules);
    this.scheduleProviderChanged.emit(this.localScheduleProvider);
    console.log('OnConnect Component scheduleSearchClosedHandler this.schedules: ', this.localScheduleProvider);
  }

  downloadSettingsUpdated(scheduleProvider: AbstractFetchableScheduleProvider) {
    this.localScheduleProvider.intervalInMinutes = scheduleProvider.intervalInMinutes;
    this.localScheduleProvider.timeOfDay = scheduleProvider.timeOfDay;
    this.localScheduleProvider.rateLimit = scheduleProvider.rateLimit;
    this.localScheduleProvider.updateDaily = scheduleProvider.updateDaily;
    this.localScheduleProvider.daysAheadToProcess = scheduleProvider.daysAheadToProcess;
  }

  private onAddRow(): void {
    this.showSearchSchedule = true;
  }

  private onDeleteRows(): void {
    if (this.schedulesDynamicComponentTable.selectedRowIds.length > 0) {
      for (let i = 0; i < this.schedulesDynamicComponentTable.selectedRowIds.length; i++) {
        const selectID = this.schedulesDynamicComponentTable?.selectedRowIds[i];
        this.schedules = this.schedules.filter((schedule) => {
          const validId = schedule.id.toString() !== selectID.toString();
          const validClientId = schedule.clientId !== selectID.toString();
          return validId && validClientId;
        });
      }
    }
    this.localScheduleProvider.schedules = cloneDeep(this.schedules);
    this.scheduleProvider.schedules = cloneDeep(this.localScheduleProvider.schedules);
    this.scheduleProviderChanged.emit(this.localScheduleProvider);
  }

  private validateScheduleProvider(): void {
    this.updateSettingsValid();
  }

  private updateSettingsValid(): void {
    this.updateShowAddSchedules();
    this.updateHostValid();
    this.updatePortValid();
    this.updateAPIKeyValid();
    this.updateOnConnectSettingsValid();
    this.updateOkEnabled();
    this.updateAddEnabled();
  }

  private updateShowAddSchedules(): void {
    this.showAddSchedules = this.scheduleProvider.scheduleProviderType === ScheduleProviderType.ON_CONNECT;
  }

  private updateOnConnectSettingsValid(): void {
    this.onConnectSettingsValid = this.hostValid && this.portValid && this.apiKeyValid;
  }

  private updateHostValid() {
    this.hostValid = this.localScheduleProvider.host?.length > 0;
    this.hostIconText = this.hostValid ? 'text-success' : 'text-danger';
  }

  private updatePortValid() {
    this.portValid = inRangeCheck(this.localScheduleProvider.port, 1, 65535);
    this.portIconText = this.portValid ? 'text-success' : 'text-danger';
  }

  private updateAPIKeyValid() {
    this.apiKeyValid = this.localScheduleProvider.apiKey?.length > 0;
    this.apiKeyIconText = this.apiKeyValid ? 'text-success' : 'text-danger';
  }

  private updateOkEnabled(): void {
    const oldOkEnabled = this.okEnabled;
    this.okEnabled = this.onConnectSettingsValid && this.downloadSettingsOkEnabled;
    if (oldOkEnabled !== this.okEnabled) {
      this.okEnabledChanged.emit(this.okEnabled);
    }
  }

  private updateAddEnabled(): void {
    if (this.apiKeyValid) {
      this.schedulesDynamicComponentTable?.enableButtons([ButtonType.ADD]);
    } else {
      this.schedulesDynamicComponentTable?.disableButtons([ButtonType.ADD]);
    }
  }
}
