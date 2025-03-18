export class ScheduleProviders {
  id: number;
  name: string;
  scheduleProviderType: string;
  port: number;
  lastCompletion: string;
  daysAheadToProcess: number;
  onLine: boolean;
  protocol: string;
  host: string;
  path: string;
  user: string;
  password: string;
  updateDaily: boolean;
  timeOfDay: string;
  intervalInMinutes: number;
  rateLimit: number;
  schedules: number;
}

export class ScheduleProvidersRowData {
  id: number;
  name: string;
  scheduleProviderType: string;
  port: number;
  lastCompletion: string;
  daysAheadToProcess: number;
  onLine: boolean;
  protocol: string;
  host: string;
  path: string;
  user: string;
  password: string;
  updateDaily: boolean;
  timeOfDay: string;
  intervalInMinutes: number;
  rateLimit: number;
  schedules: number;
}

export class SchedprovftpTest {
  host: string;
  port: number;
  path: string;
  user: string;
  password: string;
}

export class PostscheduleProvidersUpdate {
  added: ScheduleProvidersRowData[];
  updated: ScheduleProvidersRowData[];
  deleted: [];
}

export class OutputsDeprecated {
  id: number;
  name: string;
  onLine: boolean;
  transportId: number;
  srcPort: number;
  outputType: string;
  nic: string;
  lastUpdateTime?: string;
}

export class OutputStatusDeprecated {
  outputId: number;
  outputState: string;
  lastUpdateTime: string;
  lastUpdateMessage: string;
  lastEncodeEndTime: string;
  lastEncodeStartTime: string;
  lastOutputUpdateStartTime: string;
  lastOutputUpdateEndTime: string;
  plpStatistics: any[];
  srcAddress: string;
  srcPort: number;
  transportsStatus: any[];
}

export class PostNetworksUpdate {
  added: Networks[];
  updated: Networks[];
  deleted: [];
}

export class Networks {
  channels: NetworksChannelRowData[];
  descriptorElements: NetworksServicesDescriptorRowData[];
  id: number;
  name: string;
  networkType: string;
}

export class NetworksChannelRowData {
  channelType: string;
  descriptorElements: NetworksServicesDescriptorRowData[];
  extensions: [];
  id: number;
  modulation: string;
  name: string;
  services: NetworksServicesRowData[];
  timeZone: string;
  transportLinks: [];
}

export class NetworksServicesRowData {
  atscServiceType: string;
  captionDescriptions: NetworksServicesCaptionDescriptionsRowData[];
  description: string;
  descriptorElements: NetworksServicesDescriptorRowData[];
  extensions: [];
  hidden: boolean;
  hideGuide: boolean;
  id: number;
  linkedCaptionDescriptions: NetworksServicesCaptionDescriptionsRowData[];
  majorNumber: number;
  minorNumber: number;
  name: string;
  outOfBand: boolean;
  pathSelect: boolean;
  priority: number;
  scheduleLinks: NetworksServicesScheduleLinksRowData[];
  serviceType: string;
}

export class NetworksServicesDescriptorRowData {
  id: number;
  longChannelName: string;
  tag: number;
  editable: boolean;
}

export class NetworksServicesScheduleLinksRowData {
  id: number;
  serviceId: number;
  scheduleId: number;
  priority: number;
}

export class NetworksServicesCaptionDescriptionsRowData {
  id: number;
  serviceNumber: number;
  language: Language;
  digital: boolean;
  wide: boolean;
  easyReader: boolean;
}

export class Language {
  readable: string;
  iso2Code: string;
  iso3Code: string;
}

export class MediaStreams{
  ingestProtocol: string;
  name: string ;
  ingestPath: string;
  ingestUrl: string;
  enabled: boolean;
  encodingType: string;
  desAddress: string;
  desPort: number;
  nic: string;
  ttl: number;
  id: number;
  sltConfiguration: string;
}
