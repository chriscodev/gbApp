/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SweetAlert} from '../../../../../assets/node_modules/sweetalert/sweetalert/typings/core';
import * as _swal from '../../../../../assets/node_modules/sweetalert/sweetalert';
import {ActionMessage, ButtonType, ButtonTypes, ImageType, MultipleTableColumns} from 'src/app/core/models/ui/dynamicTable';
import {ClientAlarmModel} from '../../../../core/models/ClientAlarmModel';
import {
  ALARM_LEVELS,
  ALARM_TYPES,
  AlarmConfiguration,
  AlarmLevel,
  DefaultAlarmConfiguration
} from '../../../../core/models/server/Alarm';
import {BootstrapFunction} from '../../../../core/interfaces/interfaces';
import {AbstractCommitRevertComponent} from '../../abstracts/abstract-commit-revert.component';
import {cloneDeep, isEqual} from 'lodash';
import {ModalSimpleTableComponent} from '../../../../shared/components/modals/modal-simple-table/modal-simple-table.component';
import {numberOnly} from '../../../../shared/helpers/appWideFunctions';
import {ComponentCanDeactivate} from '../../../../core/guards/canDeactivateGuard';

const swal: SweetAlert = _swal as any;
declare var $: BootstrapFunction;

@Component({
  selector: 'app-configuration',
  templateUrl: './alarm-configuration.component.html',
  styleUrls: ['./alarm-configuration.component.scss'],
})
export class AlarmConfigurationComponent extends AbstractCommitRevertComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
  @ViewChild(ModalSimpleTableComponent) configTableComponent: ModalSimpleTableComponent;
  public readonly ALARM_LEVELS = ALARM_LEVELS;
  public readonly numberOnly = numberOnly;
  public modalName = '#AlarmConfigurationModal';
  public objectTitle = 'Alarm Configuration';
  public objectTypeTitle = 'AlarmConfiguration';
  public alarmLevels: AlarmLevel[] = Object.values(AlarmLevel);
  public currentAlarmConfiguration: AlarmConfiguration = new DefaultAlarmConfiguration();
  public localAlarmConfigurations: AlarmConfiguration[];
  public editableTimeout: boolean;
  public okEnabled = true;
  public tableHeaders: MultipleTableColumns[] = [
    {header: 'type', key: 'type', visible: false},
    {header: 'Description', key: 'description', visible: true},
    {header: 'Enabled', key: 'enabled', visible: true, showOnline: true},
    {header: 'Level', key: 'level', visible: true, function: this.getAlarmLevelDisplayName},
    {header: 'Timeout (in seconds)', key: 'timeOutSeconds', visible: true},
    {header: 'Send Email', key: 'sendEmailEnabled', visible: true, showOnline: true, showChecker: true}
  ];
  public buttonList: ButtonTypes[] = [
    {name: ButtonType.EDIT, imgSrc: ImageType.edit, disable: false},
  ];
  private serverAlarmConfigurations: AlarmConfiguration[];

  constructor(private clientAlarmsModel: ClientAlarmModel) {
    super();
  }

  public ngOnInit(): void {
    this.subscriptions.push(this.clientAlarmsModel.alarmConfigurations$.subscribe((alarmConfigurations) => {
      // TODO if dirty, display timed out dialog explaining dirty changes will be lost
      this.loadAlarmConfigurations(cloneDeep(alarmConfigurations));
    }));
    console.log('localAlarmConfigurations', this.localAlarmConfigurations);
  }

  public ngOnDestroy(): void {
    this.cleanUpSubscriptions();
  }

  public canDeactivate(): boolean {
    return !this.dirty;
  }

  public onCommit(): void {
    this.clientAlarmsModel.update(this.localAlarmConfigurations);
  }

  public onRevert(): void {
    this.loadAlarmConfigurations(this.clientAlarmsModel.getAlarmConfigurations());
    this.configTableComponent.resetCheckerBox();
  }

  public onResetToDefaults(): void {
    swal({
      title: 'Reset Alarm Settings',
      text: 'Are you sure you want to reset Alarm Settings to factory defaults?',
      buttons: ['Cancel', 'Ok'],
      icon: 'warning',
    }).then((isConfirm) => {
      if (isConfirm) {
        // this.configTableComponent.resetCheckerBox();
        this.clientAlarmsModel.resetAlarmConfigToDefaults();
        setTimeout(() => {
          this.configTableComponent.resetCheckerBox();
        });
      }
    });
  }

  public updateDirty(): void {
    this.dirty = !isEqual(this.localAlarmConfigurations, this.serverAlarmConfigurations);
  }

  public onButtonClicked($event: any): void {
    switch ($event.message) {
      case ActionMessage.EDIT:
        this.onEditRow();
        break;
    }
    this.updateDirty();
  }

  public inputSettings(): void {
    this.okEnabled = this.editableTimeout ? this.currentAlarmConfiguration.timeOutSeconds > 0 : true;
  }

  public updateAlarmConfiguration(): void {
    const updateIndex = this.localAlarmConfigurations.findIndex(
      (alarmConfiguration) => alarmConfiguration.type === this.currentAlarmConfiguration.type);
    if (updateIndex > -1) {
      this.localAlarmConfigurations = [...this.localAlarmConfigurations.slice(0,
        updateIndex), this.currentAlarmConfiguration, ...this.localAlarmConfigurations.slice(
        updateIndex + 1)];
    }
    this.updateDirty();
  }

  public getAlarmLevelDisplayName(alarmLevel: AlarmLevel): string {
    return ALARM_LEVELS[alarmLevel]?.displayName || alarmLevel.toString();
  }

  private loadAlarmConfigurations(alarmConfigurations: AlarmConfiguration[]): void {
    this.localAlarmConfigurations = alarmConfigurations;
    this.serverAlarmConfigurations = cloneDeep(this.localAlarmConfigurations);
    this.updateDirty();
  }

  private onEditRow(): void {
    if (this.configTableComponent.selectedRow !== null) {
      this.currentAlarmConfiguration = cloneDeep(this.configTableComponent.selectedRow);
      const alarmTypeWithDetails = ALARM_TYPES.find(
        alarmType => alarmType.alarmType === this.currentAlarmConfiguration.type);
      this.editableTimeout = alarmTypeWithDetails?.defaultTimeOutSeconds > 0;
      this.inputSettings();
    }
  }
}
