/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */
import {cloneDeep} from 'lodash';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {numberOnly} from '../../../../../../helpers/appWideFunctions';
import {
  ELEMENTARY_STREAM_TYPES,
  ElementaryStream,
  ElementaryStreamType,
  isAC3Stream
} from '../../../../../../../core/models/dtv/network/physical/stream/mpeg/ElementaryStream';
import {numberToHex} from '../../../../../../helpers/decimalToHexadecimal';
import {isElementIdMatch} from '../../../../../../../core/models/AbstractElement';
import {isDefined} from '../../../../../../../core/models/dtv/utils/Utils';
import {inRangeCheck} from '../../../../../../helpers/mathHelprrs';
import {
  AC3ElementaryStream
} from '../../../../../../../core/models/dtv/network/physical/stream/mpeg/audio/AC3ElementaryStream';

declare var $;

@Component({
    selector: 'app-modal-transport-elementary-stream',
    templateUrl: './modal-transport-elementary-stream.component.html',
    styleUrls: ['./modal-transport-elementary-stream.component.scss']
})
export class ModalTransportElementaryStreamComponent implements OnInit, OnChanges {
    @Input() elementaryStream: ElementaryStream;
    @Input() ac3ElementaryStream: AC3ElementaryStream;
    @Input() elementaryStreams: ElementaryStream[];
    @Input() editMode: boolean;
    @Output() elementaryStreamChanged: EventEmitter<ElementaryStream> = new EventEmitter();
    public readonly numberToHex = numberToHex;
    public readonly numberOnly = numberOnly;
    public readonly ELEMENTARY_STREAM_TYPES = ELEMENTARY_STREAM_TYPES;
    public readonly elementaryStreamTypes: ElementaryStreamType[] = Object.values(ElementaryStreamType);
    public localElementaryStream: ElementaryStream;
    public localAC3ElementaryStream: AC3ElementaryStream;
    public localElementaryStreams: ElementaryStream[];
    public initialPage = true;
    public ac3NextDisabled: boolean;
    public okButtonEnabled: boolean;
    public modalTitle: string;
    public iconTextPID: string;
    public pidExists = true;
    private pidValid: boolean;
    private ac3FieldsValid = true;

    constructor(private cdr: ChangeDetectorRef) {
    }

    public ngOnInit(): void {
        this.localElementaryStream = cloneDeep(this.elementaryStream);
        this.localAC3ElementaryStream = cloneDeep(this.ac3ElementaryStream);
        this.updateElementaryStreamValid();
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (isDefined(changes.elementaryStreams)) {
            this.localElementaryStreams = changes.elementaryStreams.currentValue;
        }
        if (isDefined(changes.elementaryStream)) {
            this.localElementaryStream = cloneDeep(changes.elementaryStream.currentValue);
        }
        if (isDefined(changes.ac3ElementaryStream)) {
            this.localAC3ElementaryStream = cloneDeep(changes.ac3ElementaryStream.currentValue);
        }
        if (isDefined(changes.editMode)) {
            this.editMode = changes.editMode.currentValue;
        }
        this.updateElementaryStreamValid();
        this.cdr.detectChanges();
        this.updateModalTitle();
    }

    public ac3OkButtonChange(okButtonEnabed: boolean): void {
        this.ac3FieldsValid = okButtonEnabed;
        this.updateOkButtonEnabled();
    }

    public clickPrev(): void {
        this.initialPage = true;
    }

    public clickNext() {
        this.initialPage = false;
    }

    public onKeydown(event) {
        if (event.keyCode === 32) {
            return false;
        }
    }

    public inputPid() {
        this.updatePidValid();
        this.updateOkButtonEnabled();
    }

    public onChangeStreamType() {
        this.ac3NextDisabled = !isAC3Stream(this.localElementaryStream);
        this.cdr.detectChanges();
        this.updateOkButtonEnabled();
    }

    public addUpdateElementaryStream() {
        this.closeModal();
        if (isAC3Stream(this.localElementaryStream)) {
            this.localAC3ElementaryStream.pid = this.localElementaryStream.pid;
            this.elementaryStreamChanged.emit(this.localAC3ElementaryStream);
        } else {
            this.elementaryStreamChanged.emit(this.localElementaryStream);
        }
        this.pidExists = false;
        this.iconTextPID = 'text-success';
    }

    public closeModal() {
        $('#modalElemStream').modal('hide');
        this.initialPage = true;
    }

    private updateElementaryStreamValid(): void {
        this.inputPid();
        this.onChangeStreamType();
    }

    private updatePidValid(): void {
        this.updatePidExists();
        this.pidValid = !this.pidExists && inRangeCheck(this.localElementaryStream.pid, 1, 2147483647);
        this.iconTextPID = this.pidValid ? 'text-success' : 'text-danger';
    }

    private updateModalTitle(): void {
        this.modalTitle =
            (this.editMode ? 'Edit ' : 'Add ') + ' Elementary Stream';
    }

    private updateOkButtonEnabled() {
        this.okButtonEnabled = this.pidValid && this.ac3FieldsValid;
    }

    private updatePidExists() {
        let matchedStream: ElementaryStream;
        if (this.localElementaryStream.pid > 0) {
            if (this.editMode) {
                matchedStream = this.localElementaryStreams?.find(
                    elementaryStream => !isElementIdMatch(this.localElementaryStream,
                        elementaryStream) && this.localElementaryStream.pid === elementaryStream.pid);
            } else {
                matchedStream = this.localElementaryStreams?.find(
                    elementaryStream => this.localElementaryStream.pid === elementaryStream.pid);
            }
        }
        this.pidExists = matchedStream !== undefined;
    }
}
