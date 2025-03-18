// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {v4 as uuidv4} from 'uuid';
import {BootstrapFunction} from '../../../../../core/interfaces/interfaces';
declare var $: BootstrapFunction;

@Component({
  selector: 'app-modal-transport-import-csv',
  templateUrl: './modal-transport-import-csv.component.html',
  styleUrls: ['./modal-transport-import-csv.component.scss']
})
export class ModalTransportImportCsvComponent implements OnInit, OnChanges, OnDestroy {
  @Output() transportImportChanged: EventEmitter<any> = new EventEmitter();
  @Input() modalImportCSVData: any = {};
  public importCSVObj: any = {};
  public importTransportObj: any = {};
  public showPSITableSettings = false;
  public showPSIPTableSettings = false;
  private len = 0;
  private transportData = [];
  private transTypes: any = [];

  constructor() {
    this.transTypes = [
      {name: 'PSIP-Terrestrial', code: 'ATSC_PSIP_TERRESTRIAL'},
      {name: 'PSIP-Cable', code: 'ATSC_PSIP_CABLE'},
      {name: 'DVB-SI', code: 'DVB_SI'},
      {name: 'ATSC-3.0', code: 'ATSC_3'},
      {name: 'SCTE-65', code: 'SCTE_65'},
      {name: 'ATSC-MH', code: 'ATSC_MH'},
    ];
  }

  public ngOnInit(): void {
    this.len = this.modalImportCSVData.length;
    let elemCtr = 0;
    let progCtr = 0;
    const transCtr = this.len;
    for (let i = 0; i < this.len; i++) {
      if (this.modalImportCSVData[i].programs !== undefined) {
        const progData = this.modalImportCSVData[i].programs;
        progCtr += progData?.length;
        for (let x = 0; x < progData.length; x++) {
          const programs = progData[x];
          if (programs.elementaryStreams !== undefined) {
            const elemStreamData = programs.elementaryStreams;
            elemCtr += elemStreamData.length;
          }
        }
      }
    }

    this.importCSVObj.transType = this.modalImportCSVData[0].tstype;
    this.importCSVObj.transCtr = transCtr;
    this.importCSVObj.progCtr = progCtr;
    this.importCSVObj.elemStreamCtr = elemCtr;
    this.initializeDefaults();
  }

  public ngOnChanges(changes: SimpleChanges) {
  }


  /**
   * Triggers parent Function to call Import and add necessary data on majot transport data on dirty change
   */
  public ac3TransportImport() {
    const tsType = this.modalImportCSVData[0] !== undefined ? this.modalImportCSVData[0].tstype : this.importCSVObj.transType;
    const transTypeCode = this.revertTransportTypeToCode(tsType);
    if (this.modalImportCSVData[0] !== undefined) {
      for (let i = 0; i < this.len; i++) {
        let prog = [];
        if (this.modalImportCSVData[i].programs[0]?.number !== undefined) {
          prog = this.modalImportCSVData[i].programs;
        }
        this.transportData.push(
          {
            espid: parseInt(this.modalImportCSVData[i].espid),
            pcrpid: parseInt(this.modalImportCSVData[i].pcrpid),
            pmtpid: parseInt(this.modalImportCSVData[i].pmtpid),
            programs: prog,
            st: this.modalImportCSVData[i].st,
            tsid: this.modalImportCSVData[i].tsid,
            tsname: this.modalImportCSVData[i].tsname,
            name: this.modalImportCSVData[i].tsname,
            tstype: this.modalImportCSVData[i].tstype,
            selectedType: transTypeCode,
            transportType: transTypeCode,
            psiEnabled: this.importCSVObj.enabledPSI !== undefined ? this.importCSVObj.enabledPSI : false,
            clientId: uuidv4(),
            //PSI
            patInterval: this.importTransportObj.patInterval,
            pmtInterval: this.importTransportObj.pmtInterval,
            catInterval: this.importTransportObj.catInterval,
            //PSIP
           sttInterval: this.importTransportObj.sttInterval,
           mgtInterval: this.importTransportObj.mgtInterval,
           vctInterval: this.importTransportObj.vctInterval,
           encodeHiddenServices: this.importTransportObj.encodeHiddenServices,
           ettEnabled: this.importTransportObj.ettEnabled,
           ratingRegion: this.importTransportObj.ratingRegion,
           rrtInterval: this.importTransportObj.rrtInterval,
           eitStartPid: this.importTransportObj.eitStartPid,
           eitCount: this.importTransportObj.eitCount,
           eitInterval: this.importTransportObj.eitInterval,
           eitKModifier: this.importTransportObj.eitKModifier,
           rrtEnabled: this.importTransportObj.rrtEnabled,
           ettStartPid: this.importTransportObj.ettStartPid,
           channelEttPid: this.importTransportObj.channelEttPid,
           ettInterval: this.importTransportObj.ettInterval,
           ettKModifier: this.importTransportObj.ettKModifier,

          }
        );
      }

    } else {
      const dataObj = this.transportData[0];
      dataObj.selectedType = transTypeCode;
      dataObj.transportType = transTypeCode;
      dataObj.psiEnabled = this.importCSVObj.enabledPSI === undefined ? false : this.importCSVObj.enabledPSI;
      this.transportData = [];
      this.transportData.push(dataObj);
    }
    const dataEmit = {
      action: 'importButton',
      data: this.importCSVObj,
      dataParent: this.transportData
    };
    this.transportImportChanged.emit(dataEmit);
  }

  public closeModal() {
    const dataEmit = {
      action: 'closeImportButton'
    };
    this.transportImportChanged.emit(dataEmit);
  }

  /**
   * Open PSIP Table Settings
   */
  public openPSIPTableSettings() {
    this.showPSIPTableSettings = true;
    setTimeout(()=>{
      $('#editPsipTableSettings').modal('show');
    }, 100);
  }


  public openPSITableSettings() {
    this.showPSITableSettings = true;
    setTimeout(() => {
      $('#editPsiSettings').modal('show');
    }, 100);
  }

  public psiChangedHandler(event){
    console.log(event);
    this.importTransportObj = event;
  }

  public psipChangedHandler(event){
    console.log(event);
    this.importTransportObj = event;
  }

  /***
   * Destroy all subscriptions and initiated data
   */
  public ngOnDestroy(): void {
    console.log('component Destroy');
  }

  private initializeDefaults() {
    // psi default
    this.importTransportObj.patInterval = 100;
    this.importTransportObj.pmtInterval = 400;
    this.importTransportObj.catInterval = 1000;
    // psip default
    this.importTransportObj.sttInterval = 1000;
    this.importTransportObj.mgtInterval = 150;
    this.importTransportObj.vctInterval = 400;
    this.importTransportObj.encodeHiddenServices = true;
    this.importTransportObj.rrtEnabled = false;
    this.importTransportObj.ratingRegion = 1;
    this.importTransportObj.rrtInterval = 60000;
    this.importTransportObj.eitStartPid = 7424;
    this.importTransportObj.eitCount = 4;
    this.importTransportObj.eitInterval = 500;
    this.importTransportObj.eitKModifier = 1000;
    this.importTransportObj.ettEnabled = true;
    this.importTransportObj.ettStartPid = 7680;
    this.importTransportObj.channelEttPid = 7808;
    this.importTransportObj.ettInterval = 500;
    this.importTransportObj.ettKModifier = 1000;
    this.importTransportObj.ettEnabled = true;
    this.importTransportObj.rrtEnabled = false;
  }

  private revertTransportTypeToCode(type: string) {
    let transTypeCode: { code: string; };
    transTypeCode = this.transTypes.find(function(obj: { name: string; }) {
      return obj.name === type;
    });

    return transTypeCode.code;
  }

}

