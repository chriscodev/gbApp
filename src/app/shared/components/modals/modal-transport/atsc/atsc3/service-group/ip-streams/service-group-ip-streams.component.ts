// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.

import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {isDefined} from '../../../../../../../../core/models/dtv/utils/Utils';
import {
  ServiceGroup
} from '../../../../../../../../core/models/dtv/network/physical/stream/ip/service-group/ServiceGroup';
import {ATSC3Stream} from '../../../../../../../../core/models/dtv/network/physical/stream/ip/IPStream';
import {cloneDeep} from 'lodash';
import {Subscription} from 'rxjs';
import {MediaStream} from '../../../../../../../../core/models/dtv/network/physical/stream/ip/media/MediaStream';
import {ClientMediaStreamsModel} from '../../../../../../../../core/models/ClientMediaStreamsModel';
import {
  ModalTransportAddIPStreamsComponent
} from '../modal-transport-add-ipstreams/modal-transport-add-ipstreams.component';
import {AbstractTransport} from '../../../../../../../../core/models/dtv/network/physical/Transport';

@Component({
  selector: 'app-service-group-ip-streams',
  templateUrl: './service-group-ip-streams.component.html',
  styleUrl: './service-group-ip-streams.component.scss'
})
export class ServiceGroupIpStreamsComponent implements OnInit, OnDestroy, OnChanges {
  @Input() serviceGroup: ServiceGroup;
  @Input() atsc3TransportStream: AbstractTransport;
  @ViewChild(ModalTransportAddIPStreamsComponent) modalAddIpStreams: ModalTransportAddIPStreamsComponent;
  public localServiceGroup: ServiceGroup;
  public localIPStreams: ATSC3Stream[];
  private subscriptions: Subscription [] = [];

  constructor(private clientMediaStreamsModel: ClientMediaStreamsModel, private cdr: ChangeDetectorRef) {
  }

  public ngOnInit(): void {
    this.subscriptions.push(this.clientMediaStreamsModel.mediaStreams$.subscribe(
      (mediaStreams: MediaStream[]) => {
        this.validateIPStreamLinks();
      }));
  }

  public ngOnDestroy(): void {
    this.subscriptions?.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public getLocalIpStreams(): ATSC3Stream[] {
    return this.localIPStreams;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    console.log('ServiceGroupIpStreamsComponent, onChanges changes: ', changes);
    if (isDefined(changes.serviceGroup)) {
      this.localServiceGroup = cloneDeep(changes.serviceGroup.currentValue);
      this.localIPStreams = this.localServiceGroup.ipStreams;
      this.cdr.detectChanges();
    }
  }

  public ipStreamsChangedHandler(updatedIPStreams: ATSC3Stream[]): void {
    console.log('ServiceGroupIpStreamsComponent, ipStreamsChangedHandler updatedIPStreams: ',
      updatedIPStreams);
    this.localIPStreams = updatedIPStreams;
  }

  private validateIPStreamLinks(): void {
    const mediaStreams: MediaStream[] = this.clientMediaStreamsModel.getMediaStreams();
    const oldSize = this.localIPStreams.length;
    this.localIPStreams = this.localIPStreams.filter(atsc3Stream => {
      let streamValid = true;
      if (atsc3Stream.linkedStreamId > 0) {
        streamValid = isDefined(mediaStreams.find(mediaStream => mediaStream.id === atsc3Stream.linkedStreamId));
      }
      return streamValid;
    });
    this.localServiceGroup.ipStreams = this.localIPStreams;
    this.cdr.detectChanges();
  }


}
