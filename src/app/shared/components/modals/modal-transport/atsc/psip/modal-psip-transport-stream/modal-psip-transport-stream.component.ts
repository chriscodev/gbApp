/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */
import {ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {ActionMessage, ButtonType, ButtonTypes, ImageType, MultipleTableColumns} from 'src/app/core/models/ui/dynamicTable';
import {DefaultProgram, Program} from 'src/app/core/models/dtv/network/physical/stream/mpeg/Program';
import {
    ModalDynamicTbTranslateComponent
} from '../../../../modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {AbstractPSIPTransport, AbstractTransport} from '../../../../../../../core/models/dtv/network/physical/Transport';
import {cloneDeep} from 'lodash';
import {isDefined} from '../../../../../../../core/models/dtv/utils/Utils';
import {updateElementList} from '../../../../../../../core/models/AbstractElement';

declare var $;

@Component({
    selector: 'app-modal-psip-transport-stream',
    templateUrl: './modal-psip-transport-stream.component.html',
    styleUrls: ['./modal-psip-transport-stream.component.scss'],
})
export class ModalPsipTransportStreamComponent implements OnInit, OnChanges {
    @Input() transportStream: AbstractTransport;
    @ViewChild(ModalDynamicTbTranslateComponent) programsDynamicTable: ModalDynamicTbTranslateComponent;
    public psipTransportStream: AbstractPSIPTransport;
    public localPSIPTransportStream: AbstractPSIPTransport;
    public localPrograms: Program[];
    public editMode: boolean;
    public buttonListProgram: ButtonTypes[] = [
        {name: ButtonType.ADD, imgSrc: ImageType.add, alwaysEnabled: true},
        {name: ButtonType.EDIT, imgSrc: ImageType.edit},
        {name: ButtonType.DELETE, imgSrc: ImageType.delete, supportsMultiSelect: true},
    ];
    public tableHeadersProgram: MultipleTableColumns[] = [
        {header: 'Number', key: 'programNumber', visible: true},
        {header: 'PMT PID', key: 'pmtPid', visible: true, translateField: true, showHex: true},
        {header: 'PCR PID', key: 'pcrPid', visible: true, translateField: true, showHex: true},
        {header: 'Number of Streams', key: 'elementaryStreams', visible: true, translateField: true, showDataCount: true},
    ];
    public objectTitleProgram = 'Program';
    public modalNameProgram = '#modalAddTransportProgram';
    public currentProgram: Program = new DefaultProgram(1, 1, 1);
    private readonly PROGRAM_PID_OFFSET = 0x20;
    private readonly PROGRAM_NUMBER_OFFSET = 1;

    constructor(private cdr: ChangeDetectorRef) {
    }

    public ngOnInit(): void {
        this.psipTransportStream = this.transportStream as AbstractPSIPTransport;
        this.localPSIPTransportStream = cloneDeep(this.psipTransportStream);
        this.localPrograms = this.localPSIPTransportStream.programs;
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (isDefined(changes.psipTransportStream)) {
            const newPsipTransportStream: AbstractPSIPTransport = changes.psipTransportStream.currentValue;
            this.localPSIPTransportStream = cloneDeep(newPsipTransportStream);
            this.localPrograms = this.localPSIPTransportStream.programs;
        }
    }

    public getLocalPsipTransportStream(): AbstractPSIPTransport {
        return this.localPSIPTransportStream;
    }

    public psiChangedHandler(updatedPsipTransportStream: AbstractPSIPTransport): void {
        this.updatePSI(updatedPsipTransportStream);
    }

    public psipChangedHandler(updatedPsipTransportStream: AbstractPSIPTransport): void {
        this.updatePSIP(updatedPsipTransportStream);
    }

    public programChangeHandler(updatedProgram: Program): void {
        this.currentProgram = updatedProgram;
        this.addUpdateCurrentPSIPTransportProgram();
    }

    public onButtonClickedPrograms($event: any) {
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


    private onAddRow() {
        this.editMode = false;
        this.currentProgram = this.createDefaultProgram();
    }

    private onEditRow() {
        this.editMode = true;
        this.currentProgram = this.programsDynamicTable.selectedRow;
    }

    private onDeleteRow(): void {
        this.multipleDeletion();
    }

    private multipleDeletion() {
        const len = this.programsDynamicTable.selectedRowIds.length;
        for (let i = 0; i < len; i++) {
            const selectID = this.programsDynamicTable?.selectedRowIds[i];
            this.localPrograms = this.localPrograms.filter((data) => {
                const idMatch = data.id.toString() !== selectID.toString();
                const clientIdMatch = data.clientId !== selectID.toString();
                return idMatch && clientIdMatch;
            });
        }
        this.localPSIPTransportStream.programs = this.localPrograms;
    }

    private addUpdateCurrentPSIPTransportProgram() {
        this.localPrograms = updateElementList(this.localPrograms, this.currentProgram, this.editMode) as Program[];
        this.localPSIPTransportStream.programs = this.localPrograms;
    }

    private updatePSI(updatedPsipTransportStream: AbstractPSIPTransport): void {
        this.localPSIPTransportStream.patInterval = updatedPsipTransportStream.patInterval;
        this.localPSIPTransportStream.pmtInterval = updatedPsipTransportStream.pmtInterval;
        this.localPSIPTransportStream.catInterval = updatedPsipTransportStream.catInterval;
    }

    private updatePSIP(updatedPsipTransportStream: AbstractPSIPTransport): void {
        this.localPSIPTransportStream.sttInterval = updatedPsipTransportStream.sttInterval;
        this.localPSIPTransportStream.mgtInterval = updatedPsipTransportStream.mgtInterval;
        this.localPSIPTransportStream.vctInterval = updatedPsipTransportStream.vctInterval;
        this.localPSIPTransportStream.encodeHiddenServices = updatedPsipTransportStream.encodeHiddenServices;
        this.localPSIPTransportStream.rrtEnabled = updatedPsipTransportStream.rrtEnabled;
        this.localPSIPTransportStream.ratingRegion = updatedPsipTransportStream.ratingRegion;
        this.localPSIPTransportStream.rrtInterval = updatedPsipTransportStream.rrtInterval;
        this.localPSIPTransportStream.eitStartPid = updatedPsipTransportStream.eitStartPid;
        this.localPSIPTransportStream.eitCount = updatedPsipTransportStream.eitCount;
        this.localPSIPTransportStream.eitInterval = updatedPsipTransportStream.eitInterval;
        this.localPSIPTransportStream.eitKModifier = updatedPsipTransportStream.eitKModifier;
        this.localPSIPTransportStream.ettEnabled = updatedPsipTransportStream.ettEnabled;
        this.localPSIPTransportStream.ettStartPid = updatedPsipTransportStream.ettStartPid;
        this.localPSIPTransportStream.channelEttPid = updatedPsipTransportStream.channelEttPid;
        this.localPSIPTransportStream.ettInterval = updatedPsipTransportStream.ettInterval;
        this.localPSIPTransportStream.ettKModifier = updatedPsipTransportStream.ettKModifier;
    }

    private createDefaultProgram(): Program {
        const autoProgramNumber = this.getNextProgramNumber();
        return new DefaultProgram(autoProgramNumber, this.pmtDefaultValue(autoProgramNumber),
            this.pcrDefaultValue(autoProgramNumber));
    }

    private getNextProgramNumber(): number {
        let maxProgramNumber = -1;
        this.localPrograms.forEach(program => {
            if (program.programNumber > maxProgramNumber) {
                maxProgramNumber = program.programNumber;
            }
        });
        return maxProgramNumber > 0 ? maxProgramNumber + this.PROGRAM_NUMBER_OFFSET : 1;
    }

    private pmtDefaultValue(programNumber: number): number {
        return (programNumber * 16) + this.PROGRAM_PID_OFFSET;
    }

    private pcrDefaultValue(programNumber: number): number {
        return (programNumber * 16) + this.PROGRAM_PID_OFFSET + 1;
    }
}
