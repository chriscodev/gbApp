// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild} from '@angular/core';
import {
  AbstractTransport,
  ATSC3TranslatedTransport,
  ATSC3TranslatorTarget,
  ATSC3Transport,
  DefaultATSC3TranslatorTarget,
  TransportType
} from '../../../../../../../core/models/dtv/network/physical/Transport';

import {cloneDeep} from 'lodash';
import {BootstrapFunction, ClickEvent} from '../../../../../../../core/interfaces/interfaces';
import {
  ActionMessage,
  ButtonType,
  ButtonTypes,
  ImageType,
  MultipleTableColumns
} from '../../../../../../../core/models/ui/dynamicTable';
import {
  ModalDynamicTbTranslateComponent
} from '../../../../modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {updateElementList} from '../../../../../../../core/models/AbstractElement';
import {
  ModalAtsc3ViewTransportsListComponent
} from '../modal-atsc3-view-transports-list/modal-atsc3-view-transports-list.component';
import {Subscription} from 'rxjs';
import {ClientTransportsModel} from '../../../../../../../core/models/ClientTransportsModel';
import * as _swal from 'sweetalert';
import {SweetAlert} from 'sweetalert/typings/core';
import {DtvNetworkComponent} from '../../../../../../../pages/main/dtv-services/dtv-network/dtv-network.component';

declare var $: BootstrapFunction;
const swal: SweetAlert = _swal as any;


@Component({
  selector: 'app-modal-transport-atsc3-translated-transport-stream',
  templateUrl: './modal-transport-atsc3-translated-transport-stream.component.html',
  styleUrl: './modal-transport-atsc3-translated-transport-stream.component.scss'
})
export class ModalTransportAtsc3TranslatedTransportStreamComponent implements OnInit {
  @ViewChild(ModalDynamicTbTranslateComponent) targetDynamicTable: ModalDynamicTbTranslateComponent;
  @ViewChild(ModalAtsc3ViewTransportsListComponent) viewATSC3TransportLink: ModalAtsc3ViewTransportsListComponent;
  @Input() transportStream: AbstractTransport;
  @Output() atsc3TransportStreamChanged: EventEmitter<any> = new EventEmitter();
  public atsc3TranslatedTransportStream: ATSC3TranslatedTransport;
  public serverATSC3Transports: ATSC3Transport[] = [];
  public modalName = '#translatedTargetModal';
  public modalTitle = 'Add Target Id';
  public currentTranslatedTarget: ATSC3TranslatorTarget = new DefaultATSC3TranslatorTarget();
  public localATSC3TranslatorTargets: ATSC3TranslatorTarget[];
  public serverATSC3TranslatorTargets: ATSC3TranslatorTarget[];
  public targetIdIconText: string;
  public transportName = null;
  public editMode: boolean;
  protected subscriptions: Subscription [] = [];
  public buttonList: ButtonTypes[] = [
    {name: ButtonType.ADD, imgSrc: ImageType.add, alwaysEnabled: true},
    {name: ButtonType.EDIT, imgSrc: ImageType.edit},
    {name: ButtonType.DELETE, imgSrc: ImageType.delete, supportsMultiSelect: true}

  ];
  public tableHeaders: MultipleTableColumns[] = [
    {header: 'Target', key: 'targetId', visible: true}
  ];

  constructor(@Inject(DtvNetworkComponent) private dtvNetworkComponent: DtvNetworkComponent,
              private transportModel: ClientTransportsModel,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.loadLocalATSC3Transport();
  }

  private loadLocalATSC3Transport() {
    this.atsc3TranslatedTransportStream = this.transportStream as ATSC3TranslatedTransport;
    this.serverATSC3TranslatorTargets = cloneDeep(this.atsc3TranslatedTransportStream?.targets);
    this.localATSC3TranslatorTargets = cloneDeep(this.serverATSC3TranslatorTargets);
    this.loadATSC3Transport();
    this.transportName = this.getTransportName(this.atsc3TranslatedTransportStream);
  }

  openModalLinkTransport() {
    this.loadATSC3Transport();
    this.viewATSC3TransportLink.openModal();
  }

  getAtsc3TranslatedTransportStream(): ATSC3TranslatedTransport {
    return this.atsc3TranslatedTransportStream;
  }

  unlinkTransport() {
    $('#modalLinkTransport').modal('hide');
  }

  onButtonClicked(event: ClickEvent) {
    switch (event.message) {
      case ActionMessage.ADD:
        this.onAddRow();
        break;
      case ActionMessage.EDIT:
        this.onEditRow();
        break;
      case ActionMessage.DELETE:
        this.onDeleteRow();
        break;
    }
    this.cdr.detectChanges();
  }

  closeModal() {
    this.cdr.detectChanges();
  }

  onAddRow() {
    this.editMode = false;
    this.modalTitle = 'Add Target Id';
    this.currentTranslatedTarget = new DefaultATSC3TranslatorTarget();
  }

  onEditRow() {
    this.currentTranslatedTarget = cloneDeep(this.targetDynamicTable.selectedRow);
    this.modalTitle = 'Edit Target Id';
    this.editMode = true;
  }

  onDeleteRow() {
    this.multipleDeletion();
    this.cdr.detectChanges();
  }

  private multipleDeletion() {
    const len = this.targetDynamicTable.selectedRowIds.length;
    for (let i = 0; i < len; i++) {
      const selectID = this.targetDynamicTable?.selectedRowIds[i];
      this.localATSC3TranslatorTargets = this.localATSC3TranslatorTargets.filter(target => {
        const idMatch = target.id.toString() !== selectID.toString();
        const clientIdMatch = target.clientId !== selectID.toString();
        return idMatch && clientIdMatch;
      });
    }
    this.atsc3TranslatedTransportStream.targets = this.localATSC3TranslatorTargets;
  }

  addUpdateTargetData() {
    this.localATSC3TranslatorTargets = updateElementList(this.localATSC3TranslatorTargets, this.currentTranslatedTarget,
      this.editMode) as ATSC3TranslatorTarget[];
    this.atsc3TranslatedTransportStream.targets = this.localATSC3TranslatorTargets;
    $('#translatedTargetModal').modal('hide');
  }

  public transportChangeHandler(linkTransport: ATSC3Transport): void {
    if (linkTransport?.id > 0) {
      this.atsc3TranslatedTransportStream.originalTransportId = linkTransport?.id;
    } else {
      this.atsc3TranslatedTransportStream.originalClientTransportId = linkTransport?.clientId;
    }

    this.transportName = linkTransport?.name;
    this.transportStream = this.atsc3TranslatedTransportStream;
    this.atsc3TransportStreamChanged.emit(this.atsc3TranslatedTransportStream);
  }

  private getTransportName(selectedTansport: ATSC3TranslatedTransport) {
    let selectedTransport = null;
    selectedTransport = this.serverATSC3Transports.find(transport => {
      if (selectedTansport.originalTransportId > 0 && selectedTansport.originalTransportId === transport.id) {
        return transport;
      } else if (selectedTansport.originalTransportId === -1 && selectedTansport.originalClientTransportId === transport.clientId) {
        return transport;
      } else {
        return '';
      }

    });
    this.transportName = selectedTransport.name;
    return selectedTransport.name;
  }

  loadATSC3Transport() {
    const allTransports = cloneDeep(this.dtvNetworkComponent.localTransports);
    console.log('allTransport', allTransports);
    this.getATSC3Transports(allTransports);
  }

  getATSC3Transports(transports: AbstractTransport[]) {
    const atscTransports: ATSC3Transport [] = [];
    transports.forEach(transport => {
      if (transport.transportType === TransportType.ATSC_3) {
        atscTransports.push(transport as ATSC3Transport);
      }
    });
    this.serverATSC3Transports = cloneDeep(atscTransports);
  }

  public openWarningModal() {
    const title = 'Remove Transport Link Confirmation';
    const message = 'Unlinking the transport will unlink all the services contained in any link channel from their corresponding media streams.' +
      'Are you sure you want to remove the linked Transport.';
    const icon = 'warning';
    setTimeout(() => {
      swal({
        title,
        text: message,
        buttons: ['Cancel', 'Ok'],
        icon: 'warning',
      }).then((isConfirm) => {
        if (isConfirm) {
          $('.swal-overlay').remove();
          this.transportName = null;
          // $('.fixed-layout').removeAttr('style');
          this.atsc3TranslatedTransportStream.originalTransportId = -1;
          this.cdr.detectChanges();
          this.atsc3TransportStreamChanged.emit(this.atsc3TranslatedTransportStream);
        }
      });
    }, 1000);

  }

}
