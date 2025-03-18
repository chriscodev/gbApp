/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import { Deserializable } from './deserializable.model';
export class ServerLicenseInfo implements Deserializable {
  aeaexceeded: boolean;
  aeanrtexceeded: boolean;
  backup: boolean;
  correctDongle: boolean;
  dongleAttached: boolean;
  esgexceeded: boolean;
  expired: boolean;
  guestOSVMExceeded: boolean;
  licenseCapabilityExceeded: boolean;
  licenseType: string;
  majorNumbersExceeded: boolean;
  measexceeded: boolean;
  mmtexceeded: boolean;
  newLicenseRequired: boolean;
  nodeLockValid: boolean;
  outputsExceeded: boolean;
  providersExceeded: boolean;
  routeencoderEnabled: boolean;
  routesExceeded: boolean;
  serverLicense: ServerLicense;
  serverLicenseText: string;
  serviceExportExceeded: boolean;
  servicesExceeded: boolean;
  transportsExceeded: boolean;
  unlicensedInputTypes: Array<string>;
  unlicensedNetworkTypes: Array<string>;
  unlicensedOutputTypes: Array<string>;
  valid: boolean;
  cloudFloatingLicenseGracePeriodMinutes:number;

  deserialize(input: any): this {
    return Object.assign(this, input);
  }
}

export class ServerLicense {
  activationPassword: string;

  aeaenabled: boolean;
  aeaEnabled: boolean;

  aeanrtenabled: boolean;
  aeaNrtEnabled:boolean;

  cloudFloatingLicenseEnabled: boolean;
  creationDate: number;

  dashserverEnabled: boolean;

  esgEnabled: boolean;
  esgenabled: boolean;

  guestOSVMEnabled: boolean;
  installationId: string;
  installationName: string;
  licenseExpirationDate: any;
  licenseId: number;
  licenseType: string;
  licensedInputTypes: Array<string>;
  licensedNetworkTypes: Array<string>;
  licensedOutputTypes: Array<string>;
  enabledOutputsList: Array<string>;

  maxInputs: number;
  maxMajorNumbers: number;
  maxOutputs: number;
  maxRoutes: number;
  maxServices: number;
  maxTransports: number;

  measenabled: boolean;
  measEnabled: boolean;

  mmtenabled: boolean;
  mmtEnabled: boolean;

  nodeLockType: string;
  productId: number;

  routeencoderEnabled: boolean;
  routeEncoderEnabled: boolean;

  serviceExportEnabled: boolean;
  systemType: string;
  version: string;

  cloudFloatingLicenseGracePeriodMinutes:number;
}

export class LicenseData {
  licenseId: number;
  activationPassword: string;
  installationName: string;
  restartOnSuccess: boolean;
  accepted?: boolean;
  message?: string;
  activationRequestString?: any;
}

export class ApplyOffData {
  responseString: string;
  activation: boolean;
  restartOnSuccess: boolean;
  accepted?: boolean;
  message?: string;
}
