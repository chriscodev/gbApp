// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.

import {Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, ViewChild} from '@angular/core';
import {ModalDynamicTbTranslateComponent} from '../../modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {AbstractTransport} from '../../../../../core/models/dtv/network/physical/Transport';
import {ButtonTypes, MultipleTableColumns} from '../../../../../core/models/ui/dynamicTable';
import {Program} from '../../../../../core/models/dtv/network/physical/stream/mpeg/Program';
import {VP1Embedder} from '../../../../../core/models/dtv/network/physical/stream/ip/service-group/ServiceGroup';
import {IPStream} from '../../../../../core/models/dtv/network/physical/stream/ip/IPStream';
import {cloneDeep} from 'lodash';
import {BootstrapFunction} from '../../../../../core/interfaces/interfaces';
import {DtvNetworkComponent} from '../../../../../pages/main/dtv-services/dtv-network/dtv-network.component';

declare var $: BootstrapFunction;

@Component({
  selector: 'app-modal-networks-transport-link-program',
  templateUrl: './modal-networks-transport-link-program.component.html',
  styleUrls: ['./modal-networks-transport-link-program.component.scss']
})
export class ModalNetworksTransportLinkProgramComponent implements OnInit, OnChanges {
  @ViewChild(ModalDynamicTbTranslateComponent) transportLinkDynamicTable: ModalDynamicTbTranslateComponent;
  @Input() sourceData: string;
  @Input() linkTransportData: AbstractTransport[];
  @Input() linkProgramData: Program[];
  @Input() linkProgramIPData: IPStream[];
  @Input() linkRecoveryData: VP1Embedder[];
  @Input() transName: string;
  @Output() transportLinkChanged: EventEmitter<AbstractTransport> = new EventEmitter();
  @Output() programLinkChanged: EventEmitter<Program> = new EventEmitter();
  @Output() programIPLinkChanged: EventEmitter<IPStream> = new EventEmitter();
  @Output() recoveryLinkChanged: EventEmitter<VP1Embedder> = new EventEmitter();
  public transportName = '';
  public buttonList: ButtonTypes[] = [];
  public tableHeaders: MultipleTableColumns[] = [];
  public modalTitle = 'Select Transport Program';
  public cloneIPData: IPStream[];

  constructor(@Inject(DtvNetworkComponent) private dtvNetworkComponent: DtvNetworkComponent) {
  }

  public ngOnInit(): void {
  }

  public ngOnChanges() {
    if (this.sourceData === 'TransCallFromChannel') {
      this.modalTitle = 'Select Transport';
      this.tableHeaders = [
        {header: 'Name', key: 'name', visible: true},
        {header: 'TSID', key: 'tsid', visible: true},
      ];
    } else if (this.sourceData === 'ProgCallFromService') {
      this.modalTitle = 'Select Transport Program';
      this.transportName = this.transName;
      this.tableHeaders = [
        {header: 'Number', key: 'programNumber', visible: true},
        {header: 'PMT PID', key: 'pmtPid', visible: true},
      ];
    } else if (this.sourceData === 'ProgCallFromServiceATSC3') {
      this.modalTitle = 'Select IP Stream';
      this.transportName = this.transName;
      this.tableHeaders = [
        {header: 'Name', key: 'name', visible: true},
        {header: 'Destination IP', key: 'destinationIP', visible: true}
      ];
      this.cloneIPData = cloneDeep(this.linkProgramIPData);
    } else if (this.sourceData === 'RecCallFromServiceATSC3') {
      this.modalTitle = 'Select VP1 Embedders';
      this.transportName = this.transName;
      this.tableHeaders = [
        {header: 'Host', key: 'host', visible: true},
        {header: 'Port', key: 'port', visible: true},
        {header: 'Instance', key: 'processingInstance', visible: true},
      ];
    }
  }

  public onButtonClicked() {
    if (this.sourceData === 'ProgCallFromService' || this.sourceData === 'ProgCallFromServiceATSC3') {
      this.linkProgram();
    } else if (this.sourceData === 'RecCallFromServiceATSC3') {
      this.linkRecovery();
    } else if (this.sourceData === 'TransCallFromChannel') {
      this.linkTransport();
    }
  }

  public checkSelectedRowValues() {
    return !this.transportLinkDynamicTable?.selectedRowIds[0];
  }

  public closeModalNew() {
    $('#modalTransportLink').modal('hide');
    $('#modalTransportProgramLink').modal('hide');
    $('#modalTransportRecoveryLink').modal('hide');
  }

  private linkTransport() {
    let transportId: string = this.transportLinkDynamicTable.selectedRow.id.toString();
    if (transportId === '-1') {
      transportId = this.transportLinkDynamicTable.selectedRow.clientId.toString();
    }
    // associateTransportProgram(this.dtvNetworkComponent.localTransports, transportId);
    this.transportLinkChanged.emit(this.transportLinkDynamicTable.selectedRow);
    this.closeModalNew();
  }

  private linkProgram() {
    let programId = this.transportLinkDynamicTable.selectedRow.id.toString();
    if (programId === '-1') {
      programId = this.transportLinkDynamicTable.selectedRow.clientId.toString();
    }
    // associateTransportProgram(this.dtvNetworkComponent.localTransports, programId, false);
    if (this.sourceData !== 'ProgCallFromServiceATSC3') {
      this.programLinkChanged.emit(this.transportLinkDynamicTable.selectedRow);
    } else {
      this.programIPLinkChanged.emit(this.transportLinkDynamicTable.selectedRow);
    }
    this.closeModalNew();
  }

  private linkRecovery() {
    let recoveryId = this.transportLinkDynamicTable.selectedRow.id.toString();
    if (recoveryId === '-1') {
      recoveryId = this.transportLinkDynamicTable.selectedRow.clientId.toString();
    }
    // associateTransportRecovery(recoveryId);
    this.recoveryLinkChanged.emit(this.transportLinkDynamicTable.selectedRow);
    this.closeModalNew();
  }
}
