// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.

import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChange,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {Subject, Subscription} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {DataCommonService} from 'src/app/shared/common/data-common.service';
import {ApiService} from '../../../core/services/api.service';
import {PrivilegeLevel, User} from '../../../core/models/server/User';
import {ClientUsersModel} from '../../../core/models/ClientUsersModel';
import {isDefined} from '../../../core/models/dtv/utils/Utils';
import {LicenseService} from '../../../core/services/license.service';
import {ClientLicenseModel} from '../../../core/models/ClientLicenseModel';
import {ServerLicenseInfo, SystemType} from '../../../core/models/server/License';
import {ServerService} from '../../../core/services/server.service';
import {InitLevel} from '../../../core/models/server/Server';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() dataSide = false;
  @ViewChild('sidebarnav', {static: true}) menu: ElementRef;
  linkActive: string;
  isStatusExpanded: boolean;
  isServerExpanded: boolean;
  isNotifExpanded: boolean;
  isAlarmExpanded: boolean;
  isServiceExpanded: boolean;
  count = 0;
  toggleDev = false;
  isSidebarClick: boolean;
  destroy$: Subject<boolean> = new Subject<boolean>();
  public subscription: Subscription[] = [];
  public currentUserPrivilegeLevel: PrivilegeLevel;
  public privilege: string;
  public serverLicenseInfo: ServerLicenseInfo;
  private systemType: SystemType;
  private systemMode: InitLevel;
  private clickTimeout = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private dataCommonService: DataCommonService,
    private userModel: ClientUsersModel,
    private licenseService: LicenseService,
    private clientLicenseModel: ClientLicenseModel,
    private serverService: ServerService
  ) {
    this.linkActive = '';
    // set status tab as active on init in relation to login success redirection to service map
    localStorage.setItem('isStatusExpanded', 'true');

    if (!localStorage.getItem('isStatusExpanded')) {
      localStorage.setItem('isStatusExpanded', 'false');
    } else {
      this.isStatusExpanded =
        localStorage.getItem('isStatusExpanded') === 'false' ? false : true;
    }

    if (!localStorage.getItem('isServiceExpanded')) {
      localStorage.setItem('isServiceExpanded', 'false');
    } else {
      this.isServiceExpanded =
        localStorage.getItem('isServiceExpanded') === 'false' ? false : true;
    }

    if (!localStorage.getItem('isServerExpanded')) {
      localStorage.setItem('isServerExpanded', 'false');
    } else {
      this.isServerExpanded =
        localStorage.getItem('isServerExpanded') === 'false' ? false : true;
    }

    if (!localStorage.getItem('isNotifExpanded')) {
      localStorage.setItem('isNotifExpanded', 'false');
    } else {
      this.isNotifExpanded =
        localStorage.getItem('isNotifExpanded') === 'false' ? false : true;
    }

    if (!localStorage.getItem('isAlarmExpanded')) {
      localStorage.setItem('isAlarmExpanded', 'false');
    } else {
      this.isAlarmExpanded =
        localStorage.getItem('isAlarmExpanded') === 'false' ? false : true;
    }

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.url.includes('/main/alarm/active-alarms')) {
          this.isAlarmExpanded = false;
          this.isActive('/main/alarm/active-alarms');
          this.activeTab('alarm');
        }
      }
    });
  }

  ngOnInit(): void {
    this.getCurrentUserPrivilege();
    this.loadLicenseModel();
    this.dataCommonService.isSidebarClick
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => (this.isSidebarClick = res));

    this.dataCommonService.isAlarmNotifClick
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res) {
          this.isAlarmExpanded = false;
          this.isActive('/main/alarm/active-alarms');
          this.activeTab('alarm');
        }
      });
    this.setDisplayStyle('none');

  }

  ngOnChanges(changes: SimpleChanges): void {
    const dataSide: SimpleChange = changes.dataSide;
    // this.toggleDev = this.toggleDev !== true;
    // this.loadLicenseModel();
  }

  getPointerEventsValue() {
    return this.isSidebarClick ? 'none' : '';
  }

  showNetworking() {
    this.router.navigate(['networking'], {relativeTo: this.route});
  }

  isActive(url: string) {
    const routeUrl = this.router.url;
    let act = '';
    if (url === routeUrl) {
      act = 'active';
    }
    return act;
  }

  handleLogout() {
    this.apiService.logout().subscribe(
      () => {
        this.router.navigate(['/login']);
      },
      (err) => console.log('err', err)
    );
  }

  activeTab(tabName: string) {
    let stat;
    // this.clearTabsExpandedStatus();
    if (tabName === 'status') {
      this.isStatusExpanded = !this.isStatusExpanded;
      stat = this.isStatusExpanded === false ? 'false' : 'true';
      localStorage.setItem('isStatusExpanded', stat);
    } else if (tabName === 'service') {
      this.isServiceExpanded = !this.isServiceExpanded;
      stat = this.isServiceExpanded === false ? 'false' : 'true';
      localStorage.setItem('isServiceExpanded', stat);
    } else if (tabName === 'server') {
      this.isServerExpanded = !this.isServerExpanded;
      stat = this.isServerExpanded === false ? 'false' : 'true';
      localStorage.setItem('isServerExpanded', stat);
    } else if (tabName === 'notif') {
      this.isNotifExpanded = !this.isNotifExpanded;
      stat = this.isNotifExpanded === false ? 'false' : 'true';
      localStorage.setItem('isNotifExpanded', stat);
    } else if (tabName === 'alarm') {
      this.isAlarmExpanded = !this.isAlarmExpanded;
      stat = this.isAlarmExpanded === false ? 'false' : 'true';
      localStorage.setItem('isAlarmExpanded', stat);
    }
  }

  clearTabsExpandedStatus() {
    localStorage.setItem('isStatusExpanded', 'false');
    localStorage.setItem('isServiceExpanded', 'false');
    localStorage.setItem('isServerExpanded', 'false');
    localStorage.setItem('isNotifExpanded', 'false');
    localStorage.setItem('isAlarmExpanded', 'false');
  }

  // the click timeout completes
  setClickTimeout(callback) {
    // clear any existing timeout
    clearTimeout(this.clickTimeout);
    this.clickTimeout = setTimeout(() => {
      this.clickTimeout = null;
      callback();
    }, 200);
  }

  singleRoute(route: string) {
    const url = route;

    if (url === '/main' || url === '/main/dtv-services') {
      this.activeTab('');
    }

    if (this.clickTimeout) {
      this.setClickTimeout(() => {
      });
    } else {
      // if timeout doesn't exist, we know it's first click
      // treat as single click until further notice
      this.setClickTimeout(() => {
        if (url !== this.router.url) {
          this.router.navigateByUrl(url);
        }
      });
    }
  }

  ngOnDestroy() {
    this.subscription?.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.destroy$.next(true);
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngAfterViewInit() {
    this.openActiveParent();
  }

  private loadLicenseModel(): void {
    console.log('TO LOAD LICENSE MODEL');
    this.subscription.push(
      this.clientLicenseModel.serverLicenseInfo$.subscribe((serverLicenseInfo) => {
        this.serverLicenseInfo = serverLicenseInfo;
        this.systemType = serverLicenseInfo?.serverLicense?.systemType;
        console.log('systemType', this.systemType);
      })
    );

    this.subscription.push(
      this.serverService.getServerInfo().subscribe((serverStatusInfo) => {
        this.systemMode = serverStatusInfo.initLevel;
        console.log('systemMode', this.systemMode);
        this.initiateAccessPrivilege();
      }));

  }

  private showRedundancy(): void {
    // commenting this for now as it breaks the UI left menu , Need to verify with Chris
    // this will only occur if system type is redundant and system mode is redundancy mode
      this.setDisplayStyle('none');
      this.showElement(['statusRoute', 'bckupRestoreRoute','activityLogRoute', 'systemHealthRoute','serverSettingsRoute', 'dateTime', 'networkingRoute', 'featuresRoute', 'swUpdateRoute', 'snmpRoute', 'smtpEmailRoute', 'redundancyRoute']);
  }

  private showReadonlyView(): void {
    this.setDisplayStyle('none');
    this.showElement(['statusRoute', 'serviceMapRoute', 'bckupRestoreRoute', 'activityLogRoute', 'systemHealthRoute']);
  }

  // sets the click timeout and takes a callback
  // for what operations you want to complete when

  private setDisplayStyle(style: string): void {
    const allElementIds = '#statusRoute, #serviceMapRoute, #bckupRestoreRoute, ' +
      '#activityLogRoute, #systemHealthRoute, #networkConfigRoute, #dtvSched, #dtvNetwork, #serviceExport,' +
      '#serverSettingsRoute, #dateTime, #networkingRoute, #featuresRoute, #swUpdateRoute,' +
      '#usersRoute, #certificatesRoute, #certificateRequestRoute, #notificationsRoute, #snmpRoute, ' +
      '#smtpEmailRoute, #alarmsRoute, #activeAlarmsRoute, #historyRoute, #settingsRoute, #redundancyRoute';

    const allElements = document.querySelectorAll(allElementIds);
    allElements.forEach(element => {
      (element as HTMLElement).style.display = style;
    });
  }

  private showElement(ids: string[]): void {
    ids.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.style.display = 'block';
      }
    });
  }

  private getCurrentUserPrivilege() {
    this.subscription.push(this.userModel.users$.subscribe((users: User[]) => {
      const currentUserLocalStorage = JSON.parse(localStorage.getItem('currentUser'));
      const currentUser = users.filter(user => user.name === currentUserLocalStorage?.username);
      this.currentUserPrivilegeLevel = currentUser[0]?.privilegeLevel;
      this.privilege = currentUserLocalStorage?.username;
    }));
  }

  private initiateAccessPrivilege() {
    this.setDisplayStyle('none');
    if (isDefined(this.serverLicenseInfo) && this.systemType === SystemType.REDUNDANT && this.systemMode === InitLevel.LEVEL2) {
      this.showRedundancy();
    }
    if ((isDefined(this.serverLicenseInfo) && this.systemMode !== InitLevel.LEVEL2) && this.currentUserPrivilegeLevel === PrivilegeLevel.Readonly || this.currentUserPrivilegeLevel === PrivilegeLevel.Program_Editor_Only) {
      this.showReadonlyView();
      }
    if ( (isDefined(this.serverLicenseInfo) && this.systemMode !== InitLevel.LEVEL2) && this.currentUserPrivilegeLevel !== PrivilegeLevel.Readonly) {
      this.setDisplayStyle('block');
      }
      // special access to super admin
    if ( (isDefined(this.serverLicenseInfo) && this.systemMode !== InitLevel.LEVEL2) && this.privilege === 'super') {
      this.setDisplayStyle('block');
      }
  }

  private openActiveParent(): void {
    const activeElement = this.menu?.nativeElement.querySelector('li.active');
    // alert(activeElement + '000');
    if (activeElement) {
      let parent = activeElement.parentElement;
      while (parent && parent !== this.menu?.nativeElement) {
        if (parent.tagName === 'UL' && parent.classList.contains('sub-nav')) {
          parent.nativeElement.click();
        }
        parent = parent.parentElement;
      }
    }
  }
}
