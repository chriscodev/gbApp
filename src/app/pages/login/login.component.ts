// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.

import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {ApiService} from '../../core/services/api.service';
import {LoginUser, User} from 'src/app/core/models';
import {SockStompService} from '../../core/services/sock-stomp.service';
import {DataService} from 'src/app/core/services/data.service';
import {UsersComponent} from '../main/users/users.component';
import {HeaderComponent} from 'src/app/shared/components/header/header.component';
import {ClientModelCollection} from '../../core/models/ClientModelCollection';
import {ServerService} from '../../core/services/server.service';
import {ClientLocationSettingsModel} from '../../core/models/ClientLocationSettingsModel';
import {LocationSettings} from '../../core/models/server/LocationSettings';
import {isDefined} from '../../core/models/dtv/utils/Utils';
import {takeUntil} from 'rxjs/operators';
import {ClientLicenseModel} from '../../core/models/ClientLicenseModel';
import {ServerLicenseInfo, SystemType} from '../../core/models/server/License';
import {InitLevel} from '../../core/models/server/Server';
import {LicenseService} from '../../core/services/license.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [UsersComponent, DataService, HeaderComponent],
})
export class LoginComponent implements OnInit, OnDestroy {
  public currentUser: Observable<User>;
  public currentVersion: string;
  loading = false;
  submitted = false;
  logMessage: string;
  showMessage = false;
  alertBox: any;
  userImg = '<i class=\'fa fa-user-circle fa-2x\'></i>';
  passImg = '<i class=\'fa fa-lock fa-2x\'></i>';
  contentButton: any;
  disabledLogin: boolean;
  headMessage = 'Welcome';
  disableMainOk = true;
  loginDataObj: LoginUser = new LoginUser();
  public serverLicenseInfo: ServerLicenseInfo;
  private systemType: SystemType;
  private systemMode: InitLevel;
  private currentUserSubject: BehaviorSubject<User>;
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private apiService: ApiService,
    private ds: DataService,
    private sockStompService: SockStompService,
    private serverService: ServerService,
    private clientLocationSettingsModel: ClientLocationSettingsModel,
    private clientModelCollection: ClientModelCollection,
    private clientLicenseModel: ClientLicenseModel,
    private licenseService: LicenseService
  ) {
    this.currentUserSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage?.getItem('currentUser'))
    );
    this.currentUser = this.currentUserSubject.asObservable();
    if (this.apiService.currentUserValue) {
      this.router.navigate(['/main']).then();
    }
  }

  ngOnInit(): void {
    this.contentButton = 'Login';
    this.disabledLogin = false;

    this.clientLocationSettingsModel.locationSettings$
      .pipe(takeUntil(this.destroy$))
      .subscribe((locationSettings: LocationSettings) => {
        if (isDefined(locationSettings) && isDefined(locationSettings.welcomeMessage)) {
          this.headMessage = locationSettings.welcomeMessage;
        }
      });
    this.refreshSoftwareVersion();
  }

  /***
   * On click Submit button on form, checks if all fields are valid
   * calls api service login
   * if success on login api displays a message to be redirected in dashboad
   * if false diplay error message
   */
  onSubmit() {
    this.disabledLogin = true;
    this.showMessage = false;
    this.loading = true;

    const observable: Observable<any> = this.apiService.login(this.loginDataObj.username, this.loginDataObj.password);
    const observer = {
      next: () => {
        this.redirectSuccess(this.createUserFromLogin(this.loginDataObj)).then();
      },
      error: (error: { status: any; message: string; }) => {
        const status = error.status;
        this.showMessage = true;
        switch (status) {
          case 100: // Informational responses
            this.alertBox = 'alert-danger';
            this.logMessage = 'Informational responses: ' + error.message;
            this.loading = false;
            break;

          case 200: // Success
            this.handleLoginError(error);
            break;

          case 300: // Redirection
            this.alertBox = 'alert-danger';
            this.logMessage = 'Redirection: ' + error.message;
            this.loading = false;
            break;

          case 400: // Client Errors
            this.alertBox = 'alert-danger';
            this.logMessage = 'Client Errors: ' + error.message;
            this.loading = false;
            break;

          case 500: // Server Errors
            this.alertBox = 'alert-danger';
            this.logMessage = 'Server Errors: ' + error.message;
            this.loading = false;
            break;

          default:
            break;
        }

      },
      complete: () => {
        console.log('Login onSubmit complete');
        // Handle complete
        console.log('Observable complete getServerInfo');
      }
    };
    this.subscriptions.push(observable.subscribe(observer));
  }

  formInputDisableOk() {
    this.disableMainOk = !(this.loginDataObj.username !== '' &&
      this.loginDataObj.password !== '');
  }

  /***
   * this function redirects to dashboard
   */
  async redirectSuccess(user: User) {
    this.alertBox = 'alert-success';
    this.logMessage = 'Authentication successful';
    this.loadLicenseModel();
    setTimeout(async () => {
      try {
        localStorage?.setItem('currentUser', JSON.stringify(user));
        this.apiService.currentUserSubject.next(user);
        const homePage = '/main';
        await this.router.navigate([homePage]); // redirect to home after login
        this.clientModelCollection.refresh();
        this.sockStompService.initializeConnection();
      } catch (error) {
        return error.message;
      }
    }, 500);
  }

  ngOnDestroy(): void {
    this.subscriptions?.forEach((sub) => sub.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();
  }

  private handleLoginError(error: any) {
    console.log('Login error: ', error);
    this.showMessage = true;
    const splitted = error.url?.split('?');
    if (splitted[1] === 'authenticated') {
      this.redirectSuccess(this.createUserFromLogin(this.loginDataObj)).then();
    } else {
      this.alertBox = 'alert-danger';
      this.logMessage = 'Authentication Failed: Invalid Credentials';
      this.loading = false;
    }
  }

  private createUserFromLogin(loginUser: LoginUser): User {
    return {
      id: 0,
      username: loginUser.username,
      firstName: '',
      lastName: '',
      password: loginUser.password,
      token: '',
      loggedInTime: '',
    };
  }

  private refreshSoftwareVersion(): void {
    this.serverService.getSoftwareVersionInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(softwareVersionInfo => {
        console.log('softwareVersionInfo', softwareVersionInfo);
        this.currentVersion = softwareVersionInfo.currentVersion;
      });
  }

  private loadLicenseModel(): void {
    this.licenseService.getServerLicenseInfo().subscribe(serverLicenseInfo => {
      this.serverLicenseInfo = serverLicenseInfo;
      this.systemType = serverLicenseInfo?.serverLicense?.systemType;
    });
    this.serverService.getServerInfo().subscribe((serverStatusInfo) => {
      this.systemMode = serverStatusInfo.initLevel;
    });

  }

}
