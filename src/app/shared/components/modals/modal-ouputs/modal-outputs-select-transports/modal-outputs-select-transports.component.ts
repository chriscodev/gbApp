// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.

import {Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild} from '@angular/core';
import {DtvNetworkComponent} from '../../../../../pages/main/dtv-services/dtv-network/dtv-network.component';
import {
  AbstractTransport,
  TRANSPORT_TYPES,
  TransportType
} from '../../../../../core/models/dtv/network/physical/Transport';
import {AbstractOutput, TRANSPORT_FOR_OUTPUT} from '../../../../../core/models/dtv/output/Output';
import {ModalDynamicTbTranslateComponent} from '../../modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {ButtonTypes, MultipleTableColumns} from '../../../../../core/models/ui/dynamicTable';

declare var $: (arg0: string) => { (): any; new(): any; removeAttr: { (arg0: string): void; new(): any; }; };

@Component({
  selector: 'app-modal-outputs-select-transports',
  templateUrl: './modal-outputs-select-transports.component.html',
  styleUrls: ['./modal-outputs-select-transports.component.scss']
})
export class ModalOutputsSelectTransportsComponent implements OnInit {
  @Input() output: AbstractOutput;
  @Output() outputsSelectTransport: EventEmitter<AbstractTransport> = new EventEmitter();
  @Output() closeViewSelectedTransportsModal: EventEmitter<string> = new EventEmitter();
  @ViewChild(ModalDynamicTbTranslateComponent) transportListTableComponent: ModalDynamicTbTranslateComponent;
  public unusedTransports: AbstractTransport[];
  public tableHeaders: MultipleTableColumns[] = [
    {header: 'Name', key: 'name', visible: true},
    {header: 'Type', key: 'transportType', visible: true, function: this.getTransportTypeDisplayName},
    {header: 'TSID/BSID', key: 'tsid', visible: true},
  ];
  public buttonList: ButtonTypes[] = [];

  constructor(@Inject(DtvNetworkComponent) private dtvNetworkComponent: DtvNetworkComponent) {
  }

  public ngOnInit(): void {
    this.filterUsedTransports(this.filterTransportTypes(TRANSPORT_FOR_OUTPUT[this.output.outputType].allowedTransportArray));
  }

  public getTransportTypeDisplayName(transportType: TransportType): string {
    return TRANSPORT_TYPES[transportType]?.displayName || transportType.toString();
  }

  public selectTransport() {
    if (this.transportListTableComponent.selectedRow !== null) {
      this.selectedTransport(this.transportListTableComponent.selectedRow);
    }
    this.closeModal();
  }

  public closeModal() {
    this.closeViewSelectedTransportsModal.emit('selectTransportModal');
  }

  private selectedTransport(selectedTransport: AbstractTransport) {
    $('#selectTransportButton').removeAttr('disabled');
    this.outputsSelectTransport.emit(selectedTransport);
  }

  private filterTransportTypes(transportTypes: TransportType[]): AbstractTransport[] {
    return this.dtvNetworkComponent.localTransports.filter(
      transport => transportTypes.includes(transport.transportType));
  }

  private filterUsedTransports(transports: AbstractTransport[]) {
    this.unusedTransports = transports.filter(transport => {
      const filtered = this.dtvNetworkComponent.localOutputs.some(output => {
        // ATSC3 transports are currently only transports that cannot be shared
        return transport.transportType === TransportType.ATSC_3 &&
          (transport.id > 0 ? transport.id === output.transportId : transport.clientId === output.clientTransportId);
      });
      return !filtered;
    });
  }
}
