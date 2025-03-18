// Copyright (c) 2023 Triveni Digital, Inc. All rights reserved.

export class AppAttributes {
  public constructor(public appContextIdList: string, public appId: string,
                     public defaultApp: boolean, public requiredCapabilities: string, public packageNameUrl: string,
                     public bcastEntryPageUrl: string, public bbandEntryPageUrl: string, public appRendering: boolean,
                     public validFromTime: string, public validUntilTime: string,
                     public clearAppContextCacheTime: string, public coupledServices: number[],
                     public lctTSIRef: number[], public filterCodes: number[], public b64XmlHeld: string) {
  }
}

export class DefaultAppAttributes extends AppAttributes {
  public constructor(){
    super(null, null, false, null, null , null, null, false, null, null, null, null, null, null, null ) ;
}
}
