// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.

import {AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {swalErrorLogoutFunction} from 'src/app/shared/helpers/appWideFunctions';
import {environment} from '../../../../environments/environment';
import {Observable} from 'rxjs';
import {
  ActionMessage,
  ButtonType,
  ButtonTypes,
  ImageType,
  MultipleTableColumns
} from 'src/app/core/models/ui/dynamicTable';
import {SweetAlert} from 'sweetalert/typings/core';
import * as _swal from 'sweetalert';
import {ClientLicenseModel} from '../../../core/models/ClientLicenseModel';
import {SYSTEM_TYPES, SystemType} from '../../../core/models/server/License';
import {ServerService} from 'src/app/core/services/server.service';
import {ClientUsersModel} from 'src/app/core/models/ClientUsersModel';
import {User} from 'src/app/core/models/server/User';
import {
  ModalDynamicTbTranslateComponent
} from '../modals/modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {BootstrapFunction, ClickEvent} from '../../../core/interfaces/interfaces';
import {
  DefaultRestartOptionsRequest,
  FileNode,
  INIT_LEVELS,
  InitLevel,
  KeyValuePair,
  PRIMARY_SERVER_RESTART_MODES,
  REDUNDANT_ENABLED_SERVER_RESTART_MODES,
  ResourceMap,
  RESTART_SERVER_MODES,
  RestartOptionsRequest,
  RestartServerMode,
  SERVER_RESOURCE_TYPES,
  ServerResourceType,
  SoftwareVersionInfo
} from '../../../core/models/server/Server';
import {isDefined} from '../../../core/models/dtv/utils/Utils';
import {ModalSimpleTableComponent} from '../modals/modal-simple-table/modal-simple-table.component';
import {cloneDeep, isEqual} from 'lodash';

const swal: SweetAlert = _swal as any;
declare var $: BootstrapFunction;

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit, AfterViewInit {
  @ViewChild('fileInput', {static: false}) fileInput: ElementRef;
  @ViewChild(ModalDynamicTbTranslateComponent) resourcesTableComponent: ModalDynamicTbTranslateComponent;
  @ViewChild(ModalSimpleTableComponent) propsTableComponent: ModalSimpleTableComponent;
  public readonly RESTART_SERVER_MODES = RESTART_SERVER_MODES;
  public readonly SYSTEM_TYPES = SYSTEM_TYPES;
  public readonly INIT_LEVELS = INIT_LEVELS;
  public restartServerModes: RestartServerMode[] = PRIMARY_SERVER_RESTART_MODES;
  public versionInfo: SoftwareVersionInfo;
  public currentDate = new Date();
  public urlUserGuide = environment.PARENT_URL + 'doc/GuideBuilder 5.6 User Guide.pdf';
  public privilegeLevel = '';
  public privilege: string;
  public userName = '';
  public systemType: SystemType;
  public systemMode: InitLevel;
  public resourceFileNodes: FileNode[] = [];
  public tableHeaders: MultipleTableColumns[] = [
    {header: 'Name', key: 'name', visible: true},
    {header: 'Size', key: 'formattedSize', visible: true},
    {header: 'Last Modified', key: 'localeLastModified', visible: true},
  ];
  public buttonList: ButtonTypes[] = [
    {name: ButtonType.ADDFILE, imgSrc: ImageType.addfile, alwaysEnabled: true},
    {name: ButtonType.VIEW, imgSrc: ImageType.view},
    {name: ButtonType.DELETE, imgSrc: ImageType.delete, supportsMultiSelect: true},
  ];
  public fileCountString = '';
  public activeTabs = [
    {
      tabName: 'ESG Preview Fragments',
      hrefVal: '#',
      tabIdentifier: 'ESG_PREVIEW_FRAGMENTS',
      toShow: true,
      transformVal: 0
    },
    {tabName: 'Transport Streams', hrefVal: '#', tabIdentifier: 'TS_SPOOL', toShow: true, transformVal: 0},
    {tabName: 'XSLT', hrefVal: '#', tabIdentifier: 'XSLT', toShow: true, transformVal: 0}
  ];
  public localProperties: KeyValuePair[] = [];
  public propertiesDirty = false;
  public currentKey: string;
  public currentValue: string;
  public tableHeadersProps: MultipleTableColumns[] = [
    {header: 'Name', key: 'key', visible: true},
    {header: 'Value', key: 'value', visible: true},
  ];
  public buttonListProps: ButtonTypes[] = [
    {name: ButtonType.EDIT, imgSrc: ImageType.edit, disable: false},
  ];
  public restartOptionsRequest: RestartOptionsRequest = new DefaultRestartOptionsRequest();
  public restartGuideBuilderTitleHead: string;
  public restartGuideBuilderTitle: string;
  public headerTabs = [
    {tabName: 'ESG Preview Fragments', activeId: 1},
    {tabName: 'Transport Streams', activeId: 2},
    {tabName: 'XSLT', activeId: 3}
  ];
  // activeId in the parent component to determine the current active tab; programmatically changes in the event emitter (activeIdChangedHandler())
  public activeId = 1;
  private currentProperty: KeyValuePair;
  private resourceMap: ResourceMap;
  private resourceType = ServerResourceType.ESG_PREVIEW_FRAGMENTS;
  private serverProperties: KeyValuePair[] = [];

  constructor(private userModel: ClientUsersModel, private serverService: ServerService,
              private clientLicenseModel: ClientLicenseModel
  ) {
  }

  @HostListener('click', ['$event'])
  public ctrlClickEventHandler(event: MouseEvent): void {
    if (event.ctrlKey && event.shiftKey) {
      console.log('CTRL + Shift + Left Click');
    } else if (event.ctrlKey) {
      console.log('CTRL + Left Click');
    } else {
      console.log('Just click');
    }
  }

  public ngOnInit(): void {
    this.getFooterElements();
    this.getResourceMap();
    this.getProperties();
  }

  public ngAfterViewInit(): void {
    this.clickResourceRow(null);
  }

  public onButtonClickedFooter($event: ClickEvent): void {
    console.log('onButtonClickedFooter $event: ', $event);
    switch ($event.message) {
      case ActionMessage.DELETE:
        this.deleteMediaResources(this.resourcesTableComponent.selectedRowIds);
        break;
      case ActionMessage.VIEW:
        this.viewSelectedRecord(this.resourcesTableComponent.selectedRow?.id);
        break;
      case ActionMessage.IMPORT:
        this.fileInput?.nativeElement.click();
        break;
    }
  }

  public activeIdChangedHandler(id: number): void {
    this.activeId = id;
    switch (id) {
      case 1:
        this.selectResourceType(ServerResourceType.ESG_PREVIEW_FRAGMENTS);
        break;
      case 2:
        this.selectResourceType(ServerResourceType.TS_SPOOL);
        break;
      case 3:
        this.selectResourceType(ServerResourceType.XSLT);
        break;
    }
  }

  public onLinkClick(event: MouseEvent): void {
    if (event.ctrlKey && event.shiftKey) {
      this.propsTableComponent?.setRowSelection('0');
      $('#editPropertiesModal').modal('show');
    } else {
      console.log('Regular button click.');
      this.redirectToUrl();
    }
  }

  public onButtonClickedProps($event: ClickEvent): void {
    switch ($event.message) {
      case ActionMessage.EDIT:
        this.onEditRow();
        break;
    }
  }

  public updateEditProperties(): void {
    this.currentProperty.value = this.currentValue?.length > 0 ? this.currentValue : undefined;
    this.propertiesDirty = !isEqual(this.localProperties, this.serverProperties);
  }

  public showRestartConfirmation(): void {
    this.restartGuideBuilderTitleHead = 'Restart';
    this.restartGuideBuilderTitle = this.restartGuideBuilderTitleHead + ' GuideBuilder Confirmation';
    $('#restartSystemModal').modal('show');
  }

  public updatePropsAndRestart(): void {
    this.serverService.setServerProps(this.localProperties).subscribe(properties => {
      this.serverService.postServerRestart(this.restartOptionsRequest).subscribe(restartOptionsRequest => {
        const messageAlert =
          'The GuideBuilder Server is restarting. The application will restart in a restartOptionsRequest minutes.';
        $('#restartSystemModal').modal('hide');
        swalErrorLogoutFunction(messageAlert);
      });
    });
  }

  public toggleRemoveLicense(): void {
    this.restartServerModes = this.restartOptionsRequest.removeLicense ?
      [RestartServerMode.MAINTENANCE_MODE, RestartServerMode.PASSIVE_MODE] :
      (this.systemMode === InitLevel.LEVEL2 ? REDUNDANT_ENABLED_SERVER_RESTART_MODES : PRIMARY_SERVER_RESTART_MODES);
  }

  public addMediaResources($event): void {
    if ($event !== undefined) {
      this.onFileHandler($event);
    }
  }

  public clickResourceRow(row: any): void {
    if (this.resourceFileNodes.length === 0) {
      this.resourcesTableComponent?.disableButtons([ButtonType.VIEW, ButtonType.DELETE]);
      this.buttonList.forEach(buttonList => {
        if (buttonList.name === ButtonType.VIEW || buttonList.name === ButtonType.DELETE){
          buttonList.disable = true;
        }
      });
    }
  }

  private onEditRow(): void {
    this.currentProperty = this.propsTableComponent?.selectedRow;
    this.currentKey = this.currentProperty.key;
    this.currentValue = this.currentProperty.value;
    $('#editPropertyModal').modal('show');
  }

  private redirectToUrl(): void {
    const url = this.urlUserGuide;
    window.open(url, '_blank');
  }

  private setButtonDisplay(): void {
    if (this.resourceType === ServerResourceType.TS_SPOOL) {
      this.buttonList = [
        {name: ButtonType.ADDFILE, imgSrc: ImageType.addfile, alwaysEnabled: true},
        {name: ButtonType.DELETE, imgSrc: ImageType.delete, supportsMultiSelect: true},
      ];
    } else {
      this.buttonList = [
        {name: ButtonType.ADDFILE, imgSrc: ImageType.addfile, alwaysEnabled: true},
        {name: ButtonType.VIEW, imgSrc: ImageType.view},
        {name: ButtonType.DELETE, imgSrc: ImageType.delete, supportsMultiSelect: true},
      ];
    }
  }

  private viewSelectedRecord(id: number): void {
    const downloadRelativePath = this.resourceFileNodes[id - 1]?.downloadRelativePath;
    if (isDefined(downloadRelativePath)) {
      const url = environment.ZIP_EXPORT_URL + downloadRelativePath;
      window.open(url, '_blank');
    }
  }

  private getResourceMap(): void {
    this.serverService.getResourceDirectoryMap().subscribe(resourceMap => {
      this.resourceMap = resourceMap;
      this.selectResourceType(this.resourceType);
    });
  }

  private getProperties(): void {
    this.serverService.getServerProps().subscribe(properties => {
      this.serverProperties = properties;
      this.localProperties = cloneDeep(this.serverProperties);
    });
  }

  private selectResourceType(resourceType: ServerResourceType): void {
    this.resourceType = resourceType;
    this.resourceFileNodes = this.resourceMap.get(this.resourceType) || [];
    this.fileCountString = this.resourceFileNodes.length === 1 ? '1 File' : this.resourceFileNodes.length + ' Files';
    this.setButtonDisplay();
  }

  private isValidTSFile(filename: string): boolean {
    const filenameLowercase = filename.toLowerCase();
    return filenameLowercase.endsWith('.ts') || filenameLowercase.endsWith('.tp');
  }

  private isValidXSLTFile(filename: string): boolean {
    const filenameLowercase = filename.toLowerCase();
    return filenameLowercase.endsWith('.xslt');
  }

  private isValidImageFile(filename: string): boolean {
    const filenameLowercase = filename.toLowerCase();
    return filenameLowercase.endsWith('.jpeg') || filenameLowercase.endsWith('.jpg') ||
      filenameLowercase.endsWith('.png');
  }

  private onFileHandler($event: Event): void {
    console.log('onFileHandler', $event);
    const inputElement = $event?.target as HTMLInputElement;
    if (inputElement.files?.length > 0) {
      const selectedFile = inputElement.files[0];
      const fileExist = this.resourceFileNodes.find(fileNode => fileNode.name === selectedFile.name);
      if (fileExist) {
        swal({
          title: 'File Exist',
          text: 'Are you sure you want to replace the file ' + selectedFile.name + '?',
          buttons: ['Cancel', 'Ok'],
          icon: 'warning',
        }).then((isConfirm) => {
          if (isConfirm) {
            this.doFileUpload(selectedFile);
          }
        });
      } else {
        this.doCheckedFileUpload(selectedFile);
      }
    }
  }

  private doCheckedFileUpload(selectedFile: File): void {
    let fileUploadValid = false;
    let messageValidFile = '';
    if (this.resourceType === ServerResourceType.ESG_PREVIEW_FRAGMENTS) {
      messageValidFile = 'Allowed Extension: [*.jpeg, *.jpg, *.png]';
      fileUploadValid = this.isValidImageFile(selectedFile.name);
    } else if (this.resourceType === ServerResourceType.TS_SPOOL) {
      messageValidFile = 'Allowed Extension: [*.ts, *.tp]';
      fileUploadValid = this.isValidTSFile(selectedFile.name);
    } else if (this.resourceType === ServerResourceType.XSLT) {
      messageValidFile = 'Allowed Extension: [*.xslt]';
      fileUploadValid = this.isValidXSLTFile(selectedFile.name);
    }
    if (fileUploadValid) {
      this.doFileUpload(selectedFile);
    } else {
      swal('Please select valid file: ' + messageValidFile, '', 'error').then();
    }
  }

  private doFileUpload(selectedFile: File): void {
    const resourceDirectory = SERVER_RESOURCE_TYPES[this.resourceType].rootDirectoryName;
    const observable: Observable<any> = this.serverService.postResourceFile(resourceDirectory, selectedFile);
    const observer = {
      next: () => {
        swal('', 'File ' + selectedFile.name + ' successfully added.', 'success').then();
        this.setButtonDisplay();
        this.getResourceMap();
      },
      error: () => {
        const messageAlert = 'Error on uploading file: ' + selectedFile.name;
        swal('', messageAlert, 'error').then();
      },
      complete: () => {
      }
    };
    observable.subscribe(observer);
  }

  private deleteMediaResources(ids: number[]): void {
    const rootDirectoryName = SERVER_RESOURCE_TYPES[this.resourceType]?.rootDirectoryName;
    ids.forEach(id => {
      const fileName = this.resourceFileNodes[id - 1]?.name;
      if (isDefined(fileName)) {
        this.serverService.deleteMediaResources(rootDirectoryName, fileName).subscribe(resourceMap => {
          swal('', 'File successfully deleted', 'success').then();
          this.getResourceMap();
          this.setButtonDisplay();
        });
      }
    });
  }

  private getFooterElements(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.userName = currentUser?.username;
    this.clientLicenseModel.serverLicenseInfo$.subscribe((serverLicenseInfo) => {
      this.systemType = serverLicenseInfo?.serverLicense?.systemType;
    });
    this.serverService.getServerInfo().subscribe((serverInfo) => {
      this.systemMode = serverInfo.initLevel;
      this.restartServerModes = this.systemMode === InitLevel.LEVEL2 ? REDUNDANT_ENABLED_SERVER_RESTART_MODES : PRIMARY_SERVER_RESTART_MODES;
    });
    this.userModel.users$.subscribe((users: User[]) => {
      const currentUser = users.filter(user => user.name === this.userName);
      this.privilegeLevel = currentUser[0]?.privilegeLevel;
      this.privilege = this.userName;
      this.privilegeLevel = this.privilegeLevel !== undefined ? this.privilegeLevel : this.privilege;
    });
    this.serverService.getSoftwareVersionInfo().subscribe((softwareVersionInfo) => {
      this.versionInfo = softwareVersionInfo;
    });
  }
}
