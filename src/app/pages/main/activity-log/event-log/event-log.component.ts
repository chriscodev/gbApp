// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActionMessage, ButtonType, ImageType} from '../../../../core/models/ui/dynamicTable';
import {ClientLogModel} from '../../../../core/models/ClientLogModel';
import {cloneDeep} from 'lodash';
import {ActivityLogService} from '../../../../core/services/activity-log.service';
import {SweetAlert} from '../../../../../assets/node_modules/sweetalert/sweetalert/typings/core';
import {
  ModalDynamicTbTranslateComponent
} from '../../../../shared/components/modals/modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {Subscription} from 'rxjs';
import {DefaultEventLogMessage, EventLogMessage} from '../../../../core/models/server/EventLogMessage';
import {resetTabSelectedClass} from '../../../../shared/helpers/tableSelection';
import {changeDateFormat} from '../../../../shared/helpers/appWideFunctions';
import * as _swal from '../../../../../assets/node_modules/sweetalert/sweetalert';

const swal: SweetAlert = _swal as any;

declare var $;

@Component({
  selector: 'app-event-log',
  templateUrl: './event-log.component.html',
  styleUrls: ['./event-log.component.scss']
})
export class EventLogComponent implements OnInit, OnDestroy {
  @ViewChild(ModalDynamicTbTranslateComponent) dynamicTableComponent: ModalDynamicTbTranslateComponent;
  public modalName = '#myModal_EventLogMessage';
  public eventLogs: EventLogMessage[] = [];
  public tableHeight = '380px';
  public viewLogRecord: DefaultEventLogMessage = new DefaultEventLogMessage();
  public buttonList = [
    {name: ButtonType.CLEAR, imgSrc: ImageType.clear},
    {name: ButtonType.VIEW, imgSrc: ImageType.view}];
  public tableHeaders = [
    {header: 'ID', key: 'id', visible: false},
    {header: 'Level', key: 'eventLogType', visible: true},
    {header: 'Date/time', key: 'timeStamp', visible: true, showDate: true},
    {header: 'Source', key: 'sourceName', visible: true},
    {header: 'Message', key: 'message', visible: true}
  ];
  isNext: boolean;
  isPrev: boolean;
  modalData: DefaultEventLogMessage = new DefaultEventLogMessage();
  editMode = false;
  title = 'View message - ';
  isExceptionDisable: boolean;
  public headerTabs = [
    {tabName: 'Messages', activeId: 1},
    {tabName: 'Exception', activeId: 2, disabled: true, options: {}}
  ];
  public activeId = 1;
  public dataLoading = false;
  public spinnerText = 'Loading Event Logs...';
  protected subscriptions: Subscription [] = [];

  constructor(private clientLogModel: ClientLogModel, private actLog: ActivityLogService,
              private cdr: ChangeDetectorRef) {
    this.isPrev = true;
    this.isNext = true;
    this.dataLoading = true;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.loadEventLogs();
    }, 100);
  }

  updateEventLogs(eventlogs: EventLogMessage[]) {
    this.eventLogs = cloneDeep(eventlogs);
    this.cdr.detectChanges();
    this.dataLoading = false;
  }

  public clearLogs() {
    let messageAlert = 'Success';
    let messageData = 'success';
    this.actLog.getClearlogs().subscribe(
      (data) => {
        messageAlert = 'Log messages cleared';
        messageData = 'success';
        this.dynamicTableComponent.dataSource.data = [];
        $('#clearLogsDialog').modal('hide');
      },
      (err) => {
        messageAlert = 'Error';
        messageData = err;
      }
    );
    setTimeout(() => {
      swal('', messageAlert, messageData);
    }, 100);
  }

  public onButtonClicked($event: any) {
    if (this.dynamicTableComponent.selectedRow !== null) {
      if ($event.message === ActionMessage.VIEW) {
        this.viewLogRecord = cloneDeep(this.dynamicTableComponent.selectedRow);
        this.title = 'View message -  ' + this.viewLogRecord.sourceName;
        this.editMode = true;
        this.checkException();
        this.enableDisableDefaultButtons();
        this.cdr.detectChanges();
      }
    }
    if ($event.message === ActionMessage.DELETE) {
      $('#clearLogsDialog').modal({
        keyboard: true,
        show: true
      });
    }
  }

  onRowClicked($event) {
    // todo switch row highliht based on next prev
  }

  enableDisableDefaultButtons() {
    if (this.dynamicTableComponent.currentIndex === 0) {
      this.isPrev = false;
      this.isNext = true;
    }
    if (this.dynamicTableComponent.currentIndex > 0) {
      this.isPrev = true;
      this.isNext = true;
    }
  }

  prevDataContent() {
    this.dynamicTableComponent.moveToPreviousRow();
    this.viewLogRecord = cloneDeep(this.dynamicTableComponent.selectedRow);
    this.enableDisableDefaultButtons();
    this.checkException();
    this.cdr.detectChanges();
  }

  nextDataContent() {
    this.dynamicTableComponent.moveToNextRow();
    this.viewLogRecord = cloneDeep(this.dynamicTableComponent.selectedRow);
    this.enableDisableDefaultButtons();
    this.checkException();
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.subscriptions?.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

  public activeIdChangedHandler(id) {
    resetTabSelectedClass();
    this.activeId = id;
  }

  public convertDate(val: string) {
    return changeDateFormat(val);
  }

  private loadEventLogs(): void {
    this.subscriptions.push(this.clientLogModel.eventLogs$.subscribe((eventLogs: EventLogMessage[]) => {
      this.updateEventLogs(eventLogs);
    }));
  }

  private checkException() {
    this.isExceptionDisable = false;
    if (this.viewLogRecord.thrown) {
      this.isExceptionDisable = true;
      this.headerTabs = [
        {tabName: 'Messages', activeId: 1},
        {tabName: 'Exception', activeId: 2, disabled: false, options: {color: 'red'}}
      ];
    }
  }
}
