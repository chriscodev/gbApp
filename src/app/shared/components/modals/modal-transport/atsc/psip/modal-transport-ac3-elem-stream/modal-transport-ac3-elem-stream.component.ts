// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.

import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {numberOnly} from '../../../../../../helpers/appWideFunctions';
import {
  ElementaryStream,
  ElementaryStreamType,
  isAC3Stream
} from '../../../../../../../core/models/dtv/network/physical/stream/mpeg/ElementaryStream';
import {
  AC3ElementaryStream,
  FULL_SERVICE_TYPES,
  FullServiceType
} from '../../../../../../../core/models/dtv/network/physical/stream/mpeg/audio/AC3ElementaryStream';
import {
  AUDIO_PRIORITIES,
  AudioPriority
} from '../../../../../../../core/models/dtv/network/physical/stream/mpeg/audio/AudioPriority';
import {AUDIO_SERVICE_TYPES, AudioServiceType} from '../../../../../../../core/models/dtv/common/AudioDescription';
import {
  AUDIO_SAMPLE_RATES,
  SampleRate
} from '../../../../../../../core/models/dtv/network/physical/stream/mpeg/audio/SampleRate';
import {
  SURROUND_MODES,
  SurroundMode
} from '../../../../../../../core/models/dtv/network/physical/stream/mpeg/audio/SurroundMode';
import {
  AUDIO_BITRATES,
  AudioBitRate
} from '../../../../../../../core/models/dtv/network/physical/stream/mpeg/audio/AudioBitRate';
import {
  AUDIO_CODINGS,
  AudioCoding
} from '../../../../../../../core/models/dtv/network/physical/stream/mpeg/audio/AudioCoding';
import {isDefined} from '../../../../../../../core/models/dtv/utils/Utils';
import {inRangeCheck} from '../../../../../../helpers/mathHelprrs';
import {isElementIdMatch} from '../../../../../../../core/models/AbstractElement';
import {Language, LANGUAGE_TYPES, LanguageCode} from '../../../../../../../core/models/dtv/common/Language';

@Component({
  selector: 'app-modal-transport-ac3-elem-stream',
  templateUrl: './modal-transport-ac3-elem-stream.component.html',
  styleUrls: ['./modal-transport-ac3-elem-stream.component.scss'],
})
export class ModalTransportAc3ElemStreamComponent implements OnInit, OnChanges {
  @Input() ac3ElementaryStream: AC3ElementaryStream;
  @Input() elementaryStreams: ElementaryStream[];
  @Input() editMode: boolean;
  @Output() okButtonEnabledChanged: EventEmitter<boolean> = new EventEmitter();
  public readonly numberOnly = numberOnly;
  public readonly AUDIO_SERVICE_TYPES = AUDIO_SERVICE_TYPES;
  public readonly audioServiceTypes: AudioServiceType[] = Object.values(AudioServiceType);
  public readonly AUDIO_PRIORITIES = AUDIO_PRIORITIES;
  public readonly audioPriorities: AudioPriority[] = Object.values(AudioPriority);
  public readonly AUDIO_SAMPLE_RATES = AUDIO_SAMPLE_RATES;
  public readonly sampleRates: SampleRate[] = Object.values(SampleRate);
  public readonly SURROUND_MODES = SURROUND_MODES;
  public readonly surroundModes: SurroundMode[] = Object.values(SurroundMode);
  public readonly FULL_SERVICE_TYPES = FULL_SERVICE_TYPES;
  public readonly fullServiceTypes: FullServiceType[] = Object.values(FullServiceType);
  public readonly AUDIO_BITRATES = AUDIO_BITRATES;
  public readonly audioBitRates: AudioBitRate[] = Object.values(AudioBitRate);
  public readonly AUDIO_CODINGS = AUDIO_CODINGS;
  public readonly audioCodings: AudioCoding[] = Object.values(AudioCoding);
  public readonly languages: string[] = [];
  public readonly channels: string[] = ['1', '≤ 2', '≤ 3', '≤ 4', '≤ 5', '≤ 6'];
  public localLanguage: string;
  public localFullServiceType: FullServiceType = FullServiceType.COMPLETE;
  public audioIdIconText: string;
  public mainServiceIdIconText: string;
  public associatedServiceIdIconText: string;
  public mainServiceEnabled: boolean;
  public okButtonEnabled: boolean;
  private audioIdExists: boolean;
  private mainServiceIdExists: boolean;
  private audioIdValid: boolean;
  private mainServiceIdValid: boolean;
  private associatedServiceIdValid: boolean;
  private languageMap: Map<string, Language> = new Map<string, Language>();

  constructor(private cdr: ChangeDetectorRef) {
  }

  public ngOnInit(): void {
    this.initializeLanguages();
    this.localLanguage = this.getLanguageDisplayName(this.ac3ElementaryStream.language);
    this.updateAC3ElementaryStream();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (isDefined(changes.ac3ElementaryStream)) {
      this.ac3ElementaryStream = changes.ac3ElementaryStream.currentValue;
      this.localLanguage = this.getLanguageDisplayName(this.ac3ElementaryStream.language);
    }
    if (isDefined(changes.elementaryStreams)) {
      this.elementaryStreams = changes.elementaryStreams.currentValue;
    }
    if (isDefined(changes.editMode)) {
      this.editMode = changes.editMode.currentValue;
    }
    this.updateAC3ElementaryStream();
    this.okButtonEnabledChanged.emit(this.okButtonEnabled);
  }

  public onChangeTypeService() {
    this.mainServiceEnabled = this.ac3ElementaryStream.audioServiceType === AudioServiceType.COMPLETE_MAIN ||
      this.ac3ElementaryStream.audioServiceType === AudioServiceType.VI_IMPAIRED;
  }

  public onLanguageChange(): void {
    this.ac3ElementaryStream.language = this.languageMap.get(this.localLanguage);
  }

  public onFieldInput(): void {
    this.updateAudioIdValid();
    this.updateMainServiceIdValid();
    this.updateAssociatedServiceIdValid();
    this.updateOkEnabled();
  }

  public toggleAudioChannels(): void {
    this.ac3ElementaryStream.useNumberOfChannels = !this.ac3ElementaryStream.useNumberOfChannels;
  }

  private updateAC3ElementaryStream(): void {
    this.onFieldInput();
    this.onChangeTypeService();
  }

  private updateAudioIdValid(): void {
    this.updateAudioIdExists();
    this.audioIdValid = !this.audioIdExists && inRangeCheck(this.ac3ElementaryStream.audioId, 1, 7);
    this.audioIdIconText = this.audioIdValid ? 'text-success' : 'text-danger';
  }

  private updateMainServiceIdValid(): void {
    this.updateMainServiceIdExists();
    const idValid = !this.mainServiceIdExists && inRangeCheck(this.ac3ElementaryStream.mainServiceId, 0, 7);
    this.mainServiceIdValid = !this.mainServiceEnabled || idValid;
    this.mainServiceIdIconText = this.mainServiceIdValid ? 'text-success' : 'text-danger';
  }

  private updateAssociatedServiceIdValid(): void {
    this.associatedServiceIdValid = this.mainServiceEnabled || inRangeCheck(
      this.ac3ElementaryStream.associatedServiceId, 0, 255);
    this.associatedServiceIdIconText = this.associatedServiceIdValid ? 'text-success' : 'text-danger';
  }

  private updateOkEnabled(): void {
    const lastOkButtonEnabled = this.okButtonEnabled;
    this.okButtonEnabled = this.audioIdValid && this.mainServiceIdValid && this.associatedServiceIdValid;
    if (lastOkButtonEnabled !== this.okButtonEnabled) {
      this.okButtonEnabledChanged.emit(this.okButtonEnabled);
    }
  }

  private initializeLanguages(): void {
    const languageCode: LanguageCode[] = Object.values(LanguageCode);
    languageCode.forEach(language => {
      const displayNameLanguage = this.getLanguageDisplayName(LANGUAGE_TYPES[language]);
      this.languages.push(displayNameLanguage);
      this.languageMap.set(displayNameLanguage, LANGUAGE_TYPES[language]);
    });
  }

  private getLanguageDisplayName(language: Language): string {
    return language.readable + '(' + language.iso3Code + ')';
  }

  private updateAudioIdExists() {
    let matchedElementaryStream: ElementaryStream;
    if (this.ac3ElementaryStream?.audioId > 0) {
      matchedElementaryStream = this.elementaryStreams?.find(
        elementaryStream => {
          let matched = false;
          if (isAC3Stream(elementaryStream)) {
            const ac3ElementaryStream: AC3ElementaryStream = elementaryStream as AC3ElementaryStream;
            const idValid = this.editMode ? !isElementIdMatch(this.ac3ElementaryStream,
              ac3ElementaryStream) : true;
            matched = idValid && this.ac3ElementaryStream.audioId === ac3ElementaryStream.audioId;
          }
          return matched;
        });
    }
    this.audioIdExists = isDefined(matchedElementaryStream);
    console.log('updateAudioIdExists, this.audioIdExists: ', this.audioIdExists, ', this.editMode: ',
      this.editMode);
  }

  private updateMainServiceIdExists() {
    let matchedElementaryStream: ElementaryStream;
    if (this.ac3ElementaryStream?.mainServiceId > 0) {
      matchedElementaryStream = this.elementaryStreams?.find(
        elementaryStream => {
          let matched = false;
          if (elementaryStream.streamType === ElementaryStreamType.STANDARD_ATSC_52_AC3) {
            const ac3ElementaryStream: AC3ElementaryStream = elementaryStream as AC3ElementaryStream;
            const idValid = this.editMode ? !isElementIdMatch(this.ac3ElementaryStream,
              ac3ElementaryStream) : true;
            matched = idValid && this.ac3ElementaryStream.mainServiceId === ac3ElementaryStream.mainServiceId;
          }
          return matched;
        });
    }
    this.mainServiceIdExists = isDefined(matchedElementaryStream);
  }
}
