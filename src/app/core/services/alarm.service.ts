/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {AlarmConfiguration, AlarmEvent, AlarmType, AlarmTypeWithDetails} from '../models/server/Alarm';

const httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'}),
};

@Injectable({
    providedIn: 'root',
})
export class AlarmService {

    constructor(private http: HttpClient) {
    }

    public getAlarmTypes(): Observable<AlarmTypeWithDetails[]> {
        return this.http.get<AlarmTypeWithDetails[]>(`${environment.DEVNETWORKURL}alarmTypes`, httpOptions);
    }

    public getActiveAlarms(): Observable<AlarmEvent[]> {
        return this.http.get<AlarmEvent[]>(`${environment.DEVNETWORKURL}activeAlarms`, httpOptions);
    }

    public getAlarmHistory(): Observable<AlarmEvent[]> {
        return this.http.get<AlarmEvent[]>(`${environment.DEVNETWORKURL}alarmHistory`, httpOptions);
    }

    public clearAlarmHistory(): Observable<any> {
        const url = `${environment.DEVNETWORKURL}clearAlarmHistory`;
        return this.http.post<any>(url, null);
    }

    public getAlarmConfiguration(): Observable<AlarmConfiguration[]> {
        return this.http.get<AlarmConfiguration[]>(`${environment.DEVNETWORKURL}alarmConfig`, httpOptions);
    }

    public getAlarmsConfigurationByType(alarmType: AlarmType): Observable<AlarmConfiguration> {
        return this.http.get<AlarmConfiguration>(`${environment.DEVNETWORKURL}alarmConfig/` + alarmType.toString(),
            httpOptions);
    }

    public resetAlarmConfigToDefaults(): Observable<any> {
        return this.http.put<any>(`${environment.DEVNETWORKURL}resetAlarmConfigToDefaults`, null, httpOptions);
    }

    public updateAlarmConfig(alarmConfigurations: AlarmConfiguration[],
                             requestId: string): Observable<AlarmConfiguration[]> {
      localStorage.setItem('lastCommitUpdateRequestId', requestId);
      return this.http.put<AlarmConfiguration[]>(`${environment.DEVNETWORKURL}alarmConfig?requestId=` + requestId,
            alarmConfigurations,
            httpOptions);
    }
}

