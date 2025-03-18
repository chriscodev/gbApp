/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {PACKAGE_TYPES, PackageType} from '../../../../../core/models/dtv/network/physical/stream/ip/data/DataPackage';
import {ActionMessage} from '../../../../../core/models/ui/dynamicTable';
import {isNumeric} from '../../../../helpers/alphaNumericValidator';
import {ResolvedATSC3Transport} from '../../../../../core/models/dtv/network/physical/Transport';

@Component({
  selector: 'app-modal-transport-select-service-group',
  templateUrl: './modal-transport-select-service-group.component.html',
  styleUrls: ['./modal-transport-select-service-group.component.scss']
})

export class ModalTransportSelectServiceGroupComponent implements OnInit, OnChanges{
  @Input() atsc3Transports: ResolvedATSC3Transport[];
  @Input() currentDataPackage: any;
  @Output () ac3TranStreamChanged: EventEmitter<any> = new EventEmitter();
  dataPackageTypes = Object.values(PACKAGE_TYPES);
  dataPackageType: any;
  selectServiceGroupId: number;
  selectServiceGroupDataObject: number[] = [];
  dataEmit: any;
  transportID: number;
  transportName: string;
  groupName: string;
  serviceList: string[];
  serviceGroupList: any[];
  modalTitle = 'Select Service Group';
  constructor() {}
  ngOnInit() { }
  ngOnChanges(){
    if (this.currentDataPackage.serviceGroupId > 0 && this.currentDataPackage.packageType === PackageType.ATSC3_APP_NRT ){
      this.selectAllServiceIds(this.currentDataPackage.serviceGroupId);
    }
  }

  closeModalServiceGroup(){
    this.updateOkButtonEnabled();
    this.dataEmit = {
      action: ActionMessage.ADD,
      data: this.selectServiceGroupDataObject
    };
    console.log( JSON.stringify(this.currentDataPackage));
    this.ac3TranStreamChanged.emit();
  }
  onChangeTransport($event){
    if (!isNumeric(this.transportID)){
      this.currentDataPackage.clientTransportId = this.transportID;
    }else{
      this.currentDataPackage.transportId = this.transportID;
    }
    if (this.currentDataPackage.serviceGroupId > 0 ){
      if (this.currentDataPackage.packageType === PackageType.ATSC3_APP_NRT) {
        const selectedGrpFirstService = document.getElementById(this.currentDataPackage.serviceGroupId + '-0') as HTMLInputElement;
        selectedGrpFirstService.checked = true;
        const idList = selectedGrpFirstService.className.split('-');
        this.currentDataPackage.serviceIds.push(idList[1]);
      }
    }
  }
  groupSelected($event, grpChecked ){
      this.selectServiceGroupDataObject.push(grpChecked);
      this.selectServiceGroupId = grpChecked;
      if (!isNumeric(grpChecked)) {
        this.currentDataPackage.clientServiceGroupId = grpChecked;
      }else{
        this.currentDataPackage.serviceGroupId = grpChecked;
      }
      const selectedGrpFirstService = document.getElementById(grpChecked + '-0') as HTMLInputElement;
      selectedGrpFirstService.checked = true;
      const idList = selectedGrpFirstService.className.split('-');
      this.currentDataPackage.serviceIds.push(idList[1]);
      console.log($event.target.value + '---' + this.currentDataPackage.serviceGroupId + 'group selected');
  }
  groupServiceSelected($event, serviceGrpId){
    if ($event.target.checked){
      if (!this.currentDataPackage.serviceIds.includes(serviceGrpId)) {
        this.currentDataPackage.serviceIds.push(serviceGrpId);
      }
    }else{
        this.currentDataPackage.serviceIds = this.currentDataPackage.serviceIds.filter
        (serviceId => serviceId !== serviceGrpId);
    }

  }
  groupClientServiceSelected(serviceClientGrpChecked){
    this.currentDataPackage.clientServiceIds.push(serviceClientGrpChecked);
  }
  updateServiceList(selectedGrpId){
   if (!isNumeric(selectedGrpId)){
      this.currentDataPackage.clientServiceGroupId = selectedGrpId;
   }else{
      this.currentDataPackage.serviceGroupId = selectedGrpId;
   }
  }
  selectAllGroup($event, selectedGrpId) {
    const selectedGrp = document.getElementById(selectedGrpId) as HTMLInputElement;
    const selectedAllGrp = document.getElementById('serviceGroupCheckboxAll-' + selectedGrpId) as HTMLInputElement;
    const selectedGroupList = document.getElementsByName('serviceGroupCheckbox-' + selectedGrpId) ;
    if ($event.target.checked){
      this.currentDataPackage.allServicesEnabled = true;
      this.currentDataPackage.serviceIds = [];
      selectedAllGrp.checked = true;
    }else{
      this.currentDataPackage.allServicesEnabled = false;
      selectedAllGrp.checked = false;
    }
    if (selectedAllGrp.checked) {
      selectedGroupList.forEach((elem ) => {
        const chkElement: HTMLInputElement = elem as HTMLInputElement;
        chkElement.checked = true;
        chkElement.disabled = true;
        this.currentDataPackage.serviceIds = [];
      });

    }else if (!selectedAllGrp.checked) {
      selectedGroupList.forEach((elem ) => {
        const chkElement: HTMLInputElement = elem as HTMLInputElement;
        if (chkElement.id !== selectedGrpId + '-0'){
          chkElement.checked = false;
        }else{
          const idList = chkElement.className.split('-');
          this.currentDataPackage.serviceIds.push(idList[1]);
        }
        chkElement.disabled = false;
        this.currentDataPackage.serviceIds = this.currentDataPackage.serviceIds.filter
        (serviceId => serviceId !== elem.id);
      });
    }
    this.updateServiceList(selectedGrpId);
    console.log('ALL selected group--' + this.currentDataPackage.allServicesEnabled);
  }

  selectAllServiceIds(selectedGrpId) {
    const selectedGroupList = document.getElementsByName('serviceGroupCheckbox-' + selectedGrpId);
    if (this.currentDataPackage.transportId !== null && this.currentDataPackage.packageType === PackageType.ATSC3_APP_NRT) {
      console.log('selected All' + selectedGroupList.length);
      if (this.currentDataPackage.allServicesEnabled) {
        this.currentDataPackage.serviceIds = [];
        selectedGroupList.forEach((elem) => {
          const chkElement: HTMLInputElement = elem as HTMLInputElement;
          chkElement.checked = true;
          chkElement.disabled = true;
          const idList = chkElement.className.split('-');
          console.log('---' + idList);
          this.currentDataPackage.serviceIds.push(idList[1]);
        });
      }
    }
    console.log('selected serviceIds ' + this.currentDataPackage.serviceIds);
  }
  updateOkButtonEnabled(): boolean {
    //  if ( this.transportID !== null && isNumeric(this.transportID)){
    if (this.currentDataPackage.transportId !== null){
        return this.currentDataPackage.packageType === PackageType.USER_DEFINED_NDP ?
          (this.currentDataPackage.serviceIds !== null && this.currentDataPackage.serviceGroupId !== null) :
          this.currentDataPackage.serviceGroupId !== null;
    } else{
        return this.currentDataPackage.packageType === PackageType.USER_DEFINED_NDP ?
          (this.currentDataPackage.clientServiceIds !== null && this.currentDataPackage.clientServiceGroupId !== null) :
          this.currentDataPackage.clientServiceGroupId !== null;
    }
  }
}
