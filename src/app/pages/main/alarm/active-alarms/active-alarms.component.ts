/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ClientAlarmModel} from '../../../../core/models/ClientAlarmModel';
import {AlarmEvent} from '../../../../core/models/server/Alarm';
import {ComponentCanDeactivate} from '../../../../core/guards/canDeactivateGuard';
import {ButtonTypes, MultipleTableColumns} from '../../../../core/models/ui/dynamicTable';

@Component({
    selector: 'app-active-alarms',
    templateUrl: './active-alarms.component.html',
    styleUrls: ['./active-alarms.component.scss'],
})
export class ActiveAlarmsComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
    public activeAlarms: AlarmEvent[] | undefined;
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

    constructor(private clientAlarmModel: ClientAlarmModel) {
    }

    public ngOnInit(): void {
        this.subscriptions.push(this.clientAlarmModel.activeAlarms$.subscribe((activeAlarms) => {
            this.activeAlarms = activeAlarms;
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
}
