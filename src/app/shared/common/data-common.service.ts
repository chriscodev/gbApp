import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataCommonService {

  constructor() { }

  public sidebarClick: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public alarmNotifClick: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  isSidebarClick = this.sidebarClick.asObservable();
  isAlarmNotifClick = this.alarmNotifClick.asObservable();

  updateSidebarClickStatus(isSidebarClick) {
    this.sidebarClick.next(isSidebarClick);
  }

  updateAlarmNotifClickStatus(isAlarmNotifClick) {
    this.alarmNotifClick.next(isAlarmNotifClick);
  }
}
