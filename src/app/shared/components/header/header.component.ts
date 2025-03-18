/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {
  Component,
  ElementRef,
  EventEmitter,
  Injectable,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {ApiService} from '../../../core/services/api.service';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {DataService} from '../../../core/services/data.service';
import {DataCommonService} from 'src/app/shared/common/data-common.service';
import {SockStompService, StompEventListener} from '../../../core/services/sock-stomp.service';
import {changeDateFormat} from '../../helpers/appWideFunctions';
import {cloneDeep, isEqual, uniqWith} from 'lodash';
import {ClientAlarmModel} from '../../../core/models/ClientAlarmModel';
import {ALARM_LEVEL_VALUES, AlarmEvent, AlarmLevel} from '../../../core/models/server/Alarm';
import {StompVariables} from '../../../core/subscriptions/stompSubscriptions';
import {MainService} from '../../../core/services/main.service';

declare var $;

@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [],
})
export class HeaderComponent implements OnInit, OnDestroy, StompEventListener {
  @ViewChild('dropdownContent') dropdownContent: ElementRef;
  @Output() headChanged: EventEmitter<boolean> = new EventEmitter();
  @Input() dataHead: any;
  @Input() dataUser: any;
  public userToolTip = '';
  public uniqueUsers: any = [];
  private showToggler = false;
  private dirty = false;
  private subscriptions: Subscription[] = [];
  private activeAlarms: AlarmEvent[];
  critialALarms = 0;
  warningALarms = 0;
  infoALarms = 0;
  alarmStatus = '';

  constructor(
    private mainService: MainService,
    private stompService: SockStompService,
    private apiService: ApiService,
    private router: Router,
    private ds: DataService,
    private dataCommonService: DataCommonService,
    private sockStompService: SockStompService,
    private clientAlarmModel: ClientAlarmModel,
    private eRef: ElementRef
  ) {
    this.stompService.addListener(this);
  }

  public ngOnInit(): void {
    document.addEventListener('click', this.onDocumentClick.bind(this));
    this.subscriptions.push(this.clientAlarmModel.activeAlarms$.subscribe((activeAlarms: AlarmEvent[]) => {
      this.updateActiveAlarms(activeAlarms);
    }));

    if (!localStorage.getItem('uniqueUsers')) {
      setTimeout(() => {
        this.showToggler = true;
        if (this.dataHead && this.dataHead.length === 0) {
          this.getUserLoginSession();
        } else {
          this.getUniqueUserCount();
        }
      }, 100);
    } else {
      this.getUserLoginSession();
    }

    this.subscriptions.push(
      this.ds.getIsDirty().subscribe((x) => {
        this.dirty = x;
      })
    );

    // this.userToolTip = 'User :' +  this.dataUser.username + ' ' + changeDateFormat(this.dataUser.loggedInTime);
  }

  doAlarmNotifClick() {
    this.dropdownContent.nativeElement.classList.toggle('show');
  }

  public handleLogout() {
    console.log('HeaderComponent handleLogout');
    if (this.dirty) {
      this.router.url === '/main/users'
        ? this.confirmBox()
        : this.router.navigate(['/login']);
    } else {
      this.confirmBox();
    }
  }

  public confirmLogout() {
    $('#logoutDialog').modal({
      keyboard: true,
      show: true
    });
  }

  public confirmBox() {
    this.apiService.logout().subscribe(
      () => {
        this.sockStompService.terminateConnection();
        localStorage.removeItem('currentUser');
        localStorage.removeItem('uniqueUsers');
        window.location.href = '/gbApp';
      },
      (err) => console.log('err', err)
    );
  }

  public notifyStompEvent(topic: string, messageJson: string) {
    if (topic === StompVariables.stompChannels.loginSessionsUpdate) {
      this.getUserLoginSession();
    }
  }

  private getUserLoginSession() {
    this.dataHead = [];
    this.mainService.getAllSessions().subscribe(allLoginSessions => {
      if (allLoginSessions) {
        const cnt = allLoginSessions.length;
        for (let i = 0; i < cnt; i++) {
          if (this.dataHead.indexOf(allLoginSessions[i]) === -1) {
            this.dataHead.push(allLoginSessions[i]);
          }
        }
      }
      this.getUniqueUserCount();
    });
  }

  private getUniqueUserCount() {
    this.uniqueUsers = [];
    const allUsers = cloneDeep(this.dataHead);
    allUsers.forEach(elem => {
      delete elem.sessionId;
      delete elem.loggedInTime;
    });
    this.uniqueUsers = uniqWith(allUsers, isEqual);
    this.uniqueUsers.forEach(elem => {
      const tempData = this.dataHead.filter((x) => {
        return x.userName === elem.userName && x.clientIPAddress === elem.clientIPAddress;
      });
      elem.loggedInTime = tempData[tempData.length - 1].loggedInTime;
    });
    this.userToolTip = '';
    this.uniqueUsers.forEach(user => {
      this.userToolTip += 'User :' + user.userName + ' (' + user.clientIPAddress + ') ' + changeDateFormat(
        user.loggedInTime) + '\n';
    });
    localStorage.setItem('uniqueUsers', JSON.stringify(this.uniqueUsers));
  }

  private updateActiveAlarms(activeAlarms: AlarmEvent[]): void {
    this.activeAlarms = activeAlarms.sort((a: AlarmEvent, b: AlarmEvent) => {
      const aValue = ALARM_LEVEL_VALUES[a.level].value;
      const bValue = ALARM_LEVEL_VALUES[a.level].value;
      return (aValue > bValue) ? 1 : (aValue < bValue ? -1 : 0);
    });
    this.critialALarms = this.activeAlarms.filter(alarmEvent => alarmEvent.level === AlarmLevel.CRITICAL).length;
    this.warningALarms = this.activeAlarms.filter(alarmEvent => alarmEvent.level === AlarmLevel.WARNING).length;
    this.infoALarms = this.activeAlarms.filter(alarmEvent => alarmEvent.level === AlarmLevel.INFORMATION).length;

    if (this.critialALarms > 0) {
      $('#alarmIcon').css('color', 'red');
      this.alarmStatus = this.critialALarms > 0 ? 'Critical  (' + this.critialALarms + ')' : '';
    } else if (this.warningALarms > 0) {
      $('#alarmIcon').css('color', 'yellow');
      this.alarmStatus = this.warningALarms > 0 ? 'Warning  (' + this.warningALarms + ')' : '';
    } else {
      $('#alarmIcon').css('color', 'white');
      this.alarmStatus = this.infoALarms > 0 ? 'Info  (' + this.infoALarms + ')' : '';
    }
    console.log('Header updateActiveAlarms this.activeAlarms: ', this.activeAlarms);
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }


  onDocumentClick(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.dropdownContent.nativeElement.classList.remove('show');
    }
  }
}
