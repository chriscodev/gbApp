// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.
import {inject} from '@angular/core';
import {exportElementsToCSV, onImportNow} from '../helpers';
import * as _swal from 'sweetalert';
import {SweetAlert} from 'sweetalert/typings/core';

import {v4 as uuidv4} from 'uuid';
import {ClientScheduleProvidersModel} from '../../core/models/ClientScheduleProvidersModel';
import {AbstractNetwork, NETWORK_TYPES, NetworkTransportLinking} from '../../core/models/dtv/network/logical/Network';
import {AbstractChannel, MODULATION_TYPES} from '../../core/models/dtv/network/logical/Channel';
import {
  ATSC_SERVICE_TYPES,
  DefaultPhysicalLink,
  DefaultSchedule,
  DefaultServices
} from '../../core/models/dtv/network/logical/Service';
import {CsvData} from '../../core/models/dtv/network/networkInterface';
import {FileUploadService} from '../../core/services/file-upload.service';
import {ProgressBarType} from '../../core/interfaces/ProgressBarDataInterface';
import {DtvNetworkComponent} from '../../pages/main/dtv-services/dtv-network/dtv-network.component';
import {isDefined} from '../../core/models/dtv/utils/Utils';
import {
  MODULATION_CODE,
  NETWORK_SERVICE_TYPES_CODE,
  networksFilename,
  networksHeader,
  NON_ATSC3_SERVICE_TYPES_CODE
} from '../../core/models/dtv/importExport/importExport';

const swal: SweetAlert = _swal as any;

export class NetworkCSVHandler {
  // TODO DAC See if this makes sense to have as a separate class
  private scheduleProviderModel: ClientScheduleProvidersModel;
  private networkTransportLinking: NetworkTransportLinking;
  private dtvNetworkComponent: DtvNetworkComponent;

  constructor(private fileUploadService: FileUploadService) {
    this.scheduleProviderModel = inject(ClientScheduleProvidersModel);
    this.networkTransportLinking = inject(NetworkTransportLinking);
    this.dtvNetworkComponent = inject(DtvNetworkComponent);
  }

  public openImportFileHandler(fileEvent: HTMLInputElement, localNetworkStreams: AbstractNetwork[]) {
    const getDataRecordsArrayFromCSVFile = (csvRecordsArray: string | any[], headerLength: number) => {
      const csvArr = [];
      for (let i = 1; i < csvRecordsArray.length; i++) {
        const currentRecord = (csvRecordsArray[i]).split(',');
        const csvRecord: CsvData = new CsvData();
        if (currentRecord.length === headerLength) {
          csvRecord.name = currentRecord[0].trim();
          csvRecord.networkType = currentRecord[1].trim();
          csvRecord.networkId = currentRecord[2].trim();
          csvRecord.channelName = currentRecord[3].trim();
          csvRecord.channelModulation = currentRecord[4].trim();
          csvRecord.serviceName = currentRecord[5].trim();
          csvRecord.serviceType = currentRecord[6].trim();
          csvRecord.serviceId = currentRecord[7].trim();
          csvRecord.tsId = currentRecord[8].trim();
          csvRecord.tsName = currentRecord[9].trim();
          csvRecord.programNumber = currentRecord[10].trim();
          csvRecord.schedProvider = currentRecord[11].trim();
          csvRecord.schedName = currentRecord[12].trim();
          csvArr.push(csvRecord);
        }
        if (csvArr[0] && csvArr[0].pn === '') {
          delete csvArr[0].programs;
        }
      }
      return csvArr;
    };
    const convertRecordsToJson = (recordsFromCSVFile: CsvData[]) => {
      const records = recordsFromCSVFile;
      const uniqueNetworkIds = [...new Set(records.map(item => item.networkId))];
      const networkData = [];
      let linkTs;
      for (let i = 0; i < uniqueNetworkIds.length; i++) {
        records.forEach(netRec => {
          if (netRec.networkId === uniqueNetworkIds[i] && !networkData[i]) {
            networkData[i] = {};
            networkData[i].id = 0;
            networkData[i].clientId = uuidv4();
            networkData[i].name = netRec.name;
            networkData[i].networkType = NETWORK_SERVICE_TYPES_CODE[netRec.networkType]?.networkServiceCode;
            networkData[i].channels = [];
          }
          if (netRec.networkId === uniqueNetworkIds[i] && netRec.channelName !== '') {
            if (networkData[i].channels.findIndex((channel: AbstractChannel) => channel.name === netRec.channelName) === -1) {
              const channelObj = {
                name: netRec.channelName,
                modulation: MODULATION_CODE[netRec.channelModulation]?.modulationCode,
                services: [],
                transportLinks: [],
                id: 0,
                clientId: uuidv4(),
                channelType: 'ATSC'
              };
              if (netRec.tsId && netRec.tsId !== '') {
                linkTs = this.dtvNetworkComponent.localTransports.find((trans) => {
                  return trans.tsid && trans.tsid.toString() === netRec.tsId.toString() && ((netRec.networkType === 'ATSC-Cable' && trans.transportType === 'ATSC_PSIP_CABLE') || (netRec.networkType === 'ATSC-Terrestrial' && trans.transportType === 'ATSC_PSIP_TERRESTRIAL'));
                });
                if (linkTs) {
                  channelObj.transportLinks[0] = {};
                  channelObj.transportLinks[0].actual = true;
                  if (isDefined(linkTs.id)){
                    channelObj.transportLinks[0].transportId = linkTs.id;
                  }
                  else {
                    channelObj.transportLinks[0].clientTransportId = linkTs.clientId;
                  }
                  channelObj.transportLinks[0].id = 0;
                  channelObj.transportLinks[0].clientId = uuidv4();
                } else {
                  recordsFromCSVFile = [];
                  swal('Import Error:',
                    'Invalid format line: 2, \n reason: Invalid transport link to channel ' + netRec.channelName,
                    'error').then();
                }
              }
              networkData[i].channels.push(channelObj);
            }
            networkData[i].channels.forEach((chanRec: AbstractChannel) => {
              if (netRec.channelName === chanRec.name) {
                if (netRec.serviceName && netRec.serviceName !== '') {
                  if (chanRec.services && chanRec.services.findIndex((service) => service.name === netRec.serviceName) === -1) {
                    const servLength = chanRec.services.length;
                    // @ts-ignore
                    chanRec.services[servLength] = new DefaultServices();
                    chanRec.services[servLength].serviceType = NETWORK_SERVICE_TYPES_CODE[netRec.networkType]?.networkServiceCode;
                    chanRec.services[servLength].id = 0;
                    chanRec.services[servLength].clientId = uuidv4();
                    chanRec.services[servLength].name = netRec.serviceName;
                    chanRec.services[servLength].atscServiceType = NON_ATSC3_SERVICE_TYPES_CODE[netRec.serviceType]?.serviceCode;
                    chanRec.services[servLength].scheduleLinks = [];
                    chanRec.services[servLength].description = '';
                    if (netRec.serviceId.toString().includes('-')) {
                      const num = netRec.serviceId.split('-');
                      chanRec.services[servLength].majorNumber = parseInt(num[0]);
                      chanRec.services[servLength].minorNumber = parseInt(num[1]);
                    } else {
                      chanRec.services[servLength].majorNumber = parseInt(netRec.serviceId);
                      chanRec.services[servLength].minorNumber = null;
                    }
                    if (netRec.programNumber && netRec.programNumber !== '') {
                      const linkProgram = linkTs.programs.find((prog) => {
                        return prog.programNumber && prog.programNumber.toString() === netRec.programNumber.toString();
                      });
                      if (linkProgram) {
                        chanRec.services[servLength].physicalLink = new DefaultPhysicalLink();
                        if (!isDefined(linkProgram.clientId)){
                          chanRec.services[servLength].physicalLink.physicalId = linkProgram.id;
                          delete chanRec.services[servLength].physicalLink.clientPhysicalId;
                        }
                        else {
                          chanRec.services[servLength].physicalLink.clientPhysicalId = linkProgram.clientId;
                        }
                      } else {
                        recordsFromCSVFile = [];
                        swal('Import Error:',
                          'Invalid format line: 2, \n reason: Invalid program link to service: [' + netRec.programNumber + ' in transport ' + netRec.tsId + ':' + netRec.tsName + ' to service ' + netRec.serviceName,
                          'error').then();
                      }
                    }
                  }
                  chanRec.services.forEach(serviceRec => {
                    if (netRec.serviceName === serviceRec.name) {
                      if (netRec.schedName && netRec.schedName !== '') {
                        const shedProviderSummary = this.scheduleProviderModel.scheduleProviderSummaryList.find(sched => {
                          return sched.scheduleName === netRec.schedName && sched.scheduleProviderName === netRec.schedProvider;
                        });
                        if (shedProviderSummary) {
                          if (serviceRec.scheduleLinks && serviceRec.scheduleLinks.findIndex((schedule) => schedule.scheduleId === shedProviderSummary.scheduleId) === -1) {
                            const schedLength = serviceRec.scheduleLinks.length;
                            // @ts-ignore
                            serviceRec.scheduleLinks[schedLength] = new DefaultSchedule();
                            serviceRec.scheduleLinks[schedLength].id = 0;
                            serviceRec.scheduleLinks[schedLength].clientId = uuidv4();
                            serviceRec.scheduleLinks[schedLength].priority = schedLength + 100;
                            serviceRec.scheduleLinks[schedLength].serviceId = 0;
                            serviceRec.scheduleLinks[schedLength].scheduleId = shedProviderSummary.scheduleId;
                          }
                        } else {
                          recordsFromCSVFile = [];
                          swal('Import Error:',
                            'Invalid format line: 2, \n reason: Invalid schedule ' + netRec.schedName + ':' + netRec.schedProvider + 'for service ' + netRec.serviceName,
                            'error').then();
                        }
                      }
                    }
                  });
                }
              }
            });
          }
        });
      }
      return networkData;
    };
    const checkTableDataExist = (data: [], localNetworkStreams: AbstractNetwork[], records: []) => {
      let csvRecord: CsvData = new CsvData();
      let dataExist = false;
      for (let i = 0; i < localNetworkStreams.length; i++) {
        const tData = localNetworkStreams[i];
        for (let x = 0; x < data.length; x++) {
          csvRecord = data[x];
          if (tData.name === csvRecord.name) {
            dataExist = true;
            records = [];
            swal('Import Error:',
              'Invalid format line: 2, \n reason: Network ' + tData.name + ' already exists',
              'error').then();
          }
        }
      }

      if (dataExist === false) {
        this.networkTransportLinking.sendDataNetworkCSV(data);
      }
    };

    const fileServiceImport = ({loaded, total, progress, fileName}) => {
      const type = ProgressBarType.IMPORT;
      this.fileUploadService.sendImportProgress({loaded, total, progress, fileName, type });
    };

    if (fileEvent !== undefined) {
      onImportNow(fileEvent, localNetworkStreams, getDataRecordsArrayFromCSVFile, convertRecordsToJson, checkTableDataExist, fileServiceImport, 'networks');
    } else {
      document.getElementById('fileInput').click();
    }
  }

  public onExport(networkStreams: AbstractNetwork[]) {
    const checkingPrograms = (rowData: AbstractNetwork) => {
      const streamArray = [];
      const transType = NETWORK_TYPES[rowData.networkType].displayName;
      const origNetId = (rowData.id && rowData.id !== -1) ? rowData.id : rowData.clientId;
      let arrData = [];

      if (rowData.channels && rowData.channels.length > 0) {
        rowData.channels.forEach(netChannel => {
          let modulationValue = '8VSB';
          if (transType !== 'ATSC-Terrestrial') {
            modulationValue = MODULATION_TYPES[netChannel.modulation].displayName;
          }
          if (netChannel.services && netChannel.services.length > 0) {
            let linkTs;
            let tsName = '';
            let tsId = '';
            if (netChannel.transportLinks && netChannel.transportLinks.length !== 0) {
              linkTs = this.dtvNetworkComponent.localTransports.find((trans) => {
                return trans.id && trans.id === netChannel.transportLinks[0].transportId;
              });
              tsName = linkTs.name;
              tsId = linkTs.tsid + '';
            }
            netChannel.services.forEach(chanService => {
              let pn = '';
              let schedProvider = '';
              let schedName = '';
              if (linkTs && linkTs.programs && linkTs.programs.length > 0 && chanService.physicalLink) {
                const serviceProgram = linkTs.programs.find(prog => {
                  return prog.id === chanService.physicalLink.physicalId;
                });
                pn = serviceProgram.programNumber + '';
              }
              if (chanService.scheduleLinks && chanService.scheduleLinks.length > 0) {
                const shedProviderSummary = this.scheduleProviderModel.scheduleProviderSummaryList.find(sched => {
                  return sched.scheduleId === chanService.scheduleLinks[0].scheduleId;
                });
                schedName = shedProviderSummary.scheduleName;
                schedProvider = shedProviderSummary.scheduleProviderName;
              }
              arrData = [];
              let serviceId = '' + chanService.majorNumber;
              if (chanService.minorNumber && chanService.minorNumber !== 0) {
                serviceId = chanService.majorNumber + '-' + chanService.minorNumber;
              }
              arrData.push(rowData.name);
              arrData.push(transType);
              arrData.push(origNetId);
              arrData.push(netChannel.name);
              arrData.push(modulationValue);
              arrData.push(chanService.name);
              arrData.push(ATSC_SERVICE_TYPES[chanService.atscServiceType].displayName);
              arrData.push(serviceId);
              arrData.push(tsId);
              arrData.push(tsName);
              arrData.push(pn);
              arrData.push(schedProvider);
              arrData.push(schedName);
              streamArray.push(arrData);
            });
          } else {
            arrData = [];
            arrData.push(rowData.name);
            arrData.push(transType);
            arrData.push(origNetId);
            arrData.push(netChannel.name);
            arrData.push(modulationValue);
            for (let trav = 1; trav <= 8; trav++){
              arrData.push('');
            }
            streamArray.push(arrData);
          }
        });
      } else {
        arrData.push(rowData.name);
        arrData.push(transType);
        arrData.push(origNetId);
        for (let trav = 1; trav <= 10; trav++){
          arrData.push('');
        }
        streamArray.push(arrData);
      }
      return streamArray;
    };
    const fileServiceImport = ({loaded, total, progress, fileName}) => {
      const type = ProgressBarType.EXPORT;
      this.fileUploadService.sendImportProgress({loaded, total, progress, fileName, type});
    };

    exportElementsToCSV(networkStreams, networksHeader.join(), networksFilename, checkingPrograms, fileServiceImport);
  }
}
