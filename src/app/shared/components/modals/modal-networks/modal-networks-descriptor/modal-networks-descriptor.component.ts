// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.

import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {convertDecToHex} from '../../../../helpers/decimalToHexadecimal';
import {checkDescriptorTag, checkDescriptorType} from '../../../../helpers/convertDescriptorName';
import {validateNumberWithDash} from '../../../../helpers/alphaNumericValidator';
import {
  ActionMessage,
  ButtonType,
  ButtonTypes,
  ImageType,
  MultipleTableColumns
} from 'src/app/core/models/ui/dynamicTable';
import {convertBytes} from 'src/app/shared/helpers/appWideFunctions';
import {cloneDeep} from 'lodash';
import {environment} from 'src/environments/environment';
import {
  AbstractExtension,
  AllExtension,
  APP_SERVICE_TYPE,
  AppServiceType,
  ESSENTIAL_TYPES,
  EssentialType,
  EXTENSION_TYPES,
  ExtensionType,
  INET_URL_TYPES,
  InetURLType,
  OTHER_BSID_TYPES,
  OtherBSIDType,
  PAYLOAD_FORMATS,
  PAYLOAD_FRAGMENTATIONS,
  PayloadFormat,
  PayloadFragmentation
} from '../../../../../core/models/dtv/network/Extension';
import {ClientScheduleProvidersModel} from '../../../../../core/models/ClientScheduleProvidersModel';
import {ServerResourceType} from '../../../../../core/models/server/Server';
import {DefaultDescriptor, Descriptor} from '../../../../../core/models/dtv/network/logical/DescriptorElement';
import {isDefined} from '../../../../../core/models/dtv/utils/Utils';
import {NetworkType} from '../../../../../core/models/dtv/network/logical/Network';
import {ModalDynamicTbTranslateComponent} from '../../modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {BootstrapFunction} from '../../../../../core/interfaces/interfaces';

declare var $: BootstrapFunction;

@Component({
  selector: 'app-modal-networks-descriptor',
  templateUrl: './modal-networks-descriptor.component.html',
  styleUrls: ['./modal-networks-descriptor.component.scss']
})
export class ModalNetworksDescriptorComponent implements OnInit, OnChanges {
  @ViewChild(ModalDynamicTbTranslateComponent) descriptorDynamicTable: ModalDynamicTbTranslateComponent;
  @Input() descriptor: Descriptor;
  @Input() descriptors: Descriptor[];
  @Input() descriptorEditMode: boolean;
  @Input() extension: AbstractExtension;
  @Input() extensions: AbstractExtension[];
  @Input() extensionEditMode: boolean;
  @Input() sourceData: string;
  @Output() descriptorChanged: EventEmitter<Descriptor> = new EventEmitter();
  @Output() extensionChanged: EventEmitter<AbstractExtension> = new EventEmitter();
  public localDescriptor: Descriptor = new DefaultDescriptor(0, true);
  public localExtension: AllExtension;
  public descriptorTypes: string[] = [];
  public descriptorIcons: string[] = [];
  public selectedDescriptorType: string;
  public networksDataObject: any = {}; // kindly leave this as is since it contains all kinds of types of networks (atsc-cable, terrestrial, atsc3 and also holding values either from descriptors or extensions across, networks, channels and services)
  public modalDescriptorTitle: string;
  public descriptorExtensionType: string;
  public isHideAddButton: boolean;
  public isHideOkButton: boolean;
  public dataSourceDesc: string;
  public addUpdateButtonLabel = 'Add';
  public checkSymbolInvalid: boolean;
  public isTSIDInvalid: boolean;
  public hexValueUserTag: string;
  public hexValueId: string;
  public hexValuePID: string;
  public readonly INET_URL_TYPES = INET_URL_TYPES;
  public readonly urlTypes: InetURLType[] = Object.values(InetURLType);
  public readonly APP_SERVICE_TYPE = APP_SERVICE_TYPE;
  public readonly appServiceTypes: AppServiceType[] = Object.values(AppServiceType);
  public readonly OTHER_BSID_TYPES = OTHER_BSID_TYPES;
  public readonly otherTypes: OtherBSIDType[] = Object.values(OtherBSIDType);
  public readonly ESSENTIAL_TYPES = ESSENTIAL_TYPES;
  public readonly essentials: EssentialType[] = Object.values(EssentialType);
  public readonly PAYLOAD_FORMATS = PAYLOAD_FORMATS;
  public readonly payloadFormats: PayloadFormat[] = Object.values(PayloadFormat);
  public readonly PAYLOAD_FRAGMENTATIONS = PAYLOAD_FRAGMENTATIONS;
  public readonly payloadFragmentations: PayloadFragmentation[] = Object.values(PayloadFragmentation);
  public isShowEsgModal = false;
  public isSelectedEsg = false;
  public compression: boolean;
  public tableHeaders: MultipleTableColumns[] = [
    {header: 'Name', key: 'name', visible: true},
    {header: 'Size', key: 'size', visible: true},
    {header: 'Last Modified', key: 'modified', visible: true},
  ];
  public buttonList: ButtonTypes[] = [
    {name: ButtonType.VIEW, imgSrc: ImageType.view, disable: true},
  ];
  public resourceData: ServerResourceType[] = [];
  private localDescriptors: Descriptor[] = [];
  private localExtensions: AllExtension[] = [];

  constructor(private scheduleProviderModel: ClientScheduleProvidersModel) {
  }

  public ngOnInit(): void {
    this.dataSourceDesc = cloneDeep(this.sourceData);
    this.localDescriptor = cloneDeep(this.descriptor);
    this.localDescriptors = cloneDeep(this.descriptors);
    this.localExtension = cloneDeep(this.extension) as AllExtension;
    this.localExtensions = cloneDeep(this.extensions) as AllExtension[];
    this.initPanel();
    this.addUpdateButtonLabel = this.descriptorEditMode ? 'Update' : 'Add';
    this.checkSymbolInvalid = false;
    if (this.dataSourceDesc !== 'DescCallFromChannelExt' && this.dataSourceDesc !== 'DescCallFromServiceExt') {
      this.networksDataObject.selectedDescriptorType = checkDescriptorType(this.localDescriptor.tag);
      if (this.localDescriptor && this.localDescriptor.tag !== 170) {
        this.clickPanel(this.networksDataObject.selectedDescriptorType);
      }
    }
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (isDefined(changes.descriptor)) {
      this.localDescriptor = cloneDeep(changes.descriptor.currentValue);
    }
    if (isDefined(changes.descriptors)) {
      this.localDescriptors = cloneDeep(changes.descriptors.currentValue);
    }
    if (isDefined(changes.extension)) {
      this.localExtension = cloneDeep(changes.extension.currentValue);
    }
    if (isDefined(changes.extensions)) {
      this.localExtensions = cloneDeep(changes.extensions.currentValue);
    }
    if (isDefined(changes.descriptorEditMode)) {
      this.descriptorEditMode = changes.descriptorEditMode.currentValue;
    }
    if (isDefined(changes.extensionEditMode)) {
      this.extensionEditMode = changes.extensionEditMode.currentValue;
    }
    this.initPanel();
    this.addUpdateButtonLabel = this.descriptorEditMode ? 'Update' : 'Add';
    this.checkSymbolInvalid = false;
    if (this.dataSourceDesc !== 'DescCallFromChannelExt' && this.dataSourceDesc !== 'DescCallFromServiceExt') {
      this.networksDataObject.selectedDescriptorType = checkDescriptorType(this.localDescriptor.tag);
      if (this.localDescriptor.tag !== 170) {
        this.clickPanel(this.networksDataObject.selectedDescriptorType);
      }
    } else {
      if (this.extensionEditMode) {
        this.clickPanel(EXTENSION_TYPES[this.localExtension.type].displayName);
        this.compression = this.localExtension.compression === 2;
      } else {
        this.compression = false;
        this.localExtension.compression = 1;
      }
    }
  }

  public onButtonClicked(event: { message: string; }) {
    this.isSelectedEsg = false;
    if (this.descriptorDynamicTable.selectedRow !== null) {
      this.isSelectedEsg = true;
      if (event.message === ActionMessage.VIEW) {
        this.viewRecord();
      }
    }
  }

  public clickPanel(dataType: any) {
    this.isHideAddButton = false;
    this.isHideOkButton = true;
    let addEditLabel = 'Add';
    if (this.addUpdateButtonLabel === 'Update') {
      addEditLabel = 'Edit';
    }
    switch (dataType) {
      case 'ATSC Private Information':
        this.modalDescriptorTitle = addEditLabel + ' Private Information Descriptor';
        this.descriptorExtensionType = 'ATSC';
        break;
      case 'User Defined':
        this.modalDescriptorTitle = addEditLabel + ' User Defined Descriptor';
        this.descriptorExtensionType = 'User';
        break;
      case 'Conditional Access Descriptor':
        this.modalDescriptorTitle = addEditLabel + ' Conditional Access Descriptor';
        this.descriptorExtensionType = 'Conditional';
        break;
      case 'Extended Channel Name':
        this.modalDescriptorTitle = addEditLabel + ' Extended Channel Name Descriptor';
        this.descriptorExtensionType = 'Extended';
        break;
      case 'Redistribution Control':
        this.clickAddEditDescriptor();
        break;
      case 'Capabilities':
        this.modalDescriptorTitle = addEditLabel + ' Capabilities';
        this.descriptorExtensionType = 'Capabilities';
        break;
      case 'Broadband Signaling':
        this.modalDescriptorTitle = addEditLabel + ' Inet URL';
        this.descriptorExtensionType = 'Broadband';
        if (this.localExtension.urlType === undefined) {
          this.localExtension.urlType = InetURLType.SIGNALING_SERVER;
        }
        break;
      case 'Other BSID':
        this.modalDescriptorTitle = addEditLabel + ' Other BSIDs';
        this.descriptorExtensionType = 'Other BSID';
        this.checkSymbolInvalid = true;
        this.checkOtherBSID();
        if (this.localExtension.otherType === undefined) {
          this.localExtension.otherType = OtherBSIDType.DUPLICATE;
        }
        if (this.localExtension.essential === undefined) {
          this.localExtension.essential = EssentialType.NOT_INDICATED;
        }
        break;
      case 'DRM System Id':
        this.modalDescriptorTitle = addEditLabel + ' DRM System Id';
        this.descriptorExtensionType = 'DRM System Id';
        break;
      case 'Simulcast TSID':
        this.modalDescriptorTitle = addEditLabel + ' Simulcast TSID';
        this.descriptorExtensionType = 'Simulcast TSID';
        this.isTSIDInvalid = true;
        if (this.localExtension.major && this.localExtension.major > 0) {
          this.localExtension.virtual = this.localExtension.major + '-' + this.localExtension.minor;
        } else {
          this.localExtension.virtual = '';
        }
        break;
      case 'Genre':
        this.modalDescriptorTitle = addEditLabel + ' Genre';
        this.descriptorExtensionType = 'Genre';
        break;
      case 'Broadband Service Icon':
        this.modalDescriptorTitle = addEditLabel + ' Broadband Service Icon URL';
        this.descriptorExtensionType = 'Broadband Service Icon';
        break;
      case 'Broadcast Service Icon':
        this.modalDescriptorTitle = addEditLabel + ' Broadcast Service Icon URL';
        this.descriptorExtensionType = 'Broadcast Service Icon';
        break;
      case 'Base URL':
        this.modalDescriptorTitle = addEditLabel + ' Base URL';
        this.descriptorExtensionType = 'Base URL';
        break;
      case 'Base Pattern':
        this.modalDescriptorTitle = addEditLabel + ' Base Pattern';
        this.descriptorExtensionType = 'Base Pattern';
        if (this.localExtension.appServiceType === undefined) {
          this.localExtension.appServiceType = AppServiceType.BROADCAST;
        }
        break;
      case 'User Defined ATSC3 Message':
        this.modalDescriptorTitle = addEditLabel + ' User Defined ATSC3 Message';
        this.descriptorExtensionType = 'User Defined ATSC3 Message';
        break;
      case 'LCT Codepoint':
        this.checkSymbolInvalid = false;
        this.modalDescriptorTitle = addEditLabel + ' Codepoint';
        this.descriptorExtensionType = 'LCT Codepoint';
        if (this.localExtension.codePoint === undefined) {
          this.localExtension.codePoint = 128;
        }
        if (this.localExtension.format === undefined) {
          this.localExtension.format = PayloadFormat.AUTO;
        }
        if (this.localExtension.fragmentation === undefined) {
          this.localExtension.fragmentation = PayloadFragmentation.ARBITRARY;
        }
        if (this.localExtension.inOrder === undefined) {
          this.localExtension.inOrder = true;
        }
        break;
      case 'LCT CCI':
        this.modalDescriptorTitle = addEditLabel + ' CCI';
        this.descriptorExtensionType = 'LCT CCI';
        break;
      case 'Language':
        this.modalDescriptorTitle = addEditLabel + ' Language';
        this.descriptorExtensionType = 'Language';
        break;
      case 'SGDU Passthrough':
        this.descriptorExtensionType = 'SGDU Passthrough';
        this.clickAddEditDescriptor();
        break;
      case 'Video Stream Properties':
        this.descriptorExtensionType = 'Video Stream Properties';
        this.clickAddEditDescriptor();
        break;
      case 'Audio Stream Properties':
        this.descriptorExtensionType = 'Audio Stream Properties';
        this.clickAddEditDescriptor();
        break;
      case 'Caption Asset':
        this.descriptorExtensionType = 'Caption Asset';
        this.clickAddEditDescriptor();
        break;
      case 'Low Delay':
        this.descriptorExtensionType = 'Low Delay';
        this.clickAddEditDescriptor();
        break;
      default: {
        this.initPanel();
        break;
      }
    }
  }

  public clickAddEditDescriptor() {
    if (this.dataSourceDesc === 'DescCallFromNetwork' || this.dataSourceDesc === 'DescCallFromChannel' || this.dataSourceDesc === 'DescCallFromService') {
      this.localDescriptor.descName = this.networksDataObject.selectedDescriptorType;
      this.localDescriptor.tag = parseInt(checkDescriptorTag(this.networksDataObject.selectedDescriptorType));
      this.descriptorChanged.emit(this.localDescriptor);
      this.closeModalNew();
    } else if (this.dataSourceDesc === 'DescCallFromChannelExt' || this.dataSourceDesc === 'DescCallFromServiceExt') {
      if (this.descriptorExtensionType === 'Capabilities') {
        this.localExtension.type = ExtensionType.CAPABILITIES;
        this.localExtension.unique = true;
      } else if (this.descriptorExtensionType === 'Broadband') {
        this.localExtension.type = ExtensionType.INET_URL;
        this.localExtension.unique = false;
      } else if (this.descriptorExtensionType === 'DRM System Id') {
        this.localExtension.type = ExtensionType.DRM_SYSTEM_ID;
        this.localExtension.unique = true;
      } else if (this.descriptorExtensionType === 'Simulcast TSID') {
        this.localExtension.type = ExtensionType.SIMULCAST_TSID;
        this.localExtension.unique = true;
        if (this.localExtension.virtual?.toString()?.includes('-')) {
          const num = this.localExtension.virtual?.split('-');
          this.localExtension.major = parseInt(num[0]);
          this.localExtension.minor = parseInt(num[1]);
        } else {
          this.localExtension.virtual = '';
          this.localExtension.major = 0;
          this.localExtension.minor = 0;
        }
      } else if (this.descriptorExtensionType === 'Other BSID') {
        this.localExtension.type = ExtensionType.OTHER_BSID;
        this.localExtension.unique = false;
      } else if (this.descriptorExtensionType === 'Genre') {
        this.localExtension.type = ExtensionType.GENRE;
        this.localExtension.unique = true;
      } else if (this.descriptorExtensionType === 'Broadband Service Icon') {
        this.localExtension.type = ExtensionType.BROADBAND_SERVICE_ICON;
        this.localExtension.unique = false;
      } else if (this.descriptorExtensionType === 'Broadcast Service Icon') {
        this.localExtension.type = ExtensionType.BROADCAST_SERVICE_ICON;
        this.localExtension.unique = false;
      } else if (this.descriptorExtensionType === 'Base URL') {
        this.localExtension.type = ExtensionType.BASE_URL;
        this.localExtension.unique = true;
      } else if (this.descriptorExtensionType === 'Base Pattern') {
        this.localExtension.type = ExtensionType.BASE_PATTERN;
        this.localExtension.unique = false;
      } else if (this.descriptorExtensionType === 'User Defined ATSC3 Message') {
        this.localExtension.type = ExtensionType.USER_DEFINED_ATSC3_MESSAGE;
        this.localExtension.unique = false;
        if (this.compression) {
          this.localExtension.compression = 2;
        } else {
          this.localExtension.compression = 1;
        }
      } else if (this.descriptorExtensionType === 'LCT Codepoint') {
        this.localExtension.type = ExtensionType.CP;
        this.localExtension.unique = true;
      } else if (this.descriptorExtensionType === 'Language') {
        this.localExtension.type = ExtensionType.LANGUAGE;
        this.localExtension.unique = true;
      } else if (this.descriptorExtensionType === 'SGDU Passthrough') {
        this.localExtension.type = ExtensionType.SGDU_PASSTHROUGH;
        this.localExtension.unique = true;
      } else if (this.descriptorExtensionType === 'Video Stream Properties') {
        this.localExtension.type = ExtensionType.VIDEO_STREAM_PROPERTIES;
        this.localExtension.unique = false;
      } else if (this.descriptorExtensionType === 'Audio Stream Properties') {
        this.localExtension.type = ExtensionType.AUDIO_STREAM_PROPERTIES;
        this.localExtension.unique = false;
      } else if (this.descriptorExtensionType === 'Caption Asset') {
        this.localExtension.type = ExtensionType.CAPTION_ASSET;
        this.localExtension.unique = false;
      } else if (this.descriptorExtensionType === 'Low Delay') {
        this.localExtension.type = ExtensionType.LOW_DELAY;
        this.localExtension.unique = false;
      }
      this.localExtension.descName = this.networksDataObject.selectedDescriptorType;
      this.extensionChanged.emit(this.localExtension);
      this.closeModalNew();
    }
  }

  public allowExtended() {
    this.checkSymbolInvalid = this.localDescriptor.longChannelName === '';
  }

  public allowAnyInput($event: any) {
    const capabilityVal = ($event.target.value)?.toString();
    this.checkSymbolInvalid = capabilityVal.length === 0;
  }

  public allowURL($event: any) {
    const urlVal = ($event.target.value)?.toString().toLowerCase();
    this.checkSymbolInvalid = !this.validateUrl(urlVal) || urlVal === '';
    if (urlVal === 'https://') {
      this.checkSymbolInvalid = false;
    }
  }

  public checkOtherBSID() {
    if (this.localExtension.otherBsids === '') {
      this.checkSymbolInvalid = true;
    } else {
      this.checkSymbolInvalid = false;
    }
  }

  public linkIcon() {
    this.scheduleProviderModel.resourceDirectoryListing$.subscribe((resourceDirectoryListing: ServerResourceType) => {
      if (resourceDirectoryListing !== undefined) {
        this.resourceData = cloneDeep(resourceDirectoryListing);
        this.processColumnValues();
      }
    });
    this.isShowEsgModal = true;
  }

  public selectEsgPreview() {
    const downloadRelativePath = this.descriptorDynamicTable.selectedRow.downloadRelativePath;
    this.localExtension.url = downloadRelativePath.substring(downloadRelativePath.lastIndexOf('/') + 1);
    this.cancelEsgPreviewModal();
    this.allowEsgIcon();
  }

  public cancelEsgPreviewModal() {
    this.isShowEsgModal = false;
    this.isSelectedEsg = false;
  }

  public checkBackspace($event: any) {
    const charCode = ($event.which) ? $event.which : $event.keyCode;
    if (charCode === 8) {
      const inputKey = $event.target.value;
      const inputKeyLen = inputKey?.length;
      if (inputKey?.toString()?.includes('-') && inputKey[inputKeyLen - 2] !== '-') {
        this.checkSymbolInvalid = inputKey[inputKeyLen - 1] === '-';
      } else {
        this.checkSymbolInvalid = true;
      }
    }
  }

  public checkNumberWithDash($event: any) {
    this.checkSymbolInvalid = false;
    const validateResult = validateNumberWithDash($event, NetworkType.ATSC_3);
    const inputKey = $event.target.value + $event.key;
    const limit = 999;
    if (!validateResult && inputKey < limit) {
      this.checkSymbolInvalid = true;
    } else {
      if (!validateResult && $event.key === '0') {
        this.checkSymbolInvalid = this.localExtension.virtual.split('-')[1]?.length <= 0;
      } else {
        this.checkSymbolInvalid = !(inputKey?.toString()?.includes('-') && $event.key !== '-');
      }
    }
    if (!this.checkSymbolInvalid) {
      if (inputKey?.toString()?.includes('-')) {
      }
    }
    return validateResult;
  }

  public validateVirtualChannel() {
    let major: string;
    let minor: string;
    let num: string[];
    const majorLimit = 999;
    if (this.localExtension.virtual?.toString()?.includes('-')) {
      num = this.localExtension.virtual?.split('-');
      major = num[0];
      minor = num[1];
    }
    if (parseInt(minor) === 0 || parseInt(major) > majorLimit || parseInt(minor) > 999 || !major) {
      this.checkSymbolInvalid = true;
    }
    if (this.localExtension.virtual === '' && this.localExtension.tsid >= 0 && this.localExtension.tsid <= 65535) {
      this.checkSymbolInvalid = false;
    }
  }

  public allowNumberOnly($event: any): boolean {
    const charCode = ($event.which) ? $event.which : $event.keyCode;
    return !(charCode > 31 && (charCode < 48 || charCode > 57));

  }

  public controlMaxLimit(type: string = 'otherBSID') {
    if (type === 'atsc3Message') {
      this.checkSymbolInvalid = false;
      if (this.localExtension.contentType > 65535) {
        this.localExtension.contentType = parseInt(this.localExtension.contentType?.toString().substring(0, 4));
      } else {
        if (!this.localExtension.contentType) {
          this.checkSymbolInvalid = true;
        }
      }
    } else if (type === 'codePoint') {
      this.checkSymbolInvalid = false;
      if (this.localExtension.codePoint > 255) {
        this.localExtension.codePoint = parseInt(this.localExtension.codePoint?.toString().substring(0, 2));
      }
      if (this.localExtension.codePoint < 128) {
        this.checkSymbolInvalid = true;
      }
    } else if (type === 'tsid') {
      this.isTSIDInvalid = false;
      this.checkSymbolInvalid = false;
      if (this.localExtension.tsid > 65535) {
        this.localExtension.tsid = parseInt(this.localExtension.tsid?.toString().substring(0, 4));
      } else {
        if (!this.localExtension.tsid) {
          this.checkSymbolInvalid = true;
          this.isTSIDInvalid = true;
        }
      }
      if (this.localExtension.virtual?.toString()?.includes('-')) {
        const num = this.localExtension.virtual?.split('-');
        const major = parseInt(num[0]);
        const minor = parseInt(num[1]);
        if (!(major > 0 && minor > 0)) {
          this.checkSymbolInvalid = true;
        }
      } else {
        if (this.localExtension.virtual?.toString() !== '') {
          this.checkSymbolInvalid = true;
        }
      }
    }
  }

  public convertToHex($event: any, fields: string, max: number) {
    let result: string;
    let num = ($event.target.value);
    let hexVal = '';
    if (parseInt(num?.toString()) >= max) {
      num = num.substring(0, max?.toString().length - 1);
      if (fields === 'usertag') {
        this.localDescriptor.userTag = num;
      }
      if (fields === 'id') {
        this.localDescriptor.systemId = num;
      }
      if (fields === 'pid') {
        this.localDescriptor.pid = num;
      }
    }
    result = convertDecToHex(num);
    if (num !== '') {
      if (fields === 'usertag') {
        this.hexValueUserTag = '0x' + result.toUpperCase();
      }
      if (fields === 'id') {
        this.hexValueId = '0x' + result.toUpperCase();
      }
      if (fields === 'pid') {
        this.hexValuePID = '0x' + result.toUpperCase();
      }
    } else {
      if (fields === 'usertag') {
        this.hexValueUserTag = '';
      }
      if (fields === 'id') {
        this.hexValueId = '';
      }
      if (fields === 'pid') {
        this.hexValuePID = '';
      }
    }
    if (this.networksDataObject.descriptor !== undefined) {
      hexVal = this.networksDataObject.descriptor?.toString();
    }
    this.checkSymbolInvalid = num.length === 0 || hexVal.length % 2 !== 0;
  }

  public validateHexBytes($event: any, type: string = 'userDefined') {
    const keyCode = $event.keyCode;
    const excludedKeys = [8, 37, 39, 46];
    const num = ($event.target.value)?.toString();
    if (!((keyCode >= 48 && keyCode <= 57) ||
      (keyCode >= 65 && keyCode <= 70) ||
      (keyCode >= 96 && keyCode <= 105) ||
      (excludedKeys.includes(keyCode)))) {
      $event.preventDefault();
    } else {
      if (type === 'userDefined') {
        this.checkSymbolInvalid = (num.length % 2) === 0;
      } else {
        this.disableSpecialChar($event);
      }
    }
  }

  public validateInputs($event: any, max: number) {
    const keyCode = $event.keyCode;
    const excludedKeys = [8, 37, 39, 46];
    const num = ($event.target.value);
    if (keyCode !== 8) {
      if (!((keyCode >= 48 && keyCode <= 57) ||
        (excludedKeys.includes(keyCode)))) {
        $event.preventDefault();
      } else {
        if (num?.toString() !== '' && parseInt(num?.toString()) > max) {
          $event.preventDefault();
        } else {
          this.checkSymbolInvalid = false;
        }
      }
    }
  }

  public closeModalNew() {
    $('#modalAddDescriptors').modal('hide');
  }

  private processColumnValues() {
    let idCtr = 0;
    this.resourceData?.forEach((elem: any) => {
      const milliseconds = elem.lastModified;
      const dateObject = new Date(milliseconds);
      elem.modified = dateObject?.toLocaleString();
      elem.size = convertBytes(parseInt(elem.length));
      elem.id = idCtr;
      idCtr++;
    });
  }

  private initPanel() {
    this.modalDescriptorTitle = 'Select Descriptor Type';
    if (this.dataSourceDesc === 'DescCallFromNetwork' || this.dataSourceDesc === 'DescCallFromChannel') {
      this.networksDataObject.selectedDescriptorType = 'ATSC Private Information';
      this.descriptorTypes = ['ATSC Private Information', 'User Defined', 'Conditional Access Descriptor'];
      this.descriptorIcons = ['&#x1F6C8; ATSC Private Information', '&#x1F4CB; User Defined', '&#x1F511; Conditional Access Descriptor'];
    } else if (this.dataSourceDesc === 'DescCallFromService') {
      this.networksDataObject.selectedDescriptorType = 'Extended Channel Name';
      this.descriptorTypes = ['Extended Channel Name', 'ATSC Private Information', 'User Defined', 'Redistribution Control'];
      this.descriptorIcons = ['&#x1F5CF; Extended Channel Name', '&#x1F6C8; ATSC Private Information', '&#x1F4CB; User Defined', '&#xA9; Redistribution Control'];
      this.localDescriptors.forEach(desc => {
        if (desc.tag === 160) {
          this.descriptorTypes.splice(0, 1);
          this.descriptorIcons.splice(0, 1);
          this.networksDataObject.selectedDescriptorType = 'ATSC Private Information';
        }
        if (desc.tag === 170) {
          this.descriptorTypes.splice(-1);
          this.descriptorIcons.splice(-1);
        }
      });
    } else if (this.dataSourceDesc === 'DescCallFromChannelExt') {
      this.modalDescriptorTitle = 'Select Extension Type';
      const capabilityChecker: AllExtension = this.localExtensions.find(
        (obj: any) => obj.type === ExtensionType.CAPABILITIES);
      this.networksDataObject.selectedDescriptorType = 'Capabilities';
      if (capabilityChecker !== undefined) {
        this.networksDataObject.selectedDescriptorType = 'Broadband Signaling';
      }
      if (capabilityChecker !== undefined) {
        this.descriptorTypes = ['Broadband Signaling'];
        this.descriptorIcons = ['&#x1F4F6; Broadband Signaling'];
      } else {
        this.descriptorTypes = ['Capabilities', 'Broadband Signaling'];
        this.descriptorIcons = ['&#x1F517; Capabilities', '&#x1F4F6; Broadband Signaling'];
      }
    } else if (this.dataSourceDesc === 'DescCallFromServiceExt') {
      this.modalDescriptorTitle = 'Select Extension Type';
      this.descriptorTypes = [];
      const capabilityChecker = this.localExtensions.find((obj: any) => obj.type === ExtensionType.CAPABILITIES);
      const drmChecker = this.localExtensions.find((obj: any) => obj.type === ExtensionType.DRM_SYSTEM_ID);
      const simulcastChecker = this.localExtensions.find((obj: any) => obj.type === ExtensionType.SIMULCAST_TSID);
      const genreChecker = this.localExtensions.find((obj: any) => obj.type === ExtensionType.GENRE);
      const urlChecker = this.localExtensions.find((obj: any) => obj.type === ExtensionType.BASE_URL);
      const cpChecker = this.localExtensions.find((obj: any) => obj.type === ExtensionType.CP);
      const languageChecker = this.localExtensions.find((obj: any) => obj.type === ExtensionType.LANGUAGE);
      const sgduChecker = this.localExtensions.find((obj: any) => obj.type === ExtensionType.SGDU_PASSTHROUGH);
      const oneInstanceIndexArr = [];
      this.networksDataObject.selectedDescriptorType = 'Capabilities';
      const extensions: ExtensionType[] = Object.values(ExtensionType);
      extensions.forEach(extension => {
        if (
          extension !== ExtensionType.BONDED_BSIDS &&
          extension !== ExtensionType.SERVICE_ID &&
          extension !== ExtensionType.UNKNOWN &&
          extension !== ExtensionType.CCI) {
          this.descriptorTypes.push(EXTENSION_TYPES[extension].displayName);
        }
      });
      this.descriptorIcons = ['&#x1F517; Capabilities', '&#x1f512; DRM System Id', '&#x1F4F6; Broadband Signaling', '&#x1F4E1; Simulcast TSID', '&#x25D4; Other BSID', '&#127925; Genre', '&#x1F4F6; Broadband Service Icon', '&#x1F4FB; Broadcast Service Icon', '&#129095; Base URL', '&#x28FF; Base Pattern', '&#128211; User Defined ATSC3 Message', '&#128204; LCT Codepoint', '&#x1F4AC; Language', '&#8694; SGDU Passthrough', '&#9654; Video Stream Properties', '&#128264; Audio Stream Properties', '&#13252; Caption Asset', '&#128337; Low Delay'];
      this.descriptorTypes?.forEach((element, index) => {
        if ((element === 'Capabilities' && capabilityChecker !== undefined) ||
          (element === 'DRM System Id' && drmChecker !== undefined) ||
          (element === 'Simulcast TSID' && simulcastChecker !== undefined) ||
          (element === 'Genre' && genreChecker !== undefined) ||
          (element === 'Base URL' && urlChecker !== undefined) ||
          (element === 'LCT Codepoint' && cpChecker !== undefined) ||
          (element === 'Language' && languageChecker !== undefined) ||
          (element === 'SGDU Passthrough' && sgduChecker !== undefined)) {
          oneInstanceIndexArr?.push(index);
        }
      });
      for (let i = oneInstanceIndexArr.length - 1; i >= 0; i--) {
        this.descriptorTypes?.splice(oneInstanceIndexArr[i], 1);
        this.descriptorIcons?.splice(oneInstanceIndexArr[i], 1);
      }
      if (capabilityChecker !== undefined) {
        this.networksDataObject.selectedDescriptorType = 'DRM System Id';
        if (drmChecker !== undefined) {
          this.networksDataObject.selectedDescriptorType = 'Broadband Signaling';
        }
      }
    }
    this.addUpdateButtonLabel = 'Add';
    this.descriptorExtensionType = 'default';
    this.isHideAddButton = true;
    this.isHideOkButton = false;
    this.checkSymbolInvalid = true;
    this.hexValueUserTag = '';
    this.hexValueId = '';
    this.hexValuePID = '';
  }

  private allowEsgIcon() {
    this.checkSymbolInvalid = this.localExtension.url?.toString() === '';
  }

  private viewRecord() {
    const downloadRelativePath = this.descriptorDynamicTable.selectedRow.downloadRelativePath;
    const url = environment.ZIP_EXPORT_URL + downloadRelativePath;
    window.open(url, '_blank');
  }

  private validateUrl(value: string) {
    let valid = true;
    try {
      if (value) {
        const validUrl = new URL(value);
        if (validUrl.host === '' && validUrl.origin === 'null') {
          valid = false;
        }
      }
    } catch {
      valid = false;
    }
    return valid;
  }

  private disableSpecialChar($event: any) {
    let charCode: any;
    document ? charCode = $event.keyCode : charCode = $event.which;
    return ((charCode > 64 && charCode < 91) || (charCode > 96 && charCode < 123) || charCode === 8 || charCode === 32 || (charCode >= 48 && charCode <= 57));
  }
}
