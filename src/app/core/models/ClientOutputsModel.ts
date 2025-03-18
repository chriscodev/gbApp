/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {AbstractDTVServiceClientModel} from './AbstractClientModel';
import {Injectable} from '@angular/core';
import {OutputsService} from '../services/outputs.service';
import {cloneDeep} from 'lodash';
import {isDefined} from './dtv/utils/Utils';
import {
  AbstractOutput,
  ASIOutput,
  ATSC3TranslatorOutput,
  ATSC3UDPOutput,
  NetProcessorOutput,
  NetVXOutput,
  OutputsUpdate,
  OutputType,
  SelenioOutput,
  TABLE_DOMAINS,
  TriveniOutput,
  UDPOutput,
} from './dtv/output/Output';
import {DefaultElementCompareHandler} from './DefaultElementCompareHandler';
import {v4 as uuidv4} from 'uuid';
import {AbstractCommitUpdate} from './CommitUpdate';
import {BehaviorSubject, Observable} from 'rxjs';
import {OutputStatus} from './dtv/output/OutputStatus';
import {StompVariables} from '../subscriptions/stompSubscriptions';
import {NotifyCommitUpdate, SockStompService} from '../services/sock-stomp.service';

@Injectable({
  providedIn: 'root',
})
export class ClientOutputsModel extends AbstractDTVServiceClientModel {
  private static instanceCount = 0;
  public outputSubject: BehaviorSubject<AbstractOutput[]> = new BehaviorSubject<AbstractOutput[]>([]);
  public output$: Observable<AbstractOutput[]> = this.outputSubject.asObservable();
  private outputMap: Map<number, AbstractOutput> = new Map<number, AbstractOutput>();
  public outputStatusSubject: BehaviorSubject<OutputStatus[]> = new BehaviorSubject<OutputStatus[]>([]);
  public outputStatus$: Observable<OutputStatus[]> = this.outputStatusSubject.asObservable();

  public constructor(private outputsService: OutputsService, private sockStompService: SockStompService) {
    super();
    this.sockStompService.addListener(this);
    console.log('ClientOutputsModel constructor outputsService: ',
      outputsService,
      ', instanceCount: ',
      ++ClientOutputsModel.instanceCount
    );
  }

  public refresh(): void {
    this.doTableDomainsRefresh();
    this.doOutputsRefresh();
  }

  public createElementCommitUpdate(
    newOutputs: AbstractOutput[]
  ): AbstractCommitUpdate<AbstractOutput> {
    const elementCompareResults: DefaultElementCompareHandler<AbstractOutput> =
      this.createElementsUpdate(this.getOutputs(), newOutputs);
    console.log('elementCompareResults', elementCompareResults);
    return new OutputsUpdate(
      elementCompareResults.added,
      elementCompareResults.updated,
      elementCompareResults.deletedIds
    );
  }

  public async update(newOutputs: AbstractOutput[]): Promise<any> {
    console.log('ClientOutputsModel update newOutputs: ', newOutputs);
    const outputsUpdate: OutputsUpdate =
      this.createElementCommitUpdate(newOutputs);
    this.lastRequestId = uuidv4();
    console.log('outputsUpdate>>>>>>>>>>>>>>>', outputsUpdate);
    this.outputsService
      .outputsUpdate(outputsUpdate, this.lastRequestId)
      .subscribe(
        () => {
          // this.refresh();
        },
        (error) => {
          console.log('ClientOutputsModel update ERROR', error);
        }
      );
  }

  public getOutputs(): AbstractOutput[] {
    return cloneDeep(Array.from(this.outputMap.values()));
  }

  public getOutputById(outputId: number): AbstractOutput {
    const output: AbstractOutput = this.outputMap.get(outputId);
    return isDefined(output) ? cloneDeep(output) : undefined;
  }

  public notifyStompEvent(topic: string, messageJson: string) {
    console.log('ClientOutputsModel topic: ', topic, ', messageJson: ', messageJson);
    if (topic === StompVariables.stompChannels.notifyCommitUpdate) {
      const notifyCommitUpdate: NotifyCommitUpdate = JSON.parse(messageJson);
      const lastCommitUpdateRequestId: string = localStorage.getItem('lastCommitUpdateRequestId');
      // Refresh from other client
      if (lastCommitUpdateRequestId !== notifyCommitUpdate.requestId) {
        console.log('ClientOutputsModel refreshing from other client, notifyStompEvent: ', topic,
          ', notifyCommitUpdate: ', notifyCommitUpdate, ', lastCommitUpdateRequestId: ', lastCommitUpdateRequestId);
        this.refresh();
      } else {
        console.log('ClientOutputsModel ignoring notifyStompEvent: ', topic,
          ', notifyCommitUpdate: ', notifyCommitUpdate, ', lastCommitUpdateRequestId: ', lastCommitUpdateRequestId);
      }
    }
  }

  private doOutputsRefresh(): void {
    this.outputsService.getOutputs().subscribe((outputs) => {
      console.log('doOutputsRefresh outputs:', outputs);
      this.outputMap.clear();
      outputs.forEach((output) => {
        this.outputMap.set(output.id, output);
        this.addSupportedOutput(output);
      });
      this.outputsService.getAllOutputStatus().subscribe((outputStatuses) => {
        this.outputStatusSubject.next(outputStatuses);
        this.outputSubject.next(outputs);
        console.log('Updated data: getOutputs', this.getOutputs());
        console.log('Output length: ', this.outputMap.size);
      });
    });
  }

  private addSupportedOutput(output: AbstractOutput): void {
    switch (output.outputType) {
      case OutputType.UDP:
        this.outputMap.set(output.id, output as UDPOutput);
        break;
      case OutputType.TRIVENI:
        this.outputMap.set(output.id, output as TriveniOutput);
        break;
      case OutputType.NETVX:
        this.outputMap.set(output.id, output as NetVXOutput);
        break;
      case OutputType.SELENIO:
        this.outputMap.set(output.id, output as SelenioOutput);
        break;
      case OutputType.ASI:
        this.outputMap.set(output.id, output as ASIOutput);
        break;
      case OutputType.NET_PROCESSOR:
        this.outputMap.set(output.id, output as NetProcessorOutput);
        break;
      case OutputType.ATSC3_UDP:
        this.outputMap.set(output.id, output as ATSC3UDPOutput);
        break;
      case OutputType.ATSC3_TRANSLATOR:
        this.outputMap.set(output.id, output as ATSC3TranslatorOutput);
        break;
    }
    console.log('addSupportedOutput output.outputType: ', output.outputType, ', output: ', output
    );
  }

  private doTableDomainsRefresh(): void {
    this.outputsService.getTableDomains().subscribe((tableDomains) => {
      TABLE_DOMAINS.length = 0;
      tableDomains.forEach((tableDomain) => {
        TABLE_DOMAINS.push({
          tableDomain: tableDomain.tableDomain,
          displayName: tableDomain.displayName,
        });
      });
      console.log('TABLE_DOMAINS: ', TABLE_DOMAINS);
    });
  }
}
