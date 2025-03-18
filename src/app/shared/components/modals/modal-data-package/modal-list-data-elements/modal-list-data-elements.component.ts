/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {DataPackage} from '../../../../../core/models/dtv/network/physical/stream/ip/data/DataPackage';
import {DataElement} from '../../../../../core/models/dtv/network/physical/stream/ip/data/element/DataElement';
import {AppAttributes, DefaultAppAttributes} from '../../../../../core/models/dtv/network/physical/stream/ip/data/element/App';
import {DefaultFTPAttributes, IngestAttributes} from '../../../../../core/models/dtv/network/physical/stream/ip/data/element/Ingest';
import {DefaultTransmitAttributes, FECAttributes, TransmitAttributes} from '../../../../../core/models/dtv/network/physical/stream/ip/data/element/Transmit';
import {DefaultSigningAttributes, SigningAttributes} from '../../../../../core/models/dtv/network/physical/stream/ip/data/element/Singing';
import {ModalDataAddElementsComponent} from '../modal-data-add-elements/modal-data-add-elements.component';
import {ActionMessage} from '../../../../../core/models/ui/dynamicTable';

@Component({
  selector: 'app-modal-list-data-elements',
  templateUrl: './modal-list-data-elements.component.html',
  styleUrls: ['./modal-list-data-elements.component.scss']
})
export class ModalListDataElementsComponent implements OnInit, OnChanges {
  @Input() currentDataPackage: DataPackage;
  @Input() localDataElements: DataElement[] ;
  @ViewChild(ModalDataAddElementsComponent) dataElementAddComponent: ModalDataAddElementsComponent;
  @Output() dataPackageElementsChanged: EventEmitter<any> = new EventEmitter();

  currentDataElement: DataElement ;
  currentIngestAttributes: IngestAttributes ;
  appAttributes: AppAttributes ;
  transmitAttributes: TransmitAttributes;
  fecAttributes: FECAttributes;
  signingAttributes: SigningAttributes;

  constructor() {
  }

  ngOnInit(): void {
    this.createDefaultDataElement();
    this.localDataElements = this.currentDataPackage.dataElements;
  }

  public updateDataPackageElements($event: any) {
    if ($event.message !== ActionMessage.ADD || $event.message === ActionMessage.EDIT){
      this.localDataElements = this.currentDataPackage.dataElements;
    }
    this.dataPackageElementsChanged.emit();
  }
  ngOnChanges(changes: SimpleChanges): void {
   // console.log('this list elemets' + JSON.stringify(this.currentDataPackage.dataElements));
    this.localDataElements = this.currentDataPackage.dataElements;
  }
  public createDefaultDataElement() {
    this.appAttributes = new DefaultAppAttributes();
    this.currentIngestAttributes = new DefaultFTPAttributes();
    this.transmitAttributes = new DefaultTransmitAttributes();
    this.signingAttributes = new DefaultSigningAttributes();
    this.currentDataElement = new DataElement('', this.currentIngestAttributes, this.transmitAttributes, this.appAttributes, this.signingAttributes, 0, undefined);
  }
}
