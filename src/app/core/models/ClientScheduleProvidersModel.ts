// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {Injectable} from '@angular/core';
import {AbstractDTVServiceClientModel} from './AbstractClientModel';
import {ScheduleProviderService} from '../services/schedule-provider.service';
import {
  AbstractScheduleProvider,
  GenericScheduleProvider,
  OMAESGScheduleProvider,
  OnConnectScheduleProvider,
  OnV3ScheduleProvider,
  PMCPScheduleProvider,
  PMCPTCPScheduleProvider,
  RemoteFileResource,
  RoviScheduleProvider,
  ScheduleProviderStatus,
  ScheduleProvidersUpdate,
  ScheduleProviderType,
  ScheduleSummary,
  TMSDirectScheduleProvider,
  TMSScheduleProvider
} from './dtv/schedule/ScheduleProvider';
import {DefaultElementCompareHandler} from './DefaultElementCompareHandler';
import {v4 as uuidv4} from 'uuid';
import {cloneDeep} from 'lodash';
import {isDefined} from './dtv/utils/Utils';
import {Schedule} from './dtv/schedule/Schedule';
import {AbstractCommitUpdate} from './CommitUpdate';
import {BehaviorSubject, Observable} from 'rxjs';
import {RequestUpdateNotification, SockStompService} from '../services/sock-stomp.service';
import {StompVariables} from '../subscriptions/stompSubscriptions';
import {ServerResourceType} from './server/Server';

@Injectable({
  providedIn: 'root'
})
export class ClientScheduleProvidersModel extends AbstractDTVServiceClientModel {
  private static instanceCount = 0;
  public schedProviderSubject: BehaviorSubject<AbstractScheduleProvider[]> = new BehaviorSubject<AbstractScheduleProvider[]>(
    []);
  public schedProviderSummarySubject: BehaviorSubject<ScheduleSummary[]> = new BehaviorSubject<ScheduleSummary[]>(
    []);
  public resourceDirectoryListingSubject: BehaviorSubject<ServerResourceType> = new BehaviorSubject<ServerResourceType>(
    null);
  public xsltResourceDirectoryListingSubject: BehaviorSubject<RemoteFileResource[]> = new BehaviorSubject<RemoteFileResource[]>(
    null);

  public xsltResourceDirectoryListing$: Observable<RemoteFileResource[]> = this.xsltResourceDirectoryListingSubject.asObservable();
  public schedProvider$: Observable<AbstractScheduleProvider[]> = this.schedProviderSubject.asObservable();
  public schedProviderSummary$: Observable<ScheduleSummary[]> = this.schedProviderSummarySubject.asObservable();
  public resourceDirectoryListing$: Observable<ServerResourceType> = this.resourceDirectoryListingSubject.asObservable();
  public scheduleProviderSummaryList: ScheduleSummary[];
  private providerMap: Map<number, AbstractScheduleProvider> = new Map<number, AbstractScheduleProvider>();
  private scheduleMap: Map<number, Schedule> = new Map<number, Schedule>();
  private scheduleToProviderMap: Map<number, AbstractScheduleProvider> = new Map<number, AbstractScheduleProvider>();

  public constructor(private scheduleProviderService: ScheduleProviderService,
                     private sockStompService: SockStompService) {
    super();
    console.log('ClientScheduleProvidersModel constructor scheduleProviderService: ', scheduleProviderService,
      ', instanceCount: ',
      ++ClientScheduleProvidersModel.instanceCount);
    this.sockStompService.addListener(this);
  }

  public refresh() {
    this.doScheduleProvidersRefresh();
    this.doScheduleProvidersSummaryRefresh();
    this.doESGResourceDirectoryListingRefresh();
    this.doXSLTResourceDirectoryListingRefresh();
  }

  public createElementCommitUpdate(newScheduleProviders: AbstractScheduleProvider[]): AbstractCommitUpdate<AbstractScheduleProvider> {
    const elementCompareResults: DefaultElementCompareHandler<AbstractScheduleProvider> = this.createElementsUpdate(
      this.getScheduleProviders(), newScheduleProviders);
    return new ScheduleProvidersUpdate(elementCompareResults.added, elementCompareResults.updated,
      elementCompareResults.deletedIds);
  }

  public update(newScheduleProviders: AbstractScheduleProvider[]) {
    const scheduleProvidersUpdate: ScheduleProvidersUpdate = this.createElementCommitUpdate(newScheduleProviders);
    this.lastRequestId = uuidv4();
    this.scheduleProviderService.scheduleProvidersUpdate(scheduleProvidersUpdate, this.lastRequestId).subscribe(
      () => {
        this.refresh();
        console.log('ClientScheduleProvidersModel update refresh is called...');
      },
      (error) => {
        console.log('ClientScheduleProvidersModel update ERROR', error);
      }
    );
  }

  public getScheduleProviders(): AbstractScheduleProvider[] {
    return cloneDeep(Array.from(this.providerMap.values()));
  }

  public getScheduleProviderById(scheduleProviderId: number): AbstractScheduleProvider {
    const scheduleProvider: AbstractScheduleProvider = this.providerMap.get(scheduleProviderId);
    return isDefined(scheduleProvider) ? cloneDeep(scheduleProvider) : undefined;
  }

  public getScheduleById(scheduleId: number): Schedule {
    const schedule: Schedule = this.scheduleMap.get(scheduleId);
    return isDefined(schedule) ? cloneDeep(schedule) : undefined;
  }

  public getProviderFromSchedule(scheduleId: number): Schedule {
    const scheduleProvider: AbstractScheduleProvider = this.scheduleToProviderMap.get(scheduleId);
    return isDefined(scheduleProvider) ? cloneDeep(scheduleProvider) : undefined;
  }

  public notifyStompEvent(topic: string, messageJson: string) {
    console.log('ClientScheduleProvidersModel topic: ', topic);
    if (topic === StompVariables.stompChannels.notifyScheduleProvidersUpdate) {
      const requestUpdateNotification: RequestUpdateNotification = JSON.parse(messageJson);
      // Refresh from other client and successful
      console.log(
        'ClientScheduleProvidersModel notifyStompEvent this.lastRequestId: ', this.lastRequestId,
        ', requestUpdateNotification.requestId: ', requestUpdateNotification.requestId);
      if (this.lastRequestId !== requestUpdateNotification.requestId &&
        requestUpdateNotification.success) {
        console.log('ClientScheduleProvidersModel refreshing from other client, notifyStompEvent: ', topic,
          ', requestUpdateNotification: ',
          requestUpdateNotification, ', this.lastRequestId: ', this.lastRequestId);
        this.refresh();
      }
    }

    if (topic === StompVariables.stompChannels.notifyScheduleProviderStatusUpdate) {
      // Refresh from schedules update
      console.log('ClientScheduleProvidersModel refreshing from server updated status');
      this.refresh();
    }
  }

  public getScheduleProvidersStatus(scheduleProviderId: number): Observable<ScheduleProviderStatus> {
    return this.scheduleProviderService.getScheduleProvidersStatus(scheduleProviderId);
  }

  private addSupportedScheduleProvider(scheduleProvider: AbstractScheduleProvider): void {
    switch (scheduleProvider.scheduleProviderType) {
      case ScheduleProviderType.TMS:
        this.providerMap.set(scheduleProvider.id, scheduleProvider as TMSScheduleProvider);
        break;
      case ScheduleProviderType.PMCP:
        this.providerMap.set(scheduleProvider.id, scheduleProvider as PMCPScheduleProvider);
        break;
      case ScheduleProviderType.GENERIC:
        this.providerMap.set(scheduleProvider.id, scheduleProvider as GenericScheduleProvider);
        break;
      case ScheduleProviderType.ROVI:
        this.providerMap.set(scheduleProvider.id, scheduleProvider as RoviScheduleProvider);
        break;
      case ScheduleProviderType.TMS_DIRECT:
        this.providerMap.set(scheduleProvider.id, scheduleProvider as TMSDirectScheduleProvider);
        break;
      case ScheduleProviderType.PMCP_TCP:
        this.providerMap.set(scheduleProvider.id, scheduleProvider as PMCPTCPScheduleProvider);
        break;
      case ScheduleProviderType.ON_CONNECT:
        this.providerMap.set(scheduleProvider.id, scheduleProvider as OnConnectScheduleProvider);
        break;
      case ScheduleProviderType.ON_V3:
        this.providerMap.set(scheduleProvider.id, scheduleProvider as OnV3ScheduleProvider);
        break;
      case ScheduleProviderType.OMA_INGEST:
        this.providerMap.set(scheduleProvider.id, scheduleProvider as OMAESGScheduleProvider);
        break;
    }
    scheduleProvider.schedules?.forEach(schedule => {
      this.scheduleMap.set(schedule.id, schedule);
      this.scheduleToProviderMap.set(schedule.id, scheduleProvider);
    });
    console.log('addSupportedScheduleProvider scheduleProvider.scheduleProviderType: ',
      scheduleProvider.scheduleProviderType, ', scheduleProvider: ', scheduleProvider);
  }

  private doScheduleProvidersRefresh(): void {
    this.scheduleProviderService.getScheduleProviders().subscribe(scheduleProviders => {
      console.log('doScheduleProvidersRefresh scheduleProviders: ', scheduleProviders);
      this.providerMap.clear();
      this.scheduleMap.clear();
      this.scheduleToProviderMap.clear();
      scheduleProviders?.forEach(scheduleProvider => {
        this.addSupportedScheduleProvider(scheduleProvider);
      });
      this.schedProviderSubject.next(scheduleProviders);
      console.log('providerMap length: ', this.providerMap.size);
      console.log('scheduleMap length: ', this.scheduleMap.size);
      console.log('scheduleToProviderMap length: ', this.scheduleToProviderMap.size);
      this.fireModelChangedEvent();
    });
  }

  private doScheduleProvidersSummaryRefresh(): void {
    this.scheduleProviderService.getScheduleProvidersSummary().subscribe(scheduleProvidersSummary => {
      this.schedProviderSummarySubject.next(scheduleProvidersSummary);
      this.scheduleProviderSummaryList = scheduleProvidersSummary;
    });
  }

  // TODO stomp update
  private doESGResourceDirectoryListingRefresh(): void {
    this.scheduleProviderService.getESGResourceDirectoryListing().subscribe(resourceDirectoryListing => {
      console.log('doResourceDirectoryListingRefresh: ', resourceDirectoryListing);
      this.resourceDirectoryListingSubject.next(resourceDirectoryListing);
    });
  }


  private doXSLTResourceDirectoryListingRefresh(): void {
    this.scheduleProviderService.getXSLTResourceDirectoryListing().subscribe(xslts => {
      const xsltDirectoryListingWithIds: RemoteFileResource[] = [];
      let xsltId = 1;
      console.log('doXSLTResourceDirectoryListingRefresh xslts: ', xslts);
      xslts.forEach(xslt => xsltDirectoryListingWithIds.push(
        new RemoteFileResource(xslt.name, xslt.downloadRelativePath, xslt.lastModified, xslt.length,
          xsltId++)));
      this.xsltResourceDirectoryListingSubject.next(xsltDirectoryListingWithIds);
    });
  }
}
