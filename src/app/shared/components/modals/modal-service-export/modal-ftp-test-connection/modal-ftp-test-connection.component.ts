// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

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
import {ButtonTypes, MultipleTableColumns} from '../../../../../core/models/ui/dynamicTable';
import {NICDescriptor} from '../../../../../core/models/server/NetworkSetting';
import {Subscription} from 'rxjs';
import {ClientNetworkSettingsModel} from '../../../../../core/models/ClientNetworkSettingsModel';
import {isDefined, isUndefined} from '@datorama/akita';
import {
  FileDescriptor,
  FTPExportProfile,
  FTPTestRequest,
  getFTPRequestObject
} from '../../../../../core/models/dtv/network/export/ExportProfile';
import {ServiceExportService} from '../../../../../core/services/service-export.service';


@Component({
  selector: 'app-modal-ftp-test-connection',
  templateUrl: './modal-ftp-test-connection.component.html',
  styleUrl: './modal-ftp-test-connection.component.scss'
})
export class ModalFtpTestConnectionComponent implements OnInit, OnDestroy, OnChanges {
  @Input() nics: NICDescriptor[];
  @Input() currentExportProfile: FTPExportProfile;
  @Input() showTestConnection: boolean;
  @Output() testConnectionClosed: EventEmitter<any> = new EventEmitter();
  public readonly modalTitle = 'Test Connection';
  public readonly title = 'Test Connection Result';
  public ftpBaseTest = true;
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
              private serviceExportService: ServiceExportService, private cdr: ChangeDetectorRef) {
  }

  public ngOnInit(): void {
    this.ftpBaseTest = true;
  }

  public ngOnDestroy(): void {
    this.subscriptions?.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (isDefined(changes)) {
      this.currentExportProfile = changes.currentExportProfile.currentValue;
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

  private doTestConnection(): void {
    this.errorMessage = '';
    this.cssClass = '';
    this.loading = true;
    if (this.ftpBaseTest) {
      this.doFtpTest();
    }
  }

  private doFtpTest() {
    const ftpTestRequest: FTPTestRequest = getFTPRequestObject(this.currentExportProfile);
    this.subscriptions.push(
      this.serviceExportService.doFtpTest(ftpTestRequest).subscribe((ftpTestResponse) => {
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
}

