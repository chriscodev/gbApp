// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.

import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {first, tap} from 'rxjs/operators';
import {changeDateTimeFormat} from 'src/app/shared/helpers/appWideFunctions';
import {convertDecToHex} from 'src/app/shared/helpers/decimalToHexadecimal';
import {ClientNetworksModel} from 'src/app/core/models/ClientNetworksModel';
import {Subscription} from 'rxjs';
import {cloneDeep} from 'lodash';
import {ClientScheduleProvidersModel} from 'src/app/core/models/ClientScheduleProvidersModel';
import {ClientTransportsModel} from 'src/app/core/models/ClientTransportsModel';
import {ClientOutputsModel} from 'src/app/core/models/ClientOutputsModel';
import {OutputsService} from 'src/app/core/services/outputs.service';
import {OutputStatus} from 'src/app/core/models/dtv/output/OutputStatus';
import {
  ModalDynamicTbTranslateComponent
} from '../../../shared/components/modals/modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {ClientMediaStreamsModel} from '../../../core/models/ClientMediaStreamsModel';
import {isDefined, isUndefined} from '../../../core/models/dtv/utils/Utils';
import {getProcessDisplayName, ProcessableElementState,} from '../../../core/models/dtv/common/ProcessableElementState';
import {AbstractOutput, OUTPUT_TYPES, OutputType, UDPRoute} from '../../../core/models/dtv/output/Output';
import {
  AbstractMPEGTransport,
  AbstractTransport,
  ATSC3Transport,
  TRANSPORT_TYPES,
  TransportType
} from '../../../core/models/dtv/network/physical/Transport';
import {AbstractNetwork, NETWORK_TYPES} from '../../../core/models/dtv/network/logical/Network';
import {
  ElementaryStream,
  ElementaryStreamType
} from '../../../core/models/dtv/network/physical/stream/mpeg/ElementaryStream';
import {AbstractScheduleProvider, OnV3ScheduleProvider} from '../../../core/models/dtv/schedule/ScheduleProvider';
import {Schedule} from '../../../core/models/dtv/schedule/Schedule';
import {MediaStream} from '../../../core/models/dtv/network/physical/stream/ip/media/MediaStream';

declare var $: any;

@Component({
  selector: 'app-service-map',
  templateUrl: './service-map.component.html',
  styleUrls: ['./service-map.component.scss'],
})
export class ServiceMapComponent implements OnInit, OnDestroy {
  @ViewChild(ModalDynamicTbTranslateComponent) serviceMapTableComponent: ModalDynamicTbTranslateComponent;
  public serviceMapArray = [];
  public isHidden = false;
  public dtOptions = {};
  public modalData: any;
  public modalTitle: string;
  public modalContentTitle: string;
  public viewOutputStatusModal = false;
  public buttonList = [];
  public objectTitle = 'Services';
  public objectTableType = 'ServiceMaps';
  public localServiceMaps: any = [];
  public tableHeaders = [
    {header: 'Name', key: 'name', visible: true},
    {header: 'Type', key: 'displayServiceType', visible: true},
    {header: 'Number', key: 'number', visible: true},
  ];
  public modalName = '#serviceNetworkMapModal'; // TODO check if needed
  public openModalViewSchedule = false;
  public viewChannelObj: any = {};
  private serverServiceMaps: any = [];
  private serviceMapData = [];
  private schedDataArray: AbstractScheduleProvider[] = [];
  private networkDataArray: AbstractNetwork[] = [];
  private transDataArray: AbstractTransport[] = [];
  private outputDataArray: AbstractOutput[] = [];
  private mediaStreamArray: MediaStream[] = [];
  private isUndergoProcessing = false; // TODO check if needed
  private subscriptions: Subscription[] = [];


  constructor(
    private networksModel: ClientNetworksModel,
    private scheduleProviderModel: ClientScheduleProvidersModel,
    private transportModel: ClientTransportsModel,
    private outputModel: ClientOutputsModel,
    private mediaStreamModel: ClientMediaStreamsModel,
    private outputService: OutputsService
  ) {
  }

  public ngOnInit(): void {
    this.loadServiceMapData();
    this.setDataConnectedToNextColumn();
  }

  public loadServiceMapData() {
    this.isHidden = true;
    let isOutputsLoaded = false;
    let isNetworksLoaded = false;
    let isTransportLoaded = false;
    let isSchedLoaded = false;
    this.subscriptions.push(
      this.mediaStreamModel.mediaStreams$.subscribe((mediaStream) => {
        this.mediaStreamArray = cloneDeep(mediaStream);
        this.checkAllDataLoaded(isOutputsLoaded, isNetworksLoaded, isTransportLoaded, isSchedLoaded);
      })
    );

    this.subscriptions.push(
      this.outputModel.output$.subscribe((outputs) => {
        isOutputsLoaded = true;
        this.outputDataArray = cloneDeep(outputs);
        this.checkAllDataLoaded(isOutputsLoaded, isNetworksLoaded, isTransportLoaded, isSchedLoaded);

      })
    );

    this.subscriptions.push(
      this.networksModel.networkList$.subscribe((networks) => {
        isNetworksLoaded = true;
        this.networkDataArray = cloneDeep(networks);
        this.checkAllDataLoaded(isOutputsLoaded, isNetworksLoaded, isTransportLoaded, isSchedLoaded);

      })
    );

    this.subscriptions.push(
      this.transportModel.transports$.subscribe((transports) => {
        isTransportLoaded = true;
        this.transDataArray = cloneDeep(transports);
        this.checkAllDataLoaded(isOutputsLoaded, isNetworksLoaded, isTransportLoaded, isSchedLoaded);

      })
    );

    this.subscriptions.push(
      this.scheduleProviderModel.schedProvider$.subscribe((scheds) => {
        isSchedLoaded = true;
        this.schedDataArray = cloneDeep(scheds);
        this.checkAllDataLoaded(isOutputsLoaded, isNetworksLoaded, isTransportLoaded, isSchedLoaded);
      })
    );
  }

  public schedViewSchedHandler($event: { message: string }) {
    if ($event.message === 'Close') {
      this.openModalViewSchedule = false;
      $('#modalViewSched').modal('hide');
    }
  }

  public closeModal() {
    this.modalContentTitle = '';
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  public async onButtonClickedServiceMap() {
    if (this.serviceMapTableComponent?.selectedRow !== null && this.serviceMapTableComponent?.selectedRow !== undefined) {
      const data = cloneDeep(this.serviceMapTableComponent?.selectedRow);
      const isScheduleLinks = data?.scheduleLinks?.length > 0;
      const isPhysicalLinks =
        data?.physicalLink !== null &&
        data?.physicalLink !== undefined &&
        data?.physicalLink?.physicalId !== null &&
        data?.physicalLink?.physicalId !== undefined;

      const schedDataArray = this.schedProvDataArrayFunc(data?.scheduleLinks);
      const networksDataArray = this.networksDataArrayFunction(data);
      const physicalTransportsArray = isPhysicalLinks
        ? this.physicalTransportsArrayFunction(
          data?.physicalLink.physicalId,
          data?.serviceType
        )
        : [];
      // added output data array
      const outputDataArray = await this.outputDataArrayFunction(
        physicalTransportsArray
      );
      this.serviceMapData = [
        {
          schedProv: {
            id: 1,
            isConnectedToNextColumn: isScheduleLinks,
            data: schedDataArray,
          },
          logicalNetwork: {
            id: 2,
            isConnectedToNextColumn: true,
            data: networksDataArray,
          },
          physicalTransport: {
            id: 3,
            isConnectedToNextColumn: isPhysicalLinks,
            data: physicalTransportsArray,
            type: data?.serviceType,
          },
          output: {
            id: 4,
            isConnectedToNextColumn: true,
            data: outputDataArray,
          },
        },
      ];
      //  ================================
      //  this.loadServerMaps();
    }
    this.loadData();
    this.setDataConnectedToNextColumn();
    this.getServiceMapUpdates();
  }

  public outputStatusModalCloseHandler(event: string) {
    this.viewOutputStatusModal = false;
    setTimeout(() => {
      $(`#${event}`).modal('hide');
    }, 100);
  }

  // TODO check if still needed
  callSchedStatus(obj: OnV3ScheduleProvider) {
    let schedStatus: ProcessableElementState;
    this.scheduleProviderModel.getScheduleProvidersStatus(obj.id).subscribe((data) => {
      schedStatus = data.scheduleProviderState;

      if (data.scheduleProviderState === ProcessableElementState.UPDATE_PROCESSING) {
        this.isUndergoProcessing = true;
      } else if (
        data.scheduleProviderState === ProcessableElementState.UPDATE_COMPLETE &&
        this.isUndergoProcessing === true
      ) {
        //  this.isUndergoProcessing = false;
      }
    });
    return schedStatus;

  }

  private setDataConnectedToNextColumn() {
    this.serviceMapData.map(serviceMap => {
      if (serviceMap?.logicalNetwork?.data?.length === 0) {
        serviceMap.schedProv.isConnectedToNextColumn = false;
      }
      if (serviceMap?.physicalTransport?.data?.length === 0) {
        serviceMap.logicalNetwork.isConnectedToNextColumn = false;
      }

      if (serviceMap?.output?.data?.length === 0) {
        serviceMap.physicalTransport.isConnectedToNextColumn = false;
      }
    });
  }

  private getServiceMapUpdates() {
    this.serviceMapData.map(serviceMap => {
      serviceMap.schedProv.data.map(async (schedProvData: { status: string; id: number; }) => {
        if (isDefined(schedProvData?.id) && (schedProvData?.status === ProcessableElementState.UPDATE_PROCESSING || !isDefined(
          schedProvData?.status))) {
          this.subscriptions.push(
            this.scheduleProviderModel.getScheduleProvidersStatus(schedProvData?.id).subscribe(
              (scheduleProviderStatus) => {
                schedProvData.status = scheduleProviderStatus.scheduleProviderState;
                this.loadData();
              }));
        }
      });
    });
  }

  private checkAllDataLoaded(isOutputsLoaded: boolean, isNetworksLoaded: boolean, isTransportLoaded: boolean,
                             isSchedLoaded: boolean): void {
    if (isOutputsLoaded && isNetworksLoaded && isTransportLoaded && isSchedLoaded) {
      this.getServiceMapOnNetworksData();
    }
  }

  private updateServiceMaps(serviceMap: any[]) {
    this.serverServiceMaps = cloneDeep(serviceMap);
    this.localServiceMaps = cloneDeep(this.serverServiceMaps);
    this.getServiceMapUpdates();
  }

  private getServiceMapOnNetworksData() {
    if (this.networkDataArray) {

      const netData = this.networkDataArray;
      this.serviceMapArray = netData.flatMap(network =>
        network.channels.flatMap(channel =>
          channel.services.map(service => {
            const transportLink = channel.transportLinks[0];
            const transportType = this.getTransportTypeFromTransportLinks(
              transportLink?.transportId, this.transDataArray);
            const serviceType: string = transportType === TransportType.ATSC_3_TRANSLATED ? `${TRANSPORT_TYPES[TransportType.ATSC_3_TRANSLATED].displayName} Service` : `${NETWORK_TYPES[service.serviceType].displayName} Service`;
            const channelNumber: string = service.majorNumber > 0 ? (service.majorNumber.toString() + (service.minorNumber > 0 ? '-' + service.minorNumber.toString() : '')) : undefined;
            return {
              ...service,
              number: channelNumber,
              displayServiceType: serviceType,
              networkName: network.name,
              channelName: channel.name,
            };
          })
        )
      );
      this.loadServerMaps();
    } // end if

  }

  private getMediaStreamData(linkedStreamId: number) {
    return this.mediaStreamArray.find((mediaStream) => mediaStream.id === linkedStreamId);
  }

  private physicalTransportsArrayFunction(physicalId: number, serviceType: string) {
    const getTransportsList: AbstractTransport[] = cloneDeep(this.transDataArray);
    const physicalTransportsData: any = {};
    const physicalTransportsArr = [];
    getTransportsList?.forEach((transport: AbstractTransport) => {
      if (serviceType === TransportType.ATSC_3) {
        const transElem = transport as ATSC3Transport;
        if (transElem.serviceGroups && transElem.serviceGroups?.length > 0) {
          transElem.serviceGroups?.forEach((sgElem) => {
            if (sgElem.ipStreams && sgElem.ipStreams?.length > 0) {
              sgElem.ipStreams?.forEach((ipElem) => {
                if (ipElem.id?.toString() === physicalId?.toString()) {
                  let isIpStream = true;
                  let mediaStream: MediaStream;
                  if (isDefined(ipElem.linkedStreamId)) {
                    isIpStream = false;
                    mediaStream = this.getMediaStreamData(ipElem.linkedStreamId);
                  }
                  physicalTransportsData.isHorizontallyConnected = true;
                  physicalTransportsData.isVerticallyConnected = true;
                  physicalTransportsData.transport = transElem.name;
                  physicalTransportsData.bsid = this.convertDecToHexComponent(
                    transElem.tsid.toString()
                  );
                  physicalTransportsData.serviceGroup = sgElem.name;
                  physicalTransportsData.type = isIpStream ? ipElem.type : mediaStream.encodingType;
                  physicalTransportsData.destIp = isIpStream ? ipElem.destinationIP : mediaStream.dstAddress;
                  physicalTransportsData.destPort = isIpStream ? ipElem.destinationPort : mediaStream.dstPort;
                  physicalTransportsData.routeName = isIpStream ? ipElem.name : mediaStream.name;
                  physicalTransportsData.svrId = isIpStream ? ipElem.serviceId : mediaStream.serviceId;
                  physicalTransportsData.status = null;
                  // added transport id to match output
                  physicalTransportsData.physicalId = transElem.id;
                }
              });
            }
          });
        }
      } else {
        const transElem = transport as AbstractMPEGTransport;
        if (transElem.programs && transElem.programs?.length > 0) {
          transElem.programs?.forEach((programElem) => {
            if (programElem.id?.toString() === physicalId?.toString()) {
              physicalTransportsData.isHorizontallyConnected = true;
              physicalTransportsData.isVerticallyConnected = true;
              physicalTransportsData.transport = transElem.name;
              physicalTransportsData.tsid = this.convertDecToHexComponent(
                transElem.tsid.toString()
              );
              physicalTransportsData.psiEnabled = transElem.psiEnabled;
              physicalTransportsData.programNumber = programElem.programNumber;
              physicalTransportsData.pmtPID = this.convertDecToHexComponent(
                programElem.pmtPid.toString()
              );
              physicalTransportsData.status = null;
              // added transport id to match output
              physicalTransportsData.physicalId = transElem.id;

              if (
                programElem.elementaryStreams &&
                programElem.elementaryStreams?.length > 0
              ) {
                physicalTransportsData.ac3Audio = [];
                programElem.elementaryStreams.forEach((streamElem: ElementaryStream) => {
                  if (streamElem.streamType === ElementaryStreamType.STANDARD_13818_2_VIDEO) {
                    physicalTransportsData.mpegVideo =
                      this.convertDecToHexComponent(streamElem.pid.toString());
                  } else if (streamElem.streamType === ElementaryStreamType.STANDARD_ATSC_52_AC3) {
                    physicalTransportsData.ac3Audio.push(
                      this.convertDecToHexComponent(streamElem.pid.toString())
                    );
                  }
                });
              }
            }
          });
        }
      }
    });
    if (JSON.stringify(physicalTransportsData) !== '{}') {
      physicalTransportsArr.push(physicalTransportsData);
    }
    return physicalTransportsArr;
  }

  private convertDecToHexComponent(tsid: string) {
    return '0x' + convertDecToHex(tsid);
  }

  private loadData() {
    const bgColorChanger = (serviceMapData: {
      status: string,
      outputType: string,
      udpRoutes: UDPRoute[],
      title: string,
      online?: boolean,
      outputState?: ProcessableElementState
    }) => {
      let status = serviceMapData?.status;
      let color = '#00ff00';
      if ((serviceMapData.title === 'schedProv' || serviceMapData.title === 'output') && !serviceMapData.online) {
        if (serviceMapData.outputType === OutputType.UDP) {
          const allDisabled = serviceMapData.udpRoutes.some(
            (udpRoute: { enabled: boolean; }) => udpRoute.enabled === false);
          return allDisabled ? 'yellow' : '#fff';
        }
        return '#fff';
      }

      // simulate processing when the initial load is still pending/undefined
      if(serviceMapData.title === 'schedProv' && status === undefined){
        status = ProcessableElementState.UPDATE_PROCESSING;
      }
      if (serviceMapData.title === 'output'){
        status = serviceMapData.outputState ?? '';
      }
      switch (status) {
        case ProcessableElementState.UPDATE_COMPLETE:
          //  data = '#eeeeee';
          color = '#00ff00';
          break;
        case ProcessableElementState.UPDATE_PROCESSING:
          color = '#00ffff';
          break;
        case ProcessableElementState.UPDATE_PENDING:
          color = serviceMapData.title === 'schedProv' ? '#ffff00' : '#00ffff';
          break;
        case ProcessableElementState.UPDATE_ERROR:
          color = '#ff0000';
          break;
        case null:
          color = serviceMapData.title === 'schedProv' ? '#ffff00' : '#00ff00';
          break;
        case '':
          color = '#ffff00';
          break;
        default:
          color = '#00ff00';
      }

      return color;
    };

    const serviceMapCard = (
      dataRendered: any,
      isWhiteCard: boolean,
      isVertical?: boolean,
      isFirst?: boolean,
      isLastColumn?: boolean,
      data?: { status: string; outputType: string; udpRoutes: UDPRoute[]; title: string; outputState?: ProcessableElementState }
    ) => {
      const isConnected = isFirst && dataRendered.isConnectedToNextColumn;
      const width = isConnected ? '25px' : (isLastColumn ? 'unset' : '55px');
      const position = isConnected ? (isLastColumn ? '6px' : '-15px') : (isLastColumn ? 'unset' : '-45px');
      const display = isConnected ? 'unset' : (isLastColumn ? 'none' : 'unset');

      const additionalStyle = `width: ${width}; ${isLastColumn ? 'left' : 'right'}: ${position}; display: ${display}`;

      if (isWhiteCard) {
        return `<div data="${dataRendered}" class="row node-card" style="background-color: ${bgColorChanger(data)};">`;
      }

      if (isVertical && dataRendered.data?.length > 1) {
        return `<div style="position: absolute; background-color: #fff; width: 3px; height: 81px; top: -61px; display: inline-flex;">&nbsp;</div>`;
      }

      return `<div style="position: absolute; background-color: #fff; height: 3px; top: 125px; ${additionalStyle}">&nbsp;</div>`;
    };

    const checkForAdditionalStyles = (x: any) => {
      const height = x?.isFirst ? '223px' : (x.isLast ? '189px' : '331px');
      const bottom = x?.isFirst ? '-61px' : 'unset';
      const top = x?.isLast ? '-61px' : 'unset';

      return `height: ${height}; bottom: ${bottom}; top: ${top};`;
    };

    const finalInterfaceToRender = (dataRendered: any, isLastColumn?: boolean, title?: string) => {
      if (dataRendered?.data && dataRendered?.data?.length > 0) {
        const indexOfLastItem = dataRendered?.data
          ?.map((x: any) => x?.isHorizontallyConnected)
          ?.lastIndexOf(true);

        const numberOfConnectedItems = dataRendered?.data?.filter((x: any) => x?.isHorizontallyConnected)?.length;

        return `${dataRendered?.data
          ?.map((x: any, i: number) => {
           if (isDefined(x)){
             x.isFirst = i === 0;
             x.isLast = i === indexOfLastItem;
             x.isOnlyAPassage = i < indexOfLastItem && i !== 0;
             x.title = title;

             return `<div class="card">
          <div class="card-body" style="min-height: 0">
          ${
               dataRendered.data?.length > 1 &&
               dataRendered.isConnectedToNextColumn &&
               numberOfConnectedItems > 1 &&
               ((x.isOnlyAPassage && !x.isFirst && !x.isLast) ||
                 (!x.isOnlyAPassage && (x.isFirst || x.isLast)))
                 ? `<div style="position: absolute; background-color: #fff; width: 3px;
              ${isLastColumn ? 'left: 3px;' : 'right:-18px'};
              ${checkForAdditionalStyles(x)}">&nbsp;</div>`
                 : ''
             }
          ${
               dataRendered.data
                 ? `${
                   x.isFirst
                     ? ''
                     : x.isVerticallyConnected
                       ? serviceMapCard(dataRendered, false, true, null, isLastColumn, x)
                       : ''
                 }
              ${serviceMapCard(dataRendered, true, null, null, isLastColumn, x)}
              ${this.serviceMapCardContent(dataRendered, i)}
              ${
                   dataRendered.isConnectedToNextColumn === true
                     ? `${
                       x.isFirst || x.isHorizontallyConnected
                         ? serviceMapCard(dataRendered, false, null, x.isFirst ? null : true, isLastColumn, x)
                         : ''
                     }`
                     : ''
                 }
                  </div>`
                 : ''
             }
          </div>
        </div>`;
           }
          })
          ?.join('<br>')}`;
      } else {
        return null;
      }
    };

    setTimeout(() => {
      $(() => {
        this.dtOptions = {
          data: this.serviceMapData,
          searching: false,
          info: false,
          paging: false,
          autoWidth: true,
          deferRender: true,
          destroy: true,
          columns: [
            {title: 'Schedule Provider', data: 'schedProv'},
            {title: 'Logical Network', data: 'logicalNetwork'},
            {title: 'Physical Transport', data: 'physicalTransport'},
            {title: 'Output', data: 'output'},
          ],
          columnDefs: [
            {
              title: 'Schedule Provider',
              width: '25%',
              targets: 0,
              class: 'text-center',
              data: 'schedProv',
              render(dataRendered: any) {
                return finalInterfaceToRender(dataRendered, null, 'schedProv');
              },
            },
            {
              title: 'Logical Network',
              width: '25%',
              targets: 1,
              class: 'text-center',
              data: 'logicalNetwork',
              render(dataRendered: any) {
                return finalInterfaceToRender(
                  dataRendered,
                  null,
                  'logicalNetwork'
                );
              },
            },
            {
              title: 'Physical Transport',
              width: '25%',
              targets: 2,
              class: 'text-center',
              data: 'physicalTransport',
              render(dataRendered: any) {
                return finalInterfaceToRender(
                  dataRendered,
                  null,
                  'physicalTransport'
                );
              },
            },
            {
              title: 'Output',
              width: '25%',
              targets: 3,
              class: 'text-center',
              data: 'output',
              render(dataRendered: any) {
                return finalInterfaceToRender(dataRendered, true, 'output');
              },
            },
          ],
          // used to send callback to open model in sched and output
          drawCallback: () => {
            $('table.displayServiceNetworkMap').on(
              'click',
              '.getNodeData',
              ($event: any) => {
                const DATA = $($event.currentTarget);
                const res = DATA[0].getAttribute('data');
                this.getNodeData(res).then(r => r);
              }
            );
          },
        };
        $('table.displayServiceNetworkMap').DataTable(this.dtOptions);
      });
    }, 500);
    this.isHidden = false;
  }

  /**
   *
   * @returns array to the attribute sched prov  data
   */
  private schedProvDataArrayFunc(dataArray: any) {
    const schedProvListArray = [];
    dataArray?.map((data: any) => {
      const obj = this.getSchedParentScheduleIdDataV2(data);
      schedProvListArray.push(obj);
    });
    return schedProvListArray;
  }

  private getSchedParentScheduleIdDataV2(dataObject: { scheduleId: number; }) {
    let results: Schedule;
    let dataValue: any;
    for (let i = 0; i < this.schedDataArray.length; i++) {
      const obj = this.schedDataArray[i] as OnV3ScheduleProvider;

      if (obj.schedules.length !== 0) {
        const scheds = obj.schedules;
        results = scheds.find((x: any) => x.id === dataObject.scheduleId);

        if (results !== undefined) {
          results = scheds.find((x: any) => x.id === dataObject.scheduleId);
          // TODO check if needed
          // const lastCompletion = convertTimeStandard(obj.lastCompletion);
          const scheduleStatus = this.callSchedStatus(obj);
          dataValue = {
            id: obj.id,
            intervalInMinutes: obj.intervalInMinutes,
            updateDaily: obj.updateDaily,
            scheduleProviderType: obj.scheduleProviderType,
            name: obj.name,
            scheduleId: results.id,
            providerName: obj.name,
            schedule: results.name,
            dayAhead: obj.daysAheadToProcess,
            // lastCompletion,  // TODO check if needed
            downloadInterval:
              obj.updateDaily === true
                ? 'Daily'
                : obj.intervalInMinutes + 'min(s)', // needs to be dynamic

            timeOfDay: obj.timeOfDay,
            online: obj.onLine,
            schedules: obj.schedules,
            status: scheduleStatus,
            type: 'schedProv',
            isHorizontallyConnected:
              this.schedDataArray.length > 0,
            isVerticallyConnected: false,
          };
          if (
            dataValue.status === '' ||
            dataValue.status?.toUpperCase() === 'PROCESSING' ||
            dataValue.status === undefined
          ) {
            this.modalData = dataValue;
          }
        }
      }
    }

    return dataValue;
  }

  private networksDataArrayFunction(data: { name: string, channelName: string, networkName: string, number: string }) {
    const dataNet = [];

    const networkData = {
      isHorizontallyConnected: true,
      isVerticallyConnected: true,
      service: data?.name,
      channel: data?.channelName,
      network: data?.networkName,
      number: data?.number,
      status: null,
    };

    dataNet.push(networkData);
    if (isDefined(data)){
      return dataNet;
    }
  }

  private async outputDataArrayFunction(physicalTransportsArray: { physicalId: number }[]) {
    const getOutputLists = cloneDeep(this.outputDataArray);
    const filteredData = await getOutputLists.filter((outputList: any) => {
      if (outputList.outputType !== OutputType.UDP) {
        return isDefined(outputList.transportId) && outputList.transportId === physicalTransportsArray[0]?.physicalId;
      } else {
        const filteredUdp = outputList.udpRoutes.filter((route: any) =>
          route.transportId === physicalTransportsArray[0]?.physicalId
        );
        outputList.connectedTransport = filteredUdp[0];

        return (
          outputList.udpRoutes &&
          outputList.udpRoutes.some(
            (route: any) =>
              route.transportId === physicalTransportsArray[0]?.physicalId
          )
        );
      }
    });

    for (let index = 0; index < filteredData.length; index++) {
      const element = await this.getOutputStatus(filteredData[index]);
      element.online = !!element.onLine;
      element.isHorizontallyConnected = true;
      element.isVerticallyConnected = false;
      element.output = element.name;
      filteredData[index] = element;
    }
    return await filteredData;
  }

  private async getNodeData(ids: string, isTriggerWebSocket?: boolean) {
    const dataRenderedId = ids?.split('-')?.shift();
    const dataIndex = ids?.split('-')?.pop();
    const columnKey = +dataRenderedId - 1;
    const mainDataObj: any = Object.values(this.serviceMapData[0])[
    +dataRenderedId - 1
      ];
    const NODE_DATA = dataIndex ? mainDataObj.data[dataIndex] : undefined;
    const otherDataObj = NODE_DATA
      ? mainDataObj.data?.filter((x: any) => x !== NODE_DATA)
      : undefined;
    const mainDataObjIndex = NODE_DATA
      ? mainDataObj.data?.indexOf(NODE_DATA)
      : undefined;

    this.modalData = NODE_DATA;
    if (dataRenderedId === '1') {
      this.modalContentTitle = 'Schedule Provider';
      setTimeout(() => {
        $('#scheduleProviderStatusModal').modal('show');
      }, 100);
    } else if (dataRenderedId === '4') {
      this.modalContentTitle = 'Outputs';
      this.viewOutputStatusModal = true;
      setTimeout(() => {
        $('#viewOutputStatus').modal('show');
      }, 100);
    }

    this.getWebSocketData(
      NODE_DATA,
      otherDataObj,
      mainDataObjIndex,
      mainDataObj,
      columnKey,
      isTriggerWebSocket
    );
  }

  // get output status from outputservice
  private async getOutputStatus(data: any) {
    const response = await this.outputService
      .getOutputStatusById(data.id)
      .pipe(
        first(),
        tap((res) => {
          this.encodeOutput(data, res);
        })
      )
      .toPromise();
    return {...data, ...response}; //  Return the processed data
  }

  // supplementary function of getoutputstatus
  private encodeOutput(data: any, outputStatus: OutputStatus) {
    return (data.lastUpdateTime = isDefined(outputStatus?.lastUpdateTime) ? changeDateTimeFormat(
      outputStatus?.lastUpdateTime) : '');
  }

  // TODO check if needed
  private getWebSocketData(
    NODE_DATA: any,
    otherDataObj: any[],
    mainDataObjIndex: number,
    mainDataObj: any,
    columnKey: number,
    isTriggerWebSocket: boolean | undefined
  ) {
    if (isTriggerWebSocket) {

      NODE_DATA = {
        isHorizontallyConnected: false,
        isVerticallyConnected: false,
        service: 'Serv22',
        channel: 'Ch22',
        network: 'test',
        number: '22-22',
        status: 'PROCESSING',
      };

      otherDataObj?.splice(mainDataObjIndex, 0, NODE_DATA);
      otherDataObj?.join();
      mainDataObj.data = otherDataObj;

      $('table.displayServiceNetworkMap')
        .DataTable()
        .column(columnKey)
        .nodes()
        .each((node: any) => {
          $('table.displayServiceNetworkMap')
            .DataTable()
            .cell(node)
            .data(mainDataObj);
        });
    }
  }

  private serviceMapCardContent = (dataRendered: any, index: number) => {
    const dataFinder = `${dataRendered.id}-${index}`;
    if (dataRendered.id === 1) {
      // schedule provider nodes
      const schedProvLabelArray = [
        {label: 'Provider Name', data: dataRendered?.data[index]?.providerName},
        {label: 'Schedule', data: dataRendered?.data[index]?.schedule},
        {label: 'Day Ahead', data: dataRendered?.data[index]?.dayAhead},
        {label: 'Download Interval', data: dataRendered?.data[index]?.downloadInterval},
        {label: 'Time Of Day', data: dataRendered?.data[index]?.timeOfDay},
        {label: 'Online', data: dataRendered?.data[index]?.online},
        {
          label: 'Update Status', data: isDefined(dataRendered?.data[index]?.status) ? getProcessDisplayName(dataRendered?.data[index]?.status) : getProcessDisplayName(ProcessableElementState.UPDATE_PROCESSING)
        }
      ];
      return this.setLabelsToRender(schedProvLabelArray, true, dataFinder);
    } else if (dataRendered.id === 2) {
      // networks nodes
      const networkLabelArray = [
        {label: 'Service', data: dataRendered?.data[index]?.service},
        {label: 'Channel', data: dataRendered?.data[index]?.channel},
        {label: 'Network', data: dataRendered?.data[index]?.network},
        {label: 'Number', data: isDefined(dataRendered?.data[index]?.number) ? dataRendered?.data[index]?.number : ''}
      ];
      return this.setLabelsToRender(networkLabelArray, false);
    } else if (dataRendered.id === 3) {
      // transport nodes
      if (dataRendered.type === TransportType.ATSC_3) {
        const physicalTransportArrayATSC3 = [
          {label: 'Transport', data: dataRendered?.data[index]?.transport},
          {label: 'BSID', data: dataRendered?.data[index]?.bsid},
          {label: 'Service Group', data: dataRendered?.data[index]?.serviceGroup},
          {label: 'Type', data: dataRendered?.data[index]?.type},
          {label: 'Dest IP', data: dataRendered?.data[index]?.destIp},
          {label: 'Dest Port', data: dataRendered?.data[index]?.destPort},
          {label: 'Route Name', data: dataRendered?.data[index]?.routeName},
          {
            label: 'Service ID',
            data: isDefined(dataRendered?.data[index]?.svrId) ? dataRendered?.data[index]?.svrId : ''
          }
        ];
        return this.setLabelsToRender(physicalTransportArrayATSC3, false);
      } else {
        const physicalTransportArrayNonATSC3 = [
          {label: 'Transport', data: dataRendered?.data[index]?.transport},
          {label: 'TSID', data: dataRendered?.data[index]?.tsid},
          {label: 'PSI Enabled', data: dataRendered?.data[index]?.psiEnabled},
          {label: 'Program Number', data: dataRendered?.data[index]?.programNumber},
          {label: 'PMT PID', data: dataRendered?.data[index]?.pmtPID}
        ];
        // Check if MPEG2 Video exists and add it to the array
        if (
          dataRendered?.data[index]?.mpegVideo &&
          dataRendered?.data[index]?.mpegVideo?.toString() !== ''
        ) {
          physicalTransportArrayNonATSC3.push({
            label: 'MPEG2 Video PID',
            data: dataRendered?.data[index]?.mpegVideo
          });
        }
        // Check if AC3 Audio exists and add each item to the array
        if (
          dataRendered?.data[index]?.ac3Audio &&
          dataRendered?.data[index]?.ac3Audio?.length > 0
        ) {
          dataRendered?.data[index]?.ac3Audio.forEach((elem: any) => {
            physicalTransportArrayNonATSC3.push({label: 'AC-3 Audio PID', data: elem});
          });
        }
        return this.setLabelsToRender(physicalTransportArrayNonATSC3, false);
      }
    } else if (dataRendered.id === 4) {
      // output nodes
      let udpRouteEnabled: string;
      if (dataRendered?.data[index]?.outputType === OutputType.UDP) {
        const connectedTransportId = dataRendered?.data[index]?.connectedTransport.transportId;
        const udpRoute = dataRendered?.data[index]?.udpRoutes.find(
          (route: any) => route.transportId === connectedTransportId);
        udpRouteEnabled = udpRoute.enabled;
      }
      const udpLabelsArray = [
        {label: 'NIC', data: dataRendered?.data[index]?.networkInterfaceName},
        {label: 'Address', data: dataRendered?.data[index]?.connectedTransport?.address},
        {label: 'Port', data: dataRendered?.data[index]?.connectedTransport?.port},
        {label: 'Route Enabled', data: udpRouteEnabled}
      ];
      const asiLabelsArray = [
        {label: 'Card ID', data: dataRendered?.data[index]?.cardId},
        {label: 'Bit Rate', data: dataRendered?.data[index]?.bitrate}
      ];
      const triveniCarLabelsArray = [
        {label: 'Address', data: dataRendered?.data[index]?.outputAddress},
        {label: 'Port', data: dataRendered?.data[index]?.port}
      ];
      const isATSC3 = dataRendered?.data[index]?.outputType === OutputType.ATSC3_UDP || dataRendered?.data[index]?.outputType === OutputType.ATSC3_TRANSLATOR;
      const isUDP = dataRendered?.data[index]?.outputType === OutputType.UDP;
      const isASI = dataRendered?.data[index]?.outputType === OutputType.ASI;
      const outputArray = [
        {label: 'Output', data: dataRendered?.data[index]?.output},
        {label: 'Output Type', data: OUTPUT_TYPES[dataRendered?.data[index]?.outputType].displayName},
        ...(isATSC3 ? [] : isUDP ? udpLabelsArray : isASI ? asiLabelsArray : triveniCarLabelsArray),
        {label: 'Online', data: dataRendered?.data[index]?.online},
        {label: 'Update Status', data: isDefined(getProcessDisplayName(dataRendered?.data[index]?.outputState)) ? getProcessDisplayName(dataRendered?.data[index]?.outputState) : ''}
      ];
      return this.setLabelsToRender(outputArray, true, dataFinder);
    }
  }

  private loadServerMaps() {
    this.updateServiceMaps(this.serviceMapArray);
  }

  private getTransportTypeFromTransportLinks(transportId: number, transportArray: any[]) {
    const transport = transportArray.find(transport => transport.id === transportId);
    return transport?.transportType;
  }

  private setLabelsToRender(labelArray: any[], showButton = true, dataFinder = '') {
    let htmlString = '<div class="p-3"><div class="form-body">';
    labelArray.forEach(item => {
      htmlString += `
      <div class="form-group row mb-0">
        <div class="col-md-6 text-end">
          <label class="col-form-label p-0" style="color: black !important; font-size: smaller !important;">
            ${item.label}:
          </label>
        </div>
        <div class="col-md-6 text-start">
          <label class="col-form-label p-0 txtLeft" style="color: black !important; font-size: smaller !important; text-align:left;">
            ${item?.data}
          </label>
        </div>
      </div>`;
    });

    if (showButton) {
      htmlString += `
      <br>
      <div style="margin: auto;">
        <button class="btn btn-sm getNodeData nodeStatusBtn" data="${dataFinder}">
          Status
        </button>
      </div>`;
    }
    htmlString += '</div></div>'; // Close divs

    return htmlString;
  }
}
