/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */
import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import * as _swal from 'sweetalert';
import {cloneDeep} from 'lodash';
import {ActionMessage, ButtonType, ButtonTypes, ImageType, MultipleTableColumns} from 'src/app/core/models/ui/dynamicTable';
import {
    ATSC3RecoverySettings,
    DefaultRecoverySettings,
    DefaultVP1Embedder,
    VP1Embedder
} from 'src/app/core/models/dtv/network/physical/stream/ip/service-group/ServiceGroup';
import {
    ModalDynamicTbTranslateComponent
} from '../../../../../modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {SweetAlert} from 'sweetalert/typings/core';
import {isDefined} from '../../../../../../../../core/models/dtv/utils/Utils';

const swal: SweetAlert = _swal as any;
declare var _: any;
declare var $;

@Component({
    selector: 'app-modal-transport-edit-recovery-settings',
    templateUrl: './modal-transport-edit-recovery-settings.component.html',
    styleUrls: ['./modal-transport-edit-recovery-settings.component.scss']
})
export class ModalTransportEditRecoverySettingsComponent implements OnChanges {
    @Input() recoverySettings: ATSC3RecoverySettings;
    @Output() recoverySettingsChanged: EventEmitter<ATSC3RecoverySettings> = new EventEmitter();
    @ViewChild(ModalDynamicTbTranslateComponent) vp1EmbeddersDynamicTable: ModalDynamicTbTranslateComponent;
    public recoverySettingsHeaders: MultipleTableColumns[] = [
        {header: 'Host', key: 'host', visible: true},
        {header: 'Port', key: 'port', visible: true},
        {header: 'Processing Instance', key: 'processingInstance', visible: true}
    ];
    public recoverySettingsButtonList: ButtonTypes[] = [
        {name: ButtonType.ADD, imgSrc: ImageType.add, alwaysEnabled: true},
        {name: ButtonType.EDIT, imgSrc: ImageType.edit},
        {name: ButtonType.DELETE, imgSrc: ImageType.delete, supportsMultiSelect: true}
    ];
    public editMode: boolean;
    public modalTitle = 'VP1 Embedder';
    public modalNameVP1Embedder = '#modalV1Embedders';
    public localRecoverySettings: ATSC3RecoverySettings = new DefaultRecoverySettings();
    public localVP1Embedders: VP1Embedder[];
    public localVP1Embedder: VP1Embedder = new DefaultVP1Embedder();
    public passwordShown = false;
    public submissionUrlIconText: string;
    public updateEnabled: boolean;
    private submissionUrlValid: boolean;

    constructor(private cdr: ChangeDetectorRef) {
        this.localVP1Embedders = this.localRecoverySettings.vp1Embedders;
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (isDefined(changes.recoverySettings?.currentValue)) {
            this.localRecoverySettings = cloneDeep(changes.recoverySettings.currentValue);
            this.localVP1Embedders = this.localRecoverySettings.vp1Embedders;
            this.inputRecoverySettings();
        }
    }

    public vp1EmbedderChangedHandler(updatedVP1Embedder: VP1Embedder): void {
        this.localVP1Embedder = updatedVP1Embedder;
        this.addUpdateVP1Embedder();
        this.cdr.detectChanges();
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

    public toggleShowPassword(): void {
        this.passwordShown = !this.passwordShown;
    }

    public closeModal() {
        $('#modalEditRecoverySettings').modal('hide');
    }

    public addUpdateVP1Embedder() {
        if (this.editMode) {
            this.updateCurrentVP1Embedder();
        } else {
            this.localRecoverySettings.vp1Embedders = [...this.localRecoverySettings.vp1Embedders, this.localVP1Embedder];
        }
        this.localVP1Embedders = this.localRecoverySettings.vp1Embedders;
    }

    public inputRecoverySettings(): void {
        this.updateSubmissionUrlValid();
        this.updateOkEnabled();
    }

    private updateSubmissionUrlValid(): void {
        this.submissionUrlValid = this.localRecoverySettings.submissionUrl?.length > 0;
        this.submissionUrlIconText = this.submissionUrlValid ? 'text-success' : 'text-danger';
    }

    private onAddRow() {
        this.editMode = false;
        this.localVP1Embedder = new DefaultVP1Embedder();
    }

    private onEditRow() {
        this.editMode = true;
        this.localVP1Embedder = this.vp1EmbeddersDynamicTable.selectedRow;
    }

    private onDeleteRow(): void {
        this.multipleDeletion();
    }

    private multipleDeletion(): void {
        const len = this.vp1EmbeddersDynamicTable.selectedRowIds.length;
        for (let i = 0; i < len; i++) {
            const selectID = this.vp1EmbeddersDynamicTable?.selectedRowIds[i];
            this.localRecoverySettings.vp1Embedders = this.localRecoverySettings.vp1Embedders.filter(vp1Embedder => {
                const idMatch = vp1Embedder.id.toString() !== selectID.toString();
                const clientIdMatch = vp1Embedder.clientId !== selectID.toString();
                return idMatch && clientIdMatch;
            });
        }
        this.localVP1Embedders = this.localRecoverySettings.vp1Embedders;
    }

    private updateCurrentVP1Embedder() {
        const index = this.localRecoverySettings.vp1Embedders.findIndex((vp1Embedder) =>
            this.localVP1Embedder?.id > 0
                ? vp1Embedder.id === this.localVP1Embedder.id
                : vp1Embedder.clientId === this.localVP1Embedder.clientId
        );
        if (index !== -1) {
            this.localRecoverySettings.vp1Embedders = [...this.localRecoverySettings.vp1Embedders.slice(0,
                index), this.localVP1Embedder, ...this.localRecoverySettings.vp1Embedders.slice(index + 1),
            ];
        }
    }

    private updateOkEnabled(): void {
        this.updateEnabled = this.submissionUrlValid;
    }

    public clickEditRecovery() {
      this.recoverySettingsChanged.emit(this.localRecoverySettings);
      this.closeModal();
    }
}
