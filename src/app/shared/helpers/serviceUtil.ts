// Copyright (c) 2025 Triveni Digital, Inc. All rights reserved.
import {
  AbstractMPEGTransport,
  AbstractTransport,
  ATSC3TranslatedTransport,
  ATSC3Transport,
  CablePSIPTransport,
  TerrestialPSIPTransport,
  TransportType
} from '../../core/models/dtv/network/physical/Transport';
import {IPStream} from '../../core/models/dtv/network/physical/stream/ip/IPStream';
import {AbstractNetwork} from '../../core/models/dtv/network/logical/Network';
import {AbstractService, ATSC3Service, ServiceScheduleLink} from '../../core/models/dtv/network/logical/Service';
import {Program} from '../../core/models/dtv/network/physical/stream/mpeg/Program';
import {ServiceGroup, VP1Embedder} from 'src/app/core/models/dtv/network/physical/stream/ip/service-group/ServiceGroup';
import {isDefined} from '@datorama/akita';
import {Channel} from '../../core/models/dtv/network/logical/Channel';


export function getLinkedProgram(service: AbstractService, selectedTransport: AbstractTransport): Program | null {
  let selectedProgram: Program = null;
  if (service.physicalLink !== null && selectedTransport !== null) {
    const transport: AbstractMPEGTransport = selectedTransport as AbstractMPEGTransport;
    for (const program of transport.programs) {
      if (program.id > 0 && program.id === service.physicalLink?.physicalId) {
        selectedProgram = program;
        break;
      }
      if (program.id === -1 && program.clientId === service.physicalLink?.clientPhysicalId) {
        selectedProgram = program;
        break;
      }
    }
  }
  return selectedProgram;
}

export function getServiceGroup(atsc3StreamId: number, atsc3Transport: ATSC3Transport): ServiceGroup | null {
  let serviceGroup: ServiceGroup = null;
  for (const currentGroup of atsc3Transport.serviceGroups) {
    for (const currentStream of currentGroup.ipStreams) {
      if (currentStream.id === atsc3StreamId) {
        serviceGroup = currentGroup;
        break;
      }
    }
    if (serviceGroup !== null) {
      break;
    }
  }
  return serviceGroup;
}

export function getLinkedRecovery(selectedService: AbstractService,
                                  selectedTransport: AbstractTransport): VP1Embedder | null {
  let embedder: VP1Embedder = null;
  const service: ATSC3Service = selectedService as ATSC3Service;
  const transport: ATSC3Transport = selectedTransport as ATSC3Transport;
  if (service.recoveryLink !== null && selectedTransport !== null) {
    const ipStream: IPStream = getLinkedIPStream(service, transport);
    if (ipStream !== null) {
      const serviceGroup: ServiceGroup = getServiceGroup(ipStream.id, transport);
      embedder = serviceGroup.recoverySettings.vp1Embedders.find(e => service.recoveryLink.recoveryId === e.id) || null;
    }

  }
  return embedder;
}

export function createMap(transports: AbstractTransport[]): Map<string, AbstractTransport> {
  const transportMap: Map<string, AbstractTransport> = new Map<string, AbstractTransport>();
  transports.forEach(transport => {
    switch (transport.transportType) {
      case TransportType.ATSC_3:
        transportMap.set(transport.id > 0 ? transport.id.toString() : transport.clientId,
          transport as ATSC3Transport);
        break;
      case TransportType.ATSC_3_TRANSLATED:
        transportMap.set(transport.id > 0 ? transport.id.toString() : transport.clientId,
          transport as ATSC3TranslatedTransport);
        break;
      case TransportType.ATSC_PSIP_TERRESTRIAL:
        transportMap.set(transport.id > 0 ? transport.id.toString() : transport.clientId,
          transport as TerrestialPSIPTransport);
        break;
      case TransportType.ATSC_PSIP_CABLE:
        transportMap.set(transport.id > 0 ? transport.id.toString() : transport.clientId,
          transport as CablePSIPTransport);
        break;
    }
  });
  return transportMap;
}


export function getLinkedIPStream(service: AbstractService, transport: AbstractTransport) {
  let ipStream: IPStream = null;
  const ipStreamLink = service.physicalLink;
  if (ipStreamLink != null && transport != null) {
    if (transport.transportType === TransportType.ATSC_3 || TransportType.ATSC_3_TRANSLATED) {
      const atsc3Transport = transport as ATSC3Transport;
      for (const group of atsc3Transport.serviceGroups) {
        for (const currentIPStream of group.ipStreams) {
          if (currentIPStream.id > -1) {
            if (currentIPStream.id === service.physicalLink.physicalId) {
              ipStream = currentIPStream;
            }
          } else if (currentIPStream.clientId === service.physicalLink.clientPhysicalId) {
            ipStream = currentIPStream;
          }
        }
        if (ipStream != null) {
          break;
        }
      }
    }
  }
  return ipStream;
}


export function getIPStreamsList(transport: AbstractTransport) {
  const ipStreams: IPStream[] = [];
  if (transport != null) {
    const atsc3Transport: ATSC3Transport = transport as ATSC3Transport;
    atsc3Transport.serviceGroups.forEach(srgGrp => {
      if (srgGrp.ipStreams.length > 0) {
        srgGrp.ipStreams.forEach(stream => {
          ipStreams.push(stream);
        });
      }
    });
    return ipStreams;
  }
}


export function getProgramList(transport: AbstractTransport) {
  const programs: Program[] = [];
  if (transport != null) {
    let atsc3Transport = null;
    if (transport.transportType === TransportType.ATSC_PSIP_TERRESTRIAL || transport.transportType === TransportType.ATSC_PSIP_CABLE) {
      atsc3Transport = transport as AbstractMPEGTransport;
    }
    atsc3Transport?.programs.forEach((program: Program) => {
      programs.push(program);
    });
    return programs;
  }
}

export function filterUsedStreams(streams: IPStream[], networks: AbstractNetwork[], selectedNetwork: AbstractNetwork) {

  function hasPhysicalLink(service: AbstractService, streamId: string) {
    if (isDefined(service.physicalLink)) {
      return service.physicalLink.physicalId.toString() === streamId || service.physicalLink.clientPhysicalId === streamId;
    }
    return false;
  }

  function matchesSelectedNetworkToStream(stream: IPStream, selectedNetwork: AbstractNetwork) {
    return selectedNetwork.channels.some(channel => {
      return channel.services.some(service => {
        const streamId = stream.id > -1 ? stream.id.toString() : stream.clientId;
        return hasPhysicalLink(service, streamId);
      });
    });
  }

  return streams.filter(stream => {
    return networks.some(network => {
      const isSelectedNetwork = selectedNetwork.id > -1 ? selectedNetwork.id === network.id : selectedNetwork.clientId === network.clientId;
      if (isSelectedNetwork) {
        return matchesSelectedNetworkToStream(stream, selectedNetwork);
      } else {
        return matchesSelectedNetworkToStream(stream, network);
      }
    });
  });
}

export function filterUsedPrograms(programs: Program[], networks: AbstractNetwork[], selectedNetwork: AbstractNetwork) {

  function hasPhysicalLink(service, programId): boolean {
    if (isDefined(service.physicalLink)) {
      return service.physicalLink.physicalId.toString() === programId || service.physicalLink.clientPhysicalId === programId;
    }
    return false;
  }

  function matchesSelectedNetwork(program: Program, selectedNetwork: AbstractNetwork): boolean {
    return selectedNetwork.channels.some(channel => {
      return channel.services.some(service => {
        const programId = program.id > -1 ? program.id.toString() : program.clientId;
        return hasPhysicalLink(service, programId);
      });
    });
  }

  return programs.filter(program => {
    return networks.some(network => {
      const isSelectedNetwork = selectedNetwork.id > -1 ? selectedNetwork.id === network.id : selectedNetwork.clientId === network.clientId;
      if (isSelectedNetwork) {
        return matchesSelectedNetwork(program, selectedNetwork);
      } else {
        return matchesSelectedNetwork(program, network);
      }
    });
  }).map(program => program);
}

export function getLinkedOriginalService(ipStream: IPStream, channels: Channel[],
                                         originalTransport: AbstractTransport): AbstractService {
  let service: AbstractService = null;
  if (ipStream && originalTransport) {
    for (const channel of channels) {
      const transportLinks = channel.transportLinks;
      if (transportLinks.length > 0 && transportLinks[0].transportId === originalTransport.id) {
        for (const curService of channel.services) {
          const physLink = curService.physicalLink;
          if (physLink?.physicalId > -1 && physLink?.physicalId === ipStream.id) {
            service = curService;
            break;
          } else if (physLink?.clientPhysicalId === ipStream.clientId) {
            service = curService;
            break;
          }
        }
      }
      if (service) {
        break;
      }
    }
  }
  return service;
}

export function getUsedIPStreamIds(services: AbstractService[], currentService: AbstractService) {
  const linkedIPStreamIds: string[] = [];
  services.forEach((service: AbstractService) => {
    if (currentService !== service && isDefined(service.physicalLink)) {
      const physicalId = service.physicalLink?.physicalId;
      const clientPhysicalId = service.physicalLink?.clientPhysicalId;
      if (physicalId > -1) {
        linkedIPStreamIds.push(physicalId.toString());
      } else if (clientPhysicalId) {
        linkedIPStreamIds.push(clientPhysicalId);
      }
    }
  });

  return linkedIPStreamIds;
}

export function getServiceScheduleLinks(currentService: AbstractService, originalService: AbstractService) {
  let serviceScheduleLink: ServiceScheduleLink[] = [];
  const scheduleLinks = currentService?.scheduleLinks;
  const inheritedScheduleLinks: ServiceScheduleLink[] = originalService != null ? originalService?.scheduleLinks : null;
  if (currentService?.physicalLink?.physicalId === originalService?.physicalLink?.physicalId) {
    serviceScheduleLink = inheritedScheduleLinks !== null ? inheritedScheduleLinks : scheduleLinks;
  }
  return serviceScheduleLink;
}
