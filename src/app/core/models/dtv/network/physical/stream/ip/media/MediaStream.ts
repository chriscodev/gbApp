/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {AbstractElement, UNINITIALIZED_ID} from '../../../../../../AbstractElement';
import {AbstractCommitUpdate} from '../../../../../../CommitUpdate';
import {v4 as uuidv4} from 'uuid';

export enum EncodingType {
  ROUTE = 'ROUTE', MMTP = 'MMTP'
}

export enum ServiceConfiguration {
  Broadband = 'Broadband', Broadcast = 'Broadcast'
}

export enum IngestProtocol {
  HTTP_GET = 'HTTP_GET', HTTP_PUT = 'HTTP_PUT', WEBDAV = 'WEBDAV'
}

export interface IngestProtocolWithDisplayName {
  readonly ingestProtocol: IngestProtocol;
  readonly displayName: string;
}

export const INGEST_PROTOCOLS: IngestProtocolWithDisplayName[] = [
  {ingestProtocol: IngestProtocol.HTTP_GET, displayName: 'HTTP Get'},
  {ingestProtocol: IngestProtocol.HTTP_PUT, displayName: 'HTTP Put'},
  {ingestProtocol: IngestProtocol.WEBDAV, displayName: 'Web DAV'}
];

export class MediaStream extends AbstractElement {
  public constructor(public name: string, public serviceId: number, public enabled: boolean,
                     public encodingType: EncodingType, public ingestProtocol: IngestProtocol,
                     public ingestUrl: string, public ingestPath: string, public username: string,
                     public password: string, public userId: number, public dstAddress: string, public dstPort: number,
                     public slsSourcePort: number, public nic: string, public ttl: string,
                     public sltConfiguration: ServiceConfiguration, public tsibase?: string,
                     public id?: number, public clientId?: string) {
    super(id, clientId);
  }
}

export class DefaultMediaStream extends MediaStream {
  public constructor() {
    super(undefined, undefined, true, EncodingType.ROUTE, IngestProtocol.HTTP_PUT, undefined, undefined, undefined,
      undefined, undefined, undefined, undefined, undefined, undefined, undefined, ServiceConfiguration.Broadcast,
      undefined, UNINITIALIZED_ID, uuidv4);
  }
}

export class ResolvedMediaStream extends MediaStream {
  public constructor(public serviceGroupId: number, public name: string, public serviceId: number,
                     public enabled: boolean, public encodingType: EncodingType, public ingestProtocol: IngestProtocol,
                     public ingestUrl: string, public ingestPath: string, public username: string,
                     public password: string,
                     public userId: number, public dstAddress: string, public dstPort: number,
                     public slsSourcePort: number,
                     public nic: string, public ttl: string, public sltConfiguration: ServiceConfiguration,
                     public tsibase?: string, public id?: number, public clientId?: string) {
    super(name, serviceId, enabled, encodingType, ingestProtocol, ingestUrl, ingestPath, username, password, userId,
      dstAddress, dstPort, slsSourcePort, nic, ttl, sltConfiguration, tsibase, id, clientId);
  }
}

export class MediaStreamsUpdate extends AbstractCommitUpdate<MediaStream> {
  public constructor(public added: MediaStream[], public updated: MediaStream[], public deleted: number[]) {
    super(added, updated, deleted);
  }
}
