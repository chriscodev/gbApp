// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import * as moment from 'moment/moment';
import * as _swal from 'sweetalert';
import {SweetAlert} from 'sweetalert/typings/core';
import {TransportService} from '../../core/services/transport.service';
import {v4 as uuidv4} from 'uuid';
import {exportElementsToCSV, onImportNow} from './importExportCSV';
import {CsvData, CsvDataRecord, ImportCSVData} from '../../core/models/dtv/transport/transportInterface';
import {
  AbstractPSIPTransport,
  AbstractTransport,
  TRANSPORT_TYPES
} from '../../core/models/dtv/network/physical/Transport';
import {convertCodeToElemStreamName, convertElemStreamTypeToCode} from '../helpers/appWideFunctions';
import {FileUploadService} from '../../core/services/file-upload.service';
import {ProgressBarType} from '../../core/interfaces/ProgressBarDataInterface';
import {
  TRANSPORT_TYPE_CODE,
  transportsFilename,
  transportsHeader
} from '../../core/models/dtv/importExport/importExport';

const swal: SweetAlert = _swal as any;

export class TransportCSVHandler {
  // TODO DAC See if this makes sense to have as a separate class
  public importTransDataCSV: CsvData[] = [];
  public modalImportCSVData: ImportCSVData[];
  public importAction = false;
  public timeStamp: number;
  public records: CsvData[] = [];

  constructor(public transportService: TransportService, private fileUploadService: FileUploadService) {
  }

  public openImportFileHandler(fileEvent: HTMLInputElement, maxAdditionalTransportStreams: number, localTransportStreams: AbstractTransport[]) {
    this.importAction = true;
    const getDataRecordsArrayFromCSVFile = (csvRecordsArray: string | any[], headerLength: number) => {
      const csvArr = [];
      for (let i = 1; i < csvRecordsArray.length; i++) {
        const currentRecord = (csvRecordsArray[i]).split(',');
        const csvRecord: CsvDataRecord = new CsvDataRecord();
        csvRecord.programs = [];
        if (currentRecord.length === headerLength) {
          csvRecord.tsid = currentRecord[0].trim();
          csvRecord.tsname = currentRecord[1].trim();
          csvRecord.tstype = currentRecord[2].trim();
          csvRecord.name = currentRecord[2].trim();
          csvRecord.transportType = TRANSPORT_TYPE_CODE[currentRecord[2].trim()]?.transportCode;
          csvRecord.pn = currentRecord[3]?.trim();
          csvRecord.pmtpid = currentRecord[4].trim();
          csvRecord.pcrpid = currentRecord[5].trim();
          csvRecord.espid = currentRecord[6].trim();
          csvRecord.st = currentRecord[7].trim();
          csvArr.push(csvRecord);
        } else {
          csvRecord.tsid = currentRecord[0];
          csvRecord.tsname = currentRecord[1];
          csvRecord.tstype = currentRecord[2];
          csvRecord.transportType = TRANSPORT_TYPE_CODE[currentRecord[2]]?.transportCode;
          csvRecord.pn = currentRecord[3];
          csvRecord.pmtpid = currentRecord[4] !== undefined ? currentRecord[4] : '';
          csvRecord.pcrpid = currentRecord[5] !== undefined ? currentRecord[5] : '';
          csvRecord.espid = currentRecord[6] !== undefined ? currentRecord[6] : '';
          csvRecord.st = currentRecord[7] !== undefined ? currentRecord[7] : '';
          csvRecord.programs = [];
          if (currentRecord.length !== 1) {
            csvArr.push(csvRecord);
          }
        }
        if (csvArr[0].pn === '') {
          delete csvArr[0].programs;
        }
      }
      return csvArr;
    };
    const convertRecordsToJson = (recordsFromCSVFile: CsvData[]) => {
      const records = recordsFromCSVFile;
      const transportData = [];
      const objDataTransport: ImportCSVData = {name: '', selectedType: '', transportType: '', tsid: '', tsname: '', tstype: '', pn: null};
      const progData = [];
      const uniqueIdsRecord = new Set();
      const uniqueRecords = records.filter(element => {
        const isDuplicate = uniqueIdsRecord.has(element.tsid);
        uniqueIdsRecord.add(element.tsid);
        return !isDuplicate;
      });
      this.importTransDataCSV = uniqueRecords;
      for (let i = 0; i < records.length; i++) {
        this.timeStamp = moment().toDate().getTime();
        const csvRecord: CsvData = records[i];
        objDataTransport.tsid = csvRecord?.tsid;
        objDataTransport.tsname = csvRecord?.tsname;
        objDataTransport.name = csvRecord?.tsname;
        objDataTransport.tstype = csvRecord?.tstype;
        objDataTransport.selectedType = convertElemStreamTypeToCode(csvRecord?.tstype);
        objDataTransport.transportType = TRANSPORT_TYPE_CODE[csvRecord?.tstype]?.transportCode;
        // @ts-ignore
        if (csvRecord?.pn !== null || csvRecord.pn !== 0) {
          progData.push({
            tsid: csvRecord.tsid,
            number: csvRecord?.pn,
            pmtPid: csvRecord?.pmtpid,
            pcrPid: csvRecord?.pcrpid,
            id: 0,
            clientId: uuidv4()
          });
        }
      }
      const uniqueIds = new Set();
      const unique = progData.filter(element => {
        const isDuplicate = uniqueIds.has(element.number);
        uniqueIds.add(element.number);
        return !isDuplicate;
      });
      for (let x = 0; x < unique.length; x++) {
        const streamElem = [];
        for (let i = 0; i < records.length; i++) {
          const csvRecord: CsvData = records[i];
          this.timeStamp = moment().toDate().getTime();
          if (csvRecord?.espid !== '' && unique[x].number === csvRecord?.pn) {
            let streamType = convertElemStreamTypeToCode(csvRecord?.st);
            if (streamType === 'MPEG2 Video') {
              streamType = 'STANDARD_13818_2_VIDEO';
            }
            if (streamType === 'STANDARD_ATSC_52_AC3') {
              streamElem.push({
                pid: csvRecord?.espid,
                streamType,
                id: 0,
                clientId: uuidv4(),
                audioServiceType: 'COMPLETE_MAIN',
                priority: 'NOT_SPECIFIED',
                audioId: 1,
                mainServiceId: 0,
                associatedServiceId: 0,
                sampleRate: 'kHz48',
                surroundMode: 'NOT_INDICATED',
                fullService: true,
                description: '',
                language: {
                  readable: 'English',
                  iso2Code: 'en',
                  iso3Code: 'eng'
                },
                exactBitRate: false,
                bitRate: 'K384',
                audioCoding: 'LEFT_RIGHT',
                useNumberOfChannels: false,
                numberOfChannels: 0
              });

            } else {
              streamElem.push({
                pid: csvRecord?.espid,
                streamType,
                id: 0,
                clientId: uuidv4()
              });
            }
          }
        }
        unique[x].elementaryStreams = streamElem;
      }
      for (let y = 0; y < uniqueRecords.length; y++) {
          const transData = uniqueRecords[y];
          transData.programs = [];
          for (let i = 0; i < unique.length; i++) {
            if (transData) {
              if ( unique[i].tsid === uniqueRecords[y].tsid){
                unique[i].programNumber = unique[i].number;
                transData.programs?.push(unique[i]);
              }
              if (transData.pn === '' || transData.pn === undefined || transData.pn === null ) {
                transData.pn = null;
                transData.programs = [];
              }
            }
          }
          transData.name = transData.tsname;
          transportData.push(transData);
      }
      return transportData;
    };
    const checkTableDataExist = (data: [], localTransportStreams: AbstractTransport[]) => {
      let csvRecord: CsvDataRecord = new CsvDataRecord();
      let dataExist = false;
      for (let i = 0; i < localTransportStreams.length; i++) {
        const tData = localTransportStreams[i];
        for (let x = 0; x < data.length; x++) {
          csvRecord = data[x];
          if (tData?.tsid.toString() === csvRecord.tsid.toString() && tData.name === csvRecord.tsname) {
            dataExist = true;
            this.fileReset();
            swal('Import Error:',
              'Invalid format line: 2, \n reason: Transport ' + tData.tsid + ':' + tData.name + ' already exist',
              'error').then();
          }
        }
      }

      if (dataExist === false) {
        this.modalImportCSVData = data;
        this.transportService.sendDataTransportCSV(data);
      }

    };
    const fileServiceImport = ({loaded, total, progress, fileName}) => {
      const type = ProgressBarType.IMPORT;
      this.fileUploadService.sendImportProgress({loaded, total, progress, fileName, type});
    };

    if (fileEvent !== undefined) {
      onImportNow(fileEvent, localTransportStreams, getDataRecordsArrayFromCSVFile, convertRecordsToJson, checkTableDataExist, fileServiceImport, 'transports');
    } else {
      document.getElementById('fileInput').click();
    }
  }

  public onExport(transportStreams: AbstractTransport[]) {
    const checkingPrograms = (rowData: AbstractPSIPTransport) => {
      const streamArray = [];
      const transType = TRANSPORT_TYPES[rowData.transportType]?.displayName;
      if (rowData.programs !== undefined) {
        const programs = rowData.programs;
        if (programs.length !== 0) {
          for (let i = 0; i < programs.length; i++) {
            const elemStreamArrData = programs[i].elementaryStreams;
            const progData = programs[i];
            if (elemStreamArrData.length !== 0) {
              const programData = programs[i];
              for (let x = 0; x < elemStreamArrData.length; x++) {
                const arrData = [];
                const streamName = convertCodeToElemStreamName(elemStreamArrData[x].streamType);
                arrData.push(rowData.tsid);
                arrData.push(rowData.name);
                arrData.push(transType);
                arrData.push(programData.programNumber);
                arrData.push(programData.pmtPid);
                arrData.push(programData.pcrPid);
                arrData.push(elemStreamArrData[x].pid);
                arrData.push(streamName.shortName);
                streamArray.push(arrData);
              }

            } else {
              const arrData = [];
              arrData.push(rowData.tsid);
              arrData.push(rowData.name);
              arrData.push(transType);
              arrData.push(progData.programNumber);
              arrData.push(progData.pmtPid);
              arrData.push(progData.pcrPid);
              streamArray.push(arrData);
            }

          }
        } else {
          const arrData = [];
          arrData.push(rowData.tsid);
          arrData.push(rowData.name);
          arrData.push(transType);
          streamArray.push(arrData);
        }
      } else if (rowData?.hasOwnProperty('clientId') && rowData?.clientId !== '') {
        const arrData = [];
        arrData.push(rowData.tsid);
        arrData.push(rowData.name);
        arrData.push(transType);
        streamArray.push(arrData);
      }
      return streamArray;
    };
    const fileServiceImport = ({loaded, total, progress, fileName}) => {
      const type = ProgressBarType.EXPORT;
      this.fileUploadService.sendImportProgress({loaded, total, progress, fileName, type});
    };
    exportElementsToCSV(transportStreams, transportsHeader.join(), transportsFilename, checkingPrograms, fileServiceImport);
  }


  private isMaxTransportsFull(maxAdditionalTransportStreams: number) {
    return this.importTransDataCSV.length > maxAdditionalTransportStreams;
  }

  ///////////////////////////////////////////////
  // END IMPORTING FUNCTIONALITY
  ///////////////////////////////////////////////

  //////////////////////////////////////////////
  // EXPORTING FUNCTIONALITY
  /////////////////////////////////////////////

  private fileReset() {
    this.records = [];
  }
}
