/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {Component, Inject, Input, OnInit} from '@angular/core';
import {AbstractOutput, OutputType} from '../../../../../core/models/dtv/output/Output';
import {
  AbstractTransport,
  ATSC3Transport,
  TRANSPORT_TYPES,
  TransportType
} from '../../../../../core/models/dtv/network/physical/Transport';
import {MediaStream} from '../../../../../core/models/dtv/network/physical/stream/ip/media/MediaStream';
import {DtvNetworkComponent} from '../../../../../pages/main/dtv-services/dtv-network/dtv-network.component';
import {ClientMediaStreamsModel} from '../../../../../core/models/ClientMediaStreamsModel';
import {SweetAlert} from 'sweetalert/typings/core';
import * as _swal from 'sweetalert';
import {convertDecToHex} from '../../../../helpers/decimalToHexadecimal';
import {isDefined} from '../../../../../core/models/dtv/utils/Utils';
import {ServiceGroup} from '../../../../../core/models/dtv/network/physical/stream/ip/service-group/ServiceGroup';

declare var $: (arg0: string) => { (): any; new(): any; modal: { (arg0: string): void; new(): any; }; };

const swal: SweetAlert = _swal as any;

@Component({
  selector: 'app-modal-outputs-select-transport-type',
  templateUrl: './modal-outputs-select-transport-type.component.html',
  styleUrl: './modal-outputs-select-transport-type.component.scss'
})
export class ModalOutputsSelectTransportTypeComponent implements OnInit {
  @Input() output: AbstractOutput;
  @Input() selectedTransport: AbstractTransport;
  @Input() selectedTranslatedTransport: AbstractTransport;
  public transportName = '';
  public transportType = '';
  public tsid = '';
  public disableAdd: boolean;
  public mediaStreams: MediaStream[] = [];
  protected readonly convertDecToHex = convertDecToHex;
  protected readonly OutputType = OutputType;

  constructor(@Inject(DtvNetworkComponent) private dtvNetworkComponent: DtvNetworkComponent,
              private mediaStreamModel: ClientMediaStreamsModel,
  ) {
  }

  public ngOnInit(): void {
    this.updateSelectedTransport(this.output);
  }

  public openSelectTransportModal(): void {
    $('#selectTransportModal').modal('show');
  }

  public closeModalHandler(activeModalName: string): void {
    $(`#${activeModalName}`).modal('hide');
  }

  public removeTransport(): void {
    swal({
      title: 'Remove Transport Confirmation',
      text:
        'Are you sure you want to remove Transport "' +
        this.selectedTransport.name +
        '"',
      buttons: ['Cancel', 'Ok'],
      icon: 'warning',
    }).then((isConfirm) => {
      if (isConfirm) {
        this.selectedTransport = undefined;
        delete this.output.transportId;
        delete this.output.clientTransportId;
        this.updateTransportFields();
      }
    });
  }

  public viewSelectTransportMaterial(): void {
    $('#modalViewTransportMaterial').modal('show');
  }

  public selectedTransportHandler(selectedTransport: AbstractTransport): void {
    this.selectedTransport = selectedTransport;
    this.updateTransportFields();
    this.output.transportId = this.selectedTransport.id;
    this.output.clientTransportId = this.selectedTransport.clientId;
  }

  private updateSelectedTransport(output: AbstractOutput): void {
    this.selectedTransport = undefined;
    if (output.transportId > 0) {
      const transport: AbstractTransport = this.dtvNetworkComponent.localTransports.find(
        transport => output.transportId === transport.id
      );
      if (transport?.transportType === TransportType.ATSC_3) {
        this.updateMediaStreams(transport as ATSC3Transport);
      }
      this.selectedTransport = transport;
    } else if (output.clientTransportId?.length > 0) {
      this.selectedTransport = this.dtvNetworkComponent.localTransports.find(
        transport => output.clientTransportId === transport.clientId
      );
    }
    this.updateTransportFields();
  }

  private updateTransportFields(): void {
    this.disableAdd = isDefined(this.selectedTransport);
    if (this.disableAdd) {
      this.transportName = this.selectedTransport.name;
      this.tsid = this.selectedTransport.tsid.toString();
      this.transportType = this.getTransportTypeDisplayName(this.selectedTransport.transportType);
    } else {
      this.selectedTransport = null;
      this.transportName = '';
      this.tsid = '';
      this.transportType = '';
    }
  }

  private getTransportTypeDisplayName(transportType: TransportType): string {
    return isDefined(transportType) ? TRANSPORT_TYPES[transportType]?.displayName : '';
  }

  private updateMediaStreams(atsc3Transport: ATSC3Transport): void {
    if (isDefined(atsc3Transport.serviceGroups)) {
      atsc3Transport.serviceGroups.map((sGroup: ServiceGroup) => {
        sGroup.ipStreams.map(ipStream => {
          if (isDefined(ipStream.linkedStreamId)) {
            const mediaStream = this.getMediaStreamData(ipStream.linkedStreamId);
            if (isDefined(mediaStream)) {
              this.mediaStreams.push(mediaStream);
            }
          }
        });
      });
    }
  }

  private getMediaStreamData(linkedStreamId: number): MediaStream {
    return this.mediaStreamModel.getMediaStreamById(linkedStreamId);
  }
}
