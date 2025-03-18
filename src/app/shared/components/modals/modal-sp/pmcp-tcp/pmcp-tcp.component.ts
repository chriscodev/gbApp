// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {
  AbstractFetchableScheduleProvider,
  PMCPTCPScheduleProvider,
  RemoteFileResource
} from '../../../../../core/models/dtv/schedule/ScheduleProvider';
import {AnyNICDescriptor, NICDescriptor} from '../../../../../core/models/server/NetworkSetting';
import {ClientNetworkSettingsModel} from '../../../../../core/models/ClientNetworkSettingsModel';
import {numberOnly} from 'src/app/shared/helpers/appWideFunctions';
import {isDefined} from '../../../../../core/models/dtv/utils/Utils';
import {inRangeCheck} from '../../../../helpers/mathHelprrs';
import {BootstrapFunction} from '../../../../../core/interfaces/interfaces';

declare var $: BootstrapFunction;

@Component({
  selector: 'app-pmcp-tcp',
  templateUrl: './pmcp-tcp.component.html',
  styleUrl: './pmcp-tcp.component.scss'
})
export class PmcpTcpComponent implements OnInit, OnChanges {
  @Input() scheduleProvider: AbstractFetchableScheduleProvider;
  @Output() okEnabledChanged: EventEmitter<boolean> = new EventEmitter();
  public readonly numberOnly = numberOnly;
  public localScheduleProvider: PMCPTCPScheduleProvider;
  public nics: NICDescriptor[] = [];
  public portIconText: string;
  public daysAheadIconText: string;
  public showTestConnection = false;
  public showSelectTransformer = false;
  public okEnabled = false;
  private portValid: boolean;
  private daysAheadValid: boolean;
  private downloadSettingsOkEnabled = true;

  constructor(private cdr: ChangeDetectorRef, private clientNetworkSettingsModel: ClientNetworkSettingsModel) {
    this.nics = this.clientNetworkSettingsModel.getNetworkList();
    this.nics.unshift(new AnyNICDescriptor());
    console.log('PmcpTcpComponent constructor this.nics: ', this.nics);
  }

  public ngOnInit(): void {
    console.log('PmcpTcpComponent constructor this.scheduleProvider: ', this.scheduleProvider);
    if (isDefined(this.scheduleProvider)) {
      this.localScheduleProvider = this.scheduleProvider as PMCPTCPScheduleProvider;
      this.validateScheduleProvider();
    }
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (isDefined(changes.scheduleProvider)) {
      this.localScheduleProvider = changes.scheduleProvider.currentValue;
      this.validateScheduleProvider();
      this.cdr.detectChanges();
    }
  }

  public inputSettings(): void {
    this.updateSettingsValid();
  }

  public doChooseTransformer() {
    this.showSelectTransformer = true;
  }

  public xlstSelectedHandler(remoteFileResource: RemoteFileResource): void {
    this.xlstClosedHandler();
    this.localScheduleProvider.transformer = remoteFileResource.name;
    console.log('selectTransformatterHandler this.localScheduleProvider: ',
      JSON.stringify(this.localScheduleProvider));
  }

  public xlstClosedHandler() {
    this.showSelectTransformer = false;
    $('#selectXSLTModal').modal('hide');
  }

  public chooseToEmptyTransformer() {
    this.localScheduleProvider.transformer = undefined;
  }

  public doTestConnection(): void {
    this.showTestConnection = true;
  }

  public testConnectionClosedHandler($event) {
    this.showTestConnection = false;
    $('#testConnectionModal').modal('hide');
  }

  private validateScheduleProvider(): void {
    this.updateSettingsValid();
  }

  private updateSettingsValid(): void {
    this.updatePortValid();
    this.updateDaysAheadValid();
    this.updateOkEnabled();
  }

  private updatePortValid() {
    this.portValid = inRangeCheck(this.localScheduleProvider.port, 1, 65535);
    this.portIconText = this.portValid ? 'text-success' : 'text-danger';
  }

  private updateDaysAheadValid() {
    this.daysAheadValid = inRangeCheck(this.localScheduleProvider.daysAheadToProcess, 1, 999);
    this.daysAheadIconText = this.daysAheadValid ? 'text-success' : 'text-danger';
  }

  private updateOkEnabled(): void {
    this.okEnabled = this.portValid && this.daysAheadValid && this.downloadSettingsOkEnabled;
    this.okEnabledChanged.emit(this.okEnabled);
  }
}
