/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {Subscription} from 'rxjs';
import {
  AbstractFetchableScheduleProvider,
  FileDescriptor,
  FTPTestRequest,
  getFTPRequestFromProvider,
  getOnConnectHTTPRequest,
  getOnV3HTTPRequest,
  HTTPTestRequest,
  isOnConnectScheduleProvider,
  isOnV3ScheduleProvider,
  isProviderTypeFTPBased,
  OnConnectScheduleProvider,
  onConnectUrlPrefix,
  OnV3ScheduleProvider,
  onV3UrlPrefix,
  PMCPTCPScheduleProvider,
  ScheduleProviderType,
  TCPTestRequest,
  TCPTestResponse
} from '../../../../../core/models/dtv/schedule/ScheduleProvider';
import {isDefined, isUndefined} from '../../../../../core/models/dtv/utils/Utils';
import {ScheduleProviderService} from '../../../../../core/services/schedule-provider.service';
import {ButtonTypes, MultipleTableColumns} from '../../../../../core/models/ui/dynamicTable';
import {ClientNetworkSettingsModel} from '../../../../../core/models/ClientNetworkSettingsModel';
import {NICDescriptor} from '../../../../../core/models/server/NetworkSetting';
import {v4 as uuidv4} from 'uuid';

@Component({
  selector: 'app-modal-sp-testconnection',
  templateUrl: './modal-sp-testconnection.component.html',
  styleUrls: ['./modal-sp-testconnection.component.scss'],
})
export class ModalSpTestconnectionComponent implements OnInit, OnDestroy, OnChanges {
  @Input() nics: NICDescriptor[];
  @Input() scheduleProvider: AbstractFetchableScheduleProvider;
  @Input() showTestConnection: boolean;
  @Output() testConnectionClosed: EventEmitter<any> = new EventEmitter();
  public readonly ScheduleProviderType = ScheduleProviderType;
  public readonly modalTitle = 'Test Connection';
  public readonly title = 'Test Connection Result';
  public ftpBaseTest = false;
  public graceNoteTest = false;
  public pmcpTcpTest = false;
  public testConnectionAddress: string;
  public tableMaxHeight = '250px';
  public buttonList: ButtonTypes[] = [];
  public tableHeaders: MultipleTableColumns[] = [
    {header: 'File Name', key: 'fileName', visible: true},
    {header: 'Size', key: 'fileSize', visible: true},
    {header: 'Last Modified', key: 'lastModified', visible: true, showDate: true}
  ];
  public ftpFiles: FileDescriptor[];
  public errorMessage: string;
  public loading: boolean;
  public tableHide: boolean;
  public cssClass: string;
  public onConnectMessage = '';
  public passText: string;
  public showPassword: boolean;
  private subscriptions: Subscription[] = [];

  constructor(private clientNetworkSettingsModel: ClientNetworkSettingsModel,
              private scheduleProviderService: ScheduleProviderService, private cdr: ChangeDetectorRef) {
  }

  public ngOnInit(): void {
    this.initializeScheduleProvider();
  }

  public ngOnDestroy(): void {
    this.subscriptions?.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    console.log('test connection onChanges changes: ', changes);
    if (isDefined(changes.scheduleProvider)) {
      this.scheduleProvider = changes.scheduleProvider.currentValue;
      this.initializeScheduleProvider();
      this.cdr.detectChanges();
    }
    if (isDefined(changes.showTestConnection)) {
      if (changes.showTestConnection.currentValue === true &&
        (changes.showTestConnection.previousValue === false) || isUndefined(
          changes.showTestConnection.previousValue)) {
        this.doTestConnection();
      }
    }
  }

  public closeModal(): void {
    this.testConnectionClosed.emit();
  }

  public togglePass() {
    this.showPassword = !this.showPassword;
    this.passText = 'Show pass';
    if (this.showPassword) {
      this.passText = 'Hide pass';
    }
  }

  private initializeScheduleProvider(): void {
    this.ftpBaseTest = isProviderTypeFTPBased(this.scheduleProvider.scheduleProviderType);
    if (isOnConnectScheduleProvider(this.scheduleProvider?.scheduleProviderType)) {
      const onConnectScheduleProvider = this.scheduleProvider as OnConnectScheduleProvider;
      this.testConnectionAddress = onConnectUrlPrefix + onConnectScheduleProvider.apiKey;
      this.graceNoteTest = true;
    } else if (isOnV3ScheduleProvider(this.scheduleProvider?.scheduleProviderType)) {
      const onV3ScheduleProvider = this.scheduleProvider as OnV3ScheduleProvider;
      console.log('onV3ScheduleProvider', onV3ScheduleProvider);
      this.testConnectionAddress = 'https://' + onV3ScheduleProvider.host + ':' + onV3ScheduleProvider.port + onV3UrlPrefix + onV3ScheduleProvider.apiKey;
      this.graceNoteTest = true;
    } else if (this.scheduleProvider?.scheduleProviderType === ScheduleProviderType.PMCP_TCP) {
      const pmcpTcpScheduleProvider = this.scheduleProvider as PMCPTCPScheduleProvider;
      this.testConnectionAddress = pmcpTcpScheduleProvider.networkInterfaceName;
      this.pmcpTcpTest = true;
    }
  }

  private doTestConnection(): void {
    this.errorMessage = '';
    this.cssClass = '';
    this.loading = true;
    if (this.ftpBaseTest) {
      this.doFtpTest();
    } else if (this.scheduleProvider?.scheduleProviderType === ScheduleProviderType.ON_CONNECT) {
      this.onCallOnConnectTest(this.scheduleProvider as OnConnectScheduleProvider);
    } else if (this.scheduleProvider?.scheduleProviderType === ScheduleProviderType.ON_V3) {
      this.onCallOnV3Test(this.scheduleProvider as OnV3ScheduleProvider);
    } else if (this.scheduleProvider?.scheduleProviderType === ScheduleProviderType.PMCP_TCP) {
      this.doPmcpTcpTestRequest(this.scheduleProvider as PMCPTCPScheduleProvider);
    }

  }

  private doFtpTest() {
    const ftpTestRequest: FTPTestRequest = getFTPRequestFromProvider(this.scheduleProvider);
    this.subscriptions.push(
      this.scheduleProviderService.ftpTest(ftpTestRequest).subscribe((ftpTestResponse) => {
        this.loading = false;
        this.tableHide = !ftpTestResponse.successful;
        this.cssClass = ftpTestResponse.successful ? 'success' : 'danger';
        if (ftpTestResponse.successful) {
          this.ftpFiles = ftpTestResponse.ftpFiles;
        } else {
          this.errorMessage = ftpTestResponse.errorMessage;
        }
      }));
  }

  private onCallOnConnectTest(onConnectScheduleProvider: OnConnectScheduleProvider): void {
    console.log('onCallOnConnectTest...');
    const httpTestRequest: HTTPTestRequest = getOnConnectHTTPRequest(onConnectScheduleProvider);
    this.doHTTPTest(httpTestRequest);
  }

  private onCallOnV3Test(onV3ScheduleProvider: OnV3ScheduleProvider): void {
    console.log('onCallOnV3Test...');
    const httpTestRequest: HTTPTestRequest = getOnV3HTTPRequest(onV3ScheduleProvider);
    this.doHTTPTest(httpTestRequest);
  }

  private doHTTPTest(httpTestRequest: HTTPTestRequest): void {
    console.log('doHTTPTest httpTestRequest: ', httpTestRequest);
    this.onConnectMessage = '';
    this.subscriptions.push(
      this.scheduleProviderService.httpTest(httpTestRequest).subscribe(
        (httpTestResponse) => {
          this.loading = false;
          if (isDefined(httpTestResponse)) {
            this.tableHide = false;
            this.cssClass = httpTestResponse.successful ? 'success' : 'danger';
            this.onConnectMessage = httpTestResponse.message;
          }
        }));
  }

  private doPmcpTcpTestRequest(pmcpTcpScheduleProvider: PMCPTCPScheduleProvider): void {
    const nicDescriptor: NICDescriptor = this.nics.find(
      nic => nic.interfaceName === pmcpTcpScheduleProvider.networkInterfaceName);
    const pmcpTcpTestRequest: TCPTestRequest = new TCPTestRequest(uuidv4(), pmcpTcpScheduleProvider.id,
      pmcpTcpScheduleProvider.networkInterfaceName, nicDescriptor?.ipaddress, pmcpTcpScheduleProvider.port);
    console.log('doPMCPTCPTestRequest pmcpTcpTestRequest: ', pmcpTcpTestRequest);
    this.onConnectMessage = '';
    this.subscriptions.push(
      this.scheduleProviderService.tcpTest(pmcpTcpTestRequest).subscribe(
        (tcpTestResponse: TCPTestResponse) => {
          this.loading = false;
          if (isDefined(tcpTestResponse)) {
            this.tableHide = false;
            this.cssClass = tcpTestResponse.successful ? 'success' : 'danger';
            this.onConnectMessage = tcpTestResponse.message;
          }
        }));
  }
}
