// Copyright (c) 2023 Triveni Digital, Inc. All rights reserved.
import {AWSRegions} from './AWSRegion';
export enum IngestProtocol {
  HTTP_PUT = 'HTTP_PUT', HTTP_GET = 'HTTP_GET', WEBDAV = 'WEBDAV', FILE_UPLOAD = 'FILE_UPLOAD',
  AWS_S3 = 'AWS_S3', SIG_AWS_S3 = 'SIG_AWS_S3'
}

export interface IngestProtocolWithDisplayName {
  readonly ingestProtocol: IngestProtocol;
  readonly displayName: string;
}

export const INGEST_PROTOCOLS: IngestProtocolWithDisplayName[] = [
  {ingestProtocol: IngestProtocol.HTTP_GET, displayName: 'HTTP GET'},
  {ingestProtocol: IngestProtocol.HTTP_PUT, displayName: 'HTTP PUT'},
  {ingestProtocol: IngestProtocol.WEBDAV, displayName: 'WebDAV'},
  {ingestProtocol: IngestProtocol.FILE_UPLOAD, displayName: 'File Upload'},
  {ingestProtocol: IngestProtocol.AWS_S3, displayName: 'AWS S3'},
  {ingestProtocol: IngestProtocol.SIG_AWS_S3, displayName: 'IEI'}
];

export enum PayloadFormat {
  FILE = 'FILE', UNSIGNED_PACKAGE = 'UNSIGNED_PACKAGE', SIGNED_PACKAGE = 'SIGNED_PACKAGE'
}

export interface PayloadFormatWithDisplayName {
  readonly payloadFormat: PayloadFormat;
  readonly displayName: string;
}

export const PAYLOAD_FORMATS: PayloadFormatWithDisplayName[] = [
  {payloadFormat: PayloadFormat.FILE, displayName: 'File'},
  {payloadFormat: PayloadFormat.UNSIGNED_PACKAGE, displayName: 'Unsigned Package'},
  {payloadFormat: PayloadFormat.SIGNED_PACKAGE, displayName: 'Signed Package'}
];

export class IngestAttributes {
  public constructor(public ingestProtocol: IngestProtocol, public disableAutoExpandZip: boolean,
                     public appendFile: boolean, public createMultipart: boolean, public payloadFormat: PayloadFormat,
                     public pollIntervalInSeconds: number, public url: string, public path: string,
                     public username: string , public password: string, public apiKeyId: string, public apiKeyValue: string,
                     public accessKeyId: string, public accessKeyValue: string, public region: AWSRegions ) {
  }
}

export class DefaultHttpGetAttributes extends IngestAttributes {
   public constructor() {
     super (IngestProtocol.HTTP_GET, true, false, true,  PayloadFormat.UNSIGNED_PACKAGE, null, '', null, null, null, null, null, null, null, null);
   }
}

export class DefaultHttpPutAttributes extends IngestAttributes {
    public constructor() {
      super (IngestProtocol.HTTP_PUT, true,  false, true, PayloadFormat.UNSIGNED_PACKAGE, null, '', null, null, null, null, null, null, null, null);
    }
}

export class DefaultWebDAVAttributes extends IngestAttributes {
    public constructor() {
      super (IngestProtocol.WEBDAV, true, false, true, PayloadFormat.UNSIGNED_PACKAGE, null, null, null, null, null, null, null, null, null, null );
    }
}

export class DefaultFTPAttributes extends IngestAttributes {
    public constructor() {
      super (IngestProtocol.FILE_UPLOAD, true, false, true, PayloadFormat.UNSIGNED_PACKAGE, null, null, null, null, null, null, null, null, null, null );
    }
}
export class DefaultCustomAWSAttributes extends IngestAttributes {
  public constructor() {
    super (IngestProtocol.SIG_AWS_S3, true, false, true,  PayloadFormat.UNSIGNED_PACKAGE, null, '', null, null, null, null, null, null, null, null);
  }
}
export class DefaultAWSAttributes extends IngestAttributes {
  public constructor() {
    super (IngestProtocol.AWS_S3, true, false, true,  PayloadFormat.UNSIGNED_PACKAGE, null, '', null, null, null, null, null, null, null, null);
  }
}


