/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {Component, EventEmitter, Input, OnInit, Output, ViewChild,} from '@angular/core';
import {convertDecToHex} from 'src/app/shared/helpers/decimalToHexadecimal';
import {ElementaryStreamTypeArray} from '../../../../helpers/transportTypes';

import {ITreeData, TreeGridComponent} from '@syncfusion/ej2-angular-treegrid';
import {QueryCellInfoEventArgs, RowDataBoundEventArgs,} from '@syncfusion/ej2-angular-grids';
import {ClientMediaStreamsModel} from 'src/app/core/models/ClientMediaStreamsModel';
import {cloneDeep} from 'lodash';


// TODO DAC I think this component is unused and can be deleted
@Component({
    selector: 'app-modal-outputs-view-selected-transport',
    templateUrl: './modal-outputs-view-selected-transport.component.html',
    styleUrls: ['./modal-outputs-view-selected-transport.component.scss'],
})
export class ModalOutputsViewSelectedTransportComponent implements OnInit {
    @Output() closeViewSelectedTransportsModal: EventEmitter<any> = new EventEmitter();
    @Input() modalOutputViewTransportObj: any = {};
    modalTitle: string;
    viewTransportObj: any = {
        tsid: 0,
        name: '',
    };
    hexValue: string;

    transStreamArray: { subtasks: { subtasks: any; isInExpandState: boolean; column1: string; column2: string; column3: string; column4: string; column5: string; }[]; isInExpandState: boolean; column1: string; column2: string; column3: string; column4: string; column5: string; }[];

    show = false;

    isNotATSC3type = false;
    @ViewChild('treegrid') public treegrid: TreeGridComponent;

    constructor(
        private mediaStreamModel: ClientMediaStreamsModel,
    ) {
    }

    ngOnInit(): void {
        this.show = false;
        this.viewTransportObj = cloneDeep(this.modalOutputViewTransportObj);

        console.log(
            'this.modalOutputViewTransportObj;',
            this.modalOutputViewTransportObj
        );
        this.getLoadTransport(this.modalOutputViewTransportObj);
        this.modalTitle = 'View Transport - ' + this.viewTransportObj?.name;
    }

    closeModalViewStream() {
        this.closeViewSelectedTransportsModal.emit('modalViewTransport');
    }

    /***
     * Load new Table  to get nested data form new transport and generate a table
     */
    getLoadTransport(data: { serviceGroups: any[]; programs: any[]; }) {
        this.show = true;
        const mediaStreamsData = this.mediaStreamModel.getMediaStreams();

        let defaultData = {
            isInExpandState: true,
            column1: 'Broadcast Stream',
            column2: '',
            column3: '',
            column4: '',
            column5: '',
        };

        const clonedDefaultData = JSON.parse(JSON.stringify(defaultData));

        this.transStreamArray = [
            {
                ...defaultData,
                subtasks: data.serviceGroups?.map((plp) => {
                    defaultData = clonedDefaultData;
                    defaultData.column1 = 'PLP';
                    defaultData.column2 = plp.name;
                    defaultData.column3 = '';
                    defaultData.column4 = '';
                    defaultData.column5 = '';
                    return {
                        ...defaultData,
                        subtasks: plp.ipStreams?.map(
                            (ipStreams: { linkedStreamId: number; type: string; name: string; external: boolean; sourceIP: string; sourceNIC: any; destinationIP: string; destinationPort: string; }) => {
                                defaultData = clonedDefaultData;
                                const mediaStream = mediaStreamsData?.find(
                                    (x) => x.id === ipStreams.linkedStreamId
                                );

                                defaultData.column1 = 'IP Stream';
                                defaultData.column2 = plp.name;
                                defaultData.column3 = ipStreams.linkedStreamId
                                    ? mediaStream?.encodingType
                                    : ipStreams.type;
                                defaultData.column4 = ipStreams.linkedStreamId
                                    ? mediaStream?.name
                                    : ipStreams.name;
                                defaultData.column5 = ipStreams.linkedStreamId
                                    ? `${
                                        mediaStream?.nic +
                                        ' -> ' +
                                        mediaStream?.dstAddress +
                                        ':' +
                                        mediaStream?.dstPort
                                    }`
                                    : ipStreams.external && ipStreams.external === true
                                        ? ipStreams.sourceIP
                                        : `${
                                            ipStreams?.sourceNIC ??
                                            'null -> ' +
                                            ipStreams?.destinationIP +
                                            ':' +
                                            ipStreams?.destinationPort
                                        }`;
                                return {
                                    ...defaultData,
                                    subtasks: null,
                                };
                            }),
                    };
                }),
            },
        ];

        if (data?.programs) {
            defaultData.column1 = 'Transport Stream';
            this.isNotATSC3type = true;

            this.transStreamArray = [
                {
                    ...defaultData,
                    subtasks: data.programs?.map((program) => {
                        defaultData = clonedDefaultData;
                        defaultData.column1 = 'Program';
                        defaultData.column2 = program.programNumber;
                        defaultData.column3 =
                            program.pmtPid + ' 0x' + convertDecToHex(program.pmtPid);
                        defaultData.column4 = '';
                        return {
                            ...defaultData,
                            subtasks: program.elementaryStreams?.map(
                                (elementary: { pid: string; streamType: string; }) => {
                                    defaultData = clonedDefaultData;
                                    defaultData.column1 = 'Stream '; // don't remove whitespace in the string
                                    defaultData.column2 = program.programNumber;
                                    defaultData.column3 =
                                        elementary.pid + ' 0x' + convertDecToHex(elementary.pid);
                                    defaultData.column4 = ElementaryStreamTypeArray?.find(
                                        (x) => x.code === elementary.streamType
                                    ).name;
                                    return {
                                        ...defaultData,
                                        subtasks: null,
                                    };
                                }),
                        };
                    }),
                },
            ];
        }
    }

    queryCellInfo(args: QueryCellInfoEventArgs) {
        const addUniversalAttributes = (fileName: string) => {
            const x = document.createElement('IMG');
            x.setAttribute('src', `assets/icons/svg-icons/${fileName}.svg`);
            const span = document.createElement('span');
            span.innerHTML = args.cell.innerHTML;
            args.cell.innerHTML = '';
            args.cell.appendChild(x);
            args.cell.appendChild(span);
        };

        if (args.cell.innerHTML?.includes(' 0x')) {
            const str1 = args.cell.innerHTML?.split(' ')[0];
            const str2 = args.cell.innerHTML?.split(' ')[1];
            args.cell.innerHTML = `${str1} <i style="color: grey; font-size: 12px;">${str2}</i>`;
        }

        if (
            args.cell.innerHTML?.includes('Broadcast Stream') ||
            args.cell.innerHTML?.includes('Transport Stream')
        ) {
            addUniversalAttributes('satellite');
            args.cell.setAttribute('style', 'display:flex; align-items: center;');
        } else if (args.cell.innerHTML?.includes('PLP')) {
            addUniversalAttributes('tunnel');
            args.cell.setAttribute(
                'style',
                'display:flex; align-items: center; padding-left: 50px;'
            );
        } else if (args.cell.innerHTML?.includes('Program')) {
            addUniversalAttributes('tv');
            args.cell.setAttribute(
                'style',
                'display:flex; align-items: center; padding-left: 50px;'
            );
        } else if (args.cell.innerHTML?.includes('IP Stream')) {
            addUniversalAttributes('tv');
            args.cell.setAttribute(
                'style',
                'display:flex; align-items: center; padding-left: 100px;'
            );
        } else if (args.cell.innerHTML?.includes('Stream ')) {
            addUniversalAttributes('binary');
            args.cell.setAttribute(
                'style',
                'display:flex; align-items: center; padding-left: 100px;'
            );
        }
    }

    rowDataBound(args: RowDataBoundEventArgs) {
        if (
            !(args.data as ITreeData).hasChildRecords ||
            (args.data as ITreeData).childRecords.length <= 0
        ) {
            const res = (args.row as HTMLElement).getElementsByTagName('span');
            for (const v of res as any) {
                (v as HTMLElement).style.width = 'unset';
                (v as HTMLElement).style.paddingLeft = '2px';
            }
        }
    }

}
