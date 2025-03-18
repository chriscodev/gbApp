/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChange, ViewChild,
} from '@angular/core';
import {cloneDeep} from 'lodash';
import {ServiceGroup} from 'src/app/core/models/dtv/network/physical/stream/ip/service-group/ServiceGroup';
import {AbstractExtension} from 'src/app/core/models/dtv/network/Extension';
import {AbstractTransport, ATSC3Transport} from '../../../../../../../core/models/dtv/network/physical/Transport';
import {isDefined} from '../../../../../../../core/models/dtv/utils/Utils';
import {resetTabSelectedClass} from '../../../../../../helpers/tableSelection';
import {ModalTransportSelectExtensionTypeComponent} from '../extension/modal-transport-select-extension-type/modal-transport-select-extension-type.component';

@Component({
  selector: 'app-modal-transport-atsc3-transport-stream',
  templateUrl: './modal-transport-atsc3-transport-stream.component.html',
  styleUrls: ['./modal-transport-atsc3-transport-stream.component.scss'],
})
export class ModalTransportAtsc3TransportStreamComponent implements OnInit, OnChanges {
  @Input() transportStream: AbstractTransport;
  @Output() atsc3TransportStreamChanged: EventEmitter<any> = new EventEmitter();
  @ViewChild(ModalTransportSelectExtensionTypeComponent) selectExtension!: ModalTransportSelectExtensionTypeComponent;
  public atsc3TransportStream: ATSC3Transport;
  public localTableExtensions: AbstractExtension[];
  private localATSC3TransportStream: ATSC3Transport;
  public headerTabs = [
    {tabName: 'Service Groups',  activeId: 1},
    {tabName: 'Transport Extensions',  activeId: 2},
  ];
  public activeId = 1;

  constructor(private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.loadLocalATSC3Transport();
  }

  public ngOnChanges(changes: { [property: string]: SimpleChange }) {
    if (isDefined(changes.transportStream)) {
      this.transportStream = changes.transportStream.currentValue;
      this.loadLocalATSC3Transport();
      this.cdr.detectChanges();
    }
  }

  public getAtsc3TransportStream(): ATSC3Transport {
    return this.localATSC3TransportStream;
  }

  public serviceGroupChangeHandler(updatedServiceGroups: ServiceGroup[]) {
    this.localATSC3TransportStream.serviceGroups = updatedServiceGroups;
    this.atsc3TransportStreamChanged.emit(this.localATSC3TransportStream);
  }

  public extensionChangeHandler(updatedTableExtension: AbstractExtension[]) {
    this.localATSC3TransportStream.extensions = updatedTableExtension;
    this.atsc3TransportStreamChanged.emit(this.localATSC3TransportStream);
  }

  private loadLocalATSC3Transport() {
    this.atsc3TransportStream = this.transportStream as ATSC3Transport;
    this.localATSC3TransportStream = cloneDeep(this.atsc3TransportStream);
    this.localTableExtensions = this.localATSC3TransportStream.extensions;
  }

  public activeIdChangedHandler(id: number){
    this.activeId = id;
    if ( id === 2){
      this.selectExtension.buttonDisableEnable();
    }
    resetTabSelectedClass();
  }
}
