// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.

import {AbstractElement, DisplayNameType, UNINITIALIZED_ID} from '../../../AbstractElement';
import {DescriptorElement} from './DescriptorElement';
import {CaptionDescription} from '../../schedule/Captions';
import {AbstractExtension} from '../Extension';
import {v4 as uuidv4} from 'uuid';

// TODO someday add SCTE65 and DVB-SI
export enum ServiceType {
  ATSC_TERRESTRIAL = 'ATSC_TERRESTRIAL',
  ATSC_CABLE = 'ATSC_CABLE',
  ATSC_3 = 'ATSC_3'
}

export class LogicalPhysicalLink {
  public constructor(public physicalId: number, public clientPhysicalId: string) {
  }
}

export class DefaultPhysicalLink extends LogicalPhysicalLink {
  public constructor() {
    super(UNINITIALIZED_ID, uuidv4());
  }
}

export class ServiceScheduleLink extends AbstractElement {
  public constructor(public scheduleId: number, public serviceId: number, public priority: number,
                     public scheduleName?: string, public id?: number,
                     public clientId?: string) {
    super(id, clientId);
  }
}

export class DefaultSchedule extends ServiceScheduleLink {
  public constructor(public scheduleId: number, public serviceId: number, public priority: number, public id?: number,
                     public clientId?: string) {
    super(0, 0, 0, '', UNINITIALIZED_ID, uuidv4());
  }
}

export abstract class AbstractService extends AbstractElement {
  protected constructor(public name: string, public majorNumber: number, public minorNumber: number,
                        public serviceType: ServiceType, public priority: number,
                        public atscServiceType: ATSCServiceType, public physicalLink: LogicalPhysicalLink,
                        public scheduleLinks: ServiceScheduleLink[],
                        public descriptorElements: DescriptorElement[], public extensions: AbstractExtension[],
                        public description?: string, public id?: number, public clientId?: string) {
    super(id, clientId);
  }
}

export class TranslatedService {
  public constructor(public virtualChannel: string, public linkedProgram: string, public id?: number,
                     public clientId?: string) {
  }
}

export class DefaultServices extends AbstractService {
  public constructor(public name: string, public majorNumber: number, public minorNumber: number,
                     public serviceType: ServiceType, public priority: number,
                     public atscServiceType: ATSCServiceType, public physicalLink: LogicalPhysicalLink,
                     public scheduleLinks: ServiceScheduleLink[],
                     public descriptorElements: DescriptorElement[], public extensions: AbstractExtension[],
                     public description?: string, public id?: number, public clientId?: string) {
    super(name, majorNumber, minorNumber, serviceType, priority, atscServiceType, physicalLink, scheduleLinks,
      descriptorElements, extensions, description, id, clientId);
  }
}

export abstract class AbstractATSCService extends AbstractService {
  protected constructor(public majorNumber: number, public minorNumber: number, public description: string,
                        public hidden: boolean, public captionDescriptions: CaptionDescription[],
                        public linkedCaptionDescriptions: CaptionDescription[], public name: string,
                        public serviceType: ServiceType, public priority: number,
                        public physicalLink: LogicalPhysicalLink, public scheduleLinks: ServiceScheduleLink[],
                        public descriptorElements: DescriptorElement[], public extensions: AbstractExtension[],
                        public id?: number, public clientId?: string) {
    // @ts-ignore
    super(name, serviceType, priority, physicalLink, scheduleLinks, descriptorElements, extensions, id, clientId);
  }
}

export function getATSCServiceVirtualNumber(atscService: AbstractATSCService): string {
  const firstPart: string = atscService?.majorNumber > 0 ? atscService.majorNumber.toString() : '';
  const secondPart: string = atscService?.minorNumber > 0 ? atscService.minorNumber.toString() : '';
  const separator = firstPart.length > 0 && secondPart.length > 0 ? '-' : '';
  return firstPart + separator + secondPart;

}

export class Service extends AbstractATSCService {
  public constructor() {
    super(0, 0, '', false, [], [], '', undefined, 0, undefined, undefined, [], [], UNINITIALIZED_ID, uuidv4());
  }

}

export enum ATSCServiceType {
  DIGITAL_TV = 'DIGITAL_TV', AUDIO = 'AUDIO', DATA_BROADCAST = 'DATA_BROADCAST'
}

export const ATSC_SERVICE_TYPES: Record<ATSCServiceType, DisplayNameType> = {
  [ATSCServiceType.DIGITAL_TV]: {displayName: 'Digital Television'},
  [ATSCServiceType.AUDIO]: {displayName: 'Audio'},
  [ATSCServiceType.DATA_BROADCAST]: {displayName: 'Data Broadcast'}
};

export abstract class AbstractATSCMainService extends AbstractATSCService {
  protected constructor(public atscServiceType: ATSCServiceType, public hideGuide: boolean,
                        public majorNumber: number, public minorNumber: number, public description: string,
                        public hidden: boolean, public captionDescriptions: CaptionDescription[],
                        public linkedCaptionDescriptions: CaptionDescription[], public name: string,
                        public serviceType: ServiceType, public priority: number,
                        public physicalLink: LogicalPhysicalLink, public scheduleLinks: ServiceScheduleLink[],
                        public descriptorElements: DescriptorElement[], public extensions: AbstractExtension[],
                        public id?: number, public clientId?: string) {
    super(majorNumber, minorNumber, description, hidden, captionDescriptions, linkedCaptionDescriptions, name,
      serviceType, priority,
      physicalLink, scheduleLinks, descriptorElements, extensions, id, clientId);
  }
}

export class ATSCTerrestrialService extends AbstractATSCMainService {
  public constructor(public atscServiceType: ATSCServiceType, public hideGuide: boolean, public majorNumber: number,
                     public minorNumber: number, public description: string, public hidden: boolean,
                     public captionDescriptions: CaptionDescription[],
                     public linkedCaptionDescriptions: CaptionDescription[],
                     public name: string, public priority: number, public physicalLink: LogicalPhysicalLink,
                     public scheduleLinks: ServiceScheduleLink[], public descriptorElements: DescriptorElement[],
                     public extensions: AbstractExtension[], public id?: number, public clientId?: string) {
    super(atscServiceType, hideGuide, majorNumber, minorNumber, description, hidden, captionDescriptions,
      linkedCaptionDescriptions, name,
      ServiceType.ATSC_TERRESTRIAL, priority, physicalLink, scheduleLinks, descriptorElements, extensions, id,
      clientId);
  }

}

export class DefaultATSCTerrestrialService extends ATSCTerrestrialService {
  public constructor(priority: number) {
    super(ATSCServiceType.DIGITAL_TV, false, undefined, undefined, '', false, [], [], undefined, priority,
      undefined, [], [], [], UNINITIALIZED_ID, uuidv4());
  }
}

export class ATSCCableService extends AbstractATSCMainService {
  public constructor(public pathSelect: boolean, public outOfBand: boolean, public atscServiceType: ATSCServiceType,
                     public hideGuide: boolean, public majorNumber: number, public minorNumber: number,
                     public description: string, public hidden: boolean,
                     public captionDescriptions: CaptionDescription[],
                     public linkedCaptionDescriptions: CaptionDescription[], public name: string,
                     public priority: number,
                     public physicalLink: LogicalPhysicalLink, public scheduleLinks: ServiceScheduleLink[],
                     public descriptorElements: DescriptorElement[], public extensions: AbstractExtension[],
                     public id?: number, public clientId?: string) {
    super(atscServiceType, hideGuide, majorNumber, minorNumber, description, hidden, captionDescriptions,
      linkedCaptionDescriptions, name,
      ServiceType.ATSC_CABLE, priority, physicalLink, scheduleLinks, descriptorElements, extensions, id,
      clientId);
  }
}

export class DefaultATSCCableService extends ATSCCableService {
  public constructor(priority: number) {
    super(false, false, ATSCServiceType.DIGITAL_TV, false, undefined, undefined, '', false, [], [], undefined,
      priority, undefined, [], [], [], UNINITIALIZED_ID, uuidv4());
  }
}

export enum ATSC3ServiceCategory {
  LINEAR_A_V = 'LINEAR_A_V',
  LINEAR_AUDIO = 'LINEAR_AUDIO',
  APP_BASED = 'APP_BASED',
  ESG = 'ESG',
  EAS = 'EAS',
  DRM = 'DRM',
  DATA_ONLY = 'DATA_ONLY'
}

export const ATSC3_SERVICE_CATEGORIES: Record<ATSC3ServiceCategory, DisplayNameType> = {
  [ATSC3ServiceCategory.LINEAR_A_V]: {displayName: 'Linear A/V'},
  [ATSC3ServiceCategory.LINEAR_AUDIO]: {displayName: 'Linear Audio'},
  [ATSC3ServiceCategory.APP_BASED]: {displayName: 'App Based'},
  [ATSC3ServiceCategory.ESG]: {displayName: 'ESG'},
  [ATSC3ServiceCategory.EAS]: {displayName: 'EAS'},
  [ATSC3ServiceCategory.DRM]: {displayName: 'DRM'},
  [ATSC3ServiceCategory.DATA_ONLY]: {displayName: 'Data Only'}
};

export function isServiceCategoryMajorMinorRequired(serviceCategory: ATSC3ServiceCategory): boolean {
  return serviceCategory === ATSC3ServiceCategory.LINEAR_A_V || serviceCategory === ATSC3ServiceCategory.LINEAR_AUDIO;
}

export class ServiceRecoveryLink {
  public constructor(public recoveryId: number, public clientRecoveryId: string) {
  }
}

export class DefaultRecoveryLink extends ServiceRecoveryLink {
  public constructor(public recoveryId: number, public clientRecoveryId: string) {
    super(UNINITIALIZED_ID, uuidv4());
  }
}

export enum ServiceStatus {
  AUTO = 'AUTO', ACTIVE = 'ACTIVE', INACTIVE = 'INACTIVE'
}

export enum BroadbandAccess {
  AUTO = 'AUTO', REQUIRED = 'REQUIRED', NOT_REQUIRED = 'NOT_REQUIRED'
}

export const BROADBAND_ACCESSES: Record<BroadbandAccess, DisplayNameType> = {
  [BroadbandAccess.AUTO]: {displayName: 'Auto'},
  [BroadbandAccess.REQUIRED]: {displayName: 'Required'},
  [BroadbandAccess.NOT_REQUIRED]: {displayName: 'Not Required'},
};

export enum ServiceProtection {
  AUTO = 'AUTO', PROTECTED = 'PROTECTED', NOT_PROTECTED = 'NOT_PROTECTED'
}

export const SERVICE_PROTECTIONS: Record<ServiceProtection, DisplayNameType> = {
  [ServiceProtection.AUTO]: {displayName: 'Auto'},
  [ServiceProtection.PROTECTED]: {displayName: 'Protected'},
  [ServiceProtection.NOT_PROTECTED]: {displayName: 'Not Protected'},
};

export enum HideInGuide {
  AUTO = 'AUTO', HIDDEN = 'HIDDEN', UNHIDDEN = 'UNHIDDEN'
}

export class ATSC3Service extends AbstractATSCService {
  public constructor(public serviceCategory: ATSC3ServiceCategory, public recoveryLink: ServiceRecoveryLink,
                     public serviceStatus: ServiceStatus, public broadbandAccess: BroadbandAccess,
                     public serviceProtection: ServiceProtection, public hideInGuide: HideInGuide,
                     public majorNumber: number, public minorNumber: number, public description: string,
                     public hidden: boolean, public captionDescriptions: CaptionDescription[],
                     public linkedCaptionDescriptions: CaptionDescription[], public name: string,
                     public globalServiceId: string,
                     public priority: number, public physicalLink: LogicalPhysicalLink,
                     public scheduleLinks: ServiceScheduleLink[], public descriptorElements: DescriptorElement[],
                     public extensions: AbstractExtension[], public active: boolean, public id?: number,
                     public clientId?: string) {
    super(majorNumber, minorNumber, description, hidden, captionDescriptions, linkedCaptionDescriptions, name,
      ServiceType.ATSC_3, priority,
      physicalLink, scheduleLinks, descriptorElements, extensions, id, clientId);
  }
}

export class DefaultATSC3Service extends ATSC3Service {
  public constructor(priority: number) {
    super(ATSC3ServiceCategory.LINEAR_A_V, undefined, ServiceStatus.ACTIVE, BroadbandAccess.AUTO,
      ServiceProtection.AUTO, HideInGuide.AUTO, -1, -1, '', false, [], [], undefined, undefined, priority, undefined,
      [], [], [], true, UNINITIALIZED_ID, uuidv4());
  }
}

export function isATSCService(service: AbstractService): boolean {
  return service.serviceType === ServiceType.ATSC_3 || service.serviceType === ServiceType.ATSC_CABLE ||
    service.serviceType === ServiceType.ATSC_TERRESTRIAL;
}

export class ResolvedATSC3Service {
  public constructor(public readonly id: number, public serviceId: number, public serviceGroupId: number,
                     public name: string, public serviceName: string, public globalServiceId: string,
                     public majorNumber: number, public minorNumber: number, public serviceCategory: number) {
  }
}

export class ServiceUuidDescriptor {
  public constructor(public readonly id: number, public readonly uuid: string) {
  }
}
