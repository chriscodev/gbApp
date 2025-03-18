/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {AbstractOutput, ATSC3UDPOutput} from '../../../../../../core/models/dtv/output/Output';
import {AbstractTransport, TransportType} from '../../../../../../core/models/dtv/network/physical/Transport';
import {NICDescriptor} from '../../../../../../core/models/server/NetworkSetting';
import {ClientNetworkSettingsModel} from '../../../../../../core/models/ClientNetworkSettingsModel';
import {isDefined, isUndefined} from '../../../../../../core/models/dtv/utils/Utils';
import {inRangeCheck} from '../../../../../helpers/mathHelprrs';
import {DtvNetworkComponent} from '../../../../../../pages/main/dtv-services/dtv-network/dtv-network.component';

@Component({
  selector: 'app-modal-outputs-atsc3-udp',
  templateUrl: './modal-outputs-atsc3-udp.component.html',
  styleUrls: ['./modal-outputs-atsc3-udp.component.scss']
})
export class ModalOutputsAtsc3UdpComponent implements OnInit {
  @Input() output: AbstractOutput;
  @Output() okEnabledChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  public atsc3UDPOutput: ATSC3UDPOutput;
  public selectedTransport: AbstractTransport;
  public nics: NICDescriptor[] = [];
  public sourcePortEnabled = false;
  public sourcePortIconText: string;
  private sourcePortValid = false;
  private okEnabled: boolean;

  constructor(private clientNetworkSettingsModel: ClientNetworkSettingsModel, @Inject(DtvNetworkComponent) private dtvNetworkComponent: DtvNetworkComponent) {
    this.nics = this.clientNetworkSettingsModel.getNetworkList();
  }

  public ngOnInit(): void {
    this.atsc3UDPOutput = this.output as ATSC3UDPOutput;
    this.selectedTransport = this.getSelectedTransport();
    this.sourcePortEnabled = isDefined(this.atsc3UDPOutput?.srcPort);
    this.inputSettings();
  }

  public inputSettings(): void {
    this.updateSourcePortValid();
    this.updateOkEnabled();
  }

  public toggleSourcePortCheck() {
    this.sourcePortEnabled = !this.sourcePortEnabled;
    this.inputSettings();
  }

  public updateSourcePortValid(): void {
    if (!this.sourcePortEnabled && isDefined(this.atsc3UDPOutput.srcPort)) {
      this.atsc3UDPOutput.srcPort = undefined;
    }
    this.sourcePortValid = !this.sourcePortEnabled || inRangeCheck(this.atsc3UDPOutput.srcPort, 1025, 65535);
    this.sourcePortIconText = this.sourcePortValid ? 'text-success' : 'text-danger';
  }

  private updateOkEnabled(): void {
    const oldOkEnabled = this.okEnabled;
    this.okEnabled = this.sourcePortValid && isDefined(this.atsc3UDPOutput?.nic);
    if (oldOkEnabled !== this.okEnabled) {
      this.okEnabledChanged.emit(this.okEnabled);
    }
  }

  private getSelectedTransport(): AbstractTransport {
    this.atsc3UDPOutput = this.output as ATSC3UDPOutput;
    let transport: AbstractTransport = undefined;
    console.log(this.dtvNetworkComponent.localTransports, 'transport edit-', this.atsc3UDPOutput);

    if (isDefined((this.atsc3UDPOutput.transportId) && this.atsc3UDPOutput.transportId > 0)) {
      transport = this.dtvNetworkComponent.localTransports.find(transport => transport.id === this.atsc3UDPOutput.transportId
        && transport.transportType === TransportType.ATSC_3);
    } else if (isDefined((this.atsc3UDPOutput.clientTransportId) && isUndefined(this.atsc3UDPOutput.transportId))) {
      transport = this.dtvNetworkComponent.localTransports.find(transport => transport.clientId === this.atsc3UDPOutput.clientTransportId
        && transport.transportType === TransportType.ATSC_3);
    }
    return transport;
  }
}
