/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {SweetAlert} from '../../../../../assets/node_modules/sweetalert/sweetalert/typings/core';
import * as _swal from '../../../../../assets/node_modules/sweetalert/sweetalert';
import {ClientAlarmModel} from '../../../../core/models/ClientAlarmModel';
import {AlarmEvent} from '../../../../core/models/server/Alarm';
import {ComponentCanDeactivate} from '../../../../core/guards/canDeactivateGuard';
import {ButtonTypes, MultipleTableColumns} from '../../../../core/models/ui/dynamicTable';

const swal: SweetAlert = _swal as any;

@Component({
    selector: 'app-history',
    templateUrl: './alarm-history.component.html',
    styleUrls: ['./alarm-history.component.scss'],
})
export class AlarmHistoryComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
    public alarmHistory: AlarmEvent[];
    public tableHeaders: MultipleTableColumns[] = [
        {header: 'Start', key: 'startTime', visible: true, showDate: true},
        {header: 'End', key: 'lastTime', visible: true, showDate: true},
        {header: 'Times Occurred', key: 'timesOccurred', visible: true},
        {header: 'Level', key: 'level', visible: true},
        {header: 'Component', key: 'component', visible: true},
        {header: 'Type', key: 'type', visible: true},
        {header: 'Description', key: 'description', visible: true},
    ];
    public buttonList: ButtonTypes[] = [];
    private subscriptions: Subscription [] = [];

    constructor(private clientAlarmsModel: ClientAlarmModel) {
    }

    public ngOnInit(): void {
        this.subscriptions.push(this.clientAlarmsModel.alarmHistory$.subscribe((alarmHistory) => {
          this.sortStartTimeInDesc(alarmHistory);
        }));
    }

    public ngOnDestroy() {
        this.subscriptions?.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }

    public canDeactivate(): boolean {
        return true;
    }

    public clearAlarmHistory() {
        swal({
            title: 'Clear Alarm History',
            text: 'Are you sure you want to clear the alarm history?',
            buttons: ['Cancel', 'Ok'],
            icon: 'warning',
        }).then((isConfirm) => {
            if (isConfirm) {
                this.clientAlarmsModel.clearAlarmHistory();
            }
        });
    }

    private sortStartTimeInDesc(alarmHistory: AlarmEvent[]){
      this.alarmHistory = alarmHistory.sort((a, b) => {
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
      });
    }
}
