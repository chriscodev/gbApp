/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */
import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ExportProfile, TranslatedServiceLinks} from '../../../../../core/models/dtv/network/export/ExportProfile';
import {ButtonTypes, MultipleTableColumns} from '../../../../../core/models/ui/dynamicTable';
import {ModalDynamicTbTranslateComponent} from '../../modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {BootstrapFunction} from '../../../../../core/interfaces/interfaces';

declare var $: BootstrapFunction;

@Component({
  selector: 'app-modal-service-export-list',
  templateUrl: './modal-service-export-list.component.html',
  styleUrl: './modal-service-export-list.component.scss'
})
export class ModalServiceExportListComponent implements OnInit {
  @ViewChild(ModalDynamicTbTranslateComponent) serviceExportDynamicTable: ModalDynamicTbTranslateComponent;
  @Output() serviceLinksChanged: EventEmitter<TranslatedServiceLinks[]> = new EventEmitter();
  @Input() currentExportProfile: ExportProfile;
  @Input() serviceLinksList: TranslatedServiceLinks[] = [];
  public modalName = '#addServiceLinkModal';
  public selectServiceLinks: TranslatedServiceLinks[] = [];
  public buttonList: ButtonTypes[] = [];
  public tableHeaders: MultipleTableColumns[] = [
    {header: 'Number', key: 'majorMinorNumber', visible: true},
    {header: 'Name', key: 'serviceName', visible: true},
    {header: 'Channel', key: 'channelName', visible: true},
    {header: 'Network', key: 'networkName', visible: true},
  ];


  constructor() {
  }

  ngOnInit(): void {
  }

  public closeModal() {
    $(this.modalName).modal('hide');
  }

  public openModal() {
    $(this.modalName).modal('show');
  }

  addServiceLinks() {
    this.closeModal();
    this.selectServiceLinks = this.serviceExportDynamicTable.selectedRows;
    this.serviceLinksChanged.emit(this.selectServiceLinks);
  }

}
