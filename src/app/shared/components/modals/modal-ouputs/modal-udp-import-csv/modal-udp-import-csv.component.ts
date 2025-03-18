// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DefaultMPEGRoute, OutputType, UDPOutput} from '../../../../../core/models/dtv/output/Output';
import {ClientNetworkSettingsModel} from '../../../../../core/models/ClientNetworkSettingsModel';
import {NICDescriptor} from '../../../../../core/models/server/NetworkSetting';
import {BootstrapFunction} from '../../../../../core/interfaces/interfaces';
import {UdpDefaultSettings, UdpRouteData, UdpSettings} from '../../../../../core/models/dtv/output/OutputUdpCsvInterface';
import {isUndefined} from '../../../../../core/models/dtv/utils/Utils';

declare var $: BootstrapFunction;

@Component({
  selector: 'app-modal-udp-import-csv',
  templateUrl: './modal-udp-import-csv.component.html',
  styleUrls: ['./modal-udp-import-csv.component.scss']
})
export class ModalUdpImportCsvComponent implements OnInit {
  @Input() importUdpCsvData: UdpRouteData[];
  @Input() udpOutput: UDPOutput;
  @Output() outputUdpImportChange: EventEmitter<any> = new EventEmitter();
  public outputDefaultsModal = false;
  public importCSVObj: UdpSettings = new UdpDefaultSettings();
  public nics: NICDescriptor[] = [];

  constructor(private clientNetworkSettingsModel: ClientNetworkSettingsModel) {
    this.nics = this.clientNetworkSettingsModel.getNetworkList();
  }

  public ngOnInit() {
    this.initializeDefaultOutputSummary();
  }

  public udpOutputTransportImport() {
    this.mapOutputDataFromSettings();
  }

  public openOutputDefaultsModal() {
    this.outputDefaultsModal = true;
    setTimeout(() => {
      $('#modalChildImportUDPCSVDefaultData').modal('show');
    }, 100);
  }

  public closeOutputDefaultsModal() {
    $('#modalChildImportUDPCSVDefaultData').modal('hide');
    setTimeout(() => {
      this.outputDefaultsModal = false;
    }, 100);
  }

  public closeModal() {
    const dataEmit = {
      action: 'closeImportButton'
    };
    this.outputUdpImportChange.emit(dataEmit);
  }

  private mapOutputDataFromSettings() {
    this.udpOutput.networkInterfaceName = this.importCSVObj.nic;
    this.udpOutput.ttl = this.importCSVObj.ttl;
    this.importUdpCsvData.forEach((item) => {
      const mpegRoute = new DefaultMPEGRoute(this.udpOutput.id);
      mpegRoute.clientTransportId = item.clientTransportId;
      mpegRoute.transportId = item.transportId;
      mpegRoute.address = item.address;
      mpegRoute.port = +item.port;
      mpegRoute.enabled = true;
      mpegRoute.maxBitrate = this.importCSVObj.maxBitrate;
      if (isUndefined(this.udpOutput.udpRoutes)) {
        this.udpOutput.udpRoutes = [];
      }
      this.udpOutput.udpRoutes.push(mpegRoute);
    });
    this.confirmImport();
  }

  private confirmImport() {
    // importCsvData
    const dataEmit = {
      action: 'importCsvOutputUdpData',
      data: this.udpOutput
    };
    this.outputUdpImportChange.emit(dataEmit);
  }

  private initializeDefaultOutputSummary() {
    this.importCSVObj.outputType = OutputType.UDP;
    this.importCSVObj.routes = this.importUdpCsvData.length;
    this.importCSVObj.nic = this.getDefaultNetwork();
    this.importCSVObj.ttl = 32;
    this.importCSVObj.maxBitrate = 1000000;
  }

  private getDefaultNetwork() {
    return this.nics[0]?.interfaceName;
  }

}
