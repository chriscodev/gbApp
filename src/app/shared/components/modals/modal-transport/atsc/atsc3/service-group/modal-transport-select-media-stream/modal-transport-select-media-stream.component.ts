// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  Optional,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {ClientMediaStreamsModel} from 'src/app/core/models/ClientMediaStreamsModel';
import {
  ActionMessage,
  ButtonType,
  ButtonTypes,
  ImageType,
  MultipleTableColumns
} from 'src/app/core/models/ui/dynamicTable';
import {
  DefaultMediaStream,
  MediaStream
} from '../../../../../../../../core/models/dtv/network/physical/stream/ip/media/MediaStream';
import {isDefined} from '../../../../../../../../core/models/dtv/utils/Utils';
import {
  ModalDynamicTbTranslateComponent
} from '../../../../../modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {
  TransportComponent
} from '../../../../../../../../pages/main/dtv-services/dtv-network/transport/transport.component';
import {BootstrapFunction} from '../../../../../../../../core/interfaces/interfaces';
import {ServiceGroupComponent} from '../service-group.component';

declare var $: BootstrapFunction;

@Component({
  selector: 'app-modal-transport-select-media-stream',
  templateUrl: './modal-transport-select-media-stream.component.html',
  styleUrls: ['./modal-transport-select-media-stream.component.scss']
})
export class ModalTransportSelectMediaStreamComponent implements OnChanges {
  @Input() mediaStreams: MediaStream[];
  @Output() mediaStreamsSelected: EventEmitter<MediaStream []> = new EventEmitter();
  @ViewChild(ModalDynamicTbTranslateComponent) mediaTableComponent: ModalDynamicTbTranslateComponent;

  public localMediaStreams: MediaStream[] = [];
  public selectedMediaStream: MediaStream = new DefaultMediaStream();
  public buttonList: ButtonTypes[] = [
    {name: ButtonType.VIEW, imgSrc: ImageType.view}
  ];
  public tableHeaders: MultipleTableColumns[] = [
    {header: 'Name', key: 'name', visible: true},
    {header: 'Service ID', key: 'serviceId', visible: true},
    {header: 'Address', key: 'dstAddress', visible: true},
    {header: 'Port', key: 'dstPort', visible: true}
  ];
  public okEnabled = false;
  public objectTitle = 'MediaStream';

  constructor(
    @Optional() @Inject(TransportComponent) private parent: TransportComponent,
    @Optional() @Inject(ServiceGroupComponent) private serviceGroups: ServiceGroupComponent,
    private mediaStreamModel: ClientMediaStreamsModel,
    private cdr: ChangeDetectorRef) {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (isDefined(changes.mediaStreams?.currentValue)) {
      this.localMediaStreams = changes.mediaStreams?.currentValue;
      this.sortTransportsServiceID();
      this.updateSelectedMedia();
    }
    localStorage.removeItem('MediaStream');
  }

  public sortTransportsServiceID(){
    this.localMediaStreams.sort((a, b) => a.serviceId - b.serviceId);
  }
  public onRowClicked($event: any): void {
    this.updateSelectedMedia();
  }

  public onButtonClicked($event: any): void {
    switch ($event.message) {
      case ActionMessage.VIEW:
        this.onView();
        break;
    }
  }

  public addMediaIPStreams() {
    this.closeModal();
    this.mediaStreamsSelected.emit(this.mediaTableComponent?.selectedRows);
  }

  public closeModal() {
    $('#modalTransportMediaStream').modal('hide');
  }

  private onView(): void {
    this.selectedMediaStream = this.mediaTableComponent.selectedRow;
    this.cdr.detectChanges();
    $('#modalTransportRouteDetails').modal('show');
  }

  private updateSelectedMedia(): void {
    if (isDefined(this.mediaTableComponent?.selectedRow)) {
      this.selectedMediaStream = this.mediaTableComponent?.selectedRow;
    } else {
      $('#modalTransportRouteDetails').modal('hide');
    }
    this.okEnabled = isDefined((this.selectedMediaStream));
  }
}
