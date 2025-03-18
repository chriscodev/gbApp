/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {cloneDeep} from 'lodash';
import {ClientNetworkSettingsModel} from '../../../../../../core/models/ClientNetworkSettingsModel';
import {NICDescriptor} from '../../../../../../core/models/server/NetworkSetting';
import {DefaultEASRoute, EASRoute, MPEGRoute} from '../../../../../../core/models/dtv/output/Output';
import {isDefined} from '../../../../../../core/models/dtv/utils/Utils';
import {isIPAddressValid} from '../../../../../helpers';
import {inRangeCheck} from '../../../../../helpers/mathHelprrs';

declare var $: (arg0: string) => { (): any; new(): any; modal: { (arg0: string): void; new(): any; }; };

@Component({
    selector: 'app-modal-outputs-eas-address-select',
    templateUrl: './modal-outputs-eas-address-select.component.html',
    styleUrls: ['./modal-outputs-eas-address-select.component.scss']
})
export class ModalOutputsEasAddressSelectComponent implements OnInit {
    @Input() udpRoute: MPEGRoute;
    @Output() easRouteEmit: EventEmitter<EASRoute> = new EventEmitter<EASRoute>();
    public nics: NICDescriptor[] = [];
    public ipAddressIconText: string;
    public portIconText: string;
    public easRoute: EASRoute;
    public enableMulticast: boolean;
    public okEnabled: boolean;
    private ipAddressValid: boolean;
    private portValid: boolean;

    constructor(private clientNetworkSettingsModel: ClientNetworkSettingsModel) {
        this.nics = this.clientNetworkSettingsModel.getNetworkList();
        console.log('ModalOutputsEasAddressSelectComponent this.nics: ', this.nics);
    }

    public ngOnInit(): void {
        if (isDefined(this.udpRoute.easRoute)) {
            this.easRoute = cloneDeep(this.udpRoute.easRoute);
            this.enableMulticast = isDefined(this.easRoute.multicastAddress);
        } else {
            this.easRoute = new DefaultEASRoute();
            this.easRoute.networkInterfaceName = this.nics?.length > 0 ? this.nics[0].interfaceName : undefined;
            this.enableMulticast = false;
        }
        this.inputSettings();
    }

    public updateEasAddress() {
        this.closeModal();
        if (!this.enableMulticast) {
            delete this.easRoute.multicastAddress;
        }
        this.easRouteEmit.emit(this.easRoute);
    }

    public closeModal() {
        $('#easSettingsModal').modal('hide');
    }

    public toggleMulticastEnabled() {
        this.enableMulticast = !this.enableMulticast;
        this.inputSettings();
    }

    public inputSettings(): void {
        this.updateIPAddressValid();
        this.updatePortValid();
        this.updateOkEnabled();
    }

    private updateIPAddressValid(): void {
        const addressValid = isIPAddressValid(this.easRoute.multicastAddress);
        this.ipAddressValid = !this.enableMulticast || isIPAddressValid(this.easRoute.multicastAddress);
        this.ipAddressIconText = this.ipAddressValid ? 'text-success' : 'text-danger';
    }

    private updatePortValid(): void {
        this.portValid = inRangeCheck(this.easRoute.port, 1, 65535);
        this.portIconText = this.portValid ? 'text-success' : 'text-danger';
    }

    private updateOkEnabled(): void {
        this.okEnabled = this.ipAddressValid && this.portValid && isDefined(this.easRoute.networkInterfaceName);
    }
}
