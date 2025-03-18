// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.

import {Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {cloneDeep} from 'lodash';
import {MediaStream} from '../../../../core/models/dtv/network/physical/stream/ip/media/MediaStream';
import {ComponentCanDeactivate} from '../../../../core/guards/canDeactivateGuard';
import {AbstractCommitRevertComponent} from '../../abstracts/abstract-commit-revert.component';
import {ClientDTVServicesModel} from '../../../../core/models/ClientDTVServicesModel';
import {ClientOutputsModel} from '../../../../core/models/ClientOutputsModel';
import {ClientTransportsModel} from '../../../../core/models/ClientTransportsModel';
import {ClientNetworksModel} from '../../../../core/models/ClientNetworksModel';
import {
  AbstractOutput,
  ATSC3TranslatorOutput,
  ATSC3TranslatorRoute,
  MPEGRoute,
  OutputsChangedEvent,
  OutputType,
  UDPOutput
} from '../../../../core/models/dtv/output/Output';
import {DataPackage} from '../../../../core/models/dtv/network/physical/stream/ip/data/DataPackage';
import {AbstractNetwork, NetworksChangedEvent} from '../../../../core/models/dtv/network/logical/Network';
import {
  AbstractMPEGTransport,
  AbstractTransport,
  ATSC3Transport,
  TransportsChangedEvent,
  TransportType
} from '../../../../core/models/dtv/network/physical/Transport';
import {TransportComponent} from './transport/transport.component';
import {OutputComponent} from './output/output.component';
import {NetworksComponent} from './networks/networks.component';
import {MainComponent} from '../../main.component';
import {NavSliderComponent} from '../../../../shared/components/nav-slider/nav-slider.component';
import {isDefined} from '../../../../core/models/dtv/utils/Utils';
import {ChannelTransportLink} from '../../../../core/models/dtv/network/logical/Channel';
import {ServiceType} from '../../../../core/models/dtv/network/logical/Service';

// TODO this class needs some fairly significant clean up
@Component({
  selector: 'app-dtv-network',
  templateUrl: './dtv-network.component.html',
  styleUrls: ['./dtv-network.component.scss'],
})
export class DtvNetworkComponent extends AbstractCommitRevertComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
  @ViewChild(TransportComponent) transportComponent: TransportComponent;
  @ViewChild(OutputComponent) outputComponent: OutputComponent;
  @ViewChild(NetworksComponent) networkComponent: NetworksComponent;
  @ViewChild(NavSliderComponent) navSliderComponent: NavSliderComponent;
  public localTransports: AbstractTransport[] = [];
  public localNetworks: AbstractNetwork[] = [];
  public localOutputs: AbstractOutput[] = [];
  public headerTabs = [
    {tabName: 'Transports', activeId: 1},
    {tabName: 'Networks', activeId: 2},
    {tabName: 'Outputs', activeId: 3}
  ];
  public activeId = 1;
  private activeTabs: any = [];
  private tabList = [
    {tabName: 'Media Streams', hrefVal: '#mediastream', tabIdentifier: 'mediastream', toShow: false, transformVal: '0'},
    {tabName: 'Transports', hrefVal: '#transport', tabIdentifier: 'transport', toShow: true, transformVal: '0'},
    {tabName: 'Networks', hrefVal: '#networks', tabIdentifier: 'networks', toShow: true, transformVal: '0'},
    {tabName: 'Data Streams', hrefVal: '#datapackage', tabIdentifier: 'datapackage', toShow: false, transformVal: '0'},
    {tabName: 'Outputs', hrefVal: '#output', tabIdentifier: 'output', toShow: true, transformVal: '0'}];
  private transportsDirty = false;
  private networksDirty = false;
  private outputsDirty = false;
  private serverMediaStreams: MediaStream[] = [];
  private serverTransports: AbstractTransport[] = [];
  private serverNetworks: AbstractNetwork[] = [];
  private serverDataPackages: DataPackage[] = [];
  private serverOutputs: AbstractOutput[] = [];

  constructor(
    @Inject(MainComponent) private mainComponent: MainComponent,
    private clientTransportsModel: ClientTransportsModel,
    private clientNetworksModel: ClientNetworksModel,
    private clientOutputsModel: ClientOutputsModel,
    private clientDTVServicesModel: ClientDTVServicesModel
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializeTabs();
    // TODO add client model listeners
    this.reloadChildComponent();
  }

  public onRevert() {
    localStorage.setItem('transportCommitInProcess', 'true');
    this.reloadAllComponent();
    this.dirty = false;
  }

  /***
   * This is used when leaving to current route and checks if the data which is the form
   *  being return is true
   *  Edit: TODO to revisit route guards one day. originally returns this.dirty back in master
   */
  public canDeactivate(): boolean {
    return !this.dirty;
  }

  public ngOnDestroy(): void {
    this.cleanUpSubscriptions();
  }

  public onCommit() {
    console.log('DTVService Component onCommit');
    // TODO this seems odd since this class already received a copy from output event
    // this.serverNetworks = this.networksComponent.localNetworks;
    // this.serverTransports = this.transportComponent.localTransports;
    // this.serverOutputs = this.outputComponent.localOutputs;

    console.log(' this.serverTransports', this.serverTransports);
    console.log(' this.serverOutputs edit', this.serverOutputs);
    console.log(' this.serverNetworks', this.serverNetworks);
    localStorage.setItem('transportCommitInProcess', 'true');

    this.clientDTVServicesModel
      .updateDTVServiceElements(
        this.serverMediaStreams,
        this.transportComponent.localTransports,
        this.networkComponent.localNetworks,
        this.serverDataPackages,
        this.outputComponent.localOutputs
      )
      .then(() => {
        this.networksDirty = false;
        this.transportsDirty = false;
        this.outputsDirty = false;
        this.dirty = false;
        this.reloadChildComponent();
      });
  }

  public updateDirty() {
    this.dirty =
      this.networksDirty ||
      this.transportsDirty ||
      this.outputsDirty;

    if (this.mainComponent.notifyAdmin) {
      if (isDefined(this.navSliderComponent)) {
        this.navSliderComponent.onNavChange({
          activeId: 2, nextId: 1, preventDefault: () => {
          },
        });
      }
      this.transportComponent.initialPage = true;
      this.transportComponent.editMode = false;
      this.networkComponent.initialPage = true;
      this.networkComponent.editMode = false;
      this.outputComponent.initialPage = true;
      this.outputComponent.editMode = false;
    }
    this.mainComponent.notifyAdmin = false;
  }

  public networkChangedHandler(networksChangedEvent: NetworksChangedEvent) {
    console.log('networksChangedHandler, networksChangedEvent: ', networksChangedEvent);
    if (networksChangedEvent.dirty) {
      this.localNetworks = cloneDeep(networksChangedEvent.newNetworks);
      this.networksDirty = true;
      this.updateDirty();
    } else {
      this.networksDirty = false;
      this.updateDirty();
    }
  }

  public transportsChangedHandler(transportsChangedEvent: TransportsChangedEvent) {
    console.log('transportsChangedHandler, transportsChangedEvent: ', transportsChangedEvent);
    if (transportsChangedEvent.dirty) {
      this.localTransports = cloneDeep(transportsChangedEvent.newTransports);
      // removed deleted transport from output if linked
      this.resolveTransportLinks();
      this.transportsDirty = true;
      this.updateDirty();
    } else {
      this.transportsDirty = false;
      this.updateDirty();
    }
  }

  public outputsChangedHandler(outputsChangedEvent: OutputsChangedEvent) {
    console.log('outputsChangedHandler, outputsChangedEvent: edit ', outputsChangedEvent);
    if (outputsChangedEvent.dirty) {
      this.localOutputs = cloneDeep(outputsChangedEvent.newOutputs);
      this.outputsDirty = true;
      this.updateDirty();
    } else {
      this.outputsDirty = false;
      this.updateDirty();
    }
  }

  public activeIdChangedHandler(id) {
    this.activeId = id;
  }

  private initializeTabs() {
    this.activeTabs = this.tabList.filter(x => x.toShow);
  }

  private reloadChildComponent() {
    this.subscriptions.push(
      this.clientTransportsModel.transports$.subscribe(
        (transports: AbstractTransport[]) => {
          console.log(
            'transportCompoenent transportObservable subscribe transport: ', transports
          );
          this.serverTransports = this.localTransports = transports;
        }
      )
    );
    this.subscriptions.push(
      this.clientOutputsModel.output$.subscribe((outputs: AbstractOutput[]) => {
        this.serverOutputs = this.localOutputs = outputs;
      })
    );
    this.subscriptions.push(
      this.clientNetworksModel.networkList$.subscribe((networks: AbstractNetwork[]) => {
        console.log(
          'NetworksComponent networksObservable subscribe network: ', networks
        );
        this.serverNetworks = this.localNetworks = networks;
      })
    );
    // TODO add subscribe to all network/transport/output/data stream after update on server is called
  }

  /* Reload all components on REVERT*/
  private reloadAllComponent() {
    this.clientTransportsModel.refresh();
    this.transportComponent.onRevert();

    this.clientNetworksModel.refresh();
    this.networkComponent.onRevert();

    this.clientOutputsModel.refresh();
    this.outputComponent.onRevert();

    // TODO add functions to the component after redesign
  }

  private resolveTransportLinks(): void {
    const oldOutputsList = this.localOutputs;
    const transportIds: (string | number)[] = this.localTransports.map(transport => transport.id || transport.clientId);
    const ipStreamLinkIds: (string | number)[] = [];
    const programLinkIds: (string | number)[] = [];
    this.localTransports.forEach(transport => {
      if (transport.transportType === TransportType.ATSC_3) {
        const atsc3Transport: ATSC3Transport = transport as ATSC3Transport;
        atsc3Transport.serviceGroups?.forEach(serviceGroup => {
          serviceGroup.ipStreams.forEach(ipStream => {
            const serviceLinkId: string | number = ipStream.id || ipStream.clientId;
            ipStreamLinkIds.push(serviceLinkId);
          });
        });
      } else {
        const mpegTransport: AbstractMPEGTransport = transport as AbstractMPEGTransport;
        mpegTransport.programs?.forEach(program => {
          const serviceLinkId: string | number = program.id || program.clientId;
          programLinkIds.push(serviceLinkId);
        });
      }
    });

    const validateAndRemoveRoutes = (routes: ATSC3TranslatorRoute[] | MPEGRoute[]) => {
      routes.forEach(route => {
        const isRouteValid = route.transportId > 0
          ? transportIds.includes(route.transportId)
          : transportIds.includes(route.clientTransportId);
        if (!isRouteValid) {
          const index = routes.indexOf(route);
          if (index > -1) {
            routes.splice(index, 1);
          }
        }
      });
    };

    this.localOutputs.forEach(output => {
      if (output.outputType === OutputType.UDP) {
        const atscOutput = output as UDPOutput;
        validateAndRemoveRoutes(atscOutput.udpRoutes);
      } else if (output.outputType === OutputType.ATSC3_TRANSLATOR) {
        const translatedOutput = output as ATSC3TranslatorOutput;
        validateAndRemoveRoutes(translatedOutput.routes);
      } else {
        const isValid = output.transportId > 0 ? transportIds.includes(output.transportId)
          : transportIds.includes(output.clientTransportId);
        if (!isValid) {
          output.transportId = null;
        }
      }
    });
    if (this.outputComponent) {
      this.outputComponent.updateLocalOutputsResolvedLinks(this.localOutputs);
    }
    console.log('Resolved unlinked Output list edit', this.localOutputs);
    this.updateTransportNetworkLinks(transportIds, ipStreamLinkIds, programLinkIds);
  }

  private updateTransportNetworkLinks(transportIds: (string | number)[], ipStreamLinkIds: (string | number)[],
                                      programLinkIds: (string | number)[]): void {
    console.log('DTV Network updateTransportNetworkLinks transportIds: ', transportIds);
    if (isDefined(this.networkComponent)) {
      this.networkComponent.localNetworks.forEach(network => {
        network.channels.forEach(channel => {
          const newTransportLinks: ChannelTransportLink[] = [];
          let transportLinksDirty = false;
          channel.transportLinks?.forEach(transportLink => {
            const transportIdLinkFound = transportIds.includes(transportLink.transportId);
            const transportClientIdLinkFound = transportIds.includes(transportLink.clientTransportId);
            if (transportIdLinkFound || transportClientIdLinkFound) {
              newTransportLinks.push(transportLink);
            } else {
              transportLinksDirty = true;
              console.log('DTV Network updateTransportNetworkLinks removing transportLink: ', transportLink);
            }
          });
          let networksDirty = false;
          if (isDefined(channel.transportLinks && transportLinksDirty)) {
            channel.transportLinks = newTransportLinks;
            console.log('DTV Network updateTransportNetworkLinks marking network dirty network: ', network);
            networksDirty = true;
          }
          channel.services.forEach(service => {
            if (isDefined(service.physicalLink)) {
              const serviceLinkIds: (string | number)[] = service.serviceType === ServiceType.ATSC_3 ?
                ipStreamLinkIds : programLinkIds;
              const serviceIdLinkFound = serviceLinkIds.includes(service.physicalLink.physicalId);
              const serviceClientIdLinkFound = serviceLinkIds.includes(service.physicalLink.clientPhysicalId);
              if (!serviceIdLinkFound && !serviceClientIdLinkFound) {
                service.physicalLink = undefined;
                console.log('DTV Network updateTransportNetworkLinks removing service link service: ', service);
                networksDirty = true;
              }
            }
          });
          if (networksDirty) {
            this.networksDirty = true;
            this.updateDirty();
          }
        });
      });
    }
  }
}
