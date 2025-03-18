// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.

import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {
  DefaultTranslatedServiceData,
  ExportProfile,
  ServiceExportLinks,
  TranslatedServiceLinks
} from '../../../../../core/models/dtv/network/export/ExportProfile';
import {
  ActionMessage,
  ButtonType,
  ButtonTypes,
  ImageType,
  MultipleTableColumns
} from '../../../../../core/models/ui/dynamicTable';
import {BootstrapFunction, ClickEvent} from '../../../../../core/interfaces/interfaces';
import {updateElementList} from '../../../../../core/models/AbstractElement';
import {ModalDynamicTbTranslateComponent} from '../../modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {ModalServiceExportListComponent} from '../modal-service-export-list/modal-service-export-list.component';
import {AbstractNetwork, NetworkType} from '../../../../../core/models/dtv/network/logical/Network';
import {ClientNetworksModel} from '../../../../../core/models/ClientNetworksModel';
import * as _swal from 'sweetalert';
import {SweetAlert} from 'sweetalert/typings/core';
import {v4 as uuidv4} from 'uuid';

declare var $: BootstrapFunction;
const swal: SweetAlert = _swal as any;

@Component({
  selector: 'app-modal-export-services',
  templateUrl: './modal-export-services.component.html',
  styleUrl: './modal-export-services.component.scss'
})
export class ModalExportServicesComponent implements OnInit {
  @Input() currentExportProfile: ExportProfile;
  @ViewChild(ModalServiceExportListComponent) modalExportServicesComponent: ModalServiceExportListComponent;
  @ViewChild(ModalDynamicTbTranslateComponent) serviceExportDynamicTable: ModalDynamicTbTranslateComponent;
  @Output() serviceLinksChanged: EventEmitter<ServiceExportLinks[]> = new EventEmitter();
  public currentServiceExportLink: TranslatedServiceLinks;
  public localServiceExportLinks: TranslatedServiceLinks[] = [];
  public serverServiceExportLinks: TranslatedServiceLinks[] = [];
  public networkList: AbstractNetwork[];
  public modalName = '#addServiceLinkModal';
  public serviceLinksList: TranslatedServiceLinks[] = [];
  public updatedServiceLinks: ServiceExportLinks[] = [];
  public buttonList: ButtonTypes[] = [
    {name: ButtonType.ADD, imgSrc: ImageType.add, disable: false, alwaysEnabled: true},
    {name: ButtonType.DELETE, imgSrc: ImageType.delete, supportsMultiSelect: true}
  ];
  public tableHeaders: MultipleTableColumns[] = [
    {header: 'Number', key: 'majorMinorNumber', visible: true},
    {header: 'Name', key: 'serviceName', visible: true},
    {header: 'Channel', key: 'channelName', visible: true},
    {header: 'Network', key: 'networkName', visible: true},
  ];

  constructor(private clientNetworkModel: ClientNetworksModel, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.loadServiceLinks();
    this.updatedServiceLinks = this.currentExportProfile?.serviceLinks;
  }


  loadServiceLinks() {
    this.networkList = this.clientNetworkModel.networkList.getValue();
    // load list of services available to link
    this.availableServices();
    // load services linked with current export Profile
    this.loadLinkedServiceData();
  }

  public onButtonClicked($event: ClickEvent) {
    switch ($event.message) {
      case ActionMessage.ADD:
        this.onAddRow();
        break;
      case ActionMessage.DELETE:
        this.onDeleteRows();
        break;
    }
    this.cdr.detectChanges();
  }

  private onAddRow(): void {
    this.currentServiceExportLink = new DefaultTranslatedServiceData(this.currentExportProfile.id);
    this.modalExportServicesComponent.openModal();
  }

  private onDeleteRows() {
    this.openWarningModal();
  }

  loadLinkedServiceData() {
    this.localServiceExportLinks = [];
    if (this.currentExportProfile?.serviceLinks?.length > 0) {
      this.currentExportProfile.serviceLinks.forEach(srvLink => {
        this.networkList.forEach(network => {
          network.channels.forEach(ch => {
            ch.services.forEach(srv => {

              const majorMinorNumber = srv.majorNumber + '-' + srv.minorNumber;
              if (srv.id === srvLink.serviceId && srvLink.id > 0) {
                const serviceData = new TranslatedServiceLinks(srvLink.serviceId, majorMinorNumber, srv.name, ch.name,
                  network.name, uuidv4());
                this.localServiceExportLinks.push(serviceData);
              } else if (srv.id === srvLink.serviceId && srvLink.id < 0) {
                const serviceData = new TranslatedServiceLinks(srvLink.serviceId, majorMinorNumber, srv.name, ch.name,
                  network.name, null);
                this.localServiceExportLinks.push(serviceData);
              }
            });
          });
        });
      });
    }
    this.serverServiceExportLinks = this.localServiceExportLinks;
  }

  availableServices() {
    this.serviceLinksList = [];
    this.networkList.forEach(network => {
      if (network.networkType === NetworkType.ATSC_3 || network.networkType === NetworkType.ATSC_CABLE || network.networkType === NetworkType.ATSC_TERRESTRIAL) {
        network.channels.forEach(ch => {
          ch.services.forEach(srv => {
            const majorMinorNumber = srv.majorNumber + '-' + srv.minorNumber;
            const serviceData = new TranslatedServiceLinks(srv.id, majorMinorNumber, srv.name, ch.name,
              network.name, null);
            this.serviceLinksList.push(serviceData);

          });
        });
      }
    });
  }

  serviceLinksHandler(selectedServiceLinks: TranslatedServiceLinks[]) {
    this.updatedServiceLinks = [];
    selectedServiceLinks.forEach(srvLink => {
      this.localServiceExportLinks = updateElementList(this.localServiceExportLinks, srvLink,
        false) as TranslatedServiceLinks[];
    });
    this.localServiceExportLinks.forEach(srvLink => {
      this.updatedServiceLinks.push(new ServiceExportLinks(this.currentExportProfile.id, srvLink.id, -1, uuidv4()));
    });
    this.cdr.detectChanges();
    this.serviceLinksChanged.emit(this.updatedServiceLinks);
  }

  deleteRecord(selectedServiceLinks: TranslatedServiceLinks[]) {
    selectedServiceLinks.forEach(srvLinks => {
      this.updatedServiceLinks = this.updatedServiceLinks.filter(link => link.serviceId !== srvLinks.id);
      this.localServiceExportLinks = this.localServiceExportLinks.filter(exportLink => exportLink.id !== srvLinks.id);
    });
    this.cdr.detectChanges();
    this.serviceLinksChanged.emit(this.updatedServiceLinks);
  }

  public openWarningModal() {
    const title = 'Remove Services Confirmation';
    const message = 'Are you sure you want to remove the selected Services?';
    // const icon = 'warning';
    setTimeout(() => {
      swal({
        title,
        text: message,
        buttons: ['Cancel', 'Ok'],
        icon: 'warning',
      }).then((isConfirm) => {
        if (isConfirm) {
          $('.swal-overlay').remove();
          this.deleteRecord(this.serviceExportDynamicTable.selectedRows);
        }
      });
    }, 1000);
    this.cdr.detectChanges();
  }
}
