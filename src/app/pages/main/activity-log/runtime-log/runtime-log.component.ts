// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {Component, OnInit, ViewChild} from '@angular/core';
import {ActionMessage, ButtonType, ImageType} from '../../../../core/models/ui/dynamicTable';
import {ClientLogModel} from '../../../../core/models/ClientLogModel';
import {
  ModalSimpleTableComponent
} from '../../../../shared/components/modals/modal-simple-table/modal-simple-table.component';
import {environment} from '../../../../../environments/environment';
import * as _swal from '../../../../../assets/node_modules/sweetalert/sweetalert';
import {SweetAlert} from '../../../../../assets/node_modules/sweetalert/sweetalert/typings/core';
import {ActivityLogService} from '../../../../core/services/activity-log.service';
import {HttpClient, HttpEventType} from '@angular/common/http';
import {Subscription} from 'rxjs';
import {RuntimeLog} from '../../../../core/models/server/EventLogMessage';
import {cloneDeep} from 'lodash';
import {ProgressBarDataInterface, ProgressBarType} from '../../../../core/interfaces/ProgressBarDataInterface';
import {BootstrapFunction} from '../../../../core/interfaces/interfaces';
import {progressLoader} from '../../../../shared/helpers/progressLoadHelper';

declare var $: BootstrapFunction;

const swal: SweetAlert = _swal as any;

@Component({
  selector: 'app-runtime-log',
  templateUrl: './runtime-log.component.html',
  styleUrls: ['./runtime-log.component.scss']
})
export class RuntimeLogComponent implements OnInit {
  @ViewChild(ModalSimpleTableComponent) runtimeLogTableComponent: ModalSimpleTableComponent;
  public modalName = '#displayRuntime';
  runTimeLogList = [];
  tableHeaders = [{header: 'Name', key: 'fileName', visible: true}];
  public buttonList = [
    {name: ButtonType.VIEW, imgSrc: ImageType.view, disable: false},
    {name: ButtonType.EXPORT, imgSrc: ImageType.export, disable: false}
  ];
  public viewProgressBar = false;
  public progressModalData: ProgressBarDataInterface;
  protected subscriptions: Subscription [] = [];
  private defaultDirectory = '/logs/';
  private linkExport: string;
  private exportDisabled: string;

  constructor(private clientLogModel: ClientLogModel, private http: HttpClient, private actLog: ActivityLogService) {
  }

  ngOnInit(): void {
    this.subscriptions.push(this.clientLogModel.runtimeLogs$.subscribe((runtimeLogs: RuntimeLog[]) => {
      this.runTimeLogList = cloneDeep(runtimeLogs);
    }));
    this.exportDisabled = 'disabled';
  }

  public onButtonClicked($event: any) {
    if (this.runtimeLogTableComponent.selectedRow !== null) {
      if ($event.message === ActionMessage.VIEW) {
        window.open(this.defaultDirectory + this.runtimeLogTableComponent.selectedRow.fileName, 'blank');
      } else if ($event.message === ActionMessage.EXPORT) {
        this.openFileUploadModal();
        this.downloadRuntimeLogs();
      }
    }
  }

  downloadRuntimeLogs(): void {
    this.actLog.getRuntimeLogsDownloadZipInfo().subscribe(
      (data) => {
        if (data.downloadRelativePath) {
          this.exportDisabled = '';
          this.linkExport = environment.ZIP_EXPORT_URL + data.downloadRelativePath;
          this.http.get(this.linkExport,
            {responseType: 'arraybuffer', reportProgress: true, observe: 'events'}).subscribe(event => {
            const fileName = 'runtimeLogs.zip';
            switch (event.type) {
              case HttpEventType.DownloadProgress:
                if (event.total) {
                  this.progressModalData = progressLoader(event.loaded, event.total, fileName,
                    ProgressBarType.DOWNLOAD);
                }
                break;
              case HttpEventType.Response:
                const blob = new Blob([event.body], {type: 'application/octet-stream'});
                const downloadLink = document.createElement('a');
                downloadLink.href = window.URL.createObjectURL(blob);
                downloadLink.download = fileName;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                break;
            }
          });
          let messageAlert = 'Runtime Logs successfully downloaded.';
          let messageData = 'success';
          if (data.successful === false) {
            messageData = 'error';
            messageAlert = data.errorMessage;
          }
          setTimeout(() => {
            swal('', messageAlert, messageData);
          }, 1000);
        }
      },
      (err) => {
        const messageAlert = err;
        const messageData = 'error';
        swal('', messageAlert, messageData);
      });
  }

  public openFileUploadModal() {
    this.viewProgressBar = true;
    setTimeout(() => {
      $('#modal-progress-bar').modal('show');
    }, 100);
  }

  public fileProgressModalHandler(event: string) {
    setTimeout(() => {
      $('#modal-progress-bar').modal('hide');
      this.viewProgressBar = false;
    }, 100);
  }

  ngOnDestroy() {
    this.subscriptions?.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }
}
