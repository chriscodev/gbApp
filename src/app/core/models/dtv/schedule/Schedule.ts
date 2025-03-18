// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.

import {AbstractElement} from '../../AbstractElement';
import {Language, LANGUAGE_TYPES, LanguageCode} from '../common/Language';
import {AudioDescription} from '../common/AudioDescription';
import {CaptionDescription} from './Captions';

export enum ATSCRatingType {
    USTV = 'USTV', MPAA = 'MPAA', ECTV = 'ECTV', FCTV = 'FCTV'
}

export interface ATSCRatingTypeWithDetails {
    readonly displayName: string;
    readonly ratingRegion: number;
}

export const ATSC_RATING_TYPES: Record<ATSCRatingType, ATSCRatingTypeWithDetails> = {
    [ATSCRatingType.USTV]: {displayName: 'USTV', ratingRegion: 1},
    [ATSCRatingType.MPAA]: {displayName: 'MPAA', ratingRegion: 1},
    [ATSCRatingType.ECTV]: {displayName: 'Canadian English TV', ratingRegion: 2},
    [ATSCRatingType.FCTV]: {displayName: 'Canadian French TV', ratingRegion: 2}
};

export class ATSCRatingDescription extends AbstractElement {
    public constructor(public ratingType: ATSCRatingType, public description: string, public id?: number,
                       public clientId?: string) {
        super(id, clientId);
    }
}

export class Country {
    public constructor(public humanReadable: string, public isoCode: string) {
    }
}

export class DVBRatingDescription extends AbstractElement {
    public constructor(public country: Country, public minimumAge: number, public id?: number,
                       public clientId?: string) {
        super(id, clientId);
    }
}

export class DTVEvent extends AbstractElement {
    public constructor(public startTime: Date, public endTime: Date, public duration: number,
                       public scheduleId: number, public listingId: string, public title: string,
                       public description: string, public shortDescription: string, public language: Language,
                       public atscRatingDescriptions: ATSCRatingDescription[],
                       public dvbRatingDescriptions: DVBRatingDescription[],
                       public audioDescriptions: AudioDescription[],
                       public captioningIndicated: boolean, public captionDescriptions: CaptionDescription[],
                       public redistributionControlled: boolean, public genre: string, public popularityRating: number,
                       public audioFormat: string, public videoFormat: string, public id?: number,
                       public clientId?: string) {
        super(id, clientId);
    }
}

export class DefaultDTVEvent extends DTVEvent {
    public constructor() {
        super(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined,
          LANGUAGE_TYPES[LanguageCode.CHI], undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined,
            undefined, undefined);
    }
}

export enum ScheduleType {
    LISTINGS = 'LISTINGS', DEFAULT = 'DEFAULT', RECURRING = 'RECURRING', USER = 'USER'
}

export class Schedule extends AbstractElement {
    public constructor(public name: string, public type: ScheduleType, public listingsId: string,
                       public dtvEvents: DTVEvent[], public id?: number, public clientId?: string) {
        super(id, clientId);
    }
}

export class DefaultSchedule extends Schedule {
    public constructor() {
        super(undefined, ScheduleType.DEFAULT, undefined, undefined);
    }
}
