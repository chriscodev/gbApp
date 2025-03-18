/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {ChangeDetectorRef, Component, Input, ViewChild} from '@angular/core';
import {ButtonTypes, MultipleTableColumns} from '../../../../../core/models/ui/dynamicTable';
import {ModalDynamicTbTranslateComponent} from '../../modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {ScheduleTitle} from '../../../../../core/models/dtv/schedule/ScheduleProvider';
import {BootstrapFunction} from '../../../../../core/interfaces/interfaces';
import {Schedule} from '../../../../../core/models/dtv/schedule/Schedule';
import {ScheduleProviderService} from '../../../../../core/services/schedule-provider.service';
import {isDefined} from '../../../../../core/models/dtv/utils/Utils';

declare var $: BootstrapFunction;

@Component({
  selector: 'app-modal-sp-view-schedules-list',
  templateUrl: './modal-view-schedules-list.component.html',
  styleUrl: './modal-view-schedules-list.component.scss'
})
export class ModalViewSchedulesListComponent {
  @Input() scheduleTitles: ScheduleTitle[];
  @ViewChild(ModalDynamicTbTranslateComponent) schedProViewSchedComponent: ModalDynamicTbTranslateComponent;
  public readonly modalName = '#modalViewSched';
  public readonly objectTableType = 'ScheduleTitle';
  public buttonList: ButtonTypes[] = [];
  public tableHeaders: MultipleTableColumns[] = [
    {header: 'Schedules', key: 'name', visible: true},
  ];
  public selectedSchedule: Schedule;

  constructor(private scheduleProviderService: ScheduleProviderService, private cdr: ChangeDetectorRef) {
  }

  public onViewSchedule() {
    console.log('ModalViewSchedulesListComponent onButtonClickedViewSched');
    if (isDefined(this.schedProViewSchedComponent.selectedRow)) {
      const selectedScheduleTitle: ScheduleTitle = this.schedProViewSchedComponent.selectedRow;
      this.scheduleProviderService.getScheduleById(selectedScheduleTitle.id).subscribe(
        (schedule) => {
          this.selectedSchedule = schedule;
          this.cdr.detectChanges();
          $('#modalViewSched').modal('show');
        });
    }
  }

  public closeModal() {
    $('#viewScheduleListModal').modal('hide');
  }

  public openModal() {
    $('#viewScheduleListModal').modal('show');
  }
}
