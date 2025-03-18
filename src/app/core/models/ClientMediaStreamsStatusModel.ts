// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {Injectable} from '@angular/core';
import {SockStompService} from '../services/sock-stomp.service';
import {MediaStreamStatusService} from '../services/media-stream-status.service';
import {StreamLogType} from './dtv/StreamLogEntry';


@Injectable({
  providedIn: 'root'
})
export class ClientMediaStreamsStatusModel {
  private static instanceCount = 0;

  public constructor(private mediaStreamStatusService: MediaStreamStatusService,
                     private sockStompService: SockStompService) {
    console.log('ClientMediaStreamsStatusModel constructor mediaStreamStatusService: ', mediaStreamStatusService,
      ', instanceCount: ',
      ++ClientMediaStreamsStatusModel.instanceCount);
  }

  public refresh() {
  }

  private getSLSDescriptor(streamId: number): void {
    this.mediaStreamStatusService.getSLSDescriptor(streamId).subscribe(slsDesc => {
      console.log('slsDesc-: ', slsDesc);
    });
  }

  private getMediaStreamIngestStatus(streamId: number): void {
    this.mediaStreamStatusService.getMediaStreamIngestStatus(streamId).subscribe(mediaStreamIngestDescriptor => {
      console.log('ClientModelCollection getMediaStreamIngestStatus: ', mediaStreamIngestDescriptor);
    });
  }

  private getAllBitratesStatus(): void {
    this.mediaStreamStatusService.getAllBitratesStatus().subscribe(bitrateDescriptor => {
      console.log('ClientModelCollection getAllBitratesStatus: ', bitrateDescriptor);
    });
  }

  private getAllIPStreamLogs(greaterThanId: number): void {
    this.mediaStreamStatusService.getAllIPStreamLogs(greaterThanId).subscribe(streamLogEntries => {
      console.log('ClientModelCollection getIPStreamLogs: ', streamLogEntries);
    });
  }

  private getIPStreamLogs(streamId: number, greaterThanId: number, streamLogType: StreamLogType): void {
    this.mediaStreamStatusService.getIPStreamLogs(streamId, streamLogType, greaterThanId).subscribe(ipStreamlogs => {
      console.log('ipStreamlogs-: ', ipStreamlogs);
    });
  }

  private getRouteStreamTransmitStatus(streamId: number): void {
    this.mediaStreamStatusService.getRouteStreamTransmitStatus(streamId).subscribe(
      routeMediaSegmentSegmentTransmitDescriptor => {
        console.log('ClientModelCollection getRouteStreamTransmitStatus: ', routeMediaSegmentSegmentTransmitDescriptor);
      });
  }

  private getMmtpStreamTransmitStatus(streamId: number): void {
    this.mediaStreamStatusService.getMmtpStreamTransmitStatus(streamId).subscribe(
      mmtpMediaSegmentTransmitDescriptor => {
        console.log('ClientModelCollection getMmtpStreamTransmitStatus: ', mmtpMediaSegmentTransmitDescriptor);
      });
  }

  private getMediaStreamLogs(greaterThanId: number): void {
    this.mediaStreamStatusService.getMediaStreamLogs(greaterThanId).subscribe(mediaStreamlogs => {
      console.log('MediaStreamlogs-: ', mediaStreamlogs);
    });
  }
}
