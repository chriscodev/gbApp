// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {
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
import {resetTabSelectedClass} from '../../../../../../helpers/tableSelection';
import {ServiceGroup} from '../../../../../../../core/models/dtv/network/physical/stream/ip/service-group/ServiceGroup';
import {cloneDeep} from 'lodash';
import {isDefined} from '../../../../../../../core/models/dtv/utils/Utils';
import {ATSC3Transport} from '../../../../../../../core/models/dtv/network/physical/Transport';
import {ServiceGroupSettingsComponent} from './settings/service-group-settings.component';
import {ATSC3Stream} from '../../../../../../../core/models/dtv/network/physical/stream/ip/IPStream';
import {ServiceGroupIpStreamsComponent} from './ip-streams/service-group-ip-streams.component';

@Component({
  selector: 'app-service-group',
  templateUrl: './service-group.component.html',
  styleUrl: './service-group.component.scss'
})
export class ServiceGroupComponent implements OnInit, OnChanges {
  @Input() atsc3TransportStream: ATSC3Transport;
  @Input() serviceGroup: ServiceGroup;
  @Input() editMode: boolean;
  @ViewChild(ServiceGroupSettingsComponent) serviceGroupSettingsComponent: ServiceGroupSettingsComponent;
  @ViewChild(ServiceGroupIpStreamsComponent) serviceGroupIpStreamsComponent: ServiceGroupIpStreamsComponent;
  @Output() serviceGroupChanged: EventEmitter<ServiceGroup[]> = new EventEmitter();
  @Output() okEnabledChanged: EventEmitter<boolean> = new EventEmitter();
  public localServiceGroup: ServiceGroup;
  public localIPStreams: ATSC3Stream[];
  public localATSC3TransportStream: ATSC3Transport;

  public headerTabs = [
    {tabName: 'Settings',  activeId: 1},
    {tabName: 'IP Streams',  activeId: 2},
  ];

  public activeId = 1;

  constructor(private cdr: ChangeDetectorRef) {
  }

  public getLocalServiceGroup(): ServiceGroup {
    const serviceGroup: ServiceGroup = this.serviceGroupSettingsComponent.getLocalServiceGroup();
    serviceGroup.ipStreams = this.serviceGroupIpStreamsComponent.getLocalIpStreams();
    return serviceGroup;
  }

  public ngOnInit(): void {
    console.log('ServiceGroupComponent ngOnInit');
    this.loadLocalServiceGroup();
    console.log('ServiceGroupComponent ngOnInit serviceGroupSettingsComponent: ',
      this.serviceGroupSettingsComponent);
  }
  getLinkedStreams(){
    return this.getAllLinkedStreamIds(this.atsc3TransportStream.serviceGroups);
  }

  public ngOnChanges(changes: SimpleChanges) {
    console.log('ServiceGroupComponent changes: ', changes);
    const usedIds = this.getAllLinkedStreamIds(this.atsc3TransportStream.serviceGroups);
    if (isDefined(changes.serviceGroup)) {
      this.localServiceGroup = cloneDeep(changes.serviceGroup.currentValue);
      this.localIPStreams = this.localServiceGroup.ipStreams;
      if (isDefined(changes.editMode)) {
        this.editMode = changes.editMode.currentValue;
      }
      this.cdr.detectChanges();
    }
    if (isDefined(changes.atsc3TransportStream)) {
      this.localATSC3TransportStream = cloneDeep(changes.atsc3TransportStream.currentValue);
      this.cdr.detectChanges();
    }
  }

  public getAllLinkedStreamIds(array: any[]): number[] {
    const linkedStreamIds: number[] = [];

    array.forEach(item => {
      if (item.linkedStreamId) {
        linkedStreamIds.push(item.linkedStreamId);
      }
      if (item.ipStreams && Array.isArray(item.ipStreams)) {
        linkedStreamIds.push(...this.getAllLinkedStreamIds(item.ipStreams));
      }
    });

    return linkedStreamIds;
  }
  public okEnabledChangedHandler(okEnabled: boolean): void {
    this.okEnabledChanged.emit(okEnabled);
  }

  private loadLocalServiceGroup() {
    this.localServiceGroup = cloneDeep(this.serviceGroup);
    this.localIPStreams = this.localServiceGroup.ipStreams;
    this.localATSC3TransportStream = cloneDeep(this.atsc3TransportStream);
    console.log('ServiceGroupComponent loadLocalATSC3Transport this.loadLocalServiceGroup: ',
      this.loadLocalServiceGroup, ', this.localATSC3TransportStream: ', this.localATSC3TransportStream,
      ', this.localATSC3TransportStream: ', this.localATSC3TransportStream);
  }
  activeIdChangedHandler(id: number){
    this.activeId = id;
    resetTabSelectedClass();
  }
}
