/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {cloneDeep, isEqual} from 'lodash';
import {environment} from '../../../../environments/environment';
import {DefaultSnmpManager, SNMP_VERSIONS, SnmpManager, SnmpSettings, SnmpVersion} from '../../../core/models/snmp';
import {
  ActionMessage,
  ButtonType,
  ButtonTypes,
  ImageType,
  MultipleTableColumns
} from '../../../core/models/ui/dynamicTable';
import {ClientSmnpModel} from '../../../core/models/ClientSnmpModel';
import {AbstractCommitRevertComponent} from '../abstracts/abstract-commit-revert.component';
import {
  ModalDynamicTbTranslateComponent
} from '../../../shared/components/modals/modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {isDefined} from '../../../core/models/dtv/utils/Utils';
import {isIPAddressValid, validateIP} from '../../../shared/helpers';
import {ComponentCanDeactivate} from '../../../core/guards/canDeactivateGuard';

@Component({
    selector: 'app-snmp',
    templateUrl: './snmp.component.html',
    styleUrls: ['./snmp.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class SnmpComponent extends AbstractCommitRevertComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
    @ViewChild(ModalDynamicTbTranslateComponent) snmpTableComponent: ModalDynamicTbTranslateComponent;
    public readonly SNMP_VERSIONS = SNMP_VERSIONS;
    public localSnmpSettings: SnmpSettings;
    public currentSnmpManager: SnmpManager = new DefaultSnmpManager();
    public snmpVersions: SnmpVersion[] = Object.values(SnmpVersion);
    public urlTxt = environment.PARENT_URL + 'doc/TRIVENI-GUIDEBUILDER-MIB.txt';
    public urlHtml = environment.PARENT_URL + 'doc/TRIVENI-GUIDEBUILDER-MIB.html';
    public editMode: boolean;
    public managerNameValid: boolean;
    public managerExists: boolean;
    public ipAddressValid: boolean;
    public ipPattern: RegExp = /^(([1-9]?\d|1\d\d|2[0-4]\d|25[0-5])(\.(?!$)|(?=$))){4}$/;
    public contextNameEnabled: boolean;
    public contextNameValid: boolean;
    public disableOK: boolean;
    public modalName = '#SNMPModal';
    public objectTitle = 'SNMP';
    public objectTypeTitle = 'SNMP Managers';
    public buttonList: ButtonTypes[] = [
        {name: ButtonType.ADD, imgSrc: ImageType.add, alwaysEnabled: true},
        {name: ButtonType.EDIT, imgSrc: ImageType.edit},
        {name: ButtonType.DELETE, imgSrc: ImageType.delete, supportsMultiSelect: true}
    ];
    public tableHeaders: MultipleTableColumns[] = [
        {header: 'Manager Name', key: 'entityName', visible: true},
        {header: 'IP Address', key: 'ipAddress', visible: true},
        {header: 'SNMP Version', key: 'snmpVersion', visible: true}
    ];
    private serverSnmpSettings: SnmpSettings;

    constructor(
        private snmpClientModel: ClientSmnpModel
    ) {
        super();
    }

    public ngOnInit(): void {
        this.subscriptions.push(this.snmpClientModel.snmpSettings$.subscribe((snmpSettings) => {
            // TODO if dirty, display timed out dialog explaining dirty changes will be lost
            // console.log('snmpSettings: ', JSON.stringify(snmpSettings));
            this.updateSnmpSettings(cloneDeep(snmpSettings));
        }));
    }

    public ngOnDestroy() {
        this.cleanUpSubscriptions();
    }

    public onRevert() {
        this.updateSnmpSettings(this.snmpClientModel.getSnmpSettings());
    }

    public updateDirty() {
        this.dirty = !isEqual(this.localSnmpSettings, this.serverSnmpSettings);
    }

    public onCommit() {
        this.snmpClientModel.update(this.localSnmpSettings).then();
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
                this.onDeleteRows();
                break;
        }
    }

    public validateManagerName(): void {
        this.validateManagerExist();
        this.managerNameValid = !this.managerExists && this.currentSnmpManager.entityName?.length > 0;
        this.updateDisableOK();
    }

    public ipAddressOnly(event: any): boolean {
        return validateIP(event);
    }

    public validateIPAddress(): void {
        this.ipAddressValid = this.currentSnmpManager.ipAddress?.length > 0 && isIPAddressValid(
            this.currentSnmpManager.ipAddress);
        this.updateDisableOK();
    }

    public validateContextName(): void {
        this.contextNameEnabled = this.currentSnmpManager.snmpVersion === SnmpVersion.V2C;
        this.contextNameValid = !this.contextNameEnabled || this.currentSnmpManager.contextName?.length > 0;
        this.updateDisableOK();
    }

    public changeVersion(): void {
        this.validateContextName();
    }

    public checkNameValidity(): string {
        return this.managerNameValid ? 'fa-check-circle  text-success' : 'fa-times-circle  text-danger';
    }

    public checkIPAddressValidity(): string {
        return this.ipAddressValid ? 'fa-check-circle  text-success' : 'fa-times-circle  text-danger';
    }

    public checkContextNameValidity(): string {
        return this.contextNameValid ? 'fa-check-circle  text-success' : 'fa-times-circle  text-danger';
    }

    public addUpdateCurrentManager(): void {
        if (this.editMode) {
            this.updateCurrentManager();
        } else {
            this.localSnmpSettings.snmpManagers = [...this.localSnmpSettings.snmpManagers, this.currentSnmpManager];
        }
        this.updateDirty();
    }

    public canDeactivate(): boolean{
      return !this.dirty;
    }
    private updateCurrentManager() {
        const updateIndex = this.localSnmpSettings.snmpManagers.findIndex(
            (snmpManager) => this.currentSnmpManager.id > 0 ? snmpManager.id === this.currentSnmpManager.id :
                snmpManager.clientId === this.currentSnmpManager.clientId);
        if (updateIndex > -1) {
            this.localSnmpSettings.snmpManagers = [...this.localSnmpSettings.snmpManagers.slice(0,
                updateIndex), this.currentSnmpManager, ...this.localSnmpSettings.snmpManagers.slice(
                updateIndex + 1)];
        }
    }

    private validateManagerExist() {
        const foundSnmpManager: SnmpManager = this.localSnmpSettings?.snmpManagers?.find(
            (snmpManager) => {
                return (snmpManager.entityName === this.currentSnmpManager.entityName) &&
                    ((snmpManager.id !== this.currentSnmpManager.id) || (snmpManager.clientId !== this.currentSnmpManager.clientId));
            });
        this.managerExists = isDefined(foundSnmpManager);
        this.updateDisableOK();
    }

    private updateSnmpSettings(snmpSettings: SnmpSettings) {
        this.localSnmpSettings = snmpSettings;
        this.serverSnmpSettings = cloneDeep(this.localSnmpSettings);
        this.currentSnmpManager = this.localSnmpSettings?.snmpManagers?.length > 0 ?
            this.localSnmpSettings.snmpManagers[0] : new DefaultSnmpManager();
        this.updateDirty();
    }

    private onAddRow(): void {
        this.editMode = false;
        this.currentSnmpManager = new DefaultSnmpManager();
        this.initializeNewManager();
    }

    private onEditRow(): void {
        if (this.snmpTableComponent.selectedRow !== null) {
            this.editMode = true;
            this.currentSnmpManager = cloneDeep(this.snmpTableComponent.selectedRow);
            this.initializeNewManager();
        }
    }

    private onDeleteRows(): void {
        this.snmpTableComponent.selectedRowIds?.forEach((selectedRowId) => {
            this.localSnmpSettings.snmpManagers = this.localSnmpSettings.snmpManagers.filter((snmpManager): boolean => {
                return ((snmpManager.id !== +selectedRowId) && (snmpManager.clientId !== selectedRowId));
            });
        });
        this.updateDirty();
    }

    private initializeNewManager(): void {
        this.validateManagerName();
        this.validateIPAddress();
        this.validateContextName();
        this.updateDisableOK();
    }

    private updateDisableOK(): void {
        const fieldsValid = this.managerNameValid && !this.managerExists && this.ipAddressValid && this.contextNameValid;
        this.disableOK = !fieldsValid;
    }


}
