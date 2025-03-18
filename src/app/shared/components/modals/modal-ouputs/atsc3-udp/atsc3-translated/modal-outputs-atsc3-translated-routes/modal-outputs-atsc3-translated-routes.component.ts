/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChange,
  ViewChild
} from '@angular/core';
import {cloneDeep} from 'lodash';
import {
  AbstractTransport,
  ATSC3TranslatedTransport,
  ATSC3Transport,
  TransportType
} from '../../../../../../../core/models/dtv/network/physical/Transport';
import {ClientTransportsModel} from '../../../../../../../core/models/ClientTransportsModel';
import {
  ATSC3TranslatorOutput,
  ATSC3TranslatorRoute,
  DefaultATSC3TranslatorRoute
} from '../../../../../../../core/models/dtv/output/Output';
import {BootstrapFunction} from '../../../../../../../core/interfaces/interfaces';
import {
  ModalOutputsSelectTransportTypeComponent
} from '../../../modal-outputs-select-transport-type/modal-outputs-select-transport-type.component';
import {MediaStream} from '../../../../../../../core/models/dtv/network/physical/stream/ip/media/MediaStream';
import {SweetAlert} from 'sweetalert/typings/core';
import * as _swal from 'sweetalert';
import {isDefined} from '../../../../../../../core/models/dtv/utils/Utils';
import {
  ModalAtsc3ViewTransportsListComponent
} from '../../../../modal-transport/atsc/atsc3/modal-atsc3-view-transports-list/modal-atsc3-view-transports-list.component';
import {inRangeCheck} from '../../../../../../helpers/mathHelprrs';
import {DtvNetworkComponent} from '../../../../../../../pages/main/dtv-services/dtv-network/dtv-network.component';

const swal: SweetAlert = _swal as any;
declare var $: BootstrapFunction;

@Component({
  selector: 'app-modal-outputs-atsc3-translated-routes',
  templateUrl: './modal-outputs-atsc3-translated-routes.component.html',
  styleUrl: './modal-outputs-atsc3-translated-routes.component.scss'
})
export class ModalOutputsAtsc3TranslatedRoutesComponent implements OnInit, OnChanges {
  @ViewChild(ModalOutputsSelectTransportTypeComponent) selectTransportTypeModal: ModalOutputsSelectTransportTypeComponent;
  @ViewChild(ModalAtsc3ViewTransportsListComponent) selectTranslatedTransportList: ModalAtsc3ViewTransportsListComponent;
  @Output() okEnabledChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() routeRecordChanged: EventEmitter<ATSC3TranslatorRoute> = new EventEmitter();
  @Input() selectedOutput: ATSC3TranslatorOutput;
  @Input() currentRoute: DefaultATSC3TranslatorRoute | undefined;
  @Input() editMode: boolean;
  @Input() serverATSC3Transports: ATSC3Transport[] = [];
  @Input() selectedTranslatedTransport: AbstractTransport;
  public unusedTransports: AbstractTransport[];
  public disableAdd: boolean;
  public mediaStreams: MediaStream[] = [];
  public llsPortIconText: string;
  private llsPortValid = true;
  public transportIdIconText: string;
  private transportIdValid = true;
  public okEnabled = false;
  allTransports: ATSC3TranslatedTransport[] = [];
  selectedTransport: ATSC3Transport;
  transportName = null;
  modalTitle = 'Add Route';

  public constructor(@Inject(DtvNetworkComponent) private dtvNetworkComponent: DtvNetworkComponent, public transportModel: ClientTransportsModel,
                     private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.loadATSC3Transport();
    this.filterUsedTransports(this.filterTransportTypes());
    this.setSelectedTransport();
    this.inputSettings();
  }

  public ngOnChanges(changes: { [property: string]: SimpleChange }) {
    if (changes.currentRoute && !changes.currentRoute.currentValue) {
      this.currentRoute = new DefaultATSC3TranslatorRoute(this.selectedOutput.id);
    } else if (changes.currentRoute) {
      this.updateTransportFields();
      this.cdr.detectChanges();
    }
  }

  loadATSC3Transport() {
    this.allTransports = cloneDeep(this.transportModel.transportsSubject.getValue());

  }

  public updateLLSPortValid(): void {
    this.llsPortValid = inRangeCheck(this.currentRoute.llsSrcPort, 1025, 65535);
    this.llsPortIconText = this.llsPortValid ? 'text-success' : 'text-danger';
  }

  public updateTranslatedTransportValid(): void {
    this.transportIdValid = this.currentRoute.transportId !== null && this.selectedTranslatedTransport !== null;
    this.transportIdIconText = this.transportIdValid ? 'text-success' : 'text-danger';
  }

  private updateOkEnabled(): void {
    const oldOkEnabled = this.okEnabled;
    this.okEnabled = this.llsPortValid && this.transportIdValid;
    if (oldOkEnabled !== this.okEnabled) {
      this.okEnabledChanged.emit(this.okEnabled);
    }
  }


  public inputSettings(): void {
    this.updateLLSPortValid();
    this.updateTranslatedTransportValid();
    this.updateOkEnabled();
  }

  public closeModal(): void {
    $('#addTranslatedRoute').modal('hide');
  }

  public openModal(): void {
    this.resetFields();
    this.cdr.detectChanges();
    $('#addTranslatedRoute').modal('show');
  }

  public transportChangeHandler(linkTransport: ATSC3TranslatedTransport): void {
    this.currentRoute.transportId = linkTransport?.id;
    this.currentRoute.clientTransportId = linkTransport?.clientId;
    this.currentRoute.outputId = this.selectedOutput?.id;
    this.transportName = linkTransport.name;
    this.selectedTranslatedTransport = linkTransport;
    if (this.transportName.length > 0) {
      this.disableAdd = true;
    }
    this.disableAdd = true;
    this.inputSettings();
  }

  public closeModalHandler(activeModalName: string): void {
    $(`#${activeModalName}`).modal('hide');
  }

  public viewSelectTransportMaterial(): void {
    $('#modalViewTransportMaterial').modal('show');
  }

  public removeTransport(): void {
    swal({
      title: 'Remove Transport Confirmation',
      text:
        'Are you sure you want to remove Transport "' +
        this.selectedTranslatedTransport.name +
        '"',
      buttons: ['Cancel', 'Ok'],
      icon: 'warning',
    }).then((isConfirm) => {
      if (isConfirm) {
        this.selectedTranslatedTransport = undefined;
        this.transportName = null;
        this.updateTransportFields();
        this.inputSettings();
      }
    });
  }

  setSelectedTransport(): AbstractTransport {
    const selectedATSCTransport = this.unusedTransports?.find(transport => {
      return this.currentRoute?.transportId > 0 ? transport.id === this.currentRoute?.transportId : transport.clientId === this.currentRoute?.clientTransportId;
    });
    this.selectedTranslatedTransport = selectedATSCTransport;
    return selectedATSCTransport;
  }

  private updateTransportFields(): void {
    this.disableAdd = isDefined(this.selectedTranslatedTransport?.name);
    if (this.disableAdd) {
      if (this.selectedTranslatedTransport?.id > 0 && isDefined(this.currentRoute)) {
        this.transportName = this.selectedTranslatedTransport?.name;
      } else {
        this.transportName = this.selectedTranslatedTransport?.name;
      }
    } else {
      this.transportIdValid = false;
      this.selectedTranslatedTransport = null;
    }
  }

  addTranslatedTransport() {
    this.selectTranslatedTransportList.openModal();
  }

  addUpdateRoute() {
    this.closeModal();
    this.routeRecordChanged.emit(this.currentRoute);
    this.cdr.detectChanges();
  }

  resetFields() {
    if (this.editMode) {
      if (this.currentRoute.transportId !== null) {
        this.transportName = this.currentRoute.transportId;
        this.selectedTranslatedTransport = this.setSelectedTransport();
        this.updateTransportFields();
      }
    } else {
      this.transportName = null;
      this.selectedTransport = null;
      this.selectedTranslatedTransport = null;

    }
  }

  private filterUsedTransports(transports: AbstractTransport[]) {
    this.unusedTransports = transports.filter(transport => {
      const filtered = this.dtvNetworkComponent.localOutputs.some(output => {
        return (transport.id > 0 ? transport.id === output.transportId : transport.clientId === output.clientTransportId);
      });
      return !filtered;
    });
    /* verify with Sean if we need to match the original trabsport id
    this.unusedTransports = this.unusedTransports.filter(t => {
      const transport = t as ATSC3TranslatedTransport;
      return this.selectedOutput.transportId === transport.originalTransportId;
    });*/
  }

  private filterTransportTypes(): AbstractTransport[] {
    return this.dtvNetworkComponent.localTransports.filter(
      transport => transport.transportType === TransportType.ATSC_3_TRANSLATED);
  }

  public updateData(currentRoute: ATSC3TranslatorRoute) {
    this.currentRoute = currentRoute;
    this.inputSettings();
    this.updateTransportFields();
    this.cdr.detectChanges();
  }
}
