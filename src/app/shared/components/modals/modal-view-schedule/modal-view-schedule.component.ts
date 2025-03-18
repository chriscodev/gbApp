// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.

import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {ButtonTypes, MultipleTableColumns} from 'src/app/core/models/ui/dynamicTable';
import {DataService} from 'src/app/core/services/data.service';
import {BootstrapFunction} from '../../../../core/interfaces/interfaces';
import {DefaultDTVEvent, DefaultSchedule, DTVEvent, Schedule} from '../../../../core/models/dtv/schedule/Schedule';
import {isDefined} from '../../../../core/models/dtv/utils/Utils';

declare var $: BootstrapFunction;

@Component({
  selector: 'app-modal-view-schedule',
  templateUrl: './modal-view-schedule.component.html',
  styleUrls: ['./modal-view-schedule.component.scss']
})

export class ModalViewScheduleComponent implements OnInit, OnChanges {
  @Input() schedule: Schedule;
  // TODO remove legacy Inputs and Outputs
  @Input() modalViewData: {} = [];
  @Output() schedViewSchedChanged: EventEmitter<any> = new EventEmitter();
  public currentSchedule: Schedule = new DefaultSchedule();
  public dtvEvents: DTVEvent[] = [];
  public selectedDTVEvent: DTVEvent = new DefaultDTVEvent();
  public modalTitle: string;
  public buttonList: ButtonTypes[] = [];
  public tableHeadersVS: MultipleTableColumns[] = [
    {header: 'Start Time', key: 'startTime', visible: true, showDate: true},
    {header: 'End Time', key: 'endTime', visible: true, showDate: true},
    {header: 'Title', key: 'title', visible: true}
  ];
  public tableHeadersATSC = [
    {header: 'Type', key: 'ratingType', visible: true},
    {header: 'Description', key: 'description', visible: true}
  ];
  public tableHeadersDVB = [
    {header: 'Country', key: 'country', visible: true},
    {header: 'Age', key: 'age', visible: true}
  ];
  public tableHeadersCaptions = [
    {header: 'Language', key: 'language', visible: true},
    {header: 'Digital', key: 'digital', visible: true},
    {header: 'Easy Reader', key: 'easyNumber', visible: true},
    {header: 'Wide', key: 'wide', visible: true},
    {header: 'Service Number', key: 'serviceNumber', visible: true},
  ];
  public tableHeadersAudio = [
    {header: 'Language', key: 'languageText', visible: true},
    {header: 'Type', key: 'type', visible: true},
    {header: 'ID', key: 'audioId', visible: true}
  ];

  public headerTabs = [
    {tabName: 'ATSC Ratings', activeId: 1},
    {tabName: 'DVB Ratings', activeId: 2},
    {tabName: 'Captions', activeId: 3},
    {tabName: 'Audio', activeId: 4}
  ];
  public activeId = 1;

  constructor(private ds: DataService) {
  }

  public ngOnInit(): void {
    // For legacy support of modalViewData (deprecated)
    if (isDefined(this.modalViewData) && !isDefined(this.schedule)) {
      console.log();
      this.schedule = this.modalViewData as Schedule;
    }
    if (isDefined(this.schedule)) {
      this.currentSchedule = this.schedule;
      this.dtvEvents = this.currentSchedule.dtvEvents;
      this.updateModalTitle();
    }
  }

  public ngOnChanges(changes: SimpleChanges) {
    console.log('ModalViewScheduleComponent ngOnChanges changes: ', changes);
    if (isDefined(changes.schedule?.currentValue)) {
      this.currentSchedule = changes.schedule.currentValue;
      this.dtvEvents = this.currentSchedule.dtvEvents;
      this.updateModalTitle();
      console.log('ModalViewScheduleComponent ngOnChanges this.dtvEvents: ', this.dtvEvents);
    }
    if (isDefined(changes.modalViewData?.currentValue)) {
      this.currentSchedule = changes.modalViewData.currentValue;
      this.dtvEvents = this.currentSchedule.dtvEvents;
      this.updateModalTitle();
      console.log('ModalViewScheduleComponent ngOnChanges this.dtvEvents: ', this.dtvEvents);
    }
  }

  public rowClicked(dtvEvent: DTVEvent) {
    if (isDefined(dtvEvent)) {
      this.selectedDTVEvent = dtvEvent;
    }
  }

  public closeModal() {
    $('#modalViewSched').modal('hide');
  }

  public activeIdChangedHandler(id: number) {
    this.activeId = id;
  }

  private updateModalTitle(): void {
    const viewName = this.currentSchedule.name;
    const viewListingID = this.currentSchedule.listingsId;
    this.modalTitle = 'View Schedule - ' + viewName + ' - Station ID - ' + viewListingID;
  }


}
