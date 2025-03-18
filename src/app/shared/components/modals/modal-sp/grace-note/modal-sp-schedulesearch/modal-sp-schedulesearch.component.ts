/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */
import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {ButtonTypes, MultipleTableColumns} from 'src/app/core/models/ui/dynamicTable';
import {Subscription} from 'rxjs';
import {
  ModalDynamicTbTranslateComponent
} from '../../../modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {
  getOnConnectSearchRequest,
  OnConnectScheduleProvider,
  OnConnectSearchRequest
} from '../../../../../../core/models/dtv/schedule/ScheduleProvider';
import {BootstrapFunction} from '../../../../../../core/interfaces/interfaces';
import {Schedule} from '../../../../../../core/models/dtv/schedule/Schedule';
import {ScheduleProviderService} from '../../../../../../core/services/schedule-provider.service';

declare var $: BootstrapFunction;

@Component({
  selector: 'app-modal-sp-schedulesearch',
  templateUrl: './modal-sp-schedulesearch.component.html',
  styleUrls: ['./modal-sp-schedulesearch.component.scss'],
})
export class ModalSpSchedulesearchComponent implements OnInit, OnDestroy {
  @Input() scheduleProvider: OnConnectScheduleProvider;
  @Output() scheduleSearchClosed: EventEmitter<Schedule[]> = new EventEmitter<Schedule[]>();
  @ViewChild(ModalDynamicTbTranslateComponent) scheduledSearchComponent: ModalDynamicTbTranslateComponent;
  public readonly modalName = '#schedulesSearchModal';
  public readonly objectTableType = 'Schedule';
  public queryString: string;
  public queryStringIconText: string;
  public okEnabled: boolean;
  public addSchedulesEnabled = false;
  public schedules: Schedule[] = [];
  public currentSchedule: Schedule;
  public buttonList: ButtonTypes[] = [];
  public tableHeaders: MultipleTableColumns[] = [
    {header: 'Station ID', key: 'listingsId', visible: true},
    {header: 'Name', key: 'name', visible: true},
  ];
  public showQueryResults = false;
  private queryStringValid: boolean;
  private subscriptions: Subscription[] = [];

  constructor(private scheduleProviderService: ScheduleProviderService) {
  }

  public ngOnInit(): void {
  }

  public ngOnDestroy(): void {
    this.subscriptions?.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public inputSettings(): void {
    this.updateSettingsValid();
  }

  public doQuery() {
    this.queryForSchedules();
  }

  public clickClose() {
    this.scheduleSearchClosed.emit(this.schedules);
    $('#onConnectSearchModal').modal('hide');
  }

  public addSelected() {
    const selectedSchedules: Schedule[] = this.scheduledSearchComponent?.selectedRows;
    this.scheduleSearchClosed.emit(selectedSchedules);
    $('#onConnectSearchModal').modal('hide');
  }


  private queryForSchedules(): void {
    const searchRequest: OnConnectSearchRequest = getOnConnectSearchRequest(this.scheduleProvider, this.queryString);
    this.addSchedulesEnabled = false;
    this.showQueryResults = false;
    this.schedules = [];
    console.log('queryForSchedules searchRequest: ', searchRequest);
    this.subscriptions.push(this.scheduleProviderService.onConnectSearch(searchRequest).subscribe(
      (searchResponse) => {
        console.log('queryForSchedules searchResponse: ', searchResponse);
        if (searchResponse.successful) {
          this.schedules = searchResponse.schedules;
          this.schedules = this.schedules.map((item, index) => {
            return {...item, id: index + 1};
          });
          this.addSchedulesEnabled = this.schedules?.length > 0;
          this.showQueryResults = true;
        }
      }));
  }

  private updateSettingsValid(): void {
    this.updateQueryStringValid();
    this.updateOkEnabled();
  }

  private updateQueryStringValid() {
    this.queryStringValid = this.queryString?.length > 0;
    this.queryStringIconText = this.queryStringValid ? 'text-success' : 'text-danger';
  }

  private updateOkEnabled(): void {
    this.okEnabled = this.queryStringValid;
  }
}
