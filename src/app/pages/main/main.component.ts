// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.

import {ClientLicenseModel} from '../../core/models/ClientLicenseModel';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Injectable,
  OnDestroy,
  OnInit,
  VERSION,
  ViewChild
} from '@angular/core';
import {Router} from '@angular/router';
import {MainService} from '../../core/services/main.service';
import {UsersComponent} from './users/users.component';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {ApiService} from '../../core/services/api.service';
import {DataService} from '../../core/services/data.service';
import {SockStompService, StompEventListener} from '../../core/services/sock-stomp.service';
import {HeaderComponent} from 'src/app/shared/components/header/header.component';
import {GetloginSession, User} from 'src/app/core/models';
import * as _swal from '../../../assets/node_modules/sweetalert/sweetalert';
import {SweetAlert} from '../../../assets/node_modules/sweetalert/sweetalert/typings/core';
import {TimeoutModalsComponent} from '../../shared/components/modals/timeout-modals/timeout-modals.component';
import {BnNgIdleService} from 'bn-ng-idle';
import {NotifyLicenseLogoff, ServerLicenseInfo} from '../../core/models/server/License';
import {isDefined} from '../../core/models/dtv/utils/Utils';
import {RESTART_SERVER_MODES, SoftwareVersionInfo} from '../../core/models/server/Server';
import {StompVariables} from '../../core/subscriptions/stompSubscriptions';
import {ClientServerModel} from '../../core/models/ClientServerModel';
import {BootstrapFunction} from '../../core/interfaces/interfaces';
import {ServerService} from '../../core/services/server.service';
import {ClientUsersModel} from '../../core/models/ClientUsersModel';
import {swalErrorLogoutFunction} from '../../shared/helpers/appWideFunctions';
import {ClientModelCollection} from '../../core/models/ClientModelCollection';
import {NavSliderComponent} from '../../shared/components/nav-slider/nav-slider.component';

declare var $: BootstrapFunction;
const swal: SweetAlert = _swal as any;

@Injectable({providedIn: 'root'})
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  providers: [
    UsersComponent,
    DataService,
    HeaderComponent,
    BnNgIdleService,
  ]
})
export class MainComponent implements OnInit, OnDestroy, StompEventListener {
  @ViewChild(TimeoutModalsComponent) vc: TimeoutModalsComponent;
  @ViewChild(NavSliderComponent) navSliderComponent: NavSliderComponent;
  public loadMainModule = true;
  pageTitle = 'MainComponent';
  title = 'Home';
  loggedIn = true;
  pingLoopStarted = false;
  userName: any = '';
  dataValue: object = {};
  curUsers: any = {};
  allUsers: Array<any> = [];
  count: any;
  public msg = [];
  interval: any;
  intervalPing: any;
  menu: Array<any> = [];
  routesubscriptions: Subscription[] = [];
  ngUnsubscribe = new Subject<void>();
  public currentUser: Observable<User>;
  licenseActivated = false;
  d = new Date();
  toggleDiv = false;
  isDirty = false;
  notifyAdmin = false;
  private subscriptions: Subscription[] = [];
  private sessionSubscription: Subscription;
  private currentUserSubject: BehaviorSubject<User>;

  constructor(
    private clientUserModel: ClientUsersModel,
    private stompService: SockStompService,
    private mainService: MainService,
    private router: Router,
    private ds: DataService,
    private apiService: ApiService,
    private clientLicenseModel: ClientLicenseModel,
    public bnIdle: BnNgIdleService,
    private serverService: ServerService,
    private clientServerModel: ClientServerModel,
    private clientModelCollection: ClientModelCollection,
    private cdr: ChangeDetectorRef
  ) {
    this.preloadLastZipInfo();
    this.currentUserSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage.getItem('currentUser'))
    );

    this.currentUser = this.currentUserSubject.asObservable();
    const user = this.apiService.currentUserValue;

    if (!user) {
      localStorage.removeItem('currentUser');
      this.currentUserSubject.next(null);
      this.router.navigate(['/login']).then();
      this.apiService.logout();
    }
    window.addEventListener(
      'storage',
      (event) => {
        if (event.storageArea === localStorage) {
          const token = localStorage.getItem('currentUser');
          if (!token) {
            this.loggedIn = false;
            window.location.href = '/';
          }
        }
      },
      false
    );

    this.ds.getDataAllSession().subscribe((x) => {
      this.allUsers = x;
    });
    console.log('MainComponent add stomp listener');
    this.stompService.addListener(this);
  }

  @HostListener('document:keypress', ['$event'])
  @HostListener('document:click', ['$event'])
  @HostListener('document:wheel', ['$event'])
  @HostListener('document:mousemove', ['$event'])
  onMouseMove() {
    this.bnIdle.resetTimer(); // reset inactivity timer
  }

  ngOnInit(): void {
    console.log(`Angular version: ${VERSION.full}`);
    this.stompService.initializeConnection();
    console.log('websocket re-initialized during refresh...');
    this.curUsers = JSON.parse(localStorage.getItem('currentUser'));
    this.pingLoopStarted = false;

    this.subscriptions.push(
      this.ds.getIsDirty().subscribe((x) => {
        this.isDirty = x;

      })
    );

    this.pingLoop();
    this.callapi_getAllSessions();
    this.callapi_getLogSessions();

    this.getSoftwareVersion();
    this.doLicenseCheck();
    this.idleStart(900);
  }

  /*****
   * This function triggers an API service loop that calls every second
   *  to ensure that the application is still connected to the server.
   */
  pingLoop() {
    if (!this.pingLoopStarted && this.loggedIn) {
      this.pingLoopStarted = true;

      const observable: Observable<any> = this.mainService.playPing();
      this.intervalPing = setInterval(() => {
        const observer = {
          next: () => {
          },
          error: (error: any) => {
            if (error.statusText === 'OK') {
              localStorage.setItem('errPing', 'false');
            } else if (error.statusText === 'Unknown Error') {
              // prevent consecutive pop-up of modal
              if (this.pingLoopStarted === true) {
                swalErrorLogoutFunction('The server connection has been lost. You are being logged out.');
              }
              localStorage.setItem('errPing', 'false');
              clearInterval(this.intervalPing);
              this.pingLoopStarted = false;
            } /*else {
              localStorage.setItem('errPing', 'true');
            }*/
          },
          complete: () => {
            console.log('Observable complete getServerInfo');
          }
        };
        this.subscriptions.push(observable.subscribe(observer));
      }, 1000);
    }
  }

  onActivate(event: any) {
    this.triggerComponent(event);
  }

  triggerComponent(event: {
    pageTitle: string;
    title: string;
  }) {
    if (event.pageTitle === 'HomeComponent') {
      this.pageTitle = event.pageTitle;
      this.title = event.title;
      this.ds.sendSocketDataTitle(this.title);
    } else if (event.pageTitle === 'UsersComponent') {
      this.pageTitle = event.pageTitle;
      this.title = 'Users';
      this.ds.sendSocketDataTitle(this.title);
    } else if (event.pageTitle === 'NetworkingComponent') {
      this.pageTitle = event.pageTitle;
      this.title = 'Networking';
      this.ds.sendSocketDataTitle(this.title);
    }
  }

  callapi_getLogSessions() {
    const observable: Observable<GetloginSession> = this.mainService.getLogSessions();
    const observer = {
      next: (data: GetloginSession) => {
        this.dataValue = data;
        this.userName = data.userName;
        if (localStorage?.length !== 0) {
          const item = JSON.parse(localStorage.currentUser);
          if (item.token === '') {
            item.token = data.sessionId;
            item.loggedInTime = data.loggedInTime;
          }
          localStorage.setItem('currentUser', JSON.stringify(item));
        } else {
          this.router.navigate(['/login']).then();
        }
      },
      error: () => {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
      },
      complete: () => {
      }
    };
    this.subscriptions.push(observable.subscribe(observer));
  }

  callapi_getAllSessions() {
    this.clientUserModel.refresh();
    this.clientUserModel.allLoginSessions$.subscribe((allLoginSessions) => {
      if (allLoginSessions) {
        const cnt = allLoginSessions.length;
        for (let i = 0; i < cnt; i++) {
          if (this.allUsers.indexOf(allLoginSessions[i]) === -1) {
            this.allUsers.push(allLoginSessions[i]);
          }
        }
        this.count = cnt;
        this.loadMainModule = false;
      }
    }, (error) => {
      localStorage.removeItem('currentUser');
      this.currentUserSubject.next(null);
      this.router.navigate(['/login']).then();
      this.apiService.logout();
    });
  }

  /*****
   * This function gets data from api softwareVersionInfo
   *
   */
  getSoftwareVersion() {
    setTimeout(() => {
      const softwareVersionInfo: SoftwareVersionInfo = this.clientServerModel.getServerSoftwareInfo();
      localStorage.setItem('versionInfo', JSON.stringify(softwareVersionInfo));
    }, 100);
  }

  doLicenseCheck() {
    const serverLicenseInfo: ServerLicenseInfo = this.clientLicenseModel.getServerLicenseInfo();
    console.log('doLicenseCheck serverLicenseInfo', serverLicenseInfo);
    this.clientLicenseModel.serverLicenseInfo$.subscribe((serverLicenseInfo) => {
      console.log('doLicenseCheck serverLicenseInfo: ', serverLicenseInfo);
      if (isDefined(serverLicenseInfo)) {
        this.messageLicenseCheck(serverLicenseInfo);
      }
    });
    this.ds.sendLicenseActivated(isDefined(serverLicenseInfo?.serverLicense));
    this.ds.sendFeatureLicenseData(serverLicenseInfo?.serverLicense);
  }

  /***
   * this function checks data and displays messages
   * based on license data given
   * and calls sweetalert
   *
   */
  messageLicenseCheck(serverLicenseInfo: ServerLicenseInfo) {
    const isUserAlreadyPrompted = JSON.parse(
      localStorage.getItem('isUserAlreadyPrompted')
    );
    this.licenseActivated = true;
    let message = null;
    const title = 'License status warning';
    const icon = 'warning';
    const curData = new Date();
    const dateExpiry = new Date(serverLicenseInfo.serverLicense?.licenseExpirationDate);
    const daysRemaining =
      Math.round(
        (dateExpiry.getTime() - curData.getTime()) /
        1000.0 /
        60.0 /
        60.0 /
        24.0
      ) + 1;
    if (serverLicenseInfo.serverLicense === undefined || serverLicenseInfo.serverLicense == null) {
      this.licenseActivated = false;
      message = 'No License Found';

    } else {
      this.getSoftwareVersion();
      console.log('ELSE 1');
      if (!serverLicenseInfo.serverLicense) {
        this.licenseActivated = false;
        message = 'No License Found';
      } else if (serverLicenseInfo.newLicenseRequired) {
        message =
          'A new license is required to operate this version of GuideBuilder.';
      } else if (
        serverLicenseInfo.serverLicense.nodeLockType === 'DONGLE_KEY' &&
        !serverLicenseInfo.dongleAttached
      ) {
        message = 'A dongle was not detected.';
      } else if (
        serverLicenseInfo.serverLicense.nodeLockType === 'DONGLE_KEY' &&
        !serverLicenseInfo.correctDongle
      ) {
        message = 'An incorrect dongle was detected';
      } else if (
        serverLicenseInfo.serverLicense.nodeLockType === 'MAC_ADDRESS' &&
        !serverLicenseInfo.nodeLockValid
      ) {
        message = 'Invalid licensed MAC address.';
      } else if (serverLicenseInfo.expired) {
        message =
          'The license has expired. Please contact Triveni Digital Support for assistance';
      } else if (
        serverLicenseInfo.serverLicense.licenseExpirationDate != null &&
        this.thirtyFuture(daysRemaining)
      ) {
        message = 'The license will expire ';
        message = daysRemaining === 0
          ? (message = message + 'today.')
          : message + 'in ' + daysRemaining + ' day(s).';
      }
    }

    if (isUserAlreadyPrompted == null) {
      this.sweetAlertOpenMessage(message, title, icon);
    }

    if (message == null && serverLicenseInfo.licenseCapabilityExceeded) {
      console.log('IF 3');
      message =
        'The license capability is currently exceeded due to the following reasons:\n\n';
      if (serverLicenseInfo.unlicensedNetworkTypes.length > 0) {
        message += '* Unlicensed Network Types:';

        for (const val of serverLicenseInfo.unlicensedNetworkTypes) {
          message += '\n' + val;
        }
        message += '\n';
      }
      if (serverLicenseInfo.unlicensedOutputTypes.length > 0) {
        message += '* Unlicensed Output Types:';

        for (const val of serverLicenseInfo.unlicensedOutputTypes) {
          message += '\n' + val;
        }
        message += '\n';
      }
      if (serverLicenseInfo.unlicensedInputTypes.length > 0) {
        message += '* Unlicensed Output Types:';

        for (const val of serverLicenseInfo.unlicensedInputTypes) {
          message += '\n' + val;
        }

        message += '\n';
      }
      if (serverLicenseInfo.outputsExceeded) {
        message +=
          '* Max Outputs Exceeded: ' + serverLicenseInfo.serverLicense.maxOutputs + '\n';
      }
      if (serverLicenseInfo.providersExceeded) {
        message +=
          '* Max Inputs Exceeded: ' + serverLicenseInfo.serverLicense.maxInputs + '\n';
      }
      if (serverLicenseInfo.servicesExceeded) {
        message +=
          '* Max Services Exceeded: ' + serverLicenseInfo.serverLicense.maxServices + '\n';
      }
      if (serverLicenseInfo.transportsExceeded) {
        message +=
          '* Max Transports  Exceeded: ' +
          serverLicenseInfo.serverLicense.maxTransports +
          '\n';
      }
      if (serverLicenseInfo.majorNumbersExceeded) {
        message +=
          '* Max Major Numberss  Exceeded: ' +
          serverLicenseInfo.serverLicense.maxMajorNumbers +
          '\n';
      }
      if (serverLicenseInfo.measexceeded) {
        message += '* M-EAS is not licensed\n';
      }
      if (serverLicenseInfo.aeaexceeded) {
        message += '* AEA is not licensed\n';
      }
      if (serverLicenseInfo.aeanrtexceeded) {
        message += '* AEA NRT is not licensed\n';
      }
      if (serverLicenseInfo.serviceExportExceeded) {
        message += '* service Export is not licensed\n';
      }
      if (serverLicenseInfo.esgexceeded) {
        message += '* ESG is not licensed\n';
      }
      if (serverLicenseInfo.mmtexceeded) {
        message += '* MMT is not licensed\n';
      }
      if (serverLicenseInfo.guestOSVMExceeded) {
        message += '* Guest OS VM is not licensed\n';
      }
      if (serverLicenseInfo.isRoutesExceeded) {
        message +=
          '* Max IP Streams Exceeded (' + serverLicenseInfo.serverLicense.maxRoutes + ')\n';
      }
      message +=
        '\nThe server is in passive mode. \nPlease see the Features tab for more information.';

      if (isUserAlreadyPrompted === null) {
        this.sweetAlertOpenMessage(message, title, icon);
      }
    } else {
      localStorage.setItem('isUserAlreadyPrompted', JSON.stringify(true));
    }
  }

  /***
   * Check if days remaining is less than 30 days
   * return if true else false
   */
  thirtyFuture(daysRemaining: number) {
    let timeLess = false;
    if (daysRemaining < 30) {
      timeLess = true;
    }
    return timeLess;
  }

  /***
   * Sweet alert message Opens message and tittle
   */
  sweetAlertOpenMessage(mess: string, title: string, icon: string) {
    if (mess !== null) {
      setTimeout(() => {
        swal(title, mess, icon).then((isConfirm) => {
          if (isConfirm) {
            $('.swal-overlay').remove();
            $('.fixed-layout').removeAttr('style');
            localStorage.setItem('isUserAlreadyPrompted', JSON.stringify(true));
            localStorage.setItem('isUserAlreadyPrompted', JSON.stringify(true));
          }
        });
      }, 1000);
    }
  }

  idleStart(countTimer: number) {
    this.sessionSubscription = this.bnIdle
      .startWatching(countTimer)
      .subscribe((res: boolean) => {
        if (res) {
          this.vc.opentimeOutModal();
        }
      });
  }

  restartMonitoringTimer() {
    this.bnIdle.stopTimer();
    this.bnIdle.resetTimer();
  }

  /***
   * Retrieves and sets the initial runtimeLogsZipLastUpdated property value
   * from serverStatus API response during app initialization
   */
  preloadLastZipInfo() {
    this.subscriptions.push(
      this.serverService.getServerStatus().subscribe((data) => {
        localStorage.setItem('serverStats', data.runtimeLogsZipLastUpdated);
      })
    );
  }

  headChangedHandler($evt: boolean) {
    this.toggleDiv = $evt;
  }

  handleLogout() {
    if (this.isDirty) {
      this.router.url === '/main/users'
        ? this.confirmBox()
        : this.router.navigate(['/login']);
    } else {
      this.confirmBox();
    }
  }

  confirmBox() {
    if (confirm('Leave and logout ?')) {
      this.apiService.logout().subscribe(() => {
        localStorage.removeItem('currentUser');
        window.location.href = '/';
      });
      return true;
    } else {
      return false;
    }
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscriptions?.forEach((sub) => {
      sub.unsubscribe();
    });
    this.routesubscriptions?.forEach((sub) => {
      sub.unsubscribe();
    });

    this.subscriptions = [];
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

    // to stop subcription ping loop
    if (this.intervalPing) {
      clearInterval(this.intervalPing);
    }

    if (this.sessionSubscription) {
      this.sessionSubscription.unsubscribe();
    }
    console.log('MainComponent remove stomp listener');
    this.stompService.removeListener(this);
  }

  public notifyStompEvent(topic: string, messageJson: string) {
    console.log('MainComponent, stomp topic: ', topic, ', messageJson: ', messageJson);
    console.log('loggedIn: ', this.loggedIn);
    // TODO Jan
    //  I don't think this is correct. If make a change to GB via ROUTE / MMTP encoder app, or something else use's GB API, this message pops up when it shouldn't
    //

    if (topic === StompVariables.stompChannels.notifyCommitUpdate) {
      this.notifyAdmin = true;
      $('.modal').modal('hide');
    }

    if (topic === StompVariables.stompChannels.notifyRedundancySettingsUpdate) {
      let initLevel = localStorage?.getItem('initLevel');
      initLevel = RESTART_SERVER_MODES[initLevel].displayName;
      console.log('to switch to a system mode Java Client...');
      swalServerLogoff(initLevel);
    }

    if (this.loggedIn && topic === StompVariables.stompChannels.notifyJavaAdminClientLogon) {
      console.log('Someone logged in via Java Client...');
      swalJavaClientLogin();
    }
    if (this.loggedIn && topic === StompVariables.stompChannels.notifyLicenseLogoff) {
      console.log('License change forcing log off');
      const notifyLicenseLogoff: NotifyLicenseLogoff = JSON.parse(messageJson);
      swalLicenseLogoff(notifyLicenseLogoff.reason);
    }
  }
}

function swalJavaClientLogin() {
  swal('Server Connection Closed',
    'Another user has logged to GuideBuilder via Java Admin Client. Logging this session off...').then(
    () => {
      $('.swal-overlay').remove();
      $('.fixed-layout').removeAttr('style');
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = window.location.origin + '/gbApp/';
    });
}

function swalLicenseLogoff(reason: string) {
  swal('Server Connection Closed',
    `License Logoff reason: ${reason}`).then(
    () => {
      $('.swal-overlay').remove();
      $('.fixed-layout').removeAttr('style');
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = window.location.origin + '/gbApp/';
    });
}

function swalServerLogoff(reason: string) {
  swal('Server Connection Closed',
    `The GuideBuilder Server is restarting: ${reason}`).then(
    () => {
      $('.swal-overlay').remove();
      $('.fixed-layout').removeAttr('style');
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = window.location.origin + '/gbApp/';
    });
}


