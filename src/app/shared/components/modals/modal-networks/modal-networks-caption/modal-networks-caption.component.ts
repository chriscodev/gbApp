// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.

import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {DefaultLanguage, LANGUAGE_TYPES, LanguageCode} from '../../../../../core/models/dtv/common/Language';
import {CAPTION_TYPES, CaptionDescription, CaptionType} from '../../../../../core/models/dtv/schedule/Captions';
import {cloneDeep} from 'lodash';
import {isDefined} from '../../../../../core/models/dtv/utils/Utils';
import {BootstrapFunction} from '../../../../../core/interfaces/interfaces';

declare var $: BootstrapFunction;

@Component({
  selector: 'app-modal-networks-caption',
  templateUrl: './modal-networks-caption.component.html',
  styleUrls: ['./modal-networks-caption.component.scss']
})
export class ModalNetworksCaptionComponent implements OnInit, OnChanges {
  @Input() captionEditMode: boolean;
  @Input() caption: CaptionDescription;
  @Input() source: string;
  @Output() captionChanged: EventEmitter<CaptionDescription> = new EventEmitter();
  public localCaption: CaptionDescription;
  public readonly CAPTION_TYPES = CAPTION_TYPES;
  public readonly captionStandard: CaptionType[] = Object.values(CaptionType);
  public readonly LANGUAGE_TYPES = LANGUAGE_TYPES;
  public readonly languages: LanguageCode[] = Object.values(LanguageCode);
  public isDisabled = true;
  public captionTitle = '';
  public selectedLanguage: string;

  constructor() {
  }

  public ngOnInit(): void {
  }

  public ngOnChanges(changes: SimpleChanges) {
    this.initializeDefaultValues();
    if (isDefined(changes.caption)) {
      this.localCaption = cloneDeep(changes.caption.currentValue);
      if (!this.captionEditMode) {
        this.onReset();
      } else {
        this.isDisabled = true;
        this.localCaption.caption = 'CEA-608';
        this.selectedLanguage = this.localCaption.language.iso3Code;
        if (this.localCaption.digital) {
          this.localCaption.caption = 'CEA-708';
          this.isDisabled = false;
        }
      }
    }
  }

  public onChangeDetection() {
    this.isDisabled = !this.isDisabled;
    if (this.isDisabled) {
      this.onReset();
    }
  }

  public clickAddEditCaption() {
    this.localCaption.digital = this.localCaption.caption === 'CEA-708';
    this.captionChanged.emit(this.localCaption);
    this.closeModalNew();
  }

  public onSelectedLanguage() {
    this.localCaption.language = LANGUAGE_TYPES[this.selectedLanguage];
  }

  public onPressValidate($event: any) {
    const num = ($event.target.value)?.toString();
    const charCode = ($event.which) ? $event.which : $event.keyCode;
    if ($event.key === 0 && num.length === 0) {
      $event.preventDefault();
      return false;
    }
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      $event.preventDefault();
      return false;
    }
    return true;
  }

  public onKeyupValidate() {
    if (this.localCaption.serviceNumber > 63) {
      this.localCaption.serviceNumber = parseInt(String(this.localCaption.serviceNumber)[0]);
    }
    if (this.localCaption.serviceNumber === 0) {
      this.localCaption.serviceNumber = 0;
    }
  }

  public closeModalNew() {
    $('#modalAddServiceCaption').modal('hide');
  }

  private onReset() {
    this.selectedLanguage = new DefaultLanguage().iso3Code;
    this.localCaption.language = new DefaultLanguage();
    this.localCaption.wide = false;
    this.localCaption.easyReader = false;
    this.localCaption.serviceNumber = 0;
    this.localCaption.caption = 'CEA-608';
    this.isDisabled = true;
    this.localCaption.digital = false;
  }

  private initializeDefaultValues() {
    let typeLabel = 'Linked Schedule Caption Setting';
    if (this.source === 'default') {
      typeLabel = 'Default Service Caption Setting';
    }
    this.captionTitle = 'Add ' + typeLabel;
    if (this.captionEditMode) {
      this.captionTitle = 'Edit ' + typeLabel;
    }
  }
}
