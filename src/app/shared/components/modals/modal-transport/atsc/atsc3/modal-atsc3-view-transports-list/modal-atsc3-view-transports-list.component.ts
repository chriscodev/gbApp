/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {
  ModalDynamicTbTranslateComponent
} from '../../../../modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {Subscription} from 'rxjs';
import {cloneDeep} from 'lodash';
import {
  AbstractTransport,
  ATSC3TranslatedTransport,
  ATSC3Transport
} from '../../../../../../../core/models/dtv/network/physical/Transport';
import {BootstrapFunction, ClickEvent} from '../../../../../../../core/interfaces/interfaces';

declare var $: BootstrapFunction;

@Component({
  selector: 'app-modal-atsc3-view-transports-list',
  templateUrl: './modal-atsc3-view-transports-list.component.html',
  styleUrl: './modal-atsc3-view-transports-list.component.scss'
})
export class ModalAtsc3ViewTransportsListComponent implements OnInit {
  @ViewChild(ModalDynamicTbTranslateComponent) viewTransportTable: ModalDynamicTbTranslateComponent;
  @Output() transportRecordChanged: EventEmitter<ATSC3Transport | ATSC3TranslatedTransport> = new EventEmitter();
  errorMessage = '';
  @Input() serverATSC3Transports: AbstractTransport[] = [];
  protected subscriptions: Subscription [] = [];
  public tableHeaders = [
    {header: 'Name', key: 'name', visible: true},
    {header: 'BSID', key: 'tsid', visible: true}
  ];
  public linkTransport: ATSC3Transport;
  modalName = 'modalLinkTransport';
  public buttonList = [];

  constructor() {
  }

  ngOnInit(): void {
  }

  selectTransport(event: ClickEvent) {
    this.linkTransport = cloneDeep(this.viewTransportTable.selectedRow);
    this.transportRecordChanged.emit(this.linkTransport);
    this.closeModal('#modalLinkTransport');
  }

  public closeModal(modalName) {
    $(modalName).modal('hide');
  }

  public openModal() {
    $('#modalLinkTransport').modal('show');
  }
}
