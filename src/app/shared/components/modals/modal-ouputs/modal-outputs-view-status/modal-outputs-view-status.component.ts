/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {TreeviewConfig, TreeviewItem} from 'ngx-treeview';
import {changeDateFormat, convertTransportType, formatOutputState} from '../../../../helpers/appWideFunctions';
import {first, takeUntil, tap} from 'rxjs/operators';
import {base64ToByteArray, byteArrayToAsciiDump, byteArrayToHexDump, convertDecToHex} from '../../../../helpers/decimalToHexadecimal';
import {OutputsService} from '../../../../../core/services/outputs.service';
import {AbstractOutput, OutputType} from '../../../../../core/models/dtv/output/Output';
import {ServiceGroupStatistics} from '../../../../../core/models/dtv/output/OutputStatus';
import {StreamData, TableHexRow, TableTransportData, TransportStatusData} from '../../../../../core/interfaces/TransportStreamTableInterface';


@Component({
  selector: 'app-modal-outputs-view-status',
  templateUrl: './modal-outputs-view-status.component.html',
  styleUrls: ['./modal-outputs-view-status.component.scss']
})
export class ModalOutputsViewStatusComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  @Input() output: AbstractOutput;
  @Input() modalContentTitle: string;
  @Output() outputStatusModalClose: EventEmitter<any> = new EventEmitter();
  public outputsDataObject: any = {};
  public transportsStatus: TreeviewItem[];
  public transportData: TableTransportData;
  public transportStatusData: TransportStatusData;
  public config = TreeviewConfig.create({
    hasAllCheckBox: false,
    maxHeight: 500,
  });
  public isShowTable = false;
  public treeData: StreamData[] = [];
  public statusUpdateTimer: number;
  public headerTabs = [
    {tabName: 'Status', activeId: 1},
    {tabName: 'Tables', activeId: 2},
    {tabName: 'Routes', activeId: 3},
    {tabName: 'Sockets', activeId: 4},
    {tabName: 'Groups', activeId: 5}
  ];
  public activeId = 1;
  public hexHeaders: string[] = [];
  public hexRows: TableHexRow[] = [];
  public selectedNodeTemplate: string;
  private subscriptions: Subscription[] = [];
  private activeText$: BehaviorSubject<string> = new BehaviorSubject('');

  constructor(
    private outputService: OutputsService,
  ) {
    this.hexHeaders = this.generateHexHeaders();
  }

  public ngOnInit(): void {
    this.initializeDynamicTabs();
    this.statusUpdateTimer = window.setInterval(() => {
      this.getOutputStatusData();
    }, 1000);
  }

  public clickedNode(event: any) {
    this.selectedNodeTemplate = event.type;
    if (event.type === 'Table') {
      const localTableTransportData: TableTransportData = {
        title: event.type,
        name: event.name,
        tableDomain: event.tableDomain,
        tableTypeId: event.tableTypeId,
        tableTypeIdHex: ' 0x' + convertDecToHex(event.tableTypeId),
        pid: event.pid,
        pidHex: ' 0x' + convertDecToHex(event.pid),
        size: event.size,
        version: event.version,
        intervalInMillis: event.intervalInMillis + ' ms',
        transmitPriority: event.transmitPriority,
        lastEncoded: changeDateFormat(event.lastEncoded)?.replace(/\w+[.!?]?$/, ''),
        transportId: event.transportId
      };
      this.transportData = localTableTransportData as TableTransportData;
    } else {
      const localTransportStatusData: TransportStatusData =  {
        title: event.type,
        lastEncodeStartTime: changeDateFormat(event.lastEncodeStartTime)?.replace(/\w+[.!?]?$/, ''),
        lastEncodeEndTime: changeDateFormat(event.lastEncodeEndTime)?.replace(/\w+[.!?]?$/, ''),
        transport: {
          name: event.name,
          transportType: convertTransportType(event.transportType),
          tsid: event.tsid,
          tsidHex: ' 0x' + convertDecToHex(event.tsid),
          id: event.id,
        }
      };
      this.transportStatusData = localTransportStatusData as TransportStatusData;
    }
  }

  public showTable() {
    this.isShowTable = !this.isShowTable;
    this.subscriptions.push(
      this.outputService
        .getTransportTable(this.outputsDataObject.id, this.transportData.transportId, this.transportData.name)
        .pipe(
          first(),
          tap((transportTable) => {
            this.processBase64Data(transportTable.b64Buffer);
          })
        )
        .subscribe()
    );
  }

  public closeViewModal() {
    this.outputStatusModalClose.emit('viewOutputStatusNew');
  }

  public ngOnDestroy() {
    clearInterval(this.statusUpdateTimer);
    this.destroy$.next(null);
    this.destroy$.complete();
    this.destroy$.unsubscribe();
    this.subscriptions?.forEach((sub) => sub.unsubscribe());
  }

  public activeIdChangedHandler(id: number) {
    this.activeId = id;
  }

  private initializeDynamicTabs() {
    switch (this.output.outputType) {
      case OutputType.ASI:
        this.headerTabs = [
          {tabName: 'Status', activeId: 1},
          {tabName: 'Tables', activeId: 2},
          {tabName: 'Transport Stream', activeId: 3},

        ];
        break;
      case OutputType.ATSC3_UDP:
        this.headerTabs = [
          {tabName: 'Status', activeId: 1},
          {tabName: 'Sockets', activeId: 4},
          {tabName: 'Groups', activeId: 5}
        ];
        break;
      case OutputType.UDP:
        this.headerTabs = [
          {tabName: 'Status', activeId: 1},
          {tabName: 'Tables', activeId: 2},
          {tabName: 'Routes', activeId: 3},
        ];
        break;
      default:
        this.headerTabs = [
          {tabName: 'Status', activeId: 1},
          {tabName: 'Tables', activeId: 2},
        ];
        break;
    }
  }

  private getOutputStatusData() {
    this.subscriptions.push(
      this.outputService
        .getOutputStatusById(this.output.id)
        .pipe(
          first(),
          tap((outputStatus) => {
            this.outputsDataObject = {...this.output, ...outputStatus};
            this.formatOutputStatusDisplay();
          })
        )
        .subscribe()
    );
  }

  private formatOutputStatusDisplay() {
    const propertiesToFormat = [
      'lastEncodeStartTime',
      'lastEncodeEndTime',
      'lastOutputUpdateStartTime',
      'lastOutputUpdateEndTime'
    ];

    propertiesToFormat.forEach(property => {
      this.outputsDataObject[property] = changeDateFormat(this.outputsDataObject[property]);
    });
    this.outputsDataObject.lastUpdateTime = changeDateFormat(this.outputsDataObject.lastUpdateTime);

    this.outputsDataObject.updateStatus = formatOutputState(
      this.outputsDataObject.outputState
    );

    if (this.outputsDataObject?.outputType === OutputType.ATSC3_UDP) {
      this.outputsDataObject.plpStatisticsText = this.formatPLPDisplay(
        this.outputsDataObject.serviceGroupStatistics
      );

      this.outputsDataObject.lines =
        (this.outputsDataObject.plpStatisticsText?.match(/\n/g) || '')
          ?.length + 1;
    }

    this.formatTransportsStatus(this.outputsDataObject.transportsStatus);
  }

  private formatTransportsStatus(transportsStatus: any) {
    this.activeText$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (transportsStatus) {
        for (const v of transportsStatus) {
          v.tablesStatus.sort((a: { transmitPriority: number; name: string; }, b: { transmitPriority: number; name: any; }) => {
            if (a.transmitPriority !== b.transmitPriority) {
              return b.transmitPriority - a.transmitPriority;
            } else {
              return a.name.localeCompare(b.name);
            }
          });
          const tableStatusArray = v.tablesStatus?.map((x: any) => {
            return {
              data: {
                active: false,
                name: x.name,
                type: 'Table',
                intervalInMillis: x.intervalInMillis,
                lastEncoded: x.lastEncoded,
                pid: x.pid,
                size: x.size,
                tableDomain: x.tableDomain,
                tableTypeId: x.tableTypeId,
                transmitPriority: x.transmitPriority,
                version: x.version,
                transportId: v.transport.id
              }
            };
          });
          const treePartialData: StreamData =
            {
              data: {
                active: false,
                name: v.transport.name,
                type: 'Transport Stream',
                transportType: v.transport.transportType,
                tsid: v.transport.tsid,
                id: v.transport.id,
                lastEncodeStartTime: v.lastEncodeStartTime,
                lastEncodeEndTime: v.lastEncodeEndTime,
              },
              children: tableStatusArray
            };

          this.treeData.push(treePartialData);
        }
      }
    });
  }

  private formatPLPDisplay(plpStatistics: ServiceGroupStatistics[]) {
    const plpStatisticsTextArr = [];
    if (plpStatistics) {
      for (const v of plpStatistics) {
        plpStatisticsTextArr.push(v.formattedSummary);
      }
    }
    return plpStatisticsTextArr?.join('');
  }

  private processBase64Data(b64buffer: string) {
    const byteArray = base64ToByteArray(b64buffer);
    this.hexRows = this.generateRows(byteArray);
  }

  private generateHexHeaders(): string[] {
    const headers: string[] = ['']; // Initial empty header
    for (let i = 0; i < 16; i++) {
      headers.push('+' + i.toString(16).toUpperCase());
    }
    headers.push('ASCII Dump'); // Add "ASCII Dump" as the last header
    return headers;
  }

  private generateRows(byteArray: Uint8Array): TableHexRow[] {
    const rows = [];
    const numRows = Math.ceil(byteArray.length / 16);

    for (let i = 0; i < numRows; i++) {
      const offset = i * 16;
      const slice = byteArray.slice(offset, offset + 16);
      const hexArray = byteArrayToHexDump(slice);
      while (hexArray.length < 16) {
        hexArray.push('');
      }

      const asciiArray = byteArrayToAsciiDump(slice);
      rows.push({
        offsetHeader: '0x' + offset.toString(16).padStart(1, '0'),
        hex: hexArray,
        ascii: asciiArray.join(''),
      });
    }
    return rows;
  }

}
