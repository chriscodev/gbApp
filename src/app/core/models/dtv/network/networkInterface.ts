// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.

import {DescriptorElement} from './logical/DescriptorElement';
import {AbstractExtension} from './Extension';
import {ATSCServiceType, LogicalPhysicalLink, ServiceScheduleLink, ServiceType} from './logical/Service';

export class CsvData {
  public name: string;
  public networkType: string;
  public networkId: string;
  public channelName: string;
  public channelModulation: string;
  public serviceName: string;
  public serviceType: string;
  public serviceId: string;
  public tsId: string;
  public tsName: string;
  public programNumber: string;
  public schedProvider: string;
  public schedName: string;
}

export interface Services{
 name: string;
 majorNumber: number;
 minorNumber: number;
 serviceType: ServiceType;
 priority: number;
 atscServiceType: ATSCServiceType;
 physicalLink: LogicalPhysicalLink;
 scheduleLinks: ServiceScheduleLink[];
 descriptorElements: DescriptorElement[];
 extensions: AbstractExtension[];
 id?: number;
 clientId?: string;
}
