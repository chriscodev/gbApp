/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {BootstrapFunction} from '../../../../../../core/interfaces/interfaces';
import {numberOnly} from 'src/app/shared/helpers/appWideFunctions';
import {
    AbstractFetchableScheduleProvider,
    HTTP_PORT,
    HTTP_SCHEMES,
    OnV3ScheduleProvider
} from '../../../../../../core/models/dtv/schedule/ScheduleProvider';
import {
    ModalDynamicTbTranslateComponent
} from '../../../modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {
    ModalSpScheduleDownloadSettingsComponent
} from '../../modal-sp-schedule-download-settings/modal-sp-schedule-download-settings.component';
import {isDefined} from '../../../../../../core/models/dtv/utils/Utils';
import {inRangeCheck} from '../../../../../helpers/mathHelprrs';

declare var $: BootstrapFunction;

@Component({
    selector: 'app-modal-sp-onv3',
    templateUrl: './modal-sp-onv3.component.html',
    styleUrl: './modal-sp-onv3.component.scss'
})
export class ModalSpOnv3Component implements OnInit, OnChanges, AfterViewInit {
    @Input() scheduleProvider: AbstractFetchableScheduleProvider;
    @Output() okEnabledChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
    @ViewChild(ModalDynamicTbTranslateComponent) schedulesDynamicComponentTable: ModalDynamicTbTranslateComponent;
    @ViewChild(ModalSpScheduleDownloadSettingsComponent) downloadComponent: ModalSpScheduleDownloadSettingsComponent;
    public readonly numberOnly = numberOnly;
    public readonly httpSchemes = Object.values(HTTP_SCHEMES);
    public localScheduleProvider: OnV3ScheduleProvider;
    public okEnabled = false;
    public onV3SettingsValid = false;
    public showTestConnection = false;
    public hostIconText: string;
    public portIconText: string;
    public apiKeyIconText: string;
    public showPassword: boolean;
    public apiKeyValid: boolean;
    private hostValid: boolean;
    private portValid: boolean;
    private downloadSettingsOkEnabled = true;

    constructor(private cdr: ChangeDetectorRef) {
    }

    public ngOnInit(): void {
        if (isDefined(this.scheduleProvider)) {
            this.localScheduleProvider = this.scheduleProvider as OnV3ScheduleProvider;
            this.validateScheduleProvider();
        }
    }

    public ngAfterViewInit() {
        this.downloadComponent.downloadSettingsChanged.subscribe((scheduleProvider) => {
            this.downloadSettingsUpdated(scheduleProvider);
        });
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (isDefined(changes.scheduleProvider)) {
            this.localScheduleProvider = changes.scheduleProvider.currentValue as OnV3ScheduleProvider;
            this.validateScheduleProvider();
            this.cdr.detectChanges();
        }
    }

    public doTestConnection(): void {
        this.showTestConnection = true;
    }

    public testConnectionClosedHandler($event) {
        this.showTestConnection = false;
        $('#testConnectionModal').modal('hide');
    }

    public inputSettings(): void {
        this.updateSettingsValid();
    }

    public onProtocolChanged(): void {
        this.localScheduleProvider.port = HTTP_PORT[this.localScheduleProvider.protocol].value;
    }

    public toggleView() {
        this.showPassword = !this.showPassword;
    }

    private downloadSettingsUpdated(scheduleProvider: AbstractFetchableScheduleProvider) {
        this.localScheduleProvider.intervalInMinutes = scheduleProvider.intervalInMinutes;
        this.localScheduleProvider.timeOfDay = scheduleProvider.timeOfDay;
        this.localScheduleProvider.rateLimit = scheduleProvider.rateLimit;
        this.localScheduleProvider.updateDaily = scheduleProvider.updateDaily;
        this.localScheduleProvider.daysAheadToProcess = scheduleProvider.daysAheadToProcess;
    }

    private validateScheduleProvider(): void {
        this.updateSettingsValid();
    }

    private updateSettingsValid(): void {
        this.updateHostValid();
        this.updatePortValid();
        this.updateAPIKeyValid();
        this.updateOnV3SettingsValid();
        this.updateOkEnabled();
    }

    private updateOnV3SettingsValid(): void {
        this.onV3SettingsValid = this.hostValid && this.portValid && this.apiKeyValid;
    }

    private updateHostValid() {
        this.hostValid = this.localScheduleProvider.host?.length > 0;
        this.hostIconText = this.hostValid ? 'text-success' : 'text-danger';
    }

    private updatePortValid() {
        this.portValid = inRangeCheck(this.localScheduleProvider.port, 1, 65535);
        this.portIconText = this.portValid ? 'text-success' : 'text-danger';
    }

    private updateAPIKeyValid() {
        this.apiKeyValid = this.localScheduleProvider.apiKey?.length > 0;
        this.apiKeyIconText = this.apiKeyValid ? 'text-success' : 'text-danger';
    }

    private updateOkEnabled(): void {
        const oldOkEnabled = this.okEnabled;
        this.okEnabled = this.onV3SettingsValid && this.downloadSettingsOkEnabled;
        if (oldOkEnabled !== this.okEnabled) {
            this.okEnabledChanged.emit(this.okEnabled);
        }
    }
}
