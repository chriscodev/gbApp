/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subscription} from 'rxjs';
import {
    HarrisSlotMuxOutput,
    MNAOutput,
    OutputTestRequest,
    OutputType,
    PortAddressableOutput
} from 'src/app/core/models/dtv/output/Output';
import {OutputsService} from 'src/app/core/services/outputs.service';

// TODO move up one directory since is shared with Harris outputs
@Component({
    selector: 'app-modal-outputs-test-connection',
    templateUrl: './modal-outputs-test-connection.component.html',
    styleUrls: ['./modal-outputs-test-connection.component.scss'],
})
export class ModalOutputsTestConnectionComponent implements OnInit, OnDestroy {
    @Input() output: PortAddressableOutput | HarrisSlotMuxOutput | MNAOutput;
    @Output() modalClosed: EventEmitter<any> = new EventEmitter();
    public modalTitle = 'Test Connection';
    public addressPortString = '';
    public testLoading = true;
    public cssClass = '';
    public messageText = '';
    private subscriptions: Subscription[] = [];

    constructor(private outputsService: OutputsService) {
    }

    public ngOnInit(): void {
        this.modalTitle = `Test Connection - ${this.output.outputAddress}`;
        this.addressPortString = `${this.output.outputAddress}:${this.getTestPort()}`;
        this.onCallTestConnection();
    }

    public ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }

    public onCallTestConnection(): void {
        if (this.getTestPort() > -1) {
            const outputTestRequest: OutputTestRequest = new OutputTestRequest(this.output.outputType,
                this.output.outputAddress, this.getTestPort());
            this.testLoading = true;
            this.subscriptions.push(
                this.outputsService.postTestOutputConnection(outputTestRequest).subscribe((outputTestResponse) => {
                    this.messageText = outputTestResponse.message;
                    this.cssClass = outputTestResponse.successful ? 'text-success' : 'text-danger';
                    this.testLoading = false;
                }));
        }
    }

    public closeModal(): void {
        this.modalClosed.emit();
    }

    private getTestPort(): number {
        let port = -1;
        switch (this.output.outputType) {
            case OutputType.AVP:
            case OutputType.MX8400:
                port = 1254;
                break;
            case OutputType.MX5600:
                port = 1237;
                break;
            case OutputType.SELENIO:
            case OutputType.NETVX:
            case OutputType.MNA:
                port = 21;
                break;
            case OutputType.TRIVENI:
            case OutputType.NET_PROCESSOR:
                const portAddressableOutput: PortAddressableOutput = this.output as PortAddressableOutput;
                port = portAddressableOutput.port;
                break;
        }
        return port;
    }
}
