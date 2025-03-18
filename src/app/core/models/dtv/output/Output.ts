// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.

import {AbstractElement, DisplayNameType, IntegerValue, UNINITIALIZED_ID} from '../../AbstractElement';
import {AbstractCommitUpdate} from '../../CommitUpdate';
import {v4 as uuidv4} from 'uuid';
import {AbstractTransport, TransportType} from '../network/physical/Transport';
import {isDefined} from '../utils/Utils';

export enum OutputType {
  UDP = 'UDP',
  TRIVENI = 'TRIVENI',
  NETVX = 'NETVX',
  SELENIO = 'SELENIO',
  MNA = 'MNA',
  AVP = 'AVP',
  MX8400 = 'MX8400',
  MX5600 = 'MX5600',
  ASI = 'ASI',
  NET_PROCESSOR = 'NET_PROCESSOR',
  ATSC3_UDP = 'ATSC3_UDP',
  ATSC3_TRANSLATOR = 'ATSC3_TRANSLATOR',
}

// Used for sorting
export const OUTPUT_TYPES_VALUES: Record<OutputType, IntegerValue> = {
  [OutputType.ATSC3_TRANSLATOR]: {value: 11},
  [OutputType.ASI]: {value: 10},
  [OutputType.ATSC3_UDP]: {value: 9},
  [OutputType.AVP]: {value: 8},
  [OutputType.MX5600]: {value: 7},
  [OutputType.MX8400]: {value: 6},
  [OutputType.NETVX]: {value: 5},
  [OutputType.SELENIO]: {value: 4},
  [OutputType.MNA]: {value: 3},
  [OutputType.NET_PROCESSOR]: {value: 2},
  [OutputType.TRIVENI]: {value: 1},
  [OutputType.UDP]: {value: 0}
};

export const OUTPUT_TYPES: Record<OutputType, DisplayNameType> = {
  [OutputType.ASI]: {displayName: 'ASI'},
  [OutputType.UDP]: {displayName: 'UDP'},
  [OutputType.ATSC3_UDP]: {displayName: 'ATSC 3 UDP'},
  [OutputType.TRIVENI]: {displayName: 'Triveni Carousel'},
  [OutputType.NETVX]: {displayName: 'Harris NetVX'},
  [OutputType.SELENIO]: {displayName: 'Harris Selenio'},
  [OutputType.MNA]: {displayName: 'Harris SynchronyMNA'},
  [OutputType.AVP]: {displayName: 'Ericsson AVP'},
  [OutputType.MX8400]: {displayName: 'Ericsson MX8400'},
  [OutputType.MX5600]: {displayName: 'Ericsson MX5600'},
  [OutputType.NET_PROCESSOR]: {displayName: 'Thomson NetProcessor'},
  [OutputType.ATSC3_TRANSLATOR]: {displayName: 'ATSC 3.0 Translator'}
};

export enum UDPRouteType {
  MPEG = 'MPEG', MH = 'MH',
}

export enum TableDomain {
  PSI = 'PSI,', PSIP = 'PSIP', DVBSI = 'DVBSI', MH = 'MH', SCTE65 = 'SCTE65', ACST3 = 'ATSC3',
}

export enum ICDVersion {ICD_1_0 = 'ICD_1_0', ICD_1_1 = 'ICD_1_1'}

export const ICDVERSION_TYPES: Record<ICDVersion, DisplayNameType> = {
  [ICDVersion.ICD_1_0]: {displayName: '1.0'},
  [ICDVersion.ICD_1_1]: {displayName: '1.1'}
};

export type DisplayValue = {
  displayValue: string
};

export const RGB_COLOR: Record<string, DisplayValue> = {
  ['PSIP']: {displayValue: 'rgb(0, 0, 255, 1)'},
  ['PSI']: {displayValue: 'rgb(173, 216, 230, 1)'},
  ['NULL']: {displayValue: 'rgb(0, 0, 0, 1)'},
};

export type AllowedTranportType = {
  allowedTransportArray: TransportType[]
};

export const TRANSPORT_FOR_OUTPUT: Record<OutputType, AllowedTranportType> = {
  [OutputType.TRIVENI]: {allowedTransportArray: [TransportType.ATSC_PSIP_CABLE, TransportType.ATSC_PSIP_TERRESTRIAL]},
  [OutputType.ASI]: {allowedTransportArray: [TransportType.ATSC_PSIP_CABLE, TransportType.ATSC_PSIP_TERRESTRIAL]},
  [OutputType.UDP]: {allowedTransportArray: [TransportType.ATSC_PSIP_CABLE, TransportType.ATSC_PSIP_TERRESTRIAL]},
  [OutputType.NETVX]: {allowedTransportArray: [TransportType.ATSC_PSIP_CABLE, TransportType.ATSC_PSIP_TERRESTRIAL]},
  [OutputType.SELENIO]: {allowedTransportArray: [TransportType.ATSC_PSIP_CABLE, TransportType.ATSC_PSIP_TERRESTRIAL]},
  [OutputType.MNA]: {allowedTransportArray: [TransportType.ATSC_PSIP_CABLE, TransportType.ATSC_PSIP_TERRESTRIAL]},
  [OutputType.AVP]: {allowedTransportArray: [TransportType.ATSC_PSIP_CABLE, TransportType.ATSC_PSIP_TERRESTRIAL]},
  [OutputType.MX8400]: {allowedTransportArray: [TransportType.ATSC_PSIP_CABLE, TransportType.ATSC_PSIP_TERRESTRIAL]},
  [OutputType.MX5600]: {allowedTransportArray: [TransportType.ATSC_PSIP_CABLE, TransportType.ATSC_PSIP_TERRESTRIAL]},
  [OutputType.NET_PROCESSOR]: {allowedTransportArray: [TransportType.ATSC_PSIP_CABLE, TransportType.ATSC_PSIP_TERRESTRIAL]},
  [OutputType.ATSC3_UDP]: {allowedTransportArray: [TransportType.ATSC_3]},
  [OutputType.ATSC3_TRANSLATOR]: {allowedTransportArray: [TransportType.ATSC_3]},
};

export interface TableDomainWithDisplayName {
  readonly tableDomain: TableDomain;
  readonly displayName: string;
}

export const TABLE_DOMAINS: TableDomainWithDisplayName[] = [];

export class AbstractOutput extends AbstractElement {
  protected constructor(
    public outputType: OutputType, public name: string, public onLine: boolean, public transportId: number,
    public clientTransportId: string, public id?: number, public clientId?: string
  ) {
    super(id, clientId);
  }
}

export class TranslatedOutput {
  public constructor(public id: number, public transportCount: number, public lastUpdateTime: Date) {
  }
}

/*
export function getTranslatedOutputs(outputs: AbstractOutput[], lastUpdated: string): TranslatedOutput[] {
  const translatedOutputs: TranslatedOutput[] = [];
  let index = 0;
  outputs.forEach(output => {
    const lastUpdate = index < lastUpdated.length ? lastUpdated[index] : undefined;
    index++;
    if (isDefined(lastUpdate)) {
      translatedOutputs.push(new TranslatedOutput(output.id, output.clientId, getTransportCount(output),
        lastUpdate));
    }
  });
  return translatedOutputs;
}*/

export function getTransportCount(output: AbstractOutput): number {
  if (output.outputType === OutputType.UDP) {
    const udpOutput: UDPOutput = output as UDPOutput;
    return udpOutput.udpRoutes.length;
  }
  return output.transportId > 0 || output.clientTransportId?.length > 0 ? 1 : 0;
}


export abstract class A110CapableOutput extends AbstractOutput {
  protected constructor(public outputType: OutputType, public name: string, public onLine: boolean,
                        public transportId: number, public clientTransportId: string, public a110Enabled: boolean,
                        public id?: number, public clientId?: string) {
    super(outputType, name, onLine, transportId, clientTransportId, id, clientId);
  }
}

export abstract class AddressableOutput extends AbstractOutput {
  protected constructor(public outputType: OutputType, public name: string, public onLine: boolean,
                        public transportId: number, public clientTransportId: string, public outputAddress: string,
                        public id?: number, public clientId?: string) {
    super(outputType, name, onLine, transportId, clientTransportId, id, clientId);
  }
}

export abstract class PortAddressableOutput extends AddressableOutput {
  protected constructor(public outputType: OutputType, public port: number, public name: string,
                        public onLine: boolean, public transportId: number, public clientTransportId: string,
                        public outputAddress: string, public id?: number, public clientId?: string) {
    super(outputType, name, onLine, transportId, clientTransportId, outputAddress, id, clientId);
  }
}

export abstract class EricssonOutput extends AddressableOutput {
  public constructor(public outputType: OutputType, public stacks: number, public portsList: number[],
                     public name: string, public onLine: boolean, public transportId: number,
                     public clientTransportId: string, public outputAddress: string, public id?: number,
                     public clientId?: string) {
    super(outputType, name, onLine, transportId, clientTransportId, outputAddress, id, clientId);
  }
}

export function isEricssonOutput(outputType: OutputType): boolean {
  return outputType === OutputType.AVP || outputType === OutputType.MX5600 || outputType === OutputType.MX8400;
}

export abstract class HarrisSlotMuxOutput extends AddressableOutput {
  protected constructor(public outputType: OutputType, public name: string, public onLine: boolean,
                        public transportId: number, public clientTransportId: string, public outputAddress: string,
                        public multiplexerId: string, public slotId: number, public id?: number,
                        public clientId?: string) {
    super(outputType, name, onLine, transportId, clientTransportId, outputAddress, id, clientId);
  }
}

export class UDPRoute extends AbstractElement {
  public constructor(public udpRoute: UDPRouteType, public outputId: number, public transportId: number,
                     public clientTransportId: string, public address: string, public port: number,
                     public enabled: boolean, public id?: number, public clientId?: string) {
    super(id, clientId);
  }
}

export class ATSC3TranslatorRoute extends AbstractElement {
  public constructor(public outputId: number, public transportId: number,
                     public clientTransportId: string, public enabled: boolean, public llsSrcPort: number,
                     public id: number, public clientId?: string) {
    super(id, clientId);
  }
}

export class DefaultATSC3TranslatorRoute extends ATSC3TranslatorRoute {
  public constructor(public outputId: number) {
    super(outputId, undefined, undefined, false, undefined, UNINITIALIZED_ID, uuidv4());
  }
}

export class EASRoute {
  public constructor(public mpegRouteId: number, public multicastAddress: string, public port: number,
                     public networkInterfaceName: string) {
  }
}

export class DefaultEASRoute extends EASRoute {
  public constructor() {
    super(undefined, undefined, undefined, undefined);
  }
}

export class MPEGRoute extends UDPRoute {
  public constructor(public outputId: number, public transportId: number, public clientTransportId: string,
                     public address: string, public port: number, public enabled: boolean, public maxBitrate: number,
                     public transmitNullPacketsEnabled: boolean, public easRoute: EASRoute, public id?: number,
                     public clientId?: string) {
    super(UDPRouteType.MPEG, outputId, transportId, clientTransportId, address, port, enabled, id, clientId);
  }
}

export class DefaultMPEGRoute extends MPEGRoute {
  public constructor(public outputId: number) {
    super(outputId, undefined, undefined, undefined, undefined, false, undefined, false, undefined,
      UNINITIALIZED_ID, uuidv4());
  }
}

export class TranslatedUDPRoute {
  public constructor(public id: number, public clientId: string, public transportName: string, public tsid: number) {
  }
}

export function getTranslatedUDPRoutes(udpRoutes: UDPRoute[], transports: AbstractTransport[]): TranslatedUDPRoute[] {
  const translatedUDPRoutes: TranslatedUDPRoute[] = [];
  udpRoutes?.forEach(udpRoute => {
    const transport = getTransportForUDPRoute(udpRoute, transports);
    if (isDefined(transport)) {
      translatedUDPRoutes.push(new TranslatedUDPRoute(udpRoute.id, udpRoute.clientId, transport.name,
        transport.tsid));
    }
  });
  return translatedUDPRoutes;
}

export function getTransportForUDPRoute(udpRoute: UDPRoute, transports: AbstractTransport[]): AbstractTransport {
  let transport: AbstractTransport = undefined;
  if (isDefined((udpRoute.transportId) && udpRoute.transportId > 0)) {
    transport = transports.find(transport => transport.id === udpRoute.transportId);
  } else {
    transport = transports.find(transport => transport.clientId === udpRoute.clientTransportId);
  }
  return transport;
}

export abstract class ATSC3Output extends AbstractOutput {
  protected constructor(public name: string, public onLine: boolean, public transportId: number,
                        public clientTransportId: string, public nic: string, public id?: number,
                        public clientId?: string) {
    super(OutputType.ATSC3_UDP, name, onLine, transportId, clientTransportId, id, clientId);
  }
}

export class ATSC3UDPOutput extends ATSC3Output {
  public constructor(public name: string, public onLine: boolean, public transportId: number,
                     public clientTransportId: string, public nic: string, public srcPort?: number, public id?: number,
                     public clientId?: string) {
    super(name, onLine, transportId, clientTransportId, nic, id, clientId);
  }
}

export abstract class ATSC3TranslatorOutput extends AbstractOutput {
  protected constructor(public name: string, public onLine: boolean, public transportId: number,
                        public clientTransportId: string, public nic: string, public bouquetIP: string,
                        public bouquetPort: number, public routes: ATSC3TranslatorRoute[], public srcPort?: number,
                        public id?: number, public clientId?: string) {
    super(OutputType.ATSC3_TRANSLATOR, name, onLine, transportId, clientTransportId, id, clientId);
  }
}

export class DefaultATSC3UDPOutput extends ATSC3UDPOutput {
  public constructor(public name: string, public onLine: boolean) {
    super(name, onLine, undefined, undefined, undefined, undefined, UNINITIALIZED_ID, uuidv4());
  }
}


export class DefaultATSC3TranslatorOutput extends ATSC3TranslatorOutput {
  public constructor(public name: string, public onLine: boolean) {
    super(name, onLine, undefined, undefined, undefined, undefined, undefined,
      [], undefined, UNINITIALIZED_ID, uuidv4());
  }
}

export class UDPOutput extends A110CapableOutput {
  public constructor(public name: string, public onLine: boolean, public transportId: number,
                     public clientTransportId: string, public a110Enabled: boolean, public ttl: number,
                     public networkInterfaceName: string, public udpRoutes: MPEGRoute[], public id?: number,
                     public clientId?: string) {
    super(OutputType.UDP, name, onLine, transportId, clientTransportId, a110Enabled, id, clientId);
  }
}

const DEFAULT_TTL = 32;

export class DefaultUDPOutput extends UDPOutput {
  public constructor(public name: string, public onLine: boolean) {
    super(name, onLine, UNINITIALIZED_ID, null, false, DEFAULT_TTL, undefined, undefined, UNINITIALIZED_ID,
      uuidv4());
  }
}

export class ASIOutput extends A110CapableOutput {
  public constructor(public name: string, public onLine: boolean, public transportId: number,
                     public clientTransportId: string, public a110Enabled: boolean, public cardId: number,
                     public bitrate: number, id?: number, clientId?: string) {
    super(OutputType.ASI, name, onLine, transportId, clientTransportId, a110Enabled, id, clientId);
  }
}

export class DefaultASIOutput extends ASIOutput {
  public constructor(public name: string, public onLine: boolean) {
    super(name, onLine, undefined, undefined, false, undefined, 1000000, UNINITIALIZED_ID, uuidv4());
  }
}

export class TriveniOutput extends PortAddressableOutput {
  public constructor(public name: string, public onLine: boolean, public transportId: number,
                     public clientTransportId: string, public outputAddress: string, public port: number,
                     public id?: number, public clientId?: string) {
    super(OutputType.TRIVENI, port, name, onLine, transportId, clientTransportId, outputAddress, id, clientId);
  }
}

export class DefaultTriveniOutput extends TriveniOutput {
  public constructor(public name: string, public onLine: boolean) {
    super(name, onLine, undefined, undefined, undefined, undefined, UNINITIALIZED_ID, uuidv4());
  }
}

export class NetProcessorOutput extends PortAddressableOutput {
  public constructor(public name: string, public onLine: boolean, public transportId: number,
                     public clientTransportId: string, public outputAddress: string, public port: number,
                     public id?: number, public clientId?: string) {
    super(OutputType.NET_PROCESSOR, port, name, onLine, transportId, clientTransportId, outputAddress, id,
      clientId);
  }
}

export class DefaultNetProcessorOutput extends NetProcessorOutput {
  public constructor(public name: string, public onLine: boolean) {
    super(name, onLine, undefined, undefined, undefined, 4240, UNINITIALIZED_ID, uuidv4());
  }
}

export class NetVXOutput extends HarrisSlotMuxOutput {
  public constructor(public name: string, public onLine: boolean, public transportId: number,
                     public clientTransportId: string, public outputAddress: string, public multiplexerId: string,
                     public slotId: number, public id?: number, public clientId?: string) {
    super(OutputType.NETVX, name, onLine, transportId, clientTransportId, outputAddress, multiplexerId, slotId, id,
      clientId);
  }
}

export class DefaultNetVXOutput extends NetVXOutput {
  public constructor(public name: string, public onLine: boolean) {
    super(name, onLine, undefined, undefined, undefined, undefined, undefined, UNINITIALIZED_ID, uuidv4());
  }
}

export class SelenioOutput extends HarrisSlotMuxOutput {
  public constructor(public name: string, public onLine: boolean, public transportId: number,
                     public clientTransportId: string, public outputAddress: string, public multiplexerId: string,
                     public slotId: number, public id?: number, public clientId?: string) {
    super(OutputType.SELENIO, name, onLine, transportId, clientTransportId, outputAddress, multiplexerId, slotId,
      id, clientId);
  }
}

export class DefaultSelenioOutput extends SelenioOutput {
  public constructor(public name: string, public onLine: boolean) {
    super(name, onLine, undefined, undefined, undefined, undefined, undefined, UNINITIALIZED_ID, uuidv4());
  }
}

export class MNAOutput extends AddressableOutput {
  public constructor(public name: string, public onLine: boolean, public transportId: number,
                     public clientTransportId: string, public outputAddress: string, public icdVersion: ICDVersion,
                     public carouselEncrypted: boolean, public trafficNICName: string, public id?: number,
                     public clientId?: string) {
    super(OutputType.MNA, name, onLine, transportId, clientTransportId, outputAddress, id, clientId);
  }
}

export class DefaultMNAOutput extends MNAOutput {
  public constructor(public name: string, public onLine: boolean) {
    super(name, onLine, undefined, undefined, undefined, ICDVersion.ICD_1_0, false, undefined, UNINITIALIZED_ID,
      uuidv4());
  }

}

export class AVPOutput extends EricssonOutput {
  public constructor(public stacks: number, public portsList: number[], public name: string, public onLine: boolean,
                     public transportId: number, public clientTransportId: string, public outputAddress: string,
                     public id?: number, public clientId?: string) {
    super(OutputType.AVP, stacks, portsList, name, onLine, transportId, clientTransportId, outputAddress, id,
      clientId);
  }
}

export class DefaultAVPOutput extends AVPOutput {
  public constructor(public name: string, public onLine: boolean) {
    super(32, [1254, 1253, 1252, 1251, 1250], name, onLine, undefined, undefined, undefined, UNINITIALIZED_ID,
      uuidv4());
  }
}

export class MX5600Output extends EricssonOutput {
  public constructor(public stacks: number, public portsList: number[], public name: string, public onLine: boolean,
                     public transportId: number, public clientTransportId: string, public outputAddress: string,
                     public id?: number, public clientId?: string) {
    super(OutputType.MX5600, stacks, portsList, name, onLine, transportId, clientTransportId, outputAddress, id,
      clientId);
  }
}

export class DefaultMX5600Output extends MX5600Output {
  public constructor(public name: string, public onLine: boolean) {
    super(32, [1237, 1236, 1235, 1234], name, onLine, undefined, undefined, undefined, UNINITIALIZED_ID,
      uuidv4());
  }
}

export class MX8400Output extends EricssonOutput {
  public constructor(public stacks: number, public portsList: number[], public name: string, public onLine: boolean,
                     public transportId: number, public clientTransportId: string, public outputAddress: string,
                     public id?: number, public clientId?: string) {
    super(OutputType.MX8400, stacks, portsList, name, onLine, transportId, clientTransportId, outputAddress, id,
      clientId);
  }
}

export class DefaultMX8400Output extends MX8400Output {
  public constructor(public name: string, public onLine: boolean) {
    super(32, [1254, 1253, 1252, 1251, 1250], name, onLine, undefined, undefined, undefined, UNINITIALIZED_ID,
      uuidv4());
  }
}

export class OutputTestRequest {
  public constructor(public outputType: OutputType, public address: string, public port: number) {
  }
}

export class OutputTestResponse {
  public constructor(public successful: boolean, public message: string) {
  }
}

export class OutputsUpdate extends AbstractCommitUpdate<AbstractOutput> {
  public constructor(public added: AbstractOutput[], public updated: AbstractOutput[], public deleted: number[]) {
    super(added, updated, deleted);
  }
}

export class OutputsChangedEvent {
  public constructor(public dirty: boolean, public newOutputs: AbstractOutput[]) {
  }
}

