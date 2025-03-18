// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.
import {ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {ModalViewSchedulesListComponent} from '../modal-sp-view-schedules-list/modal-view-schedules-list.component';
import {
  ElementStatusUpdate,
  SockStompService,
  StompEventListener
} from '../../../../../core/services/sock-stomp.service';
import {StompVariables} from '../../../../../core/subscriptions/stompSubscriptions';
import {
  AbstractScheduleProvider,
  DefaultScheduleView,
  ScheduleProviderStatus,
  ScheduleSummary,
  ScheduleTitle,
  ScheduleView
} from '../../../../../core/models/dtv/schedule/ScheduleProvider';
import {ClientScheduleProvidersModel} from '../../../../../core/models/ClientScheduleProvidersModel';
import {ScheduleProviderService} from '../../../../../core/services/schedule-provider.service';
import {BootstrapFunction} from '../../../../../core/interfaces/interfaces';
import {
  getProcessDisplayName,
  ProcessableElementState
} from '../../../../../core/models/dtv/common/ProcessableElementState';
import {isDefined} from '../../../../../core/models/dtv/utils/Utils';

declare var $: BootstrapFunction;

@Component({
  selector: 'app-modal-sp-status',
  templateUrl: './modal-sp-status.component.html',
  styleUrls: ['./modal-sp-status.component.scss'],
})
export class ModalSpStatusComponent implements OnInit, OnChanges, OnDestroy, StompEventListener {
  @Input() scheduleProvider: AbstractScheduleProvider;
  @ViewChild(ModalViewSchedulesListComponent, {static: false}) viewScheduleComponent: ModalViewSchedulesListComponent;
  public scheduleView: ScheduleView = new DefaultScheduleView();
  public scheduleProviderStatus: ScheduleProviderStatus;
  public viewSchedulesEnabled = true;
  public scheduleProviderState = '';
  private scheduleSummary: ScheduleSummary[];
  private subscriptions: Subscription[] = [];

  constructor(private stompService: SockStompService, private scheduleProviderService: ScheduleProviderService,
              private cdr: ChangeDetectorRef, private scheduleProviderModel: ClientScheduleProvidersModel
  ) {
    this.stompService.addListener(this);
    this.disableViewSchedule();
  }

  public ngOnInit(): void {
  }

  public ngOnChanges(): void {
    this.loadProviderStatus();
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.stompService.removeListener(this);
  }

  public notifyStompEvent(topic: string, messageJson: string) {
    console.log('ModalSpStatusComponent notifyStompEvent ', topic);
    if (topic === StompVariables.stompChannels.notifyScheduleProviderStatusUpdate) {
      const elementStatusUpdate: ElementStatusUpdate = JSON.parse(messageJson);
      if (elementStatusUpdate.id === this.scheduleProvider.id) {
        this.loadProviderStatus();
      }
    }
  }

  public openViewScheduleModal() {
    this.viewScheduleComponent.openModal();
  }

  public renderProcessValue(processValue: ProcessableElementState){
    let processState: string;
    processState = getProcessDisplayName(processValue);
    if (isDefined(processState)){
      return processState;
    }
    return processValue;
  }

  private loadProviderStatus(): void {
    this.viewSchedulesEnabled = false;
    this.subscriptions.push(
      this.scheduleProviderModel.getScheduleProvidersStatus(this.scheduleProvider?.id).subscribe(
        (scheduleProviderStatus) => {
          this.scheduleProviderStatus = scheduleProviderStatus;
          if (this.scheduleProviderStatus.scheduleProviderState.toString() === 'Complete' || ProcessableElementState.UPDATE_COMPLETE) {
            this.enableViewSchedule();
          } else {
            this.disableViewSchedule();
          }
          this.updateProviderScheduleView(this.scheduleProviderStatus);
        }));
  }

  private enableViewSchedule() {
    $('#viewScheduleList').removeAttr('disabled');
  }

  private disableViewSchedule() {
    $('#viewScheduleList').prop('disabled', true);
  }

  // TODO rewrite to Model class after release
  private updateProviderScheduleView(scheduleProviderStatus: ScheduleProviderStatus): void {
    this.scheduleProviderService.getScheduleProviderSummary(this.scheduleProvider.id).subscribe(
      (scheduleSummary) => {
        const scheduleTitles: ScheduleTitle[] = [];
        scheduleSummary.forEach(scheduleSummary => scheduleTitles.push(
          new ScheduleTitle(scheduleSummary.scheduleId, scheduleSummary.scheduleName)));
        this.scheduleView = new ScheduleView(this.scheduleProvider.name,
          this.scheduleProvider.scheduleProviderType, scheduleProviderStatus.scheduleProviderState,
          scheduleProviderStatus.lastUpdateTime, scheduleProviderStatus.lastCompletion,
          scheduleProviderStatus.lastUpdateMessage, scheduleTitles);
        // this.viewSchedulesEnabled = scheduleTitles.length > 0;
      });
    this.cdr.detectChanges();
  }
}
