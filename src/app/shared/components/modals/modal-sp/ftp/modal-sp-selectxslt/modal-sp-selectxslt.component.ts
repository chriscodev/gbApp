/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {ActionMessage, ButtonType, ButtonTypes, ImageType, MultipleTableColumns} from 'src/app/core/models/ui/dynamicTable';
import {environment} from 'src/environments/environment';
import {
    ModalDynamicTbTranslateComponent
} from '../../../modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {RemoteFileResource} from '../../../../../../core/models/dtv/schedule/ScheduleProvider';
import {ClientScheduleProvidersModel} from '../../../../../../core/models/ClientScheduleProvidersModel';

@Component({
    selector: 'app-modal-sp-selectxslt',
    templateUrl: './modal-sp-selectxslt.component.html',
    styleUrls: ['./modal-sp-selectxslt.component.scss'],
})
export class ModalSpSelectxsltComponent implements OnInit {
    @Output() xsltClosed: EventEmitter<any> = new EventEmitter();
    @Output() xlstSelected: EventEmitter<RemoteFileResource> = new EventEmitter();
    @ViewChild(ModalDynamicTbTranslateComponent) schedViewXSLTComponent: ModalDynamicTbTranslateComponent;
    public buttonList: ButtonTypes[] = [
        {name: ButtonType.VIEW, imgSrc: ImageType.view, disable: false}
    ];
    public tableHeaders: MultipleTableColumns[] = [
        {header: 'Name', key: 'name', visible: true},
        {header: 'Size', key: 'length', visible: true},
        {header: 'Last Modified', key: 'lastModified', visible: true, showDate: true},
    ];
    public xslts: RemoteFileResource[] = [];
    public currentXSLT: RemoteFileResource;
    public objectTitleXSLT = 'XSLT';

    constructor(private clientScheduleProvidersModel: ClientScheduleProvidersModel) {
    }

    public ngOnInit(): void {
        this.getListingXSLT();
    }

    public onButtonClicked($event) {
        console.log('$event', $event);
        switch ($event.message) {
            case ActionMessage.VIEW:
                this.viewXslt();
                break;
        }
    }

    public onRowClicked($event) {
        this.currentXSLT = $event;
    }

    public clickSelect(): void {
        this.xlstSelected.emit(this.currentXSLT);
    }

    public closeModal(): void {
        this.xsltClosed.emit();
    }

    public viewXslt() {
      const url = environment.ZIP_EXPORT_URL + this.currentXSLT.downloadRelativePath;
      window.open(url, '_blank');
    }

    private getListingXSLT() {
        this.clientScheduleProvidersModel.xsltResourceDirectoryListing$.subscribe(
            (remoteFileResources: RemoteFileResource[]) => {
                this.xslts = remoteFileResources;
            });
    }
}
