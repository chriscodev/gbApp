// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {Injectable} from '@angular/core';
import {DTVService} from '../services/dtv-service.service';
import {DataPackage, DataPackagesUpdate} from './dtv/network/physical/stream/ip/data/DataPackage';
import {MediaStream, MediaStreamsUpdate} from './dtv/network/physical/stream/ip/media/MediaStream';
import {AbstractTransport} from './dtv/network/physical/Transport';
import {AbstractNetwork} from './dtv/network/logical/Network';
import {AbstractOutput} from './dtv/output/Output';
import {AbstractCommitUpdate, DTVServiceCommitUpdate} from './CommitUpdate';
import {ClientModelCollection} from './ClientModelCollection';
import {v4 as uuidv4} from 'uuid';
import * as _swal from 'src/assets/node_modules/sweetalert/sweetalert';
import {SweetAlert} from 'src/assets/node_modules/sweetalert/sweetalert/typings/core';

const swal: SweetAlert = _swal as any;

@Injectable({
  providedIn: 'root',
})
export class ClientDTVServicesModel {
  private lastRequestId: string;

  public constructor(
    private dtvPackageService: DTVService,
    private clientModelCollection: ClientModelCollection
  ) {
  }

  public async updateDTVServiceElements(
    newMediaStreams: MediaStream[],
    newTransports: AbstractTransport[],
    newNetworks: AbstractNetwork[],
    newDataPackages: DataPackage[],
    newOutputs: AbstractOutput[]
  ): Promise<any> {
    // TODO active when integrating ROUTE/MMTP Encoder
    const mediaStreamsCommitUpdate: AbstractCommitUpdate<MediaStream> = new MediaStreamsUpdate([], [], []);
    // this.clientModelCollection.clientMediaStreamsModel.createElementCommitUpdate(newMediaStreams);

    const transportsCommitUpdate: AbstractCommitUpdate<AbstractTransport> =
      this.clientModelCollection.clientTransportsModel.createElementCommitUpdate(
        newTransports
      );

    const networksCommitUpdate: AbstractCommitUpdate<AbstractNetwork> =
      this.clientModelCollection.clientNetworksModel.createElementCommitUpdate(
        newNetworks
      );

    // TODO active when integrating ROUTE/MMTP Encoder
    const dataPackagesCommitUpdate: AbstractCommitUpdate<DataPackage> = new DataPackagesUpdate([], [], []);
    // this.clientModelCollection.clientDataPackagesModel.createElementCommitUpdate(newDataPackages);

    const outputsCommitUpdate: AbstractCommitUpdate<AbstractOutput> =
      this.clientModelCollection.clientOutputsModel.createElementCommitUpdate(
        newOutputs
      );

    const dtvServiceCommitUpdate: DTVServiceCommitUpdate =
      new DTVServiceCommitUpdate(
        mediaStreamsCommitUpdate,
        transportsCommitUpdate,
        networksCommitUpdate,
        dataPackagesCommitUpdate,
        outputsCommitUpdate
      );

    this.lastRequestId = uuidv4();
    localStorage.setItem('lastCommitUpdateRequestId', this.lastRequestId);
    console.log('dtvServiceCommitUpdate: ', dtvServiceCommitUpdate);
    await this.dtvPackageService
      .dtvServiceCommitUpdate(dtvServiceCommitUpdate, this.lastRequestId)
      .subscribe(
        () => {
          // TODO notify User's updated?
          console.log('ClientDTVServicesModel update complete, refreshing...');
          this.clientModelCollection.clientMediaStreamsModel.refresh();
          this.clientModelCollection.clientTransportsModel.refresh();
          this.clientModelCollection.clientNetworksModel.refresh();
          this.clientModelCollection.clientDataPackagesModel.refresh();
          this.clientModelCollection.clientOutputsModel.refresh();
        },
        (error) => {
          this.clientModelCollection.clientMediaStreamsModel.refresh();
          this.clientModelCollection.clientTransportsModel.refresh();
          this.clientModelCollection.clientNetworksModel.refresh();
          this.clientModelCollection.clientOutputsModel.refresh();
          this.clientModelCollection.clientDataPackagesModel.refresh();
          swal('FAILED!', 'Commit Failed with error: ' + error.error.errorMessage, 'error');
          console.log('ClientDTVServicesModel update ERROR', error);
        }
      );
  }
}
