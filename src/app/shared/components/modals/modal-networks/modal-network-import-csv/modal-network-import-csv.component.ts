/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */
import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChange} from '@angular/core';
import {cloneDeep} from 'lodash';

@Component({
  selector: 'app-modal-network-import-csv',
  templateUrl: './modal-network-import-csv.component.html',
  styleUrls: ['./modal-network-import-csv.component.scss']
})
export class ModalNetworkImportCsvComponent implements OnInit, OnChanges, OnDestroy {
  @Output() networkImportChanged: EventEmitter<any> = new EventEmitter();
  @Input() modalImportCSVData: any = {};
  importCSVObj: any = {};
  len = 0;
  transportData = [];
  networkTypes: any = [];
  captureCSVDATA: any = {};
  importTransportObj: any = {};

  constructor() {
    this.networkTypes = [
      {name: 'ATSC-Cable', code: 'ATSC_CABLE'},
      {name: 'ATSC-Terrestrial', code: 'ATSC_TERRESTRIAL'},
      {name: 'ATSC-3.0', code: 'ATSC_3'},
    ];
  }

  ngOnInit(): void {
    this.len = this.modalImportCSVData.length;
    let serviceCtr = 0;
    let channelCtr = 0;
    const networkCtr = this.len;
    for (let i = 0; i < this.len; i++) {
      if (this.modalImportCSVData[i].channels !== undefined) {
        const channelData = this.modalImportCSVData[i].channels;
        channelCtr += channelData?.length;
        for (let x = 0; x < channelData.length; x++) {
          const channel = channelData[x];
          if (channel.services !== undefined) {
            const service = channel.services;
            serviceCtr += service.length;
          }
        }
      }
    }

    this.importCSVObj.networkType = this.getNetworkType(this.modalImportCSVData[0].networkType);
    this.importCSVObj.networkCtr = networkCtr;
    this.importCSVObj.channelCtr = channelCtr;
    this.importCSVObj.serviceCtr = serviceCtr;
  }

  getNetworkType(type: string) {
    let networkTypeCode: { name: string; };
    networkTypeCode = this.networkTypes.find(function(obj: { code: string; }) {
      return obj.code === type;
    });
    return networkTypeCode.name;
  }

  /**
   * Triggers parent Function to call Import and add necessary data on majot transport data on dirty change
   */
  import() {
    const dataEmit = {
      action: 'importButton',
    };
    this.networkImportChanged.emit(dataEmit);
  }

  /**
   * Destroys compoenent
   */
  closeModal() {
    const dataEmit = {
      action: 'closeImportButton'
    };
    this.networkImportChanged.emit(dataEmit);

  }

  // Whenever the data in the parent changes, the child gets notified about this in the ngOnChanges method.
  // The child can act on it. This is the standard way of interacting with a child.
  ngOnChanges(changes: { [property: string]: SimpleChange }) {
    const modalImportCSVData: SimpleChange = changes.modalImportCSVData;
    const curValue = modalImportCSVData.currentValue;
    this.captureCSVDATA = cloneDeep(curValue[0]);
    const dataObj = Object.assign({}, this.captureCSVDATA);
    // To check if an object is not empty
    if (Object.keys(dataObj).length !== 0) {
      this.importTransportObj = dataObj;
    }
  }

  /***
   * Destroy all subscriptions and initiated data
   */
  ngOnDestroy(): void {
    console.log('component Destroy');
  }

}

