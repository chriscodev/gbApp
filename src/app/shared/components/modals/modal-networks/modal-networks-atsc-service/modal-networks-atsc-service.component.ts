// Copyright (c) 2023-2025 Triveni Digital, Inc. All rights reserved.

import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {ActionMessage, ButtonType, ImageType} from '../../../../../core/models/ui/dynamicTable';
import {DefaultDescriptor, Descriptor} from '../../../../../core/models/dtv/network/logical/DescriptorElement';
import {parseHtmlEntities} from '../../../../helpers/convertDescriptorName';
import {validateEndDash, validateNumberWithDash} from '../../../../helpers/alphaNumericValidator';
import {deleteSelectedRows} from '../../../../helpers/appWideFunctions';
import {cloneDeep} from 'lodash';
import {ClientLicenseModel} from '../../../../../core/models/ClientLicenseModel';
import {ServerLicenseInfo} from '../../../../../core/models/server/License';
import {ModalDynamicTbTranslateComponent} from '../../modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {
  AbstractATSCService,
  AbstractService,
  ATSC3_SERVICE_CATEGORIES,
  ATSC3Service,
  ATSC3ServiceCategory,
  ATSC_SERVICE_TYPES,
  ATSCCableService,
  ATSCServiceType,
  BROADBAND_ACCESSES,
  BroadbandAccess,
  DefaultPhysicalLink,
  DefaultRecoveryLink,
  DefaultSchedule,
  getATSCServiceVirtualNumber,
  HideInGuide,
  isATSCService,
  isServiceCategoryMajorMinorRequired,
  SERVICE_PROTECTIONS,
  ServiceProtection,
  ServiceScheduleLink,
  ServiceStatus,
  ServiceType
} from '../../../../../core/models/dtv/network/logical/Service';
import {AbstractNetwork, NetworkTransportLinking} from '../../../../../core/models/dtv/network/logical/Network';
import {isDefined} from '../../../../../core/models/dtv/utils/Utils';
import {ScheduleSummary} from '../../../../../core/models/dtv/schedule/ScheduleProvider';
import {ClientScheduleProvidersModel} from '../../../../../core/models/ClientScheduleProvidersModel';
import {CaptionDescription, DefaultCaption} from '../../../../../core/models/dtv/schedule/Captions';
import {DefaultLanguage} from '../../../../../core/models/dtv/common/Language';
import {ModalViewScheduleComponent} from '../../modal-view-schedule/modal-view-schedule.component';
import {AbstractExtension, DefaultExtension, ExtensionType} from '../../../../../core/models/dtv/network/Extension';
import {AbstractATSCChannel} from '../../../../../core/models/dtv/network/logical/Channel';
import {
  AbstractTransport,
  ATSC3TranslatedTransport,
  ATSC3Transport,
  TransportType
} from '../../../../../core/models/dtv/network/physical/Transport';
import {Program} from '../../../../../core/models/dtv/network/physical/stream/mpeg/Program';
import {ATSC3Stream, IPStream} from '../../../../../core/models/dtv/network/physical/stream/ip/IPStream';
import {VP1Embedder} from '../../../../../core/models/dtv/network/physical/stream/ip/service-group/ServiceGroup';
import {ModalNetworksAtscChannelComponent} from '../modal-networks-atsc-channel/modal-networks-atsc-channel.component';
import {ClientMediaStreamsModel} from '../../../../../core/models/ClientMediaStreamsModel';
import {Schedule} from '../../../../../core/models/dtv/schedule/Schedule';
import {isElementIdMatch, updateElementList} from '../../../../../core/models/AbstractElement';
import {BootstrapFunction} from '../../../../../core/interfaces/interfaces';
import {ClientNetworksModel} from '../../../../../core/models/ClientNetworksModel';
import {DtvNetworkComponent} from '../../../../../pages/main/dtv-services/dtv-network/dtv-network.component';
import {ScheduleProviderService} from '../../../../../core/services/schedule-provider.service';
import {
  getLinkedIPStream,
  getLinkedOriginalService,
  getLinkedProgram,
  getLinkedRecovery,
  getServiceScheduleLinks
} from '../../../../helpers/serviceUtil';


declare var $: BootstrapFunction;

@Component({
  selector: 'app-modal-networks-atsc-service',
  templateUrl: './modal-networks-atsc-service.component.html',
  styleUrls: ['./modal-networks-atsc-service.component.scss']
})
export class ModalNetworksAtscServiceComponent implements OnInit, OnChanges {
  @ViewChild(ModalDynamicTbTranslateComponent) serviceDynamicTable: ModalDynamicTbTranslateComponent;
  @ViewChildren(
    ModalDynamicTbTranslateComponent) dynamicCaptionTableComponent: QueryList<ModalDynamicTbTranslateComponent>;
  @ViewChild(ModalViewScheduleComponent) viewSchedulerComponent: ModalViewScheduleComponent;
  @ViewChild('scheduleTable') scheduleTable: ModalDynamicTbTranslateComponent;
  @Input() channel: AbstractATSCChannel;
  @Input() service: AbstractService;
  @Input() services: AbstractService[];
  @Input() serviceEditMode: boolean;
  @Input() networkStream: AbstractNetwork;
  @Input() isMajorReplaceable: boolean;
  @Input() activeTabs: number;
  @Input() selectedTransport: AbstractTransport;
  @Output() serviceChanged: EventEmitter<AbstractService> = new EventEmitter();
  @Output() serviceLinkChanged: EventEmitter<{ linkId: string, action: string }> = new EventEmitter();
  public readonly modalDescriptorName = '#modalAddDescriptors';
  public readonly modalCaptionName = '#modalAddServiceCaption';
  public readonly ServiceType = ServiceType;
  public localService: AbstractATSCService;
  public localATSC3Service: ATSC3Service;
  public localCableService: ATSCCableService;
  public localServiceVirtualChannel: string; // Shadows localService major-minor for view
  public localATSCServiceDescriptors: Descriptor[];
  public localATSCServiceExtensions: AbstractExtension[];
  public clonedDescriptorExtension: any;
  public clonedSchedule: any;
  public clonedDefault: any;
  public clonedLinked: any;
  public currentDescriptor: Descriptor = new DefaultDescriptor(0, true);
  public currentExtension: AbstractExtension = new DefaultExtension(ExtensionType.UNKNOWN, true);
  public currentSchedule: ServiceScheduleLink = new DefaultSchedule(0, 0, 0);
  public currentDefault: CaptionDescription = new DefaultCaption();
  public currentLinked: CaptionDescription = new DefaultCaption();
  public descriptorEditMode: boolean;
  public extensionEditMode: boolean;
  public defaultEditMode: boolean;
  public linkedEditMode: boolean;
  public hideInGuide: boolean;
  public active = true;
  public hideGuide = true;
  public captionType = 'default';
  public readonly SERVICE_TYPES = ATSC_SERVICE_TYPES;
  public readonly serviceTypes: ATSCServiceType[] = Object.values(ATSCServiceType);
  public readonly ATSC3_SERVICE_CATEGORIES = ATSC3_SERVICE_CATEGORIES;
  public readonly atsc3ServiceCategories: ATSC3ServiceCategory[] = Object.values(ATSC3ServiceCategory);
  public readonly BROADBAND_ACCESS_TYPES = BROADBAND_ACCESSES;
  public readonly broadbandAccessTypes: BroadbandAccess[] = Object.values(BroadbandAccess);
  public readonly PROTECTION_TYPES = SERVICE_PROTECTIONS;
  public readonly protectionTypes: ServiceProtection[] = Object.values(ServiceProtection);
  public isHiddenSched = false;
  public isHiddenDesc = true;
  public isHiddenCaption = true;
  public validServiceVirtualNumber = true;
  public modalTitle = 'Add Service';
  public modalScheduleName = '#modalSchedSources';
  public tableHeadersSchedule = [
    {header: 'Name', key: 'scheduleName', visible: true},
    {header: 'Provider', key: 'scheduleProviderName', visible: true},
    {header: 'Source Type', key: 'scheduleProviderType', visible: true}
  ];
  public tableHeadersCaption = [
    {header: 'Type', key: 'type_display', visible: true},
    {header: 'Language', key: 'language_display', visible: true},
    {header: 'Easy Reader', key: 'easyReader_display', visible: true},
    {header: 'Wide', key: 'wide_display', visible: true},
    {header: 'Service Number', key: 'serviceNumber', visible: true},
  ];
  public tableHeadersDescriptor = [
    {header: 'Descriptors', key: 'descName', visible: true}
  ];
  public buttonList = [
    {name: ButtonType.ADD, imgSrc: ImageType.add, supportsMultiSelect: true, alwaysEnabled: true},
    {name: ButtonType.EDIT, imgSrc: ImageType.edit, disable: true},
    {name: ButtonType.DELETE, imgSrc: ImageType.delete, supportsMultiSelect: true, disable: true}
  ];
  public buttonListSchedule = [
    {name: ButtonType.ADD, imgSrc: ImageType.add, supportsMultiSelect: true, alwaysEnabled: true},
    {name: ButtonType.VIEW, imgSrc: ImageType.view, disable: true},
    {name: ButtonType.DELETE, imgSrc: ImageType.delete, supportsMultiSelect: true, disable: true}
  ];
  public buttonListDefault = [
    {name: ButtonType.ADD, imgSrc: ImageType.add, supportsMultiSelect: true, alwaysEnabled: true},
    {name: ButtonType.EDIT, imgSrc: ImageType.edit, disable: true},
    {name: ButtonType.DELETE, imgSrc: ImageType.delete, supportsMultiSelect: true}
  ];
  public buttonListLinked = [
    {name: ButtonType.ADD, imgSrc: ImageType.add, supportsMultiSelect: true, alwaysEnabled: true},
    {name: ButtonType.EDIT, imgSrc: ImageType.edit, disable: true},
    {name: ButtonType.DELETE, imgSrc: ImageType.delete, supportsMultiSelect: true}
  ];
  public selectedSchedule: Schedule;
  public openModalViewSchedule = false;
  public linkProgramData: Program[];
  public linkProgramIPData: IPStream[];
  public linkRecoveryData: VP1Embedder[];
  public isFromService = false;
  public programModalName: string;
  public globalServiceIdPlaceholder: string;
  public headerTabs = [
    {tabName: 'Schedule Sources', activeId: 1},
    {tabName: 'Service Caption Settings', activeId: 2},
    {tabName: 'Service Descriptors', activeId: 3},
  ];
  public activeId = 1;
  public channelNumberRequired: boolean;
  public nameIconText: string;
  public channelNumberIconText: string;
  public okEnabled: boolean;
  private nameValid: boolean;
  private channelNumberValid: boolean;
  private localServices: AbstractService[];
  private localATSCServiceSchedules: ServiceScheduleLink[];
  private localATSCServiceDefault: CaptionDescription[];
  private localATSCServiceLinked: CaptionDescription[];
  protected selectedIPStream: ATSC3Stream = null;
  protected selectedRecoveryStream: VP1Embedder = null;
  protected selectedProgram: Program = null;
  protected unUsedIPStreamIds: (string)[] = [];
  protected unUsedProgramIds: (string)[] = [];
  protected originalService: AbstractService = null;

  constructor(private clientNetworksModel: ClientNetworksModel,
              private clientMediaStreamsModel: ClientMediaStreamsModel,
              private clientLicenseModel: ClientLicenseModel,
              private scheduleProviderModel: ClientScheduleProvidersModel,
              private scheduleProviderService: ScheduleProviderService,
              private channelComponent: ModalNetworksAtscChannelComponent,
              private networkTransportLinking: NetworkTransportLinking,
              @Inject(DtvNetworkComponent) private dtvNetworkComponent: DtvNetworkComponent,
              private cdr: ChangeDetectorRef) {
  }

  public ngOnInit(): void {
    this.initializeTabs();
    this.initializeDynamicTabs();
    this.localService = cloneDeep(this.service);
    if (this.localService.serviceType === ServiceType.ATSC_3) {
      this.localATSC3Service = this.localService as ATSC3Service;
      this.active = this.localATSC3Service.serviceStatus === ServiceStatus.ACTIVE;
    }
    if (this.localService.serviceType !== ServiceType.ATSC_3) {
      this.localCableService = this.localService as ATSCCableService;
      this.hideGuide = this.localCableService.hideGuide;
    }
    this.localServices = cloneDeep(this.services);
    this.localATSCServiceDescriptors = cloneDeep(this.localService.descriptorElements);
    this.localATSCServiceExtensions = cloneDeep(this.localService.extensions);
    this.localATSCServiceSchedules = cloneDeep(this.localService.scheduleLinks);
    this.localATSCServiceDefault = cloneDeep(this.localService.captionDescriptions);
    this.localATSCServiceLinked = cloneDeep(this.localService.linkedCaptionDescriptions);
    this.loadServerSchedule();
    this.assignServiceData();
    this.assignDescriptors_Extensions();
    this.clonedDefault = cloneDeep(this.assignCaptionSettings(this.localATSCServiceDefault));
    this.clonedLinked = cloneDeep(this.assignCaptionSettings(this.localATSCServiceLinked));
    if (this.localService.name === '') {
      this.localServiceVirtualChannel = '';
      this.localService.atscServiceType = ATSCServiceType.DIGITAL_TV;
      this.validServiceVirtualNumber = false;
    }
    this.updateLocalServiceFields();
    this.inputSettings();
  }

  // TODO rewrite this
  public ngOnChanges(changes: SimpleChanges) {
    localStorage.removeItem('Service-Schedule'); // intentionally added this to reset selection in schedule source list during initialization
    if (isDefined(changes.services)) {
      this.localServices = cloneDeep(changes.services.currentValue);
    }
    if (isDefined(changes.service)) {
      this.localService = cloneDeep(changes.service.currentValue);
      if (this.localService.serviceType !== ServiceType.ATSC_3) {
        this.localCableService = this.localService as ATSCCableService;
        this.hideGuide = this.localCableService.hideGuide;
      }
      if (this.localService.serviceType === ServiceType.ATSC_3) {
        this.localATSC3Service = this.localService as ATSC3Service;
        this.active = this.localATSC3Service.serviceStatus === ServiceStatus.ACTIVE;
      }
      this.localATSCServiceDescriptors = cloneDeep(this.localService.descriptorElements);
      this.localATSCServiceExtensions = cloneDeep(this.localService.extensions);
      this.localATSCServiceSchedules = cloneDeep(this.localService.scheduleLinks);
      this.localATSCServiceDefault = cloneDeep(this.localService.captionDescriptions);
      this.localATSCServiceLinked = cloneDeep(this.localService.linkedCaptionDescriptions);
      this.loadServerSchedule();
      this.assignServiceData();
      this.assignDescriptors_Extensions();
      //  this.getUpdatedProgramData();
      this.getUpdatedRecoveryData();
      this.clonedDefault = cloneDeep(this.assignCaptionSettings(this.localATSCServiceDefault));
      this.clonedLinked = cloneDeep(this.assignCaptionSettings(this.localATSCServiceLinked));

      if (!this.serviceEditMode) {
        this.modalTitle = 'Add Service';
        this.localServiceVirtualChannel = '';
        this.localService.atscServiceType = ATSCServiceType.DIGITAL_TV;
        this.validServiceVirtualNumber = false;
        this.selectedIPStream = null;
        this.selectedProgram = null;
        this.selectedRecoveryStream = null;

        if (this.localService.serviceType === ServiceType.ATSC_3) {
          this.localATSC3Service.serviceCategory = ATSC3ServiceCategory.LINEAR_A_V;
          this.localATSC3Service.broadbandAccess = BroadbandAccess.AUTO;
          this.localATSC3Service.serviceProtection = ServiceProtection.AUTO;
          this.localATSC3Service.hidden = false;
          this.localATSC3Service.hideInGuide = HideInGuide.UNHIDDEN;
          this.localATSC3Service.hideInGuide = HideInGuide.UNHIDDEN;
          this.hideInGuide = false;
        }
      } else {

        this.modalTitle = 'Edit Service - ' + this.localService.name;
        if (this.localService.serviceType !== ServiceType.ATSC_3) {
          this.selectedProgram = null;
          if (isDefined(this.localService.physicalLink)) {
            this.selectedProgram = getLinkedProgram(this.localService, this.selectedTransport);
          }
        } else {
          if (isDefined(this.localService.physicalLink) && this.selectedTransport !== null) {
            if (this.selectedTransport?.transportType === TransportType.ATSC_3) {
              this.selectedIPStream = this.getATSC3Stream();
            } else if (this.selectedTransport?.transportType === TransportType.ATSC_3_TRANSLATED) {
              const translatedTransport = this.selectedTransport as ATSC3TranslatedTransport;
              this.selectedIPStream = this.getATSC3Stream();
              this.originalService = getLinkedOriginalService(this.selectedIPStream, this.channelComponent.channels,
                this.channelComponent.getOriginalTransport(translatedTransport));
              this.updateScheduleForTranslatedTransport('link');
            }
          } else {
            this.selectedIPStream = null;
          }

          if (isDefined(this.localATSC3Service.recoveryLink) && this.selectedTransport !== null) {
            if (this.originalService != null && this.selectedTransport.transportType === TransportType.ATSC_3_TRANSLATED) {
              const translatedTransport = this.selectedTransport as ATSC3TranslatedTransport;
              this.selectedRecoveryStream = getLinkedRecovery(this.originalService,
                this.channelComponent.getOriginalTransport(translatedTransport));
            } else {
              this.selectedRecoveryStream = getLinkedRecovery(this.localService, this.selectedTransport);
            }
          }

          if (this.localService.descriptorElements && this.localService.descriptorElements.length > 0) {
            this.checkRedistributionTag(this.localService.descriptorElements[0].tag);
          }
          if (this.localService.serviceType === ServiceType.ATSC_3) {
            this.hideInGuide = this.localATSC3Service.hideInGuide === HideInGuide.HIDDEN;
          }
        }
      }
      this.isFromService = false;
    }

    if (isDefined(changes.serviceEditMode)) {
      this.serviceEditMode = changes.serviceEditMode.currentValue;
    }
    this.updateLocalServiceFields();
    this.inputSettings();
  }

  public rowClicked($event: { tag: number, type: ExtensionType }) {
    if ($event) {
      if (this.localService.serviceType !== ServiceType.ATSC_3) {
        this.checkRedistributionTag($event.tag);
      } else {
        this.checkUneditableType($event.type);
      }
    }
  }

  public onButtonClickedDescriptor(event: { message: string; }) {
    switch (event.message) {
      case ActionMessage.ADD:
        this.onAddRowDescriptor();
        break;
      case ActionMessage.EDIT:
        this.onEditRowDescriptor();
        break;
      case ActionMessage.DELETE:
        this.onDeleteRowDescriptor();
        break;
    }
  }

  public extensionChangeHandler(updatedExtension: AbstractExtension) {
    this.currentExtension = updatedExtension;
    this.localService.extensions = this.localATSCServiceExtensions = updateElementList(
      this.localATSCServiceExtensions, this.currentExtension, this.extensionEditMode) as AbstractExtension[];
    this.assignDescriptors_Extensions();
  }

  public descriptorChangeHandler(updatedDescriptor: Descriptor) {
    this.currentDescriptor = updatedDescriptor;
    this.localService.descriptorElements = this.localATSCServiceDescriptors = updateElementList(
      this.localATSCServiceDescriptors, this.currentDescriptor, this.descriptorEditMode) as Descriptor[];
    this.assignDescriptors_Extensions();
    if (this.localService.descriptorElements && this.localService.descriptorElements.length > 0) {
      this.checkRedistributionTag(this.localService.descriptorElements[0].tag);
    }
  }

  public onButtonClickedSchedule(event: { message: string; }) {
    switch (event.message) {
      case ActionMessage.ADD:
        this.onAddRowSchedule();
        break;
      case ActionMessage.VIEW:
        this.onViewRowSchedule();
        break;
      case ActionMessage.DELETE:
        this.onDeleteRowSchedule();
        break;
    }
  }

  public rowClickedSchedule($events: ServiceScheduleLink) {
    this.currentSchedule = $events;
    if (this.scheduleTable) {

      if (isDefined(
        this.channelComponent.selectedLinkTransport) && this.channelComponent.selectedLinkTransport.transportType === TransportType.ATSC_3_TRANSLATED) {
        this.scheduleTable.disableButtons([ButtonType.ADD]);
        this.scheduleTable.disableButtons([ButtonType.DELETE]);
        console.log('schedule', this.scheduleTable);
        if (this.scheduleTable && this.scheduleTable.tableData == null) {
          this.scheduleTable.enableButtons([ButtonType.VIEW]);
        }
      } else {
        this.scheduleTable.enableButtons([ButtonType.ADD]);
      }
    }
  }

  public scheduleChangeHandler(updatedSchedule: ServiceScheduleLink) {
    this.currentSchedule = updatedSchedule;
    if (this.localATSCServiceSchedules && this.localATSCServiceSchedules.length > 0) {
      this.currentSchedule.priority = this.localATSCServiceSchedules[this.localATSCServiceSchedules.length - 1].priority + 1;
    } else {
      this.localATSCServiceSchedules = [];
      this.currentSchedule.priority = 100;
    }
    this.localService.scheduleLinks = this.localATSCServiceSchedules = updateElementList(
      this.localATSCServiceSchedules, this.currentSchedule, false) as ServiceScheduleLink[];
    this.loadServerSchedule();
  }

  public updateScheduleForTranslatedTransport(linkValue) {
    const scheduleLinks = getServiceScheduleLinks(this.localService, this.originalService);
    console.log('sch link444', scheduleLinks);
    const schedule = scheduleLinks[0];
    if (isDefined(schedule)) {
      console.log('schedule data', schedule);
      this.currentSchedule = new DefaultSchedule(schedule.scheduleId, schedule.serviceId, schedule.priority);
      this.currentSchedule.id = schedule.id;
    }
    if (linkValue === 'link') {
      this.localService.scheduleLinks = this.localATSCServiceSchedules = updateElementList(
        this.localATSCServiceSchedules, this.currentSchedule, false) as ServiceScheduleLink[];
    } else {
      this.currentSchedule = null;
      this.clonedSchedule = null;
    }
    this.loadServerSchedule();

  }

  public onButtonClickedDefaultCaption(event: { message: string; }) {
    switch (event.message) {
      case ActionMessage.ADD:
        this.onAddRowDefault();
        break;
      case ActionMessage.EDIT:
        this.onEditRowDefault();
        break;
      case ActionMessage.DELETE:
        this.onDeleteRowDefault();
        break;
    }
  }

  public defaultChangeHandler(updatedDefault: CaptionDescription) {
    this.currentDefault = updatedDefault;
    if (!this.localATSCServiceDefault) {
      this.localATSCServiceDefault = [];
    }
    this.localService.captionDescriptions = this.localATSCServiceDefault = updateElementList(
      this.localATSCServiceDefault, this.currentDefault, this.defaultEditMode) as CaptionDescription[];
    this.clonedDefault = cloneDeep(this.assignCaptionSettings(this.localATSCServiceDefault));
  }

  public onButtonClickedLinkedCaption(event: { message: string; }) {
    switch (event.message) {
      case ActionMessage.ADD:
        this.onAddRowLinked();
        break;
      case ActionMessage.EDIT:
        this.onEditRowLinked();
        break;
      case ActionMessage.DELETE:
        this.onDeleteRowLinked();
        break;
    }
  }

  public linkedChangeHandler(updatedLinked: CaptionDescription) {
    this.currentLinked = updatedLinked;
    if (!this.localATSCServiceLinked) {
      this.localATSCServiceLinked = [];
    }
    this.localService.linkedCaptionDescriptions = this.localATSCServiceLinked = updateElementList(
      this.localATSCServiceLinked, this.currentLinked, this.linkedEditMode) as CaptionDescription[];
    this.clonedLinked = cloneDeep(this.assignCaptionSettings(this.localATSCServiceLinked));
  }

  public closeModalNew() {
    this.isFromService = false;
    this.channelComponent.isFromChannel = true;
    $('#modalAddService').modal('hide');
  }

  public updateHideInGuide() {
    this.hideInGuide = false;
    if (this.localService.serviceType === ServiceType.ATSC_3) {
      this.localATSC3Service.hideInGuide = HideInGuide.UNHIDDEN;
    }
  }

  public updateHideInGuideValue() {
    if (this.localService.serviceType === ServiceType.ATSC_3) {
      if (this.hideInGuide) {
        this.localATSC3Service.hideInGuide = HideInGuide.HIDDEN;
      } else {
        this.localATSC3Service.hideInGuide = HideInGuide.UNHIDDEN;
      }
    }
  }

  public validateEntireVirtualChannelValue() {
    if (this.localService.serviceType === ServiceType.ATSC_TERRESTRIAL || this.localService.serviceType === ServiceType.ATSC_3) {
      let major: string;
      let minor: string;
      let num: string[];
      let majorLimit = 99;
      if (this.localService.serviceType === ServiceType.ATSC_3) {
        majorLimit = 999;
      }
      if (this.localServiceVirtualChannel?.toString()?.includes('-')) {
        num = this.localServiceVirtualChannel?.split('-');
        major = num[0];
        minor = num[1];
      }
      if (parseInt(minor) === 0 || parseInt(major) > majorLimit || parseInt(minor) > 999) {
        this.validServiceVirtualNumber = false;
      }
      const serverLicenseInfo: ServerLicenseInfo = this.clientLicenseModel.getServerLicenseInfo();
      if (this.networkTransportLinking.majorPerNetwork.indexOf(
        major) === -1 && this.networkTransportLinking.majorPerNetwork.length >= serverLicenseInfo.serverLicense.maxMajorNumbers) {
        this.validServiceVirtualNumber = this.isMajorReplaceable && this.networkTransportLinking.majorPerNetwork.length === serverLicenseInfo.serverLicense.maxMajorNumbers;
      }
    } else {
      if (this.localServiceVirtualChannel?.toString()?.includes('-')) {
        const num = this.localServiceVirtualChannel?.split('-');
        let major = num[0];
        let minor = num[1];
        if (major === '' || minor === '' || (parseInt(major) === 0 && parseInt(
          minor) === 0)) {
          this.validServiceVirtualNumber = false;
        }
        if (parseInt(major) > 999) {
          major = major?.substring(0, 3);
        }
        if (parseInt(minor) > 999) {
          minor = minor?.substring(0, 3);
        }
        this.localServiceVirtualChannel = major + '-' + minor;
      } else {
        if (this.localServiceVirtualChannel?.length > 0) {
          const virtualChannelNumber: number = parseInt(this.localServiceVirtualChannel);
          if (virtualChannelNumber === 0) {
            this.validServiceVirtualNumber = false;
          }
          if (virtualChannelNumber > 16383) {
            this.localServiceVirtualChannel = this.localServiceVirtualChannel?.substring(0, 4);
          }
        } else {
          this.validServiceVirtualNumber = false;
        }
      }
    }
    this.updateLocalServiceFields();
    this.inputSettings();
  }

  public checkNumberWithDash(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    this.validServiceVirtualNumber = true;
    const validateResult = validateNumberWithDash(event, this.networkStream.networkType);
    const inputKey = input.value + event.key;
    // const virtual = this.localServices?.find((obj: any) => obj.virtual === inputKey);
    const virtual = this.findLocalService(inputKey);
    if (this.localService.serviceType === ServiceType.ATSC_TERRESTRIAL || this.localService.serviceType === ServiceType.ATSC_3) {
      let limit = 99;
      if (this.localService.serviceType === ServiceType.ATSC_3) {
        limit = 999;
      }
      if (!validateResult && parseInt(inputKey) < limit) {
        this.validServiceVirtualNumber = false;
      } else {
        if (!validateResult && event.key === '0') {
          this.validServiceVirtualNumber = this.localServiceVirtualChannel.split('-')[1]?.length > 0;
        } else {
          this.validServiceVirtualNumber = inputKey?.toString()?.includes('-') && event.key !== '-';
        }
      }
      if (this.validServiceVirtualNumber) {
        if (inputKey?.toString()?.includes('-')) {
          inputKey.split('-');
        }
      }
    } else if (this.localService.serviceType === ServiceType.ATSC_CABLE) {
      if (validateResult) {
        if (inputKey?.length > 0) {
          this.validServiceVirtualNumber = !inputKey.toString().endsWith('-');
        } else {
          this.validServiceVirtualNumber = false;
        }
      } else {
        this.validServiceVirtualNumber = false;
      }
    }
    return validateResult;
  }

  public checkBackspace(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const charCode = (event.which) ? event.which : event.keyCode;
    if (this.localService.serviceType === ServiceType.ATSC_TERRESTRIAL || this.localService.serviceType === ServiceType.ATSC_3) {
      if (charCode === 8) {
        const inputKey = input.value;
        const inputKeyLen = inputKey?.length;
        if (inputKey?.toString()?.includes('-') && inputKey[inputKeyLen - 2] !== '-') {
          this.validServiceVirtualNumber = inputKey[inputKeyLen - 1] !== '-';
        } else {
          this.validServiceVirtualNumber = false;
        }
      }
    }
    if (this.localService.serviceType === ServiceType.ATSC_CABLE) {
      if (charCode === 8) {
        const inputKey = input.value;
        const inputKeyString: string = inputKey?.toString();
        const updatedKey = inputKeyString?.length > 0 ? inputKeyString.substring(0,
          inputKeyString.length - 1) : undefined;
        this.validServiceVirtualNumber = updatedKey?.length > 0 && !updatedKey?.endsWith('-');
      }
    }
  }

  public clickAddEditService() {
    this.schedulePriorityUpdate();
    this.updateLocalServiceFields();
    if (this.localService.serviceType === ServiceType.ATSC_3 || this.localService.serviceType === ServiceType.ATSC_TERRESTRIAL) {
      if (isDefined(this.localService.majorNumber)) {
        if (this.networkTransportLinking.majorPerNetwork.indexOf(this.localService.majorNumber.toString()) === -1) {
          this.networkTransportLinking.majorPerNetwork.push(this.localService.majorNumber.toString());
        }
      }
    }
    if (this.localService.serviceType === ServiceType.ATSC_3) {
      this.localATSC3Service.active = this.active;
      this.localATSC3Service.serviceStatus = ServiceStatus.INACTIVE;
      if (this.active) {
        this.localATSC3Service.serviceStatus = ServiceStatus.ACTIVE;
      }
    }
    if (this.localService.serviceType !== ServiceType.ATSC_3) {
      this.localCableService.hideGuide = this.hideGuide;
    }
    if (this.selectedTransport?.transportType === TransportType.ATSC_3_TRANSLATED) {
      this.localATSC3Service.scheduleLinks = null;
      this.localService.scheduleLinks = null;
    }
    this.serviceChanged.emit(this.localService);
    this.closeModalNew();
  }

  public checkDash(val: string) {
    this.localServiceVirtualChannel = validateEndDash(val);
  }

  public unlinkTransportProgram() {
    const programId = this.localService.physicalLink?.physicalId > 0 ? this.localService.physicalLink?.physicalId.toString() : this.localService.physicalLink?.clientPhysicalId;
    this.serviceLinkChanged.emit({linkId: programId, action: 'unlink'});
    this.selectedProgram = null;
    this.localService.physicalLink = undefined;
    this.cdr.detectChanges();
  }

  public unlinkTransportIPStream() {
    const ipStreamId = this.localService.physicalLink?.physicalId > 0 ? this.localService.physicalLink?.physicalId.toString() : this.localService.physicalLink?.clientPhysicalId;
    this.serviceLinkChanged.emit({linkId: ipStreamId, action: 'unlink'});
    this.selectedIPStream = null;
    this.localService.physicalLink = undefined;
    this.cdr.detectChanges();
  }

  public unlinkTransportRecovery() {
    if (this.localService.serviceType === ServiceType.ATSC_3) {
      // const recoveryId = this.localATSC3Service.recoveryLink?.recoveryId?.toString();
      this.selectedRecoveryStream = null;
      this.localATSC3Service.recoveryLink = null;
      this.cdr.detectChanges();
    }
  }

  public linkTransportProgram() {
    this.programModalName = 'ProgCallFromService';
    this.isFromService = true;
    this.linkProgramData = this.channelComponent.unusedPrograms;
    this.unUsedProgramIds = this.channelComponent.unusedProgramIds;
    console.log('Unfiltered unused Program Count link:', this.unUsedProgramIds?.length, 'Unused Program list :',
      this.linkProgramData);
    if (this.unUsedProgramIds?.length > 0) {
      this.linkProgramData = this.linkProgramData?.map(program => {
        const programId = program.id > -1 ? program.id.toString() : program.clientId;
        if (this.unUsedProgramIds.includes(programId)) {
          return program;
        } else {
          return null;
        }
      }).filter(ipStream => ipStream !== null);
    }
  }

  public programLinkChangeHandler(updatedProgramLink: Program) {
    this.localService.physicalLink = new DefaultPhysicalLink();
    if (updatedProgramLink.id !== -1) {
      this.localService.physicalLink.physicalId = updatedProgramLink.id;
      delete this.localService.physicalLink.clientPhysicalId;
      this.unUsedProgramIds = this.unUsedProgramIds.filter(id => id.toString() !== updatedProgramLink.id.toString());
      this.serviceLinkChanged.emit({linkId: updatedProgramLink.id.toString(), action: 'link'});
    } else {
      this.localService.physicalLink.clientPhysicalId = updatedProgramLink.clientId;
      this.unUsedProgramIds = this.unUsedProgramIds.filter(id => id !== updatedProgramLink.clientId);
      this.serviceLinkChanged.emit({linkId: updatedProgramLink.clientId.toString(), action: 'link'});
    }
    this.selectedProgram = updatedProgramLink;
  }

  public linkTransportIPStream() {
    this.programModalName = 'ProgCallFromServiceATSC3';
    this.isFromService = true;
    this.linkProgramIPData = this.channelComponent.unusedIPStreams;
    this.unUsedIPStreamIds = this.channelComponent.unusedIPStreamIds;
    console.log('Unfiltered UnusedStream link Count:', this.unUsedIPStreamIds?.length, 'Unused IpStreams list :',
      this.linkProgramIPData);
    if (this.unUsedIPStreamIds?.length > 0) {
      this.linkProgramIPData = this.linkProgramIPData?.map(ipStream => {
        const ipStreamId = ipStream.id > -1 ? ipStream.id.toString() : ipStream.clientId;
        if (this.unUsedIPStreamIds.includes(ipStreamId)) {
          return ipStream;
        } else {
          return null;
        }
      }).filter(ipStream => ipStream !== null);
    }

    this.linkProgramIPData.forEach((ipItem: ATSC3Stream) => {
      if (ipItem.hasOwnProperty('linkedStreamId')) {
        const mediaStreams = this.clientMediaStreamsModel.getMediaStreams();
        if (ipItem.linkedStreamId > 0) {
          const selectedMediaStream = mediaStreams.filter(x => x.id === ipItem.linkedStreamId)[0];
          ipItem.name = selectedMediaStream.name;
          ipItem.destinationIP = selectedMediaStream.dstAddress;
          // TODO add sourceIP like java app currently it is blank
        }
      }
    });
    console.log('filtered selected used streams data', this.linkProgramIPData);
  }

  public programIPLinkChangeHandler(updatedProgramIPLink: ATSC3Stream) {
    this.localService.physicalLink = new DefaultPhysicalLink();
    if (updatedProgramIPLink.id !== -1) {
      this.localService.physicalLink.physicalId = updatedProgramIPLink.id;
      delete this.localService.physicalLink.clientPhysicalId;
      this.unUsedIPStreamIds = this.unUsedIPStreamIds?.filter(
        id => id.toString() !== updatedProgramIPLink.id.toString());
      this.serviceLinkChanged.emit({linkId: updatedProgramIPLink.id.toString(), action: 'link'});
    } else {
      this.localService.physicalLink.clientPhysicalId = updatedProgramIPLink.clientId;
      this.unUsedIPStreamIds = this.unUsedIPStreamIds?.filter(id => id !== updatedProgramIPLink.clientId);
      this.serviceLinkChanged.emit({linkId: updatedProgramIPLink.clientId, action: 'link'});
    }
    this.selectedIPStream = updatedProgramIPLink;
  }

  public linkTransportRecovery() {
    this.programModalName = 'RecCallFromServiceATSC3';
    this.isFromService = true;
    this.getUpdatedRecoveryData();
    /* this.linkRecoveryData = this.linkRecoveryData.filter(
       x => (this.networkTransportLinking.transportRecoveryPerNetwork.indexOf(
         x.id && x.id.toString()) === -1 && x.id !== -1) || (this.networkTransportLinking.transportRecoveryPerNetwork.indexOf(
         x.clientId && x.clientId.toString()) === -1 && x.id === -1));

     */
  }

  public recoveryLinkChangeHandler(updatedRecoveryLink: VP1Embedder) {
    this.getUpdatedRecoveryData();
    if (this.localService.serviceType === ServiceType.ATSC_3) {
      this.localATSC3Service.recoveryLink = new DefaultRecoveryLink(0, '');
      if (updatedRecoveryLink.id !== -1) {
        this.localATSC3Service.recoveryLink.recoveryId = updatedRecoveryLink.id;
      } else {
        this.localATSC3Service.recoveryLink.clientRecoveryId = updatedRecoveryLink.clientId;
      }
      this.selectedRecoveryStream = updatedRecoveryLink;
    }
  }

  public activeIdChangedHandler(id: number) {
    if (id === 1) {
      this.toggleSchedule();
    }
    if (id === 2) {
      this.toggleCaption();
    }
    if (id === 3) {
      this.toggleDescriptor();
    }
    this.activeId = id;
  }

  public inputSettings(): void {
    this.updateChannelNumberRequired();
    this.updateNameValid();
    this.updateChannelNumberValid();
    this.updateOkEnabled();
  }

  private loadServerSchedule() {
    if (this.localATSCServiceSchedules && this.localATSCServiceSchedules.length > 0) {
      this.scheduleProviderModel.schedProviderSummary$.subscribe(
        (scheduleProvidersSummary: ScheduleSummary[]) => {
          if (scheduleProvidersSummary !== undefined) {
            const tempSched = this.filterSchedule(scheduleProvidersSummary);
            this.clonedSchedule = [];
            let schedCtr = 0;
            tempSched.forEach((tempSchedItem) => {
              const localTempSched: any = {};
              localTempSched.id = schedCtr;
              localTempSched.scheduleName = tempSchedItem.scheduleName;
              localTempSched.scheduleId = tempSchedItem.scheduleId;
              localTempSched.scheduleProviderName = tempSchedItem.scheduleProviderName;
              localTempSched.scheduleProviderId = tempSchedItem.scheduleProviderId;
              localTempSched.scheduleProviderType = tempSchedItem.scheduleProviderType;
              this.clonedSchedule.push(localTempSched);
              schedCtr++;
            });
          }
        });
    } else {
      this.clonedSchedule = [];
    }
  }

  private schedulePriorityUpdate() {
    const newSchedLinks: ServiceScheduleLink[] = [];
    this.clonedSchedule.forEach((schedItem) => {
      const schedObj = this.localService.scheduleLinks.find(sched => {
        return sched.scheduleId === schedItem.scheduleId;
      });
      newSchedLinks.push(schedObj);
    });
    for (let schedTrav = 0, schedLength = newSchedLinks.length - 1; schedTrav <= schedLength; schedTrav++) {
      newSchedLinks[schedTrav].priority = 100 + schedLength - schedTrav;
    }
    this.localService.scheduleLinks = this.localATSCServiceSchedules = newSchedLinks;
  }

  private filterSchedule(data: ScheduleSummary[]) {
    const sched: any = [];
    for (let ctr = 0; ctr < this.localATSCServiceSchedules?.length; ctr++) {
      sched.push(data.find(
        (obj: { scheduleId: number; }) => obj.scheduleId === this.localATSCServiceSchedules[ctr].scheduleId));
    }
    return sched;
  }

  private assignCaptionSettings(tableHolder: CaptionDescription[]) {
    let tempTableHolder: any = tableHolder;
    if (tempTableHolder && tempTableHolder.length > 0) {
      tempTableHolder?.forEach((item: any) => {
        item.name = '';
        if (!item.digital) {
          item.language = new DefaultLanguage();
          item.wide = false;
          item.easyReader = false;
          item.serviceNumber = '';
          item.type_display = 'CEA-608';
          item.language_display = 'Not Applicable';
          item.easyReader_display = '';
          item.wide_display = '';
        } else {
          item.type_display = 'CEA-708';
          item.language_display = item.language.readable;
          item.easyReader_display = this.parseHTMLEntities('&#x274C;');
          if (item.easyReader) {
            item.easyReader_display = this.parseHTMLEntities('&#x2705;');
          }
          item.wide_display = this.parseHTMLEntities('&#x274C;');
          if (item.wide) {
            item.wide_display = this.parseHTMLEntities('&#x2705;');
          }
        }
      });
    } else {
      tempTableHolder = [];
    }
    return tempTableHolder;
  }

  private assignDescriptors_Extensions() {
    let descExtensionTable: any;
    if (this.localService.serviceType !== ServiceType.ATSC_3) {
      descExtensionTable = this.localATSCServiceDescriptors;
    } else {
      descExtensionTable = this.localATSCServiceExtensions;
    }
    descExtensionTable?.map((item: { descName: any; name: any; }) => {
      const objectHolder: any = parseHtmlEntities(this.networkStream.networkType, item);
      item.descName = objectHolder.desc_name;
      item.name = objectHolder.name;
    });
    this.clonedDescriptorExtension = cloneDeep(descExtensionTable);
    if (this.localService.serviceType !== ServiceType.ATSC_3) {
      let index = 0;
      if (this.clonedDescriptorExtension && this.clonedDescriptorExtension.length > 0) {
        this.clonedDescriptorExtension.forEach((item: any) => {
          item.descId = item.id;
          item.descClientId = item.clientId;
          delete item.clientId;
          item.id = index;
          index++;
        });
      } else {
        this.clonedDescriptorExtension = [];
      }
    }
  }

  private assignServiceData() {
    if (this.localService.majorNumber > 0) {
      this.localServiceVirtualChannel = this.localService.majorNumber.toString();
    }
    if (this.localService.minorNumber > 0) {
      this.localServiceVirtualChannel = this.localService.majorNumber + '-' + this.localService.minorNumber;
    }
    this.validServiceVirtualNumber = this.localServiceVirtualChannel?.length > 0;
  }

  private checkUneditableType(type: ExtensionType) {
    const editButton = document.getElementById(ButtonType.EDIT + '-' + 'Service Descriptor');
    if (isDefined(editButton) && editButton.hasAttribute('disabled')) {
      editButton.removeAttribute('disabled');
    }
    if (type === ExtensionType.SGDU_PASSTHROUGH
      || type === ExtensionType.AUDIO_STREAM_PROPERTIES
      || type === ExtensionType.VIDEO_STREAM_PROPERTIES
      || type === ExtensionType.CAPTION_ASSET
      || type === ExtensionType.LOW_DELAY) {
      editButton.setAttribute('disabled', 'true');
    }
  }

  private checkRedistributionTag(tag: number) {
    this.buttonList[1].disable = tag === 170;
  }

  private onAddRowDescriptor() {
    if (this.localService.serviceType !== ServiceType.ATSC_3) {
      this.descriptorEditMode = false;
      this.currentDescriptor = new DefaultDescriptor(0, true);
    } else {
      this.extensionEditMode = false;
      this.currentExtension = new DefaultExtension(ExtensionType.UNKNOWN, true);
    }
  }

  private onEditRowDescriptor() {
    if (this.localService.serviceType !== ServiceType.ATSC_3) {
      this.descriptorEditMode = true;
      this.currentDescriptor = this.localATSCServiceDescriptors[this.serviceDynamicTable.selectedRowIds[0]];
    } else {
      this.extensionEditMode = true;
      this.currentExtension = this.serviceDynamicTable.selectedRow;
    }
  }

  private onDeleteRowDescriptor() {
    if (this.localService.serviceType !== ServiceType.ATSC_3) {
      const myCallbackFunction = (parentList, localList): void => {
        this.localService.descriptorElements = parentList;
        this.localATSCServiceDescriptors = localList;
        this.assignDescriptors_Extensions();
        if (this.localService.descriptorElements && this.localService.descriptorElements.length > 0) {
          this.checkRedistributionTag(this.localService.descriptorElements[0].tag);
        }
      };
      deleteSelectedRows(this.localService.descriptorElements, this.localATSCServiceDescriptors,
        this.serviceDynamicTable, myCallbackFunction, true);
    } else {
      const myCallbackFunction = (parentList, localList): void => {
        this.localService.extensions = parentList;
        this.localATSCServiceExtensions = localList;
        this.assignDescriptors_Extensions();
      };
      deleteSelectedRows(this.localService.extensions, this.localATSCServiceExtensions, this.serviceDynamicTable,
        myCallbackFunction);
    }
  }

  private onAddRowSchedule() {
    this.modalScheduleName = '#modalSchedSources';
    this.currentSchedule = new DefaultSchedule(0, 0, 0);
  }

  private onViewRowSchedule() {
    this.openModalViewSchedule = true;
    this.modalScheduleName = '#modalViewSched';
    this.viewSchedList(this.currentSchedule);
  }

  private viewSchedList(serviceScheduleLink: ServiceScheduleLink) {
    this.updateCurrentSchedule(serviceScheduleLink.scheduleId);
  }

  private updateCurrentSchedule(providerId: number): void {
    this.scheduleProviderService.getScheduleById(providerId).subscribe(
      (schedule) => {
        this.selectedSchedule = schedule;
      });
  }

  private onDeleteRowSchedule() {
    this.multipleDeletionSchedule();
  }

  private multipleDeletionSchedule() {
    const len = this.serviceDynamicTable.selectedRowIds.length;
    for (let i = 0; i < len; i++) {
      const selectID = this.serviceDynamicTable?.selectedRowIds[i];
      this.localATSCServiceSchedules.splice(selectID, 1);
    }
    this.localService.scheduleLinks = this.localATSCServiceSchedules;
    this.loadServerSchedule();
  }

  private onAddRowDefault() {
    this.captionType = 'default';
    this.defaultEditMode = false;
    this.currentDefault = new DefaultCaption();
  }

  private onEditRowDefault() {
    this.captionType = 'default';
    this.defaultEditMode = true;
    this.currentDefault = this.dynamicCaptionTableComponent.first.selectedRow;
  }

  private onDeleteRowDefault() {
    const myCallbackFunction = (parentList, localList): void => {
      this.localService.captionDescriptions = parentList;
      this.localATSCServiceDefault = localList;
      this.clonedDefault = cloneDeep(this.assignCaptionSettings(this.localATSCServiceDefault));
    };
    deleteSelectedRows(this.localService.captionDescriptions, this.localATSCServiceDefault,
      this.dynamicCaptionTableComponent.first, myCallbackFunction);
  }

  private onAddRowLinked() {
    this.captionType = 'linked';
    this.linkedEditMode = false;
    this.currentLinked = new DefaultCaption();
  }

  private onEditRowLinked() {
    this.captionType = 'linked';
    this.linkedEditMode = true;
    this.currentLinked = this.dynamicCaptionTableComponent.last.selectedRow;
  }

  private onDeleteRowLinked() {
    const myCallbackFunction = (parentList, localList): void => {
      this.localService.linkedCaptionDescriptions = parentList;
      this.localATSCServiceLinked = localList;
      this.clonedLinked = cloneDeep(this.assignCaptionSettings(this.localATSCServiceLinked));
    };
    deleteSelectedRows(this.localService.linkedCaptionDescriptions, this.localATSCServiceLinked,
      this.dynamicCaptionTableComponent.last, myCallbackFunction);
  }

  private parseHTMLEntities(text: string) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
  }

  private initializeTabs() {
    const slideRect =
      document.querySelector('.js-service-nav .nav__slider-rect') as HTMLElement;
    if (slideRect) {
      slideRect.style.width = 100 / this.activeTabs + '%';
    }
  }

  private toggleSchedule() {
    this.isHiddenSched = false;
    this.isHiddenDesc = true;
    this.isHiddenCaption = true;
  }

  private toggleDescriptor() {
    this.isHiddenSched = true;
    this.isHiddenDesc = false;
    this.isHiddenCaption = true;
    if (this.localService.serviceType === ServiceType.ATSC_3) {
      this.tableHeadersDescriptor[0].header = 'Extensions';
    } else {
      this.tableHeadersDescriptor[0].header = 'Descriptors';
    }
  }

  private toggleCaption() {
    this.isHiddenSched = true;
    this.isHiddenDesc = true;
    this.isHiddenCaption = false;
    this.captionType = '';
  }

  private getUpdatedRecoveryData() {
    this.linkRecoveryData = [];
    if (this.channel.transportLinks && this.channel.transportLinks.length > 0) {
      const selectedTransport = this.dtvNetworkComponent.localTransports.filter(
        x => x.transportType === TransportType.ATSC_3 && ((x.id === this.channel.transportLinks[0].transportId && x.id !== -1) || (x.clientId === this.channel.transportLinks[0].clientTransportId && x.id === -1))) as ATSC3Transport[];
      if (selectedTransport[0]) {
        if (selectedTransport[0].serviceGroups && selectedTransport[0].serviceGroups.length > 0) {
          selectedTransport[0].serviceGroups.forEach(sg => {
            if (sg.ipStreams && sg.ipStreams.length > 0) {
              sg.ipStreams.forEach(ip => {
                if ((ip.id !== -1 && this.localService.physicalLink && ip.id.toString() === this.localService.physicalLink.physicalId.toString()) || (ip.id === -1 && this.localService.physicalLink && ip.clientId === this.localService.physicalLink.physicalId.toString())) {
                  this.linkRecoveryData = sg.recoverySettings.vp1Embedders;
                }
              });
            }
          });
        }
      }
    }
  }

  private initializeDynamicTabs() {
    if (this.localService.serviceType === ServiceType.ATSC_3) {
      this.headerTabs = [
        {tabName: 'Schedule Sources', activeId: 1},
        {tabName: 'Service Extensions', activeId: 3},
      ];
    } else {
      this.headerTabs = [
        {tabName: 'Schedule Sources', activeId: 1},
        {tabName: 'Service Caption Settings', activeId: 2},
        {tabName: 'Service Descriptors', activeId: 3},
      ];
    }
  }

  private updateLocalServiceFields(): void {
    this.localService.majorNumber = this.getCurrentMajorNumber();
    this.localService.minorNumber = this.getCurrentMinorNumber();
    this.updateGlobalServiceIdPlaceholder();
  }

  private isUniqueServiceVirtualNumber(): boolean {
    let foundMatch = false;
    if (isATSCService(this.localService)) {
      const currentMajorNumber = this.getCurrentMajorNumber();
      const currentMinorNumber = this.getCurrentMinorNumber();
      this.services.forEach(service => {
        if (isATSCService(service)) {
          const otherATSCService: AbstractATSCService = service as AbstractATSCService;
          const majorNumberMatch = currentMajorNumber === otherATSCService.majorNumber;
          const minorNumberMatch = currentMinorNumber === otherATSCService.minorNumber;
          const virtualNumberMatch = majorNumberMatch && minorNumberMatch;
          if (virtualNumberMatch && !this.serviceEditMode) {
            foundMatch = true;
          } else {
            const idMatch = isElementIdMatch(this.localService, otherATSCService);
            if (!idMatch && virtualNumberMatch) {
              foundMatch = true;
            }
          }
        } else {
        }
      });
    }
    return !foundMatch;
  }

  private getCurrentMajorNumber(): number {
    const parts: string[] = this.localServiceVirtualChannel?.split('-');
    return parts?.length > 0 && parts[0].length > 0 ? parseInt(parts[0]) : -1;
  }

  private getCurrentMinorNumber(): number {
    const parts: string[] = this.localServiceVirtualChannel?.split('-');
    return parts?.length > 1 && parts[1].length > 0 ? parseInt(parts[1]) : -1;
  }

  private findLocalService(virtualNumber: string): AbstractService {
    return this.localServices?.find((service: AbstractService) => {
      let matchFound = false;
      if (isATSCService(service)) {
        const atscService: AbstractATSCService = service as AbstractATSCService;
        const thisVirtualNumber = getATSCServiceVirtualNumber(atscService);
        matchFound = virtualNumber === thisVirtualNumber;
      }
      return matchFound;
    });
  }

  private updateNameValid(): void {
    this.nameValid = this.localService.name?.length > 0 && this.localService.name?.length <= 7;
    this.nameIconText = this.nameValid ? 'text-success' : 'text-danger';
  }

  private updateChannelNumberRequired(): void {
    this.channelNumberRequired = true;
    if (this.localService.serviceType === ServiceType.ATSC_3) {
      if (!isServiceCategoryMajorMinorRequired(this.localATSC3Service.serviceCategory)) {
        this.channelNumberRequired = false;
      }
    }
  }

  private updateChannelNumberValid(): void {
    const channelNumberEntered = this.localServiceVirtualChannel?.length > 0;
    if (this.channelNumberRequired || channelNumberEntered) {
      this.channelNumberValid = this.validServiceVirtualNumber && this.isUniqueServiceVirtualNumber();
    } else {
      this.channelNumberValid = true;
    }
    this.channelNumberIconText = this.channelNumberValid ? 'text-success' : 'text-danger';
  }

  private updateOkEnabled(): void {
    this.okEnabled = this.nameValid && this.channelNumberValid;
  }

  private updateGlobalServiceIdPlaceholder(): void {
    this.globalServiceIdPlaceholder = 'urn:uuid:XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX';
    if (this.localService?.id > 0) {
      const serviceUuid: string = this.clientNetworksModel.getServiceUuid(this.localService.id);
      if (isDefined(serviceUuid)) {
        this.globalServiceIdPlaceholder = 'urn:uuid:' + serviceUuid;
      }
    }
  }

  private getATSC3Stream() {
    let atsc3Stream = null;
    if (this.selectedTransport.transportType === TransportType.ATSC_3) {
      atsc3Stream = getLinkedIPStream(this.localService, this.selectedTransport);
    } else if (this.selectedTransport.transportType === TransportType.ATSC_3_TRANSLATED) {
      const translatedTransport = this.selectedTransport as ATSC3TranslatedTransport;
      atsc3Stream = getLinkedIPStream(this.localService,
        this.channelComponent.getOriginalTransport(translatedTransport));
    }
    const mediaStreams = this.clientMediaStreamsModel.getMediaStreams();
    if (atsc3Stream?.hasOwnProperty('linkedStreamId')) {
      const mediaStreams = this.clientMediaStreamsModel.getMediaStreams();
      mediaStreams.forEach(mediaStream => {
        if (mediaStream.id === atsc3Stream.linkedStreamId) {
          atsc3Stream = mediaStream;
        }
      });
    }
    console.log('Matched Linked Ip Stream', atsc3Stream);
    return atsc3Stream;

  }

}
