// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {MPEGRoute, TranslatedUDPRoute, UDPRoute} from '../../core/models/dtv/output/Output';
import {isDefined} from '../../core/models/dtv/utils/Utils';
import {AbstractMPEGTransport} from '../../core/models/dtv/network/physical/Transport';
import {OutputsService} from '../../core/services/outputs.service';
import * as _swal from 'sweetalert';
import {SweetAlert} from 'sweetalert/typings/core';
import {
  DefaultTransportUdpCsvData,
  DefaultUdpRouteData,
  TransportUdpCsvData,
  UdpRouteData
} from '../../core/models/dtv/output/OutputUdpCsvInterface';
import {FileUploadService} from '../../core/services/file-upload.service';
import {CsvData} from '../../core/models/dtv/network/networkInterface';
import {onImportNow} from './importExportCSV';
import {ProgressBarType} from '../../core/interfaces/ProgressBarDataInterface';
import {dtvCSVContent, outputsFilename, outputsHeader} from '../../core/models/dtv/importExport/importExport';

const swal: SweetAlert = _swal as any;

export class OutputUdpRouteCSVHandler {

  constructor(public outputsService: OutputsService, private fileUploadService: FileUploadService) {
  }

  public onImportFileHandler(fileEvent: HTMLInputElement, udpRoutes: UDPRoute[], localMPEGTransports: AbstractMPEGTransport[]) {
    const getDataRecordsArrayFromCSVFile = (csvRecordsArray: string | any[], headerLength: number) => {
      const csvArr: TransportUdpCsvData[] = [];
      for (let i = 1; i < csvRecordsArray.length; i++) {
        const currentRecord = (csvRecordsArray[i]).split(',');
        const csvRecord: TransportUdpCsvData = new DefaultTransportUdpCsvData();
        if (currentRecord.length === headerLength) {
          csvRecord.tsid = currentRecord[0].trim();
          csvRecord.tsname = currentRecord[1].trim();
          csvRecord.ipAddress = currentRecord[2].trim();
          csvRecord.port = currentRecord[3].trim();

          csvArr.push(csvRecord);
        } else {
          csvRecord.tsid = currentRecord[0]?.trim();
          csvRecord.tsname = currentRecord[1]?.trim();
          csvRecord.ipAddress = currentRecord[2]?.trim();
          csvRecord.port = currentRecord[3]?.trim();
          if (currentRecord.length !== 1) {
            csvArr.push(csvRecord);
          }
        }
      }
      return csvArr;
    };
    const convertRecordsToJson = (recordsFromCSVFile: CsvData[]) => {
      const records = recordsFromCSVFile;
      const udpRoutesData: UdpRouteData[] = [];
      for (let i = 0; i < records.length; i++) {
        const objDataUdpRoute: UdpRouteData = new DefaultUdpRouteData();
        const csvRecord: any = records[i];
        objDataUdpRoute.transportId = this.translateTransport(csvRecord, localMPEGTransports);
        objDataUdpRoute.clientTransportId = this.translateClientTransport(csvRecord, localMPEGTransports);
        objDataUdpRoute.address = csvRecord.ipAddress;
        objDataUdpRoute.port = csvRecord.port;
        objDataUdpRoute.name = csvRecord.tsname;
        objDataUdpRoute.tsid = csvRecord.tsid;
        udpRoutesData.push(objDataUdpRoute);
      }
      return udpRoutesData;
    };
    const checkTableDataExist = (data: UdpRouteData[], udpRoutes: UDPRoute[], records: []) => {
      const mismatchedLocalTransport = this.matchRecordsToLocalTransports(data, localMPEGTransports);
      const matchedWithLocalUdpRoute = this.matchRecordsToLocalUdpRoute(data, udpRoutes);

      if (mismatchedLocalTransport.length > 0){
        swal('Import Error:',
          'Invalid format line: 2, \n reason: Invalid transport name / id ' + mismatchedLocalTransport[0].name + ':' + mismatchedLocalTransport[0].tsid,
          'error').then();
      }
      if (matchedWithLocalUdpRoute.length > 0){
        swal('Import Error:',
          'Invalid format line: 2, \n reason: Transport ' + matchedWithLocalUdpRoute[0].tsid + ':' + matchedWithLocalUdpRoute[0].name + ' already exist',
          'error').then();
      }
      if (matchedWithLocalUdpRoute.length < 1 && mismatchedLocalTransport.length < 1) {
        setTimeout(() => {
          this.outputsService.sendDataOutputUdpRouteCSV(data);
        }, 1000);
      }
    };

    const fileServiceImport = ({loaded, total, progress, fileName}) => {
      const type = ProgressBarType.IMPORT;
      this.fileUploadService.sendImportProgress({loaded, total, progress, fileName, type});
    };
    if (isDefined(fileEvent)) {
      onImportNow(fileEvent, udpRoutes, getDataRecordsArrayFromCSVFile, convertRecordsToJson, checkTableDataExist, fileServiceImport, 'outputs');
    } else {
      document.getElementById('fileInput').click();
    }
  }

  public onExport(udpRoutes: MPEGRoute[], translatedUDPRoutes: TranslatedUDPRoute[]) {
    let csvContent = dtvCSVContent;
    csvContent = csvContent + outputsHeader.join() + '\r\n';
    let loaded = 0;

    udpRoutes.forEach(udpRoute => {
      const row = this.extractCsvData(udpRoute, translatedUDPRoutes);
      if (isDefined(row)) {
        csvContent += row + '\r\n';
        loaded++;
        const total = udpRoutes.length;
        const progress = (loaded / total) * 100;
        const fileName = outputsFilename;
        const type = ProgressBarType.EXPORT;
        this.fileUploadService.sendImportProgress({loaded, total, progress, fileName, type});
      }
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', outputsFilename);
    document.body.appendChild(link);
    link.click();
  }

  private extractCsvData(udpRoute: MPEGRoute, translatedUDPRoutes: TranslatedUDPRoute[]): string {
    const translatedUDPRoute = this.getTranslatedUDPRoute(udpRoute, translatedUDPRoutes);
    let csvString: string;
    if (isDefined(translatedUDPRoute)) {
      const tsid = translatedUDPRoute.tsid;
      const transportName = this.escapeCsvValue(translatedUDPRoute.transportName);
      const address = this.escapeCsvValue(udpRoute.address);
      csvString = `${tsid},${transportName},${address},${(udpRoute.port)}`;
    } else {
      console.log('ModalOutputsAtsc1UdpComponent extractCsvData, cannot find translatedUDPRoute for udpRoute: ',
        udpRoute);
    }
    return csvString;
  }

  private escapeCsvValue(value: any): string {
    if (typeof value === 'string' && value.includes(',')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private getTranslatedUDPRoute(udpRoute: MPEGRoute, translatedUDPRoutes: TranslatedUDPRoute[]): TranslatedUDPRoute {
    return translatedUDPRoutes.find(translatedUDPRoute => {
      return udpRoute.id > 0 ? udpRoute.id === translatedUDPRoute.id :
        udpRoute.clientId === translatedUDPRoute.clientId;
    });
  }


  private matchRecordsToLocalTransports(data: UdpRouteData[], localMPEGTransports: AbstractMPEGTransport[]) {
    return data.filter(
      (item1) => !localMPEGTransports.some((item2) => item1.transportId === item2.id && item1.name === item2.name)
    );
  }
  private matchRecordsToLocalUdpRoute(data: UdpRouteData[], udpRoute: UDPRoute[]) {
    return data.filter(
      (item1) => udpRoute?.some((item2) => item1.transportId === item2.transportId && item1.port === item2.port.toString() && item1.address === item2.address)
    );
  }


  private translateTransport(csvRecord: TransportUdpCsvData, localMPEGTransports: AbstractMPEGTransport[]) {
    return localMPEGTransports
      .find(item => item.tsid.toString() === csvRecord.tsid && item.name === csvRecord.tsname)?.id;
  }
  private translateClientTransport(csvRecord: TransportUdpCsvData, localMPEGTransports: AbstractMPEGTransport[]) {
    return localMPEGTransports
      .find(item => item.tsid.toString() === csvRecord.tsid && item.name === csvRecord.tsname)?.clientId;
  }


}
