/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */

import {AbstractElement, DisplayNameType} from '../../AbstractElement';
import {Language} from './Language';

export enum AudioServiceType {
    COMPLETE_MAIN = 'COMPLETE_MAIN',
    MUSIC_EFFECTS = 'MUSIC_EFFECTS',
    VI_IMPAIRED = 'VI_IMPAIRED',
    HE_IMPAIRED = 'HE_IMPAIRED',
    DIALOGUE = 'DIALOGUE',
    COMMENTARY = 'COMMENTARY',
    EMERGENCY = 'EMERGENCY',
    VOICE_OVER = 'VOICE_OVER'
}

export const AUDIO_SERVICE_TYPES: Record<AudioServiceType, DisplayNameType> = {
    [AudioServiceType.COMPLETE_MAIN]: {displayName: 'Complete Main'},
    [AudioServiceType.MUSIC_EFFECTS]: {displayName: 'Music and Effects'},
    [AudioServiceType.VI_IMPAIRED]: {displayName: 'Visually Impaired'},
    [AudioServiceType.HE_IMPAIRED]: {displayName: 'Hearing Impaired'},
    [AudioServiceType.DIALOGUE]: {displayName: 'Dialogue'},
    [AudioServiceType.COMMENTARY]: {displayName: 'Commentary'},
    [AudioServiceType.EMERGENCY]: {displayName: 'Emergency'},
    [AudioServiceType.VOICE_OVER]: {displayName: 'Voice Over'}
};

export class AudioDescription extends AbstractElement {
    public constructor(public language: Language, public type: AudioServiceType, audioId: number, public id?: number,
                       public clientId?: string) {
        super(id, clientId);
    }
}

export const DEFAULT_AUDIO_SERVICE_TYPE: AudioServiceType = AudioServiceType.COMPLETE_MAIN;
