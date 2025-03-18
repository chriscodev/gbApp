// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.

import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {
  ActionMessage,
  ButtonType,
  ButtonTypes,
  ImageType,
  MultipleTableColumns
} from '../../../../../core/models/ui/dynamicTable';
import {ModalDynamicTbTranslateComponent} from '../../modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {cloneDeep} from 'lodash';
import {ClientScheduleProvidersModel} from '../../../../../core/models/ClientScheduleProvidersModel';
import {ScheduleSummary} from '../../../../../core/models/dtv/schedule/ScheduleProvider';
import {DefaultSchedule, Service, ServiceScheduleLink} from '../../../../../core/models/dtv/network/logical/Service';
import {v4 as uuidv4} from 'uuid';
import {isDefined} from '../../../../../core/models/dtv/utils/Utils';
import {ModalViewScheduleComponent} from '../../modal-view-schedule/modal-view-schedule.component';
import {Schedule} from '../../../../../core/models/dtv/schedule/Schedule';
import {ScheduleProviderService} from '../../../../../core/services/schedule-provider.service';
import {StompVariables} from '../../../../../core/subscriptions/stompSubscriptions';
import {SockStompService, StompEventListener} from '../../../../../core/services/sock-stomp.service';
import {BootstrapFunction} from '../../../../../core/interfaces/interfaces';

declare var $: BootstrapFunction;

@Component({
  selector: 'app-modal-networks-schedule',
  templateUrl: './modal-networks-schedule.component.html',
  styleUrls: ['./modal-networks-schedule.component.scss']
})
export class ModalNetworksScheduleComponent implements OnInit, OnChanges, StompEventListener {
  @ViewChild(ModalDynamicTbTranslateComponent) scheduleDynamicTable: ModalDynamicTbTranslateComponent;
  @ViewChild(ModalViewScheduleComponent) viewSchedulerComponent: ModalViewScheduleComponent;
  @Input() service: Service;
  @Input() schedule: ServiceScheduleLink;
  @Output() scheduleChanged: EventEmitter<ServiceScheduleLink> = new EventEmitter();
  public readonly modalViewSched = '#modalViewSched';
  public scheduleList: ScheduleSummary[] = [];
  public tableHeaders: MultipleTableColumns[] = [
    {header: 'Schedule Name', key: 'scheduleName', visible: true},
    {header: 'Provider', key: 'scheduleProviderName', visible: true},
  ];
  public buttonList: ButtonTypes[] = [
    {name: ButtonType.ADD, imgSrc: ImageType.add, disable: true, alwaysEnabled: true},
    {name: ButtonType.VIEW, imgSrc: ImageType.view, disable: true},
  ];
  public selectedSchedule: Schedule;
  public openModalViewSchedule = false;
  private localSchedule: ServiceScheduleLink = new DefaultSchedule(0, 0, 0);

  constructor(
    private stompService: SockStompService,
    private scheduleProviderModel: ClientScheduleProvidersModel,
    private scheduleProviderService: ScheduleProviderService
  ) {
    this.stompService.addListener(this);
  }

  public ngOnInit(): void {
    this.loadServerSchedule();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (isDefined(changes.schedule)) {
      this.localSchedule = cloneDeep(changes.schedule.currentValue);
    }
  }

  public onButtonClicked(event: { message: string; }) {
    switch (event.message) {
      case ActionMessage.ADD:
        this.onAddRow();
        break;
      case ActionMessage.VIEW:
        this.onViewRow();
        break;
      default:
        break;
    }
  }

  public notifyStompEvent(topic: string) {
    if (topic === StompVariables.stompChannels.notifyScheduleProviderStatusUpdate) {
      this.loadServerSchedule();
    }
  }

  public closeModal() {
    $('#modalSchedSources').modal('hide');
  }

  private onAddRow() {
    const tempSchedule = this.scheduleDynamicTable.tableData.filter(
      (x: any) => x.id?.toString() === this.scheduleDynamicTable.selectedRowIds[0])[0];
    this.localSchedule.clientId = uuidv4();
    this.localSchedule.scheduleId = tempSchedule.scheduleId;
    this.localSchedule.serviceId = this.service.id;
    this.scheduleChanged.emit(this.localSchedule);
    this.closeModal();
  }

  private onViewRow() {
    this.openModalViewSchedule = true;
    this.viewList(this.scheduleDynamicTable.selectedRow);
  }

  private viewList(scheduleSummary: ScheduleSummary) {
    this.updateCurrentSchedule(scheduleSummary.scheduleId);
  }

  private updateCurrentSchedule(providerId: number): void {
    this.scheduleProviderService.getScheduleById(providerId).subscribe(
      (schedule) => {
        this.selectedSchedule = schedule;
      });
  }

  private loadServerSchedule() {
    this.scheduleProviderModel.refresh();
    this.localSchedule = cloneDeep(this.schedule);
    this.scheduleProviderModel.schedProviderSummary$.subscribe((scheduleProvidersSummary: ScheduleSummary[]) => {
      if (scheduleProvidersSummary !== undefined) {
        const serverSchedule: ScheduleSummary[] = scheduleProvidersSummary;
        serverSchedule?.forEach((item: any) => {
          item.id = item.scheduleId;
        });
        this.scheduleList = cloneDeep(serverSchedule);
      }
    });
  }
}
