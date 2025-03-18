// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {numberOnly} from '../../../../../../helpers/appWideFunctions';
import * as _swal from 'sweetalert';
import {AbstractPSIPTransport} from '../../../../../../../core/models/dtv/network/physical/Transport';
import {inRangeCheck} from '../../../../../../helpers/mathHelprrs';
import {cloneDeep} from 'lodash';
import {SweetAlert} from 'sweetalert/typings/core';

const swal: SweetAlert = _swal as any;
declare var _: any;
declare var $;

@Component({
  selector: 'app-modal-edit-psi-settings',
  templateUrl: './modal-edit-psi-settings.component.html',
  styleUrls: ['./modal-edit-psi-settings.component.scss']
})
export class ModalEditPsiSettingsComponent implements OnInit {
  @Input() psipTransportStream: AbstractPSIPTransport;
  @Output() psiSettingsChanged: EventEmitter<AbstractPSIPTransport> = new EventEmitter();
  public readonly numberOnly = numberOnly;
  public localPsipTransportStream: AbstractPSIPTransport;
  public modalTitle = 'Edit PSI Settings';
  public patIconText: string;
  public pmtIconText: string;
  public catIconText: string;
  public updateEnabled: boolean;
  private patValid: boolean;
  private pmtValid: boolean;
  private catValid: boolean;

  constructor() {
  }

  public ngOnInit(): void {
    this.modalTitle = this.psipTransportStream.name ? this.modalTitle + ' - ' + this.psipTransportStream.name : this.modalTitle ;
    this.localPsipTransportStream = cloneDeep(this.psipTransportStream);
    this.inputPSI();
  }

  public inputPSI() {
    this.updatePATIntervalValid();
    this.updatePMTIntervalValid();
    this.updateCATIntervalValid();
    this.checkButtonDisabled();
  }

  public updatePSISettings() {
    this.closeModal();
    this.psiSettingsChanged.emit(this.localPsipTransportStream);
  }

  public closeModal() {
    $('#editPsiSettings').modal('hide');
  }

  public setDefaultSettings() {
    swal({
      title: 'Are you sure you want to reset PSI settings to system defaults?',
      buttons: ['No', 'Yes'],
      icon: 'warning',
    }).then((isConfirm) => {
      if (isConfirm) {
        this.initializeDefaults();
      }
    });
  }

  private updatePATIntervalValid(): void {
    this.patValid = inRangeCheck(this.localPsipTransportStream.patInterval, 1, 100);
    this.patIconText = this.patValid ? 'text-success' : 'text-danger';
  }

  private updatePMTIntervalValid(): void {
    this.pmtValid = inRangeCheck(this.localPsipTransportStream.pmtInterval, 1, 400);
    this.pmtIconText = this.pmtValid ? 'text-success' : 'text-danger';
  }

  private updateCATIntervalValid(): void {
    this.catValid = inRangeCheck(this.localPsipTransportStream.catInterval, 1, 1000);
    this.catIconText = this.catValid ? 'text-success' : 'text-danger';
  }

  private checkButtonDisabled() {
    this.updateEnabled = this.patValid && this.pmtValid && this.catValid;
  }

  private initializeDefaults() {
    this.localPsipTransportStream.patInterval = 100;
    this.localPsipTransportStream.pmtInterval = 400;
    this.localPsipTransportStream.catInterval = 1000;
    this.inputPSI();
  }
}
