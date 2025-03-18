// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {isIPAddressValid, validateIP} from 'src/app/shared/helpers';
import {numberOnly} from 'src/app/shared/helpers/appWideFunctions';
import {
  ATSC3ESGSettings,
  DefaultATSC3ESGSettings
} from '../../../../../../../../core/models/dtv/network/physical/stream/ip/service-group/ServiceGroup';
import {cloneDeep} from 'lodash';
import {isDefined} from '../../../../../../../../core/models/dtv/utils/Utils';
import {inRangeCheck} from '../../../../../../../helpers/mathHelprrs';

declare var $;

@Component({
  selector: 'app-modal-transport-edit-esg-settings',
  templateUrl: './modal-transport-edit-esg-settings.component.html',
  styleUrls: ['./modal-transport-edit-esg-settings.component.scss']
})
export class ModalTransportEditEsgSettingsComponent implements OnChanges {
  @Input() esgSettings: ATSC3ESGSettings;
  @Output() esgSettingsChanged: EventEmitter<ATSC3ESGSettings> = new EventEmitter();
  public localESGSettings: ATSC3ESGSettings = new DefaultATSC3ESGSettings();
  public readonly numberOnly = numberOnly;
  public readonly validateIP = validateIP;
  public dstAddressIconText: string;
  public dstPortIconText: string;
  public bitrateIconText: string;
  public hoursAheadIconText: string;
  public hoursBehindIconText: string;
  public updateEnabled: boolean;
  private dstAddressValid: boolean;
  private dstPortValid: boolean;
  private bitrateValid: boolean;
  private hoursAheadValid: boolean;
  private hoursBehindValid: boolean;

  constructor() {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (isDefined(changes.esgSettings?.currentValue)) {
      this.localESGSettings = cloneDeep(changes.esgSettings.currentValue);
      this.inputESG();
    }
  }

  public inputESG(): void {
    this.updateDstAddressValid();
    this.updateDstPortValid();
    this.updateBitrateValid();
    this.updateHoursAheadValid();
    this.updateHoursBehindValid();
    this.updateOkEnabled();
  }

  public closeModal(): void {
    $('#modalEditESGSettings').modal('hide');
  }

  public updateESGSettings(): void {
    this.closeModal();
    this.esgSettingsChanged.emit(this.localESGSettings);
  }

  private updateDstAddressValid(): void {
    this.dstAddressValid = !this.localESGSettings.enabled || isIPAddressValid(this.localESGSettings.dstAddress);
    this.dstAddressIconText = this.dstAddressValid ? 'text-success' : 'text-danger';
  }

  private updateDstPortValid(): void {
    this.dstPortValid = !this.localESGSettings.enabled || inRangeCheck(this.localESGSettings.dstPort, 1025, 65535);
    this.dstPortIconText = this.dstPortValid ? 'text-success' : 'text-danger';
  }

  private updateBitrateValid(): void {
    this.bitrateValid = !this.localESGSettings.enabled || inRangeCheck(this.localESGSettings.bitrate, 1,
      2147483647);
    this.bitrateIconText = this.bitrateValid ? 'text-success' : 'text-danger';
  }

  private updateHoursAheadValid(): void {
    this.hoursAheadValid = !this.localESGSettings.enabled || inRangeCheck(this.localESGSettings.hoursAhead, 1,
      1536);
    this.hoursAheadIconText = this.hoursAheadValid ? 'text-success' : 'text-danger';
  }

  private updateHoursBehindValid(): void {
    this.hoursBehindValid = !this.localESGSettings.enabled || inRangeCheck(this.localESGSettings.hoursBehind, 0,
      1536);
    this.hoursBehindIconText = this.hoursBehindValid ? 'text-success' : 'text-danger';
  }

  private updateOkEnabled(): void {
    this.updateEnabled = this.dstAddressValid && this.dstPortValid && this.bitrateValid && this.hoursAheadValid && this.hoursBehindValid;
  }
}
