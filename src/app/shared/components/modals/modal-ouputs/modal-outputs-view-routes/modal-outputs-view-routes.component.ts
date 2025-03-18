// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.

import {Component, Input, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {changeDateTimeFormat, convertBytesToSpeed} from '../../../../helpers/appWideFunctions';
import {isDefined, isEmptyValue} from '../../../../../core/models/dtv/utils/Utils';
import {Chart, ChartConfiguration, ChartOptions, registerables} from 'chart.js';
import {first, tap} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {OutputsService} from '../../../../../core/services/outputs.service';
import {OutputStatus, PIDGroupBitrate, StreamedTransportStatus} from 'src/app/core/models/dtv/output/OutputStatus';
import {
  AbstractOutput,
  MPEGRoute,
  OutputType,
  RGB_COLOR,
  TranslatedUDPRoute,
  UDPOutput
} from '../../../../../core/models/dtv/output/Output';
import {convertDecToHex} from '../../../../helpers/decimalToHexadecimal';
import {TRANSPORT_TYPES, TransportType} from '../../../../../core/models/dtv/network/physical/Transport';

@Component({
  selector: 'app-modal-outputs-view-routes',
  templateUrl: './modal-outputs-view-routes.component.html',
  styleUrls: ['./modal-outputs-view-routes.component.scss']
})
export class ModalOutputsViewRoutesComponent implements OnInit, OnChanges, OnDestroy {
  protected readonly convertBytesToSpeed = convertBytesToSpeed;
  protected readonly isDefined = isDefined;
  protected readonly OutputType = OutputType;
  protected readonly isEmptyValue = isEmptyValue;
  @Input() outputsDataObject: OutputStatus;
  @Input() outputLocal: AbstractOutput;
  public output: UDPOutput;
  public udpRoutes: MPEGRoute[];
  public translatedUDPRoutes: TranslatedUDPRoute[];
  public selectedUDPRoute: MPEGRoute;
  public tableHeadersUDPRoutes = [
    {header: 'Transport Name', key: 'transportName', visible: true, translateField: true},
    {header: 'TSID', key: 'tsid', visible: true, translateField: true},
    {header: 'Address', key: 'address', visible: true},
    {header: 'Port', key: 'port', visible: true},
    {header: 'Bitrate', key: 'maxBitrate', visible: true, function: this.convertBytesFormat},
    {header: 'Enabled', key: 'enabled', visible: true, showOnline: true},
  ];
  public buttonListUDPR = [];
  public bitRateMbps = 0;
  public headerTabs = [
    {tabName: 'Histogram', activeId: 1},
    {tabName: 'Percentage', activeId: 2},
    {tabName: 'Rate', activeId: 3},
  ];
  public activeId = 1;
  public lastUpdateData: string;
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: '',
        fill: true,
        tension: 0.5,
        borderColor: 'blue',
        backgroundColor: 'blue'
      }
    ]
  };
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    animation: false,
    scales: {
      x: {
        stacked: true // Enable stacking on X-axis
      },
      y: {
        stacked: true, // Enable stacking on Y-axis
      }
    },
  };
  public lineChartLegend = true;
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    datasets: [
      {
        data: [],
        label: '',
      }
    ]
  };
  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    indexAxis: 'y',
    animation: false,
  };
  public barChartLegend = false;

  public pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: '',
      }
    ]
  };
  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: false,
    animation: false,
  };
  public pieChartLegend = true;
  public outputsDataInterval: number;
  public transportStatusArray: OutputStatus;
  private subscriptions: Subscription[] = [];

  constructor(
    private outputService: OutputsService,
  ) {
    Chart.register(...registerables);
    Chart.defaults.color = '#ffffff';
  }
  public ngOnInit() {
    this.output = this.outputLocal as UDPOutput;
    this.getOutputStatusData();
    this.getOutputsDataInterval();
  }

  public getOutputsDataInterval(){
    this.outputsDataInterval = window.setInterval( () => {
    this.getOutputStatusData();
    }, 5000);
  }

  public ngOnChanges() {
    if (isDefined(this.output?.udpRoutes)){
      this.translatedUDPRoutes = this.getTranslatedUdpRoute();
      this.udpRoutes = this.output.udpRoutes as MPEGRoute[];
    }
  }

  public getLastUpdateData(dateTime: string){
    const rawDateTime = changeDateTimeFormat(dateTime);
    const dateTimeParts = rawDateTime.split(' ');
    return dateTimeParts[0] + ' ' + dateTimeParts[1];
  }

  public selectUDPRoute(event: MPEGRoute) {
    this.selectedUDPRoute = event;
    this.getSampleGroupBitrateData();
  }

  public getTranslatedUdpRoute(){
    const translatedUDPRoutes: TranslatedUDPRoute[] = [];
    this.output.udpRoutes.map(( udpRoute ) => {
      const match = this.outputsDataObject.transportsStatus.find(item => item.transport.id === udpRoute.transportId);
      if (match) {
        translatedUDPRoutes.push(new TranslatedUDPRoute(udpRoute.id, udpRoute.clientId, match.transport.name, match.transport.tsid));
      }
    });
    return translatedUDPRoutes;
  }
  public activeIdChangedHandler(id: number){
    this.activeId = id;
  }

  public ngOnDestroy(){
    clearInterval(this.outputsDataInterval);
    this.subscriptions?.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  public convertTSID(transportTSID: number){
    return convertDecToHex(transportTSID);
  }

  public getTransportTypeDisplayName(transportType: TransportType): string {
     return TRANSPORT_TYPES[transportType]?.displayName || transportType?.toString();
  }

  private convertBytesFormat(bytes: number){
    return convertBytesToSpeed(bytes);
  }


  private setDataToBarChart(groupedData: { [x: string]: any[]; }){
    const labels = Object.keys(groupedData);
    const datasets = {
      data: labels.map(key => groupedData[key][0]),
      backgroundColor: labels.map(label => RGB_COLOR[label].displayValue ),
    };
    this.barChartData = {
      labels,
      datasets: [datasets]
    };
  }

  private getOrder(pidGroupName: string){
    return (pidGroupName === 'PSI') ? 3 :
      (pidGroupName === 'PSIP') ? 2 :
        (pidGroupName === 'NULL') ? 1 : -1;
  }

  private setDataToLineChart(groupBitRatesData: any[], groupedData: { [x: string]: any; }){
    const datasets = Object.keys(groupedData).map(pidGroupName => {
      return {
        data: groupedData[pidGroupName],
        label: pidGroupName,
        fill: true,
        backgroundColor: RGB_COLOR[pidGroupName].displayValue,
        tension: 0,
        borderColor: RGB_COLOR[pidGroupName].displayValue,
        order: this.getOrder(pidGroupName),
      };
    });
    this.lineChartData = {
      labels: groupBitRatesData[0].map((bitRate: { time: string; }) => bitRate.time),
      datasets
    };
  }

  private setDataToPieChart(groupedData: { [x: string]: any[]; }){
    const labels = Object.keys(groupedData);
    const datasets = {
      data: labels.map(key => groupedData[key][0]),
      backgroundColor: labels.map(label => RGB_COLOR[label].displayValue ),
    };
    this.pieChartData = {
      labels,
      datasets: [datasets]
    };

  }

  private getOutputStatusData(){
    this.subscriptions.push(
      this.outputService
        .getOutputStatusById(this.outputsDataObject.outputId)
        .pipe(
          first(),
          tap((res) => {
            this.transportStatusArray = res;
            this.getSampleGroupBitrateData();
          })
        )
        .subscribe()
    );
  }

  private getSampleGroupBitrateData(): void {
    const transportStatuses = this.transportStatusArray?.transportsStatus ?? [];

    const groupBitRatesData = transportStatuses
      .filter((status: StreamedTransportStatus) =>
        this.output.outputType === OutputType.UDP
          ? status.transport.id === this.selectedUDPRoute?.transportId
          : true
      )
      .map((status: StreamedTransportStatus) => {
        const pidGroupNames = this.getPidGroupNames(status.pidGroupBitrateSamples);
        this.bitRateMbps = status.bitrateMbps;

        const processedSamples = this.processPidGroupBitrateSamples(
          status.pidGroupBitrateSamples,
          pidGroupNames
        );

        this.lastUpdateData = this.getLastUpdateData(
          processedSamples[processedSamples.length - 1]?.sampleTimeStamp
        );

        return processedSamples.map((sample) => ({
          time: this.getLastUpdateData(sample.sampleTimeStamp),
          pidGroupBitRates: sample.pidGroupBitrates,
        }));
      })
      .filter(Boolean);

    if (groupBitRatesData.length) {
      this.sortGroupBitRatesData(groupBitRatesData[0]);
      this.formatDataToLineChart(groupBitRatesData);
    }
  }

  private processPidGroupBitrateSamples(
    samples: any[],
    pidGroupNames: string[]
  ): any[] {
    return samples.map((sample) => {
      if (sample.pidGroupBitrates.length < 1) {
        sample.pidGroupBitrates = pidGroupNames.map((name) => ({
          rateMbps: 0,
          pidGroupName: name,
        }));
      }
      return sample;
    }).sort(
      (a, b) =>
        new Date(a.sampleTimeStamp).getTime() -
        new Date(b.sampleTimeStamp).getTime()
    );
  }

  private sortGroupBitRatesData(groupData: any[]): void {
    const customSortOrder = ['PSI', 'PSIP', 'NULL'];
    groupData.forEach((item) =>
      item.pidGroupBitRates.sort(
        (a: PIDGroupBitrate, b: PIDGroupBitrate) =>
          customSortOrder.indexOf(a.pidGroupName) -
          customSortOrder.indexOf(b.pidGroupName)
      )
    );
  }

  private formatDataToLineChart(groupBitRatesData: any[]): void {
    const groupedData = this.groupPidRates(groupBitRatesData[0]);
    this.setDataToLineChart(groupBitRatesData, groupedData);
    this.setDataToPieChart(groupedData);
    this.setDataToBarChart(groupedData);
  }

  private groupPidRates(data: any[]): Record<string, number[]> {
    return data.reduce((acc, item) => {
      item.pidGroupBitRates.forEach((rate: PIDGroupBitrate) => {
        acc[rate.pidGroupName] = acc[rate.pidGroupName] || [];
        acc[rate.pidGroupName].push(rate.rateMbps);
      });
      return acc;
    }, {});
  }

  private getPidGroupNames(data: any[]): string[] {
    return Array.from(
      data.reduce((names, item) => {
        item.pidGroupBitrates.forEach((rate: PIDGroupBitrate) => names.add(rate.pidGroupName));
        return names;
      }, new Set<string>())
    );
  }

}
