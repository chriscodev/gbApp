// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {ATSCServiceType, ServiceType} from '../network/logical/Service';
import {ModulationType} from '../network/logical/Channel';
import {TransportType} from '../network/physical/Transport';

export type networkServiceCodeType = {
  networkServiceCode: ServiceType
};

export type serviceCodeType = {
  serviceCode: ATSCServiceType
};

export type modulationType = {
  modulationCode: ModulationType
};

export type transportType = {
  transportCode: TransportType
};

export const transportsHeader = ['TSID(I)', 'TSNAME(S)', 'TSTYPE(S)', 'PN(I)(O)', 'PMTPID(I)(O)', 'PCRPID(I)(O)', 'ESPID(I)(O)', 'ST(S)(O)'];
export const networksHeader = ['NETWORKNAME(S)', 'TYPE(S)', 'ORIGINALNETWORKID(I)', 'CHANNELNAME(S)', 'MODULATION(S)', 'SERVICENAME(S)', 'ATSCSERVICETYPE(S)', 'SERVICE ID(I)', 'TSID(I)(O)', 'TSNAME(S)(O)', 'PN(I)(O)', 'SCHEDULE PROVIDER(S)(O)', 'SCHEDULE NAME(S)(O)'];
export const outputsHeader = ['TSID(I)', 'TSNAME(S)', 'IPADDRESS(S)(O)', 'PORT(I)(O)'];

export const transportsFilename = 'GB_transports_exported.csv';
export const networksFilename = 'GB_networks_exported.csv';
export const outputsFilename = 'GB_outputs_exported.csv';

export const dtvCSVContent = 'data:text/csv;charset=utf-8,';

export const NETWORK_SERVICE_TYPES_CODE: Record<string, networkServiceCodeType> = {
  ['ATSC-Terrestrial']: {networkServiceCode: ServiceType.ATSC_TERRESTRIAL},
  ['ATSC-Cable']: {networkServiceCode: ServiceType.ATSC_CABLE},
  ['ATSC-3.0']: {networkServiceCode: ServiceType.ATSC_3}
};

export const NON_ATSC3_SERVICE_TYPES_CODE: Record<string, serviceCodeType> = {
  ['Digital Television']: {serviceCode: ATSCServiceType.DIGITAL_TV},
  ['Audio']: {serviceCode: ATSCServiceType.AUDIO},
  ['Data Broadcast']: {serviceCode: ATSCServiceType.DATA_BROADCAST}
};

export const MODULATION_CODE: Record<string, modulationType> = {
  ['256-QAM']: {modulationCode: ModulationType.QAM256},
  ['64-QAM']: {modulationCode: ModulationType.QAM64}
};

export const TRANSPORT_TYPE_CODE: Record<string, transportType> = {
  ['PSIP-Terrestrial']: {transportCode: TransportType.ATSC_PSIP_TERRESTRIAL},
  ['PSIP-Cable']: {transportCode: TransportType.ATSC_PSIP_CABLE},
  ['ATSC-3.0']: {transportCode: TransportType.ATSC_3}
};
