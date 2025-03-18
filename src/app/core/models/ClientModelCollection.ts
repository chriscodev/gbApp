/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {Injectable} from '@angular/core';
import {ClientUsersModel} from './ClientUsersModel';
import {AbstractClientModel} from './AbstractClientModel';
import {ClientOutputsModel} from './ClientOutputsModel';
import {ClientTransportsModel} from './ClientTransportsModel';
import {ClientNetworksModel} from './ClientNetworksModel';
import {ClientDataPackagesModel} from './ClientDataPackagesModel';
import {ClientMediaStreamsModel} from './ClientMediaStreamsModel';
import {ClientScheduleProvidersModel} from './ClientScheduleProvidersModel';
import {ClientLicenseModel} from './ClientLicenseModel';
import {ClientCertsModel} from './ClientCertsModel';
import {ClientCertRequestModel} from './ClientCertRequestsModel';
import {ClientServerModel} from './ClientServerModel';
import {ClientAlarmModel} from './ClientAlarmModel';
import {ClientNetworkSettingsModel} from './ClientNetworkSettingsModel';
import {ClientSmnpModel} from './ClientSnmpModel';
import {ClientLogModel} from './ClientLogModel';
import {ClientLocationSettingsModel} from './ClientLocationSettingsModel';
import {ClientSmtpModel} from './ClientSmtpModel';
import {ClientRedundancyModel} from './ClientRedundancyModel';
import {ClientServiceExportModel} from './ClientServiceExportModel';

@Injectable({
  providedIn: 'root'
})
export class ClientModelCollection {
  private clientModels: AbstractClientModel[] = [];

  public constructor(public clientServerModel: ClientServerModel,
                     public clientUsersModel: ClientUsersModel,
                     public clientOutputsModel: ClientOutputsModel,
                     public clientTransportsModel: ClientTransportsModel,
                     public clientNetworksModel: ClientNetworksModel,
                     public clientDataPackagesModel: ClientDataPackagesModel,
                     public clientMediaStreamsModel: ClientMediaStreamsModel,
                     public clientScheduleProvidersModel: ClientScheduleProvidersModel,
                     public clientLicenseModel: ClientLicenseModel,
                     public clientCertsModel: ClientCertsModel,
                     public clientCertRequestsModel: ClientCertRequestModel,
                     public clientAlarmModel: ClientAlarmModel,
                     public clientNetworkSettingsModel: ClientNetworkSettingsModel,
                     public clientSNMPModel: ClientSmnpModel,
                     public clientLogModel: ClientLogModel,
                     public clientLocationSettingsModel: ClientLocationSettingsModel,
                     public ClientSMTPModel: ClientSmtpModel,
                     public clientRedundancyModel: ClientRedundancyModel,
                     public clientServiceExportModel: ClientServiceExportModel) {
    console.log('ClientModelCollection constructor');
    this.clientModels.push(clientServerModel);
    this.clientModels.push(clientUsersModel);
    this.clientModels.push(clientOutputsModel);
    this.clientModels.push(clientTransportsModel);
    this.clientModels.push(clientNetworksModel);
    this.clientModels.push(clientDataPackagesModel);
    this.clientModels.push(clientMediaStreamsModel);
    this.clientModels.push(clientScheduleProvidersModel);
    this.clientModels.push(clientLicenseModel);
    this.clientModels.push(clientCertsModel);
    this.clientModels.push(clientCertRequestsModel);
    this.clientModels.push(clientAlarmModel);
    this.clientModels.push(clientNetworkSettingsModel);
    this.clientModels.push(clientSNMPModel);
    this.clientModels.push(clientLogModel);
    this.clientModels.push(clientLocationSettingsModel);
    this.clientModels.push(ClientSMTPModel);
    this.clientModels.push(clientRedundancyModel);
    this.clientModels.push(clientServiceExportModel);

    // Refresh so can access Welcome Message
    clientLocationSettingsModel.refresh();
  }

  public refresh(): void {
    let index = 1;
    console.log('ClientModelCollection refresh>');
    this.clientModels.forEach(clientModel => {
      console.log('Refreshing Client Model (', clientModel.constructor.name, ') ', index++, ' of ',
        this.clientModels.length);
      clientModel.refresh();
    });
  }
}
