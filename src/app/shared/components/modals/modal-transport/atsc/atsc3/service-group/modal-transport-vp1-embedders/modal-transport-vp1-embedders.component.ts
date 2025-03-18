/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */
import {numberOnly} from 'src/app/shared/helpers/appWideFunctions';
import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {
    DefaultVP1Embedder,
    VP1Embedder
} from '../../../../../../../../core/models/dtv/network/physical/stream/ip/service-group/ServiceGroup';
import {cloneDeep} from 'lodash';
import {isDefined} from '../../../../../../../../core/models/dtv/utils/Utils';
import {inRangeCheck} from '../../../../../../../helpers/mathHelprrs';

declare var $;

@Component({
    selector: 'app-modal-transport-vp1-embedders',
    templateUrl: './modal-transport-vp1-embedders.component.html',
    styleUrls: ['./modal-transport-vp1-embedders.component.scss']
})
export class ModalTransportVp1EmbeddersComponent implements OnChanges {
    @Input() vp1Embedder: VP1Embedder;
    @Input() editMode: boolean;
    @Output() vp1EmbedderChanged: EventEmitter<VP1Embedder> = new EventEmitter();
    public readonly numberOnly = numberOnly;
    public localVP1Embedder: VP1Embedder = new DefaultVP1Embedder();
    public modalTitle = 'VP1 Embedder';
    public nameIconText: string;
    public hostIconText: string;
    public portIconText: string;
    public processingInstanceIconText: string;
    public serverCodeIconText: string;
    public epochYearIconText: string;
    public updateEnabled: boolean;
    private nameValid: boolean;
    private hostValid: boolean;
    private portValid: boolean;
    private processingInstanceValid: boolean;
    private serverCodeValid: boolean;
    private epochYearValid: boolean;

    constructor() {
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (isDefined(changes.vp1Embedder?.currentValue)) {
            this.localVP1Embedder = cloneDeep(changes.vp1Embedder.currentValue);
            this.inputVP1();
        }
        if (isDefined(changes.editMode?.currentValue)) {
            this.editMode = changes.editMode.currentValue;
            this.modalTitle = (this.editMode ? 'Edit ' : 'Add ') + 'VP1 Embedder';
        }
    }

    public inputVP1(): void {
        this.updateNameValid();
        this.updateHostValid();
        this.updatePortValid();
        this.updateProcessingInstanceValid();
        this.updateServerCodeValid();
        this.updateEpochYearValid();
        this.updateOkEnabled();
    }

    public closeModal() {
        $('#modalV1Embedders').modal('hide');
    }

    public updateVP1Embedder() {
        this.closeModal();
        this.vp1EmbedderChanged.emit(this.localVP1Embedder);
    }

    private updateNameValid(): void {
        this.nameValid = this.localVP1Embedder.name?.length > 0;
        this.nameIconText = this.nameValid ? 'text-success' : 'text-danger';
    }

    private updateHostValid(): void {
        this.hostValid = this.localVP1Embedder.host?.length > 0;
        this.hostIconText = this.hostValid ? 'text-success' : 'text-danger';
    }

    private updatePortValid(): void {
        this.portValid = inRangeCheck(this.localVP1Embedder.port, 1, 65535);
        this.portIconText = this.portValid ? 'text-success' : 'text-danger';
    }

    private updateProcessingInstanceValid(): void {
        this.processingInstanceValid = inRangeCheck(this.localVP1Embedder.processingInstance, 1, 8191);
        this.processingInstanceIconText = this.processingInstanceValid ? 'text-success' : 'text-danger';
    }

    private updateServerCodeValid(): void {
        this.serverCodeValid = inRangeCheck(this.localVP1Embedder.serverCode, 1, 65535);
        this.serverCodeIconText = this.serverCodeValid ? 'text-success' : 'text-danger';
    }

    private updateEpochYearValid(): void {
        this.epochYearValid = inRangeCheck(this.localVP1Embedder.epochYear, 2000, 9999);
        this.epochYearIconText = this.epochYearValid ? 'text-success' : 'text-danger';
    }

    private updateOkEnabled(): void {
        this.updateEnabled = this.nameValid && this.hostValid && this.portValid && this.processingInstanceValid
            && this.serverCodeValid;
    }
}
