// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {DataPackage} from '../../../../../core/models/dtv/network/physical/stream/ip/data/DataPackage';
import {DataElement} from '../../../../../core/models/dtv/network/physical/stream/ip/data/element/DataElement';
import {DataPackageService} from '../../../../../core/services/data-package.service';
import {Subject} from 'rxjs';
import {v4 as uuidv4} from 'uuid';

declare var $;

@Component({
  selector: 'app-modal-file-upload',
  templateUrl: './modal-file-upload.component.html',
  styleUrls: ['./modal-file-upload.component.scss']
})
export class ModalFileUploadComponent implements OnInit, OnChanges {
  @Input() currentDataPackage: DataPackage;
  @Input() currentDataElement: DataElement;
  @Output() updateFileUploadStatus: EventEmitter<any> = new EventEmitter();
  modalTitle = 'File upload Progress';
  fileSizeUnit = 1024;
  requestId: string;
  uploadedMedia: Array<any> = [];

  constructor(private dataPackageService: DataPackageService) {
  }

  ngOnInit(): void {
  }

  closeFileUploadModal() {
    $('#fileUploadModal').modal('hide');
  }

  uploadFile() {
  }

  onFileBrowse(event: Event) {
    const target = event.target as HTMLInputElement;
    this.processFiles(target.files);
  }

  processFiles(files) {
    for (const file of files) {
      const reader = new FileReader();
      reader.readAsDataURL(file); // read file as data url
      reader.onload = (event: any) => {
        this.uploadedMedia.push({
          FileName: file.name,
          FileSize:
            this.getFileSize(file.size) +
            ' ' +
            this.getFileSizeUnit(file.size),
          FileType: file.type,
          FileUrl: event.target.result,
          FileProgessSize: 0,
          FileProgress: 0,
          ngUnsubscribe: new Subject<any>(),
        });

        this.startProgress(file, this.uploadedMedia.length - 1);
      };
    }
  }

  async startProgress(file, index) {
    const filteredFile = this.uploadedMedia
      .filter((u, i) => i === index)
      .pop();

    if (filteredFile != null) {
      const fileSize = this.getFileSize(file.size);
      const fileSizeInWords = this.getFileSizeUnit(fileSize);
      if (true) {
        const formData = new FormData();
        formData.append('File', file);
        this.requestId = uuidv4();
        this.dataPackageService.dataPackageMedia(this.currentDataPackage, this.currentDataElement, formData,
          this.requestId)
          .subscribe(
            (res: any) => {
              if (res.status === 'progress') {
                const completedPercentage = parseFloat(res.message);
                const progress = (fileSize * completedPercentage) / 100;
                filteredFile.FileProgessSize = `${progress.toFixed(2)} ${fileSizeInWords}`;
                filteredFile.FileProgress = completedPercentage;
              } else if (res.status === 'completed') {
                filteredFile.Id = res.Id;
                filteredFile.FileProgessSize = `${fileSize} ${fileSizeInWords}`;
                filteredFile.FileProgress = 100;
              }
            },
            (error: any) => {
              console.error('File upload error:', error);
            }
          );
      } else {
        for (
          let f = 0;
          f < fileSize + fileSize * 0.0001;
          f += fileSize * 0.01
        ) {
          filteredFile.FileProgessSize = f.toFixed(2) + ' ' + fileSizeInWords;
          const percentUploaded = Math.round((f / fileSize) * 100);
          filteredFile.FileProgress = percentUploaded;
          await this.fakeWaiter(Math.floor(Math.random() * 35) + 1);
        }
      }
    }
  }

  getFileSize(fileSize: number): number {
    if (fileSize > 0) {
      if (fileSize < this.fileSizeUnit * this.fileSizeUnit) {
        fileSize = parseFloat((fileSize / this.fileSizeUnit).toFixed(2));
      } else if (
        fileSize <
        this.fileSizeUnit * this.fileSizeUnit * this.fileSizeUnit
      ) {
        fileSize = parseFloat(
          (fileSize / this.fileSizeUnit / this.fileSizeUnit).toFixed(2)
        );
      }
    }

    return fileSize;
  }

  getFileSizeUnit(fileSize: number) {
    let fileSizeInWords = 'bytes';

    if (fileSize > 0) {
      if (fileSize < this.fileSizeUnit) {
        fileSizeInWords = 'bytes';
      } else if (fileSize < this.fileSizeUnit * this.fileSizeUnit) {
        fileSizeInWords = fileSize + 'KB';
      } else if (fileSize < this.fileSizeUnit * this.fileSizeUnit * this.fileSizeUnit) {
        fileSizeInWords = 'MB';
      }
    }

    return fileSizeInWords;
  }

  fakeWaiter(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  ngOnChanges() {
  }

  removeImage(idx: number) {
    this.uploadedMedia = this.uploadedMedia.filter((u, index) => index !== idx);
  }
}
