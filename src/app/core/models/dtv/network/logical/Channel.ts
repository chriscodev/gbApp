// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.

import {AbstractElement, DisplayNameType, UNINITIALIZED_ID} from '../../../AbstractElement';
import {DescriptorElement} from './DescriptorElement';
import {AbstractExtension} from '../Extension';
import {AbstractService} from './Service';
import {v4 as uuidv4} from 'uuid';

export enum ChannelType {
  ATSC = 'ATSC', ATSC3 = 'ATSC3'
}

export enum ModulationType {
  QAM64 = 'QAM64', QAM256 = 'QAM256'
}

export const MODULATION_TYPES: Record<ModulationType, DisplayNameType> = {
  [ModulationType.QAM64]: {displayName: '64-QAM'},
  [ModulationType.QAM256]: {displayName: '256-QAM'}
};

export const CHANNEL_TYPES: Record<ChannelType, DisplayNameType> = {
  [ChannelType.ATSC]: {displayName: 'ATSC'},
  [ChannelType.ATSC3]: {displayName: 'ATSC-3.0'}
};

export class ChannelTransportLink extends AbstractElement {
  public constructor(public transportId: number, public clientTransportId: string, public channelId: number,
                     public actual: boolean, public id?: number, public clientId?: string) {
    super(id, clientId);
  }
}

export class DefaultChannelTransportLink extends ChannelTransportLink {
  public constructor() {
    super(UNINITIALIZED_ID, undefined, UNINITIALIZED_ID, true, UNINITIALIZED_ID, uuidv4());
  }
}

export abstract class AbstractChannel extends AbstractElement {
  protected constructor(public name: string, public channelType: ChannelType,
                        public transportLinks: ChannelTransportLink[], public services: AbstractService[],
                        public descriptorElements: DescriptorElement[], public extensions: AbstractExtension[],
                        public modulation?: ModulationType, public timeZone?: string, public id?: number,
                        public clientId?: string) {
    super(id, clientId);
  }
}

export class TranslatedChannel {
  public constructor(public serviceCount: number, public transportName: string, public id?: number, public clientId?: string) {
  }
}

export class DefaultChannel extends AbstractChannel {
  public constructor(public name: string, public channelType: ChannelType,
                     public transportLinks: ChannelTransportLink[], public services: AbstractService[],
                     public descriptorElements: DescriptorElement[], public extensions: AbstractExtension[]) {
    super('', channelType, [], [], [], [], ModulationType.QAM256, 'Select Time Zone', UNINITIALIZED_ID, uuidv4());
  }
}

export class Channel extends AbstractChannel {
  public constructor() {
    super('', undefined, undefined, undefined, undefined, undefined);
  }
}

export abstract class AbstractATSCChannel extends AbstractChannel {
  protected constructor(public timeZone: string, public name: string, public channelType: ChannelType,
                        public transportLinks: ChannelTransportLink[], public services: AbstractService[],
                        public descriptorElements: DescriptorElement[], public extensions: AbstractExtension[],
                        public modulation?: ModulationType, public id?: number, public clientId?: string) {
    super(name, channelType, transportLinks, services, descriptorElements, extensions, ModulationType.QAM256,
      'Select Time Zone', id, clientId);
  }
}

export class ATSCMainChannel extends AbstractATSCChannel {
  public constructor(public timeZone: string, public name: string, public channelType: ChannelType,
                     public transportLinks: ChannelTransportLink[], public services: AbstractService[],
                     public descriptorElements: DescriptorElement[], public extensions: AbstractExtension[],
                     public modulation?: ModulationType, public id?: number, public clientId?: string) {
    super(timeZone, name, ChannelType.ATSC, transportLinks, services, descriptorElements, extensions, modulation,
      id, clientId);
  }
}

export class ATSC3Channel extends AbstractATSCChannel {
  public constructor(public timeZone: string, public name: string, public channelType: ChannelType,
                     public transportLinks: ChannelTransportLink[], public services: AbstractService[],
                     public descriptorElements: DescriptorElement[], public extensions: AbstractExtension[],
                     public modulation: ModulationType, public id?: number, public clientId?: string) {

    super(timeZone, name, ChannelType.ATSC3, transportLinks, services, descriptorElements, extensions, modulation,
      id, clientId);
  }
}
