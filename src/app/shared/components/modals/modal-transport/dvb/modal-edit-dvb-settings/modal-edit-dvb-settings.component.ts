// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChange} from '@angular/core';
import {Subscription} from 'rxjs';
import {numberOnly} from 'src/app/shared/helpers/appWideFunctions';

@Component({
  selector: 'app-modal-edit-dvb-settings',
  templateUrl: './modal-edit-dvb-settings.component.html',
  styleUrls: ['./modal-edit-dvb-settings.component.scss']
})
export class ModalEditDvbSettingsComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  @Output() psipTransChanged: EventEmitter<any> = new EventEmitter();
  @Input() modalTransportProgramObj: any = [];

  modalTitle: string;

  dvbTableSettingsObj: any = {};

  //ICONS
  iconTextpfInterval: string = '';
  iconTexteitpresentFollowingOtherInterval: string = '';
  iconTexteitschedulesactual: string = '';
  iconTexteitschedulePrimaryActualInterval: string = '';
  iconTexteitscheduleSecondaryActualInterval: string = '';
  iconTextnitactualInterval: string = '';
  iconTextnitotherInterval: string = '';
  iconTexttdtinterval: string = '';

  iconTextsdtactualInterval: string = '';
  iconTextsdtotherInterval: string = '';
  iconTexteitschedulesothers: string = '';
  iconTexteitschedulePrimaryOtherInterval: string = '';
  iconTexteitscheduleSecondaryOtherInterval: string = '';
  iconTexttotinterval: string = '';


  pf: boolean = false;
  eitpresentFollowingOtherInterval: boolean = false;
  eitschedulesactual: boolean = false;
  eitschedulePrimaryActualInterval: boolean = false;
  eitscheduleSecondaryActualInterval: boolean = false;
  nitactualInterval: boolean = false;
  nitotherInterval: boolean = false;
  tdtinterval: boolean = false;

  sdtactualInterval: boolean = false;
  sdtotherInterval: boolean = false;
  eitschedulesothers: boolean = false;
  eitschedulePrimaryOtherInterval: boolean = false;
  eitscheduleSecondaryOtherInterval: boolean = false;
  totinterval: boolean = false;

  // CHECK TOGGLERS
  checkEITOthers: boolean = false;
  checkEITScheduleActual: boolean = false;
  checkNITOthers: boolean = false;
  checkSDTOthers: boolean = false;
  checkEITScheduleOthers: boolean = false;
  checkEnableBAT: boolean = false;

  disableUpdate: boolean;

  dataEmit: any = {};
  typeAction: string;

  constructor() {
    this.modalTitle = 'Edit DVB Table Settings';
  }

  ngOnInit(): void {

    console.log('ngOnInit');
    this.initialDVBData();
    this.inputDVB();
  }

  dataAssignPDVB() {

  }

  clickDefaultDVB() {
    this.dvbTableSettingsObj = {
      eitpresentFollowingInterval: 2000,
      eitpresentFollowingOtherEnabled: false,
      eitpresentFollowingOtherInterval: 10000,

      eitscheduleActualEnabled: false,
      eitschedulesactual: 7,
      eitschedulePrimaryActualInterval: 60000,
      eitscheduleSecondaryActualInterval: 300000,
      nitactualInterval: 10000,

      nitotherEnabled: false,
      nitotherInterval: 10000,
      tdtinterval: 30000,

      sdtactualInterval: 2000,

      sdtotherEnabled: false,
      sdtotherInterval: 10000,

      eitscheduleOtherEnabled: false,
      eitschedulesothers: 3,
      eitschedulePrimaryOtherInterval: 60000,
      eitscheduleSecondaryOtherInterval: 300000,

      batenabled: false,
      totinterval: 30000
    };
  }

  initialDVBData() {
    this.disableUpdate = false;
    this.clickDefaultDVB();

    this.iconTextpfInterval = 'text-success';
    this.iconTexteitpresentFollowingOtherInterval = '';
    this.iconTexteitschedulesactual = '';
    this.iconTexteitschedulePrimaryActualInterval = '';
    this.iconTexteitscheduleSecondaryActualInterval = '';
    this.iconTextnitactualInterval = 'text-success';
    this.iconTextnitotherInterval = '';
    this.iconTexttdtinterval = 'text-success';

    this.iconTextsdtactualInterval = 'text-success';
    this.iconTextsdtotherInterval = '';
    this.iconTexteitschedulesothers = '';
    this.iconTexteitschedulePrimaryOtherInterval = '';
    this.iconTexteitscheduleSecondaryOtherInterval = '';
    this.iconTexttotinterval = 'text-success';
  }

  initIcons() {
    this.pfIcon();
    this.eitpresentFollowingOtherIntervalIcon();
    this.eitschedulesactualIcon();
    this.eitschedulePrimaryActualIntervalIcon();
    this.eitscheduleSecondaryActualIntervalIcon();
    this.nitactualIntervalIcon();
    this.nitotherIntervalIcon();
    this.tdtintervalIcon();

    // RIGHT

    this.sdtactualIntervalIcon();
    this.sdtotherIntervalIcon();
    this.eitschedulesothersIcon();
    this.eitschedulePrimaryOtherIntervalIcon();
    this.eitscheduleSecondaryOtherIntervalIcon();
    this.totintervalIcon();
  }

  //ICONS
  pfIcon() {
    this.iconTextpfInterval = this.pf === true ? 'text-success' : 'text-danger';
    this.iconTextpfInterval = this.dvbTableSettingsObj.eitpresentFollowingInterval == null ? '' : this.iconTextpfInterval;
  }

  eitpresentFollowingOtherIntervalIcon() {
    this.iconTexteitpresentFollowingOtherInterval = this.eitpresentFollowingOtherInterval === true ? 'text-success' : 'text-danger';
    this.iconTexteitpresentFollowingOtherInterval = this.dvbTableSettingsObj.eitpresentFollowingOtherInterval == null ? '' : this.iconTexteitpresentFollowingOtherInterval;
  }

  eitschedulesactualIcon() {
    this.iconTexteitschedulesactual = this.eitschedulesactual === true ? 'text-success' : 'text-danger';
    this.iconTexteitschedulesactual = this.dvbTableSettingsObj.eitschedulesactual == null ? '' : this.iconTexteitschedulesactual;
  }

  eitschedulePrimaryActualIntervalIcon() {
    this.iconTexteitschedulePrimaryActualInterval = this.eitschedulePrimaryActualInterval === true ? 'text-success' : 'text-danger';
    this.iconTexteitschedulePrimaryActualInterval = this.dvbTableSettingsObj.eitschedulePrimaryActualInterval == null ? '' : this.iconTexteitschedulePrimaryActualInterval;
  }

  eitscheduleSecondaryActualIntervalIcon() {
    this.iconTexteitscheduleSecondaryActualInterval = this.eitscheduleSecondaryActualInterval === true ? 'text-success' : 'text-danger';
    this.iconTexteitscheduleSecondaryActualInterval = this.dvbTableSettingsObj.eitscheduleSecondaryActualInterval == null ? '' : this.iconTexteitscheduleSecondaryActualInterval;
  }

  nitactualIntervalIcon() {
    this.iconTextnitactualInterval = this.nitactualInterval === true ? 'text-success' : 'text-danger';
    this.iconTextnitactualInterval = this.dvbTableSettingsObj.nitactualInterval == null ? '' : this.iconTextnitactualInterval;
  }

  nitotherIntervalIcon() {
    this.iconTextnitotherInterval = this.nitotherInterval === true ? 'text-success' : 'text-danger';
    this.iconTextnitotherInterval = this.dvbTableSettingsObj.nitotherInterval == null ? '' : this.iconTextnitotherInterval;
  }

  tdtintervalIcon() {
    this.iconTexttdtinterval = this.tdtinterval === true ? 'text-success' : 'text-danger';
    this.iconTexttdtinterval = this.dvbTableSettingsObj.tdtinterval == null ? '' : this.iconTexttdtinterval;
  }

  // RIGHT ICONS
  sdtactualIntervalIcon() {
    this.iconTextsdtactualInterval = this.sdtactualInterval === true ? 'text-success' : 'text-danger';
    this.iconTextsdtactualInterval = this.dvbTableSettingsObj.sdtactualInterval == null ? '' : this.iconTextsdtactualInterval;
  }

  sdtotherIntervalIcon() {
    this.iconTextsdtotherInterval = this.sdtotherInterval === true ? 'text-success' : 'text-danger';
    this.iconTextsdtotherInterval = this.dvbTableSettingsObj.sdtotherInterval == null ? '' : this.iconTextsdtotherInterval;
  }

  eitschedulesothersIcon() {
    this.iconTexteitschedulesothers = this.eitschedulesothers === true ? 'text-success' : 'text-danger';
    this.iconTexteitschedulesothers = this.dvbTableSettingsObj.eitschedulesothers == null ? '' : this.iconTexteitschedulesothers;
  }

  eitschedulePrimaryOtherIntervalIcon() {
    this.iconTexteitschedulePrimaryOtherInterval = this.eitschedulePrimaryOtherInterval === true ? 'text-success' : 'text-danger';
    this.iconTexteitschedulePrimaryOtherInterval = this.dvbTableSettingsObj.eitschedulePrimaryOtherInterval == null ? '' : this.iconTexteitschedulePrimaryOtherInterval;
  }

  eitscheduleSecondaryOtherIntervalIcon() {
    this.iconTexteitscheduleSecondaryOtherInterval = this.eitscheduleSecondaryOtherInterval === true ? 'text-success' : 'text-danger';
    this.iconTexteitscheduleSecondaryOtherInterval = this.dvbTableSettingsObj.eitscheduleSecondaryOtherInterval == null ? '' : this.iconTexteitscheduleSecondaryOtherInterval;
  }

  totintervalIcon() {
    this.iconTexttotinterval = this.totinterval === true ? 'text-success' : 'text-danger';
    this.iconTexttotinterval = this.dvbTableSettingsObj.totinterval == null ? '' : this.iconTexttotinterval;
  }

  // END OF ICONS

  // START INPUTS

  pfInterValInput() {
    let InputValue = true;
    let Range = false;
    let returnValue = false;

    if (this.dvbTableSettingsObj.eitpresentFollowingInterval === '' || this.dvbTableSettingsObj.eitpresentFollowingInterval === null) {
      InputValue = false;
    }
    if (this.dvbTableSettingsObj.eitpresentFollowingInterval >= 1 && this.dvbTableSettingsObj.eitpresentFollowingInterval <= 2000) {
      Range = true;
    }
    if (InputValue && Range) {
      returnValue = true;
    }

    return returnValue;
  }


  eitpresentFollowingOtherIntervalInput() {
    let InputValue = true;
    let Range = false;
    let returnValue = false;

    if (this.dvbTableSettingsObj.eitpresentFollowingOtherInterval === '' || this.dvbTableSettingsObj.eitpresentFollowingOtherInterval === null) {
      InputValue = false;
    }
    if (this.dvbTableSettingsObj.eitpresentFollowingOtherInterval >= 1 && this.dvbTableSettingsObj.eitpresentFollowingOtherInterval <= 10000) {
      Range = true;
    }
    if (InputValue && Range) {
      returnValue = true;
    }

    return returnValue;

  }

  eitschedulesactualInput() {
    let InputValue = true;
    let Range = false;
    let returnValue = false;

    if (this.dvbTableSettingsObj.eitschedulesactual === '' || this.dvbTableSettingsObj.eitschedulesactual === null) {
      InputValue = false;
    }
    if (this.dvbTableSettingsObj.eitschedulesactual >= 1 && this.dvbTableSettingsObj.eitschedulesactual <= 7) {
      Range = true;
    }
    if (InputValue && Range) {
      returnValue = true;
    }

    return returnValue;
  }

  eitschedulePrimaryActualIntervalInput() {
    let InputValue = true;
    let Range = false;
    let returnValue = false;

    if (this.dvbTableSettingsObj.eitschedulePrimaryActualInterval === '' || this.dvbTableSettingsObj.eitschedulePrimaryActualInterval === null) {
      InputValue = false;
    }
    if (this.dvbTableSettingsObj.eitschedulePrimaryActualInterval >= 1 && this.dvbTableSettingsObj.eitschedulePrimaryActualInterval <= 60000) {
      Range = true;
    }
    if (InputValue && Range) {
      returnValue = true;
    }

    return returnValue;
  }

  eitscheduleSecondaryActualIntervallInput() {
    let InputValue = true;
    let Range = false;
    let returnValue = false;

    if (this.dvbTableSettingsObj.eitscheduleSecondaryActualInterval === '' || this.dvbTableSettingsObj.eitscheduleSecondaryActualInterval === null) {
      InputValue = false;
    }
    if (this.dvbTableSettingsObj.eitscheduleSecondaryActualInterval >= 1 && this.dvbTableSettingsObj.eitscheduleSecondaryActualInterval <= 300000) {
      Range = true;
    }
    if (InputValue && Range) {
      returnValue = true;
    }

    return returnValue;
  }

  nitactualIntervallInput() {
    let InputValue = true;
    let Range = false;
    let returnValue = false;

    if (this.dvbTableSettingsObj.nitactualInterval === '' || this.dvbTableSettingsObj.nitactualInterval === null) {
      InputValue = false;
    }
    if (this.dvbTableSettingsObj.nitactualInterval >= 1 && this.dvbTableSettingsObj.nitactualInterval <= 10000) {
      Range = true;
    }
    if (InputValue && Range) {
      returnValue = true;
    }

    return returnValue;
  }

  nitotherIntervallInput() {
    let InputValue = true;
    let Range = false;
    let returnValue = false;

    if (this.dvbTableSettingsObj.nitotherInterval === '' || this.dvbTableSettingsObj.nitotherInterval === null) {
      InputValue = false;
    }
    if (this.dvbTableSettingsObj.nitotherInterval >= 1 && this.dvbTableSettingsObj.nitotherInterval <= 10000) {
      Range = true;
    }
    if (InputValue && Range) {
      returnValue = true;
    }

    return returnValue;
  }

  tdtintervallInput() {
    let InputValue = true;
    let Range = false;
    let returnValue = false;

    if (this.dvbTableSettingsObj.tdtinterval === '' || this.dvbTableSettingsObj.tdtinterval === null) {
      InputValue = false;
    }
    if (this.dvbTableSettingsObj.tdtinterval >= 1 && this.dvbTableSettingsObj.tdtinterval <= 30000) {
      Range = true;
    }
    if (InputValue && Range) {
      returnValue = true;
    }

    return returnValue;
  }

  // ===== right

  sdtactualIntervalInput() {
    let InputValue = true;
    let Range = false;
    let returnValue = false;

    if (this.dvbTableSettingsObj.sdtactualInterval === '' || this.dvbTableSettingsObj.sdtactualInterval === null) {
      InputValue = false;
    }
    if (this.dvbTableSettingsObj.sdtactualInterval >= 1 && this.dvbTableSettingsObj.sdtactualInterval <= 2000) {
      Range = true;
    }
    if (InputValue && Range) {
      returnValue = true;
    }

    return returnValue;
  }

  sdtotherIntervalInput() {
    let InputValue = true;
    let Range = false;
    let returnValue = false;

    if (this.dvbTableSettingsObj.sdtotherInterval === '' || this.dvbTableSettingsObj.sdtotherInterval === null) {
      InputValue = false;
    }
    if (this.dvbTableSettingsObj.sdtotherInterval >= 1 && this.dvbTableSettingsObj.sdtotherInterval <= 10000) {
      Range = true;
    }
    if (InputValue && Range) {
      returnValue = true;
    }

    return returnValue;
  }

  eitschedulesothersInput() {
    let InputValue = true;
    let Range = false;
    let returnValue = false;

    if (this.dvbTableSettingsObj.eitschedulesothers === '' || this.dvbTableSettingsObj.eitschedulesothers === null) {
      InputValue = false;
    }
    if (this.dvbTableSettingsObj.eitschedulesothers >= 1 && this.dvbTableSettingsObj.eitschedulesothers <= 3) {
      Range = true;
    }
    if (InputValue && Range) {
      returnValue = true;
    }

    return returnValue;
  }

  eitschedulePrimaryOtherIntervalInput() {
    let InputValue = true;
    let Range = false;
    let returnValue = false;

    if (this.dvbTableSettingsObj.eitschedulePrimaryOtherInterval === '' || this.dvbTableSettingsObj.eitschedulePrimaryOtherInterval === null) {
      InputValue = false;
    }
    if (this.dvbTableSettingsObj.eitschedulePrimaryOtherInterval >= 1 && this.dvbTableSettingsObj.eitschedulePrimaryOtherInterval <= 60000) {
      Range = true;
    }
    if (InputValue && Range) {
      returnValue = true;
    }

    return returnValue;
  }

  eitscheduleSecondaryOtherIntervalInput() {
    let InputValue = true;
    let Range = false;
    let returnValue = false;

    if (this.dvbTableSettingsObj.eitscheduleSecondaryOtherInterval === '' || this.dvbTableSettingsObj.eitscheduleSecondaryOtherInterval === null) {
      InputValue = false;
    }
    if (this.dvbTableSettingsObj.eitscheduleSecondaryOtherInterval >= 1 && this.dvbTableSettingsObj.eitscheduleSecondaryOtherInterval <= 300000) {
      Range = true;
    }
    if (InputValue && Range) {
      returnValue = true;
    }

    return returnValue;
  }

  totintervalInput() {
    let InputValue = true;
    let Range = false;
    let returnValue = false;

    if (this.dvbTableSettingsObj.totinterval === '' || this.dvbTableSettingsObj.totinterval === null) {
      InputValue = false;
    }
    if (this.dvbTableSettingsObj.totinterval >= 1 && this.dvbTableSettingsObj.totinterval <= 30000) {
      Range = true;
    }
    if (InputValue && Range) {
      returnValue = true;
    }

    return returnValue;
  }

  // END INPUTS

  inputDVB() {
    this.initInputs();

    this.disableUpdate = true;

    // TODO CHECK TOGLE LOGIC

    this.initIcons();
    this.checkButtonDisabled();
  }

  checkButtonDisabled() {
    this.disableUpdate = true;
    if (
      this.pf &&
      this.eitpresentFollowingOtherInterval &&
      this.eitschedulesactual &&
      this.eitschedulePrimaryActualInterval &&
      this.eitscheduleSecondaryActualInterval &&
      this.nitactualInterval &&
      this.nitotherInterval &&
      this.tdtinterval &&

      this.sdtactualInterval &&
      this.sdtotherInterval &&
      this.eitschedulePrimaryOtherInterval &&
      this.eitscheduleSecondaryOtherInterval &&
      this.totinterval
    ) {
      this.disableUpdate = false;
    }

    console.log('disableUpdate', this.disableUpdate);

  }


  validateInputFieldset(event, property) {
    const num = (event.target.value);
    if (property === 'eitpresentFollowingInterval') {
      if (num > 8191) {
        event.preventDefault();
        this.dvbTableSettingsObj[property] = parseInt(num.toString().substring(0, (num.length - 1)));
        if (property === 'eitpresentFollowingInterval') {

          this.pf = this.pfInterValInput();
          this.pfIcon();
          if (this.pf) {
            this.disableUpdate = false;
          }
        }
      }

    }

    if (property === 'eitpresentFollowingOtherInterval') {
      if (num > 8191) {
        event.preventDefault();
        this.dvbTableSettingsObj[property] = parseInt(num.toString().substring(0, (num.length - 1)));
        if (property === 'eitpresentFollowingOtherInterval') {

          this.eitpresentFollowingOtherInterval = this.eitpresentFollowingOtherIntervalInput();
          this.eitpresentFollowingOtherIntervalIcon();
          if (this.pf) {
            this.disableUpdate = false;
          }
        }
      }

    }


    this.checkButtonDisabled();
  }

  onInputNumber(event) {
    numberOnly(event);
  }

  // TOGGLE CHECKBOX


  toggleCheckEITOthers(e) {
    this.checkEITOthers = e.target.checked;
    console.log('this.checkEITOthers', this.checkEITOthers);
    // if( this.checkEITOthers)
    if (!this.checkEITOthers) {
      this.dvbTableSettingsObj.eitpresentFollowingOtherInterval = 10000;
    }
    this.inputDVB();
  }

  toggleCheckEITScheduleActuals(e) {
    this.checkEITScheduleActual = e.target.checked;
    if (!this.checkEITScheduleActual) {
      this.dvbTableSettingsObj.eitschedulesactual = 7;
      this.dvbTableSettingsObj.eitschedulePrimaryActualInterval = 60000;
      this.dvbTableSettingsObj.eitscheduleSecondaryActualInterval = 300000;
    }
    this.inputDVB();
  }

  toggleCheckNITOthers(e) {
    this.checkNITOthers = e.target.checked;
    if (!this.checkNITOthers) {
      this.dvbTableSettingsObj.nitotherInterval = 10000;
    }
    this.inputDVB();
  }

  toggleCheckSDTOtherss(e) {
    this.checkSDTOthers = e.target.checked;
    if (!this.checkSDTOthers) {
      this.dvbTableSettingsObj.sdtotherInterval = 10000;
    }
    this.inputDVB();
  }

  toggleCheckEITScheduleOther(e) {
    this.checkEITScheduleOthers = e.target.checked;
    if (!this.checkEITScheduleOthers) {
      this.dvbTableSettingsObj.eitschedulesothers = 3;
      this.dvbTableSettingsObj.eitschedulesothers = 60000;
      this.dvbTableSettingsObj.eitschedulesothers = 300000;
    }
    this.inputDVB();
  }

  toggleCheckEnableBAT(e) {
    this.checkEnableBAT = e.target.checked;

    this.inputDVB();
  }


  clickUpdateDVBTable() {
    // GlobalVariables.transportDataRow = this.dvbTableSettingsObj;
    //need to update Transport Partent psipTranshandler
    let dataEmit = {
      action: 'btnUpdateDVBTableSetting',
      dataRow: this.dvbTableSettingsObj
    };

    //TODO
    this.psipTransChanged.emit(dataEmit);
  }


  initInputs() {
    this.pf = this.pfInterValInput();
    this.eitpresentFollowingOtherInterval = this.eitpresentFollowingOtherIntervalInput();
    this.eitschedulesactual = this.eitschedulesactualInput();
    this.eitschedulePrimaryActualInterval = this.eitschedulePrimaryActualIntervalInput();
    this.eitscheduleSecondaryActualInterval = this.eitscheduleSecondaryActualIntervallInput();
    this.nitactualInterval = this.nitactualIntervallInput();
    this.nitotherInterval = this.nitotherIntervallInput();
    this.tdtinterval = this.tdtintervallInput();

    this.sdtactualInterval = this.sdtactualIntervalInput();
    this.sdtotherInterval = this.sdtotherIntervalInput();
    this.eitschedulesothers = this.eitschedulesothersInput();
    this.eitschedulePrimaryOtherInterval = this.eitschedulePrimaryOtherIntervalInput();
    this.eitscheduleSecondaryOtherInterval = this.eitscheduleSecondaryOtherIntervalInput();
    this.totinterval = this.totintervalInput();
  }

  closeModalTable() {
    let dataEmit = {
      action: 'closeTableSetting'
    };
    this.psipTransChanged.emit(dataEmit);
  }

  // Whenever the data in the parent changes, the child gets notified about this in the ngOnChanges method.
  // The child can act on it. This is the standard way of interacting with a child.
  ngOnChanges(changes: { [property: string]: SimpleChange }) {
    let modalTransportProgramObj: SimpleChange = changes['modalTransportProgramObj'];

    let currValue = modalTransportProgramObj['currentValue'];
    console.log('ngOnChanges', currValue);

    this.typeAction = 'add';
    if (currValue['action'] === 'openImportModalDVBSettings') {
      this.modalTitle = 'Default PSIP Table Settings';
    }

    // if (this.typeAction === 'edit' || this.typeAction === undefined) {
    //   let type = this.modalTransportProgramObj;
    //   let data = this.modalTransportProgramObj['dataRowDynamic'];
    //   if(this.modalTransportProgramObj['editPSIPTableSetting']){
    //     type = this.modalTransportProgramObj['dataRow'].action;
    //     if(type ==='add'){
    //       this.initialPSIPData();
    //     }
    //   }
    // }
    // on CSV IMPORT
    // if(currValue['action']==='openImportModalDVBSettings' || currValue['action']==='editDVBTablesetting' ){

    //   this.typeAction = 'add';
    //   if(currValue['action']==='openImportModalPSIPSettings'){
    //     this.modalTitle = 'Default PSIP Table Settings';
    //   }

    //   let dataPSIP = currValue['dataRowPSIP'];

    //   //trigger
    //   if(dataPSIP['sttInterval']!==undefined){
    //     this.typeAction = 'edit';
    //   }else{
    //     this.typeAction = 'add';
    //   }
    // }

  }

  /***
   * Destroy all subscriptions and initiated data
   */
  ngOnDestroy(): void {
    console.log('ngOnDestroy');
    this.subscriptions.forEach((sub) => sub.unsubscribe());

  }

}
