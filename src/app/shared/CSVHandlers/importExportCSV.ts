// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {AbstractElement} from '../../core/models/AbstractElement';
import * as _swal from 'sweetalert';
import {SweetAlert} from 'sweetalert/typings/core';
import {isEqual} from 'lodash';
import {
  dtvCSVContent,
  networksHeader,
  outputsHeader,
  transportsHeader
} from '../../core/models/dtv/importExport/importExport';

const swal: SweetAlert = _swal as any;

export function exportElementsToCSV(elements: AbstractElement[], header, filename, processFunction, fileServiceImport?) {
  processData(elements, header, filename, processFunction, fileServiceImport);
}

function processData(allData, header, filename, processFunction, fileServiceImport) {
  const streamArray = [];
  allData?.forEach(item => {
    const streamTempHolder = processFunction(item);
    streamTempHolder?.forEach(streamItem => {
      streamArray.push(streamItem);
    });
  });
  createCSV(streamArray, header, filename, fileServiceImport);
}

function createCSV(streamArray, header, filename, fileServiceImport) {
  let csvContent = dtvCSVContent;
  csvContent = csvContent + header + '\r\n';
  let loaded = 0;
  streamArray.forEach(function(rowArray) {
    const row = rowArray.join(',');
    csvContent += row + '\r\n';
    loaded++;
    const total = streamArray.length;
    const progress = (loaded / total) * 100;
    const fileName = filename;
    fileServiceImport({loaded, total, progress, fileName});
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
}

export function onImportNow(fileEvent: HTMLInputElement, localDataStreams: AbstractElement[], getDataRecordsArrayFromCSVFile, convertRecordsToJson, checkTableDataExist, fileServiceImport, originType) {
  if (fileEvent.files && fileEvent.files.length > 0) {
    const file = fileEvent.files[0];
    let records = [];
    if (isValidCSVFile(file)) {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const loaded = e.loaded;
          const total = e.total;
          const progress = (loaded / total) * 100;
          const fileName = file.name;
          fileServiceImport({loaded, total, progress, fileName});
          console.log(`Loaded ${loaded} of ${total} bytes (${progress}%)`);
        }
      };
      reader.onload = () => {
        const csvData = reader.result;
        const csvRecordsArray = (csvData as string).split(/\r\n|\n/);
        const headersRow = getHeaderArray(csvRecordsArray, originType);
        records = getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow.length);
        const csvtoJsonData = convertRecordsToJson(records);
        checkTableDataExist(csvtoJsonData, localDataStreams, records);
      };
      reader.onerror = () => {
        console.log('error is occured while reading file!');
      };
    } else {
      swal('Please import valid .csv file.', '', 'error').then();
      records = [];
    }

  } else {
    console.log('no file selected');

  }
}

function isValidCSVFile(file: any) {
  return file.name.endsWith('.csv');
}

function getHeaderArray(csvRecordsArr: any, originType) {
  const headers = (csvRecordsArr[0]).split(',');
  const headerArray = [];
  for (let j = 0; j < headers.length; j++) {
    headerArray.push(headers[j]);
  }
  if ((isEqual(headerArray, transportsHeader) && originType === 'transports') ||
    (isEqual(headerArray, networksHeader) && originType === 'networks') ||
    (isEqual(headerArray, outputsHeader) && originType === 'outputs') ) {
    return headerArray;
  }
  else {
    swal('Please import valid .csv file.', '', 'error').then();
    return;
  }
}
