/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */
import {cloneDeep} from 'lodash';
import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {BondedBSIDsExtension, DefaultBondedBSIDsExtension} from '../../../../../../../../core/models/dtv/network/Extension';
import {numberOnly, numbersListOnly} from 'src/app/shared/helpers/appWideFunctions';
import {isDefined} from '../../../../../../../../core/models/dtv/utils/Utils';

declare var $;

@Component({
    selector: 'app-modal-transport-add-bonded-bsid',
    templateUrl: './modal-transport-add-bonded-bsid.component.html',
    styleUrls: ['./modal-transport-add-bonded-bsid.component.scss']
})
export class ModalTransportAddBondedBSIDComponent implements OnChanges {
    @Input() editMode: boolean;
    @Input() bondedBSIDsExtension: BondedBSIDsExtension;
    @Output() bondedBSIDsExtensionChanged: EventEmitter<BondedBSIDsExtension> = new EventEmitter();
    public readonly numbersListOnly = numbersListOnly;
    public readonly numberOnly = numberOnly;
    public modalTitle: string;
    public localBondedBSIDsExtension: BondedBSIDsExtension = new DefaultBondedBSIDsExtension();
    public bsidIconText: string;
    public okButtonEnabled = false;
    private bsidValid: boolean;

    constructor() {
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (isDefined(changes.bondedBSIDsExtension?.currentValue)) {
            this.localBondedBSIDsExtension = cloneDeep(changes.bondedBSIDsExtension.currentValue);
        }
        if (isDefined(changes.editMode?.currentValue)) {
            this.editMode = changes.editMode.currentValue;
        }
        this.updateExtensionValid();
    }

    public inputBsid(): void {
        this.updateExtensionValid();
    }

    public closeModal(): void {
        $('#modalAddBondedBSID').modal('hide');
    }

    public addUpdateExtension(): void {
        this.closeModal();
        this.flattenBondedBSIDs();
        this.bondedBSIDsExtensionChanged.emit(this.localBondedBSIDsExtension);
    }

    private updateExtensionValid(): void {
        this.updateModelTitle();
        this.updateNameValid();
        this.updateOkEnabled();
    }

    private updateModelTitle(): void {
        this.modalTitle = (this.editMode ? 'Edit ' : 'Add ') + 'Bonded BSIDs';
    }

    private updateNameValid(): void {
        this.bsidValid = this.localBondedBSIDsExtension.bondedBsids?.length > 0;
        this.bsidIconText = this.bsidValid ? 'text-success' : 'text-danger';
    }

    private updateOkEnabled(): void {
        this.okButtonEnabled = this.bsidValid;
    }

    private flattenBondedBSIDs(): void {
        const parts: string[] = this.localBondedBSIDsExtension.bondedBsids.split(' ');
        this.localBondedBSIDsExtension.bondedBsids = '';
        parts.forEach(part => {
            if (part?.length > 0) {
                if (this.localBondedBSIDsExtension.bondedBsids.length > 0) {
                    this.localBondedBSIDsExtension.bondedBsids += ' ';
                }
                this.localBondedBSIDsExtension.bondedBsids += part;
            }
        });
    }
}
