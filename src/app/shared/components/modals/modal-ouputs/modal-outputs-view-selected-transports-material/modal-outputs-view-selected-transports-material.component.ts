/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {
    AbstractMPEGTransport,
    AbstractTransport,
    ATSC3Transport,
    TransportType
} from '../../../../../core/models/dtv/network/physical/Transport';
import {convertDecToHex} from '../../../../helpers/decimalToHexadecimal';
import {
    ELEMENTARY_STREAM_TYPES,
    ElementaryStreamType
} from '../../../../../core/models/dtv/network/physical/stream/mpeg/ElementaryStream';
import {isDefined} from '../../../../../core/models/dtv/utils/Utils';
import {MediaStream} from '../../../../../core/models/dtv/network/physical/stream/ip/media/MediaStream';
import {Program} from '../../../../../core/models/dtv/network/physical/stream/mpeg/Program';
import {ServiceGroup} from '../../../../../core/models/dtv/network/physical/stream/ip/service-group/ServiceGroup';

interface StreamData {
    // non-atsc3
    data: {
        name: string;
        icon?: string;
        program?: number;
        pid?: string;
        streamType?: string;
        // atsc
        plpId?: string;
        ipStreamType?: string;
        ipStreamName?: string;
        ipFlow?: string;
    };
    children?: StreamData[];
}


/** Flat node with expandable and level information */

declare var $: (arg0: string) => { (): any; new(): any; modal: { (arg0: string): void; new(): any; }; };

@Component({
    selector: 'app-modal-outputs-view-selected-transports-material',
    templateUrl: './modal-outputs-view-selected-transports-material.component.html',
    styleUrl: './modal-outputs-view-selected-transports-material.component.scss'
})
export class ModalOutputsViewSelectedTransportsMaterialComponent implements OnInit, OnChanges {
    @Input() transport: AbstractTransport;
    @Input() mediaStreams: MediaStream[] = [];
    @Output() modalClosed: EventEmitter<any> = new EventEmitter();
    public transportName = '';
    public tsidLabel = '';
    public tsid = '';
    public treeHeaders: any = [];
    // tree node
    public treeData: StreamData[];
    protected readonly convertDecToHex = convertDecToHex;
    protected readonly TransportType = TransportType;

    constructor() {
    }

    public ngOnInit(): void {
        if (isDefined(this.transport)) {
            this.tsidLabel = this.transport.transportType === TransportType.ATSC_3 ? 'BSID' : 'TSID';
            this.transportName = this.transport.name;
            this.tsid = this.transport.tsid.toString();
            this.loadDataTreeView(this.transport);
            this.loadTreeHeaders();
        }
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (isDefined(changes.transport)) {
            this.ngOnInit();
        }
    }

    public closeModalView(): void {
        this.modalClosed.emit('modalViewTransportMaterial');
    }

    private loadTreeHeaders(): void {
        if (this.transport.transportType !== TransportType.ATSC_3) {
            this.treeHeaders = [
                {label: 'Type', key: 'name', isVisible: true, isInnerHtml: false},
                {label: 'Icon', key: 'icon', isVisible: false, isInnerHtml: false},
                {label: 'Program', key: 'program', isVisible: true, isInnerHtml: false},
                {label: 'PID', key: 'pid', isVisible: true, isInnerHtml: true},
                {label: 'Stream Type', key: 'streamType', isVisible: true, isInnerHtml: false}
            ];
        } else {
            this.treeHeaders = [
                {label: 'Type', key: 'name', isVisible: true, isInnerHtml: false},
                {label: 'Icon', key: 'icon', isVisible: false, isInnerHtml: false},
                {label: 'PLP ID', key: 'plpId', isVisible: true, isInnerHtml: false},
                {label: 'IP Stream Type', key: 'ipStreamType', isVisible: true, isInnerHtml: false},
                {label: 'IP Stream Name', key: 'ipStreamName', isVisible: true, isInnerHtml: false},
                {label: 'IP Flow', key: 'ipFlow', isVisible: true, isInnerHtml: false}
            ];
        }
    }

    private loadDataTreeView(transport: AbstractTransport): void {
        if (transport.transportType !== TransportType.ATSC_3) {
            const mpegTransport: AbstractMPEGTransport = transport as AbstractMPEGTransport;
            this.treeData = [
                {
                    data: {
                        name: 'Transport Stream',
                        icon: 'assets/icons/svg-icons/satellite.svg',
                        program: null,
                        pid: null,
                        streamType: null
                    },
                    children: mpegTransport.programs.map(
                        (program: Program) => {
                            const programChildren = [];
                            if (program.elementaryStreams && program.elementaryStreams.length > 0) {
                                programChildren.push(...program.elementaryStreams.map(stream => ({
                                    data: {
                                        name: 'Stream',
                                        icon: 'assets/icons/svg-icons/binary.svg',
                                        program: program.programNumber,
                                        pid: stream.pid + `<i class="text-white-50 mx-1">0x${convertDecToHex(
                                            stream.pid)}<i/>`,
                                        streamType: this.getStreamType(stream.streamType)
                                    }
                                })));
                            }
                            return {
                                data: {
                                    name: 'Program',
                                    icon: 'assets/icons/svg-icons/tv.svg',
                                    program: program.programNumber,
                                    pid: program.pmtPid + `<i class="text-white-50 mx-1">0x${convertDecToHex(
                                        program.pmtPid)}<i/>`,
                                    streamType: null,
                                },
                                children: programChildren
                            };
                        })
                }
            ];
        } else {
            const atsc3Transport: ATSC3Transport = transport as ATSC3Transport;
            this.treeData = [
                {
                    data: {
                        name: 'Broadcast Stream',
                        icon: 'assets/icons/svg-icons/satellite.svg',
                        plpId: null,
                        ipStreamType: null,
                        ipStreamName: null,
                        ipFlow: null
                    },
                    children: atsc3Transport.serviceGroups.filter((serviceGroup: ServiceGroup) =>
                        isDefined(serviceGroup.ipStreams) && serviceGroup.ipStreams.length > 0
                    ).map((serviceGroup: { name: string; ipStreams: any[]; }) => ({
                        data: {
                            name: 'PLP',
                            icon: 'assets/icons/svg-icons/tunnel.svg',
                            plpId: serviceGroup.name,
                            ipStreamType: null,
                            ipStreamName: null,
                            ipFlow: null
                        },
                        children: serviceGroup.ipStreams.map(ipStream => ({
                            data: {
                                name: 'IP Stream',
                                icon: 'assets/icons/svg-icons/tv.svg',
                                plpId: serviceGroup.name,
                                ipStreamType: isDefined(ipStream.linkedStreamId) ? this.findMediaStream(
                                    ipStream.linkedStreamId, 'encodingType') : ipStream.type,
                                ipStreamName: isDefined(ipStream.linkedStreamId) ? this.findMediaStream(
                                    ipStream.linkedStreamId, 'name') : ipStream.name,
                                ipFlow: isDefined(ipStream.linkedStreamId) ? (`${this.findMediaStream(
                                    ipStream.linkedStreamId, 'nic')} -> ${this.findMediaStream(ipStream.linkedStreamId,
                                    'dstAddress')}: ${this.findMediaStream(ipStream.linkedStreamId,
                                    'dstPort')}`) : (ipStream.external ?
                                    `${ipStream.sourceIP}`
                                    : `null -> ${ipStream.destinationIP}:${ipStream.destinationPort}`)

                            }
                        }))
                    }))
                }
            ];
        }
    }

    private findMediaStream(linkedStreamId, key) {
        console.log('findMediaStream', linkedStreamId, key);
        console.log('selectedMediaStream', this.mediaStreams);
        const stream = this.mediaStreams.find(s => s.id === linkedStreamId);
        return stream ? stream[key] : null;
    }

    private getStreamType(streamType: ElementaryStreamType): string {
        return ELEMENTARY_STREAM_TYPES[streamType]?.displayName || streamType.toString();
    }
}
