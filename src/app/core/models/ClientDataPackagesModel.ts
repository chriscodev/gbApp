// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {AbstractDTVServiceClientModel} from './AbstractClientModel';
import {DataPackage, DataPackagesUpdate} from './dtv/network/physical/stream/ip/data/DataPackage';
import {DataPackageService} from '../services/data-package.service';
import {isDefined} from './dtv/utils/Utils';
import {cloneDeep} from 'lodash';
import {ResolvedATSC3Transport} from './dtv/network/physical/Transport';
import {DefaultElementCompareHandler} from './DefaultElementCompareHandler';
import {v4 as uuidv4} from 'uuid';
import {Injectable} from '@angular/core';
import {AbstractCommitUpdate} from './CommitUpdate';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientDataPackagesModel extends AbstractDTVServiceClientModel {
  private static instanceCount = 0;
  public dataPackagesSubject: BehaviorSubject<DataPackage[]> = new BehaviorSubject<DataPackage[]>([]);
  public dataPackages$: Observable<DataPackage[]> = this.dataPackagesSubject.asObservable();
  private dataPackageMap: Map<number, DataPackage> = new Map<number, DataPackage>();
  private resolvedATSC3TransportMap: Map<number, ResolvedATSC3Transport> = new Map<number, ResolvedATSC3Transport>();

  public constructor(private dataPackageService: DataPackageService) {
    super();
    console.log('ClientDataPackagesModel constructor dataPackageService: ', dataPackageService, ', instanceCount: ',
      ++ClientDataPackagesModel.instanceCount);
  }

  public refresh() {
    this.doDataPackageRefresh();
    this.doResolvedATSC3TransportRefresh();
  }

  public createElementCommitUpdate(newDataPackages: DataPackage[]): AbstractCommitUpdate<DataPackage> {
    const elementCompareResults: DefaultElementCompareHandler<DataPackage> = this.createElementsUpdate(
      this.getDataPackages(), newDataPackages);
    return new DataPackagesUpdate(elementCompareResults.added, elementCompareResults.updated,
      elementCompareResults.deletedIds);
  }

  public async update(newDataPackages: DataPackage[]): Promise<any> {
    console.log('ClientDataPackagesModel update newDataPackages: ', newDataPackages);
    const dataPackagesUpdate: DataPackagesUpdate = this.createElementCommitUpdate(newDataPackages);
    this.lastRequestId = uuidv4();
    await this.dataPackageService.dataPackagesUpdate(dataPackagesUpdate, this.lastRequestId).subscribe(
      () => {
        console.log('ClientDataPackageModel update complete, refreshing...');
        this.refresh();
      },
      (error) => {
        console.log('ClientDataPackagesModel update ERROR', error);
      }
    );
  }

  public getDataPackages(): DataPackage[] {
    return cloneDeep(Array.from(this.dataPackageMap.values()));
  }

  public getDataPackageById(dataPackageId: number): DataPackage {
    const dataPackage: DataPackage = this.dataPackageMap.get(dataPackageId);
    return isDefined(dataPackage) ? cloneDeep(dataPackage) : undefined;
  }

  public getResolvedATSC3Transports(): ResolvedATSC3Transport[] {
    return cloneDeep(Array.from(this.resolvedATSC3TransportMap.values()));
  }

  public getResolvedATSC3TransportById(dataPackageId: number): ResolvedATSC3Transport {
    const atsc3Transport: ResolvedATSC3Transport = this.resolvedATSC3TransportMap.get(dataPackageId);
    return isDefined(atsc3Transport) ? cloneDeep(atsc3Transport) : undefined;
  }

  public notifyStompEvent(topic: string, messageJson: string) {
    console.log('ClientDataPackagesModel notifyStompEvent: ', topic, ', messageJson: ',
      messageJson);
    // TODO finish implementation DAC
  }

  private doDataPackageRefresh() {
    this.dataPackageService.getDataPackages().subscribe(dataPackages => {
      this.dataPackageMap.clear();
      this.dataPackagesSubject.next(dataPackages);
      dataPackages?.forEach(dataPackage => {
        this.dataPackageMap.set(dataPackage.id, dataPackage);
        console.log('adding dataPackage: ', dataPackage);
      });
      console.log('dataPackageMap length: ', this.dataPackageMap.size);
    });
  }

  private doResolvedATSC3TransportRefresh() {
    this.dataPackageService.getResolvedAtsc3Transports().subscribe(atsc3Transports => {
      this.resolvedATSC3TransportMap.clear();
      atsc3Transports?.forEach(atsc3Transport => {
        this.resolvedATSC3TransportMap.set(atsc3Transport.id, atsc3Transport);
      });
      console.log('resolvedATSC3TransportMap length: ', this.resolvedATSC3TransportMap.size);
    });
  }
}
