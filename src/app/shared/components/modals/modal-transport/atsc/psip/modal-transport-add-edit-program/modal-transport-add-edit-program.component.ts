/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */
import {cloneDeep} from 'lodash';
import {ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';

import {numberOnly, pcrDefaultValue, pmtDefaultValue} from '../../../../../../helpers/appWideFunctions';
import {ActionMessage, ButtonType, ButtonTypes, ImageType, MultipleTableColumns} from 'src/app/core/models/ui/dynamicTable';
import {DefaultProgram, Program} from '../../../../../../../core/models/dtv/network/physical/stream/mpeg/Program';
import {isDefined} from '../../../../../../../core/models/dtv/utils/Utils';
import {isElementIdMatch, updateElementList} from '../../../../../../../core/models/AbstractElement';
import {ModalDynamicTbTranslateComponent} from '../../../../modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {numberToHex} from '../../../../../../helpers/decimalToHexadecimal';
import {DefaultElementaryStream, ELEMENTARY_STREAM_TYPES, ElementaryStream, ElementaryStreamType, isAC3Stream} from '../../../../../../../core/models/dtv/network/physical/stream/mpeg/ElementaryStream';
import {AC3ElementaryStream, DefaultAC3ElementaryStream} from '../../../../../../../core/models/dtv/network/physical/stream/mpeg/audio/AC3ElementaryStream';

declare var $;

@Component({
  selector: 'app-modal-transport-add-edit-program',
  templateUrl: './modal-transport-add-edit-program.component.html',
  styleUrls: ['./modal-transport-add-edit-program.component.scss']
})
export class ModalTransportAddEditProgramComponent implements OnInit, OnChanges {
  @Input() program: Program;
  @Input() programs: Program[];
  @Input() programEditMode: boolean;
  @Output() programChanged: EventEmitter<Program> = new EventEmitter();
  @ViewChild(ModalDynamicTbTranslateComponent) elementaryStreamsDynamicTable: ModalDynamicTbTranslateComponent;
  public readonly numberToHex = numberToHex;
  public readonly numberOnly = numberOnly;
  public localProgram: Program = new DefaultProgram(1, 48, 49);
  public localPrograms: Program[] = [];
  public localElementaryStreams: ElementaryStream[];
  public localElementaryStream: ElementaryStream = new DefaultElementaryStream(
    ElementaryStreamType.STANDARD_13818_2_VIDEO);
  public localAC3ElementaryStream: AC3ElementaryStream = new DefaultAC3ElementaryStream(1, 1);
  public modalTitle: string;
  public iconTextNumber: string;
  public iconTextPMTPID: string;
  public iconTextPCRPID: string;
  public editMode = false;
  public buttonList: ButtonTypes[] = [
    {name: ButtonType.ADD, imgSrc: ImageType.add, alwaysEnabled: true},
    {name: ButtonType.EDIT, imgSrc: ImageType.edit},
    {name: ButtonType.DELETE, imgSrc: ImageType.delete, supportsMultiSelect: true},
  ];
  public tableHeaders: MultipleTableColumns[] = [
    {header: 'PID', key: 'pid', visible: true, translateField: true, showHex: true},
    {header: 'Stream Type', key: 'streamType', visible: true, function: this.getStreamType},
  ];
  public okButtonEnabled = false;
  public modalNameElemStream = '#modalElemStream';
  public objectTitle = 'Elementary Stream';
  private numberValid: boolean;
  private pmtPIDValid: boolean;
  private pcrPIDValid: boolean;
  private numberExists: boolean;

  constructor(private cdr: ChangeDetectorRef) {
  }

  public ngOnInit(): void {
    this.localProgram = cloneDeep(this.program);
    this.localPrograms = cloneDeep(this.programs);
    this.localElementaryStreams = this.localProgram.elementaryStreams;
    this.updateProgramValid();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (isDefined(changes.program)) {
      const newProgram: Program = changes.program.currentValue;
      this.localProgram = cloneDeep(newProgram);
      this.localElementaryStreams = this.localProgram.elementaryStreams;

    }
    if (isDefined(changes.programs)) {
      this.localPrograms = cloneDeep(changes.programs.currentValue);
    }
    if (isDefined(changes.programEditMode)) {
      this.programEditMode = changes.programEditMode.currentValue;
    }
    this.updateProgramValid();
  }

  public elementaryStreamChangedHandler(updatedElementaryStream: ElementaryStream): void {
    console.log('ModalTransportAddEditProgramComponent, elementaryStreamChangedHandler updatedElementaryStream: ',
      updatedElementaryStream);
    this.localElementaryStream = updatedElementaryStream;
    this.addUpdateCurrentElementaryStream();
    this.cdr.detectChanges();
  }

  public onRowClicked($event: any): void {
    console.log('ModalTransportAddEditProgramComponent, onRowClicked: ', $event);
    this.iconTextNumber = 'text-success';
  }

  public onButtonClicked($event: any) {
    switch ($event.message) {
      case ActionMessage.ADD:
        this.onAddRow();
        break;
      case ActionMessage.EDIT:
        this.onEditRow();
        break;
      case ActionMessage.DELETE:
        this.onDeleteRow();
        break;
    }
    this.cdr.detectChanges();
  }

  public closeModal() {
    $('#modalAddTransportProgram').modal('hide');
  }

  public inputProgramNumber(){
    this.localProgram.pmtPid = pmtDefaultValue(this.localProgram.programNumber);
    this.localProgram.pcrPid = pcrDefaultValue(this.localProgram.programNumber);
    this.updateProgramValid();
  }

  public inputProgram() {
    this.updateProgramValid();
  }

  public clickAddProgram() {
    this.programChanged.emit(this.localProgram);
    this.closeModal();
  }

  getStreamType(streamType: ElementaryStreamType): string {
    return ELEMENTARY_STREAM_TYPES[streamType]?.displayName || 'Unknown';
  }

  private onAddRow() {
    this.editMode = false;
    this.localElementaryStream = new DefaultElementaryStream(this.mpegVideoElementaryStreamExists() ?
      ElementaryStreamType.STANDARD_ATSC_52_AC3 : ElementaryStreamType.STANDARD_13818_2_VIDEO);
    this.localAC3ElementaryStream = new DefaultAC3ElementaryStream(this.getNextAudioId(), this.getMainServiceId());
  }

  private onEditRow() {
    this.editMode = true;
    this.localElementaryStream = this.elementaryStreamsDynamicTable.selectedRow;
    if (isAC3Stream(this.localElementaryStream)) {
      this.localAC3ElementaryStream = this.localElementaryStream as AC3ElementaryStream;
    }
  }

  private onDeleteRow(): void {
    this.multipleDeletion();
  }

  private multipleDeletion(): void {
    const len = this.elementaryStreamsDynamicTable.selectedRowIds.length;
    for (let i = 0; i < len; i++) {
      const selectID = this.elementaryStreamsDynamicTable?.selectedRowIds[i];
      this.localProgram.elementaryStreams = this.localProgram.elementaryStreams.filter(transport => {
        const idMatch = transport.id.toString() !== selectID.toString();
        const clientIdMatch = transport.clientId !== selectID.toString();
        return idMatch && clientIdMatch;
      });
    }
    this.localElementaryStreams = this.localProgram.elementaryStreams;
  }

  private updateProgramValid(): void {
    this.updateModalTitle();
    this.updateNumberValid();
    this.updatePMTValid();
    this.updatePCRValid();
    this.updateOkEnabled();
  }

  private updateModalTitle(): void {
    const programNumberText = this.localProgram.programNumber > 0 ? this.localProgram.programNumber.toString() : '';

    this.modalTitle =
      (this.programEditMode ? 'Edit ' : 'Add ') + ' Program ' +
      (programNumberText.length > 0 ? ' - ' : '') +
      programNumberText;
  }

  private updateNumberValid(): void {
    this.updateNumberExists();
    this.numberValid = !this.numberExists && isDefined(
      this.localProgram.programNumber) && this.localProgram.programNumber > 0 && (this.localProgram.programNumber > 0 &&  this.localProgram.programNumber < 65535);
    this.iconTextNumber = this.numberValid ? 'text-success' : 'text-danger';
  }

  private updatePMTValid(): void {
    this.pmtPIDValid = isDefined(this.localProgram?.pmtPid) && (this.localProgram.pmtPid > 0 &&  this.localProgram.pmtPid < 8191);
    this.iconTextPMTPID = this.pmtPIDValid ? 'text-success' : 'text-danger';
  }

  private updatePCRValid(): void {
    this.pcrPIDValid = isDefined(this.localProgram?.pcrPid) && (this.localProgram.pcrPid > 0 && this.localProgram.pcrPid < 8191);
    this.iconTextPCRPID = this.pcrPIDValid ? 'text-success' : 'text-danger';
  }

  private updateOkEnabled(): void {
    this.okButtonEnabled = this.numberValid && this.pmtPIDValid && this.pcrPIDValid;
  }

  private updateNumberExists() {
    let matchedProgram: Program;
    if (this.localProgram?.programNumber > 0) {
      matchedProgram = this.programs?.find(
        program => {
          const idMatch = this.programEditMode ? !isElementIdMatch(this.localProgram,
            program) : true;
          return idMatch && this.localProgram.programNumber === program.programNumber;
        });
    }
    this.numberExists = matchedProgram !== undefined;
  }

  private addUpdateCurrentElementaryStream() {
    this.localProgram.elementaryStreams = updateElementList(this.localProgram.elementaryStreams,
      this.localElementaryStream, this.editMode) as ElementaryStream[];
    this.localElementaryStreams = this.localProgram.elementaryStreams;
  }

  private mpegVideoElementaryStreamExists(): boolean {
    return this.localProgram.elementaryStreams.findIndex(
      elementaryStream => elementaryStream.streamType === ElementaryStreamType.STANDARD_13818_2_VIDEO) > -1;
  }

  private getNextAudioId(): number {
    let maxAudioId = -1;
    this.localProgram.elementaryStreams.forEach(elementaryStream => {
      if (elementaryStream.streamType === ElementaryStreamType.STANDARD_ATSC_52_AC3) {
        const ac3ElementaryStream: AC3ElementaryStream = elementaryStream as AC3ElementaryStream;
        if (ac3ElementaryStream.audioId > maxAudioId) {
          maxAudioId = ac3ElementaryStream.audioId;
        }
      }
    });
    return maxAudioId > 0 ? maxAudioId + 1 : 1;
  }

  private getMainServiceId(): number {
    let maxMainServiceId = -1;
    this.localProgram.elementaryStreams.forEach(elementaryStream => {
      if (elementaryStream.streamType === ElementaryStreamType.STANDARD_ATSC_52_AC3) {
        const ac3ElementaryStream: AC3ElementaryStream = elementaryStream as AC3ElementaryStream;
        if (ac3ElementaryStream.mainServiceId > maxMainServiceId) {
          maxMainServiceId = ac3ElementaryStream.audioId;
        }
      }
    });
    return maxMainServiceId > 0 ? maxMainServiceId + 1 : 0;
  }

}
