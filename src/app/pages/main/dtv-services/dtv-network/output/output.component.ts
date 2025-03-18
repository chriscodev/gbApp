// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.

import {ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {
  ActionMessage,
  ButtonType,
  ButtonTypes,
  ImageType,
  MultipleTableColumns
} from '../../../../../core/models/ui/dynamicTable';
import {
  AbstractOutput,
  ASIOutput,
  DefaultASIOutput,
  DefaultATSC3TranslatorOutput,
  DefaultATSC3UDPOutput,
  DefaultAVPOutput,
  DefaultMNAOutput,
  DefaultMX5600Output,
  DefaultMX8400Output,
  DefaultNetProcessorOutput,
  DefaultNetVXOutput,
  DefaultSelenioOutput,
  DefaultTriveniOutput,
  DefaultUDPOutput,
  getTransportCount,
  OUTPUT_TYPES,
  OUTPUT_TYPES_VALUES,
  OutputsChangedEvent,
  OutputType,
  TranslatedOutput
} from '../../../../../core/models/dtv/output/Output';
import {ClientOutputsModel} from '../../../../../core/models/ClientOutputsModel';
import {OutputsService} from '../../../../../core/services/outputs.service';
import {
  ModalDynamicTbTranslateComponent
} from '../../../../../shared/components/modals/modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {ClientLicenseModel} from '../../../../../core/models/ClientLicenseModel';
import {cloneDeep, isEqual} from 'lodash';
import {isDefined, isUndefined} from '../../../../../core/models/dtv/utils/Utils';
import {Subscription} from 'rxjs';
import {LicensedNetworkType, ServerLicense, ServerLicenseInfo} from '../../../../../core/models/server/License';
import {
  ElementIds,
  insertIntoElementList,
  isElementNameUnique,
  updateElementList
} from '../../../../../core/models/AbstractElement';
import {ClientNetworkSettingsModel} from '../../../../../core/models/ClientNetworkSettingsModel';
import {OutputStatus} from '../../../../../core/models/dtv/output/OutputStatus';
import {ClientServerModel} from '../../../../../core/models/ClientServerModel';
import {BootstrapFunction} from '../../../../../core/interfaces/interfaces';

declare var $: BootstrapFunction;

@Component({
  selector: 'app-output',
  templateUrl: './output.component.html',
  styleUrls: ['./output.component.scss']
})
export class OutputComponent implements OnInit, OnDestroy {
  @ViewChild(ModalDynamicTbTranslateComponent) outputsTableComponent: ModalDynamicTbTranslateComponent;
  @Output() outputsChanged: EventEmitter<OutputsChangedEvent> = new EventEmitter<OutputsChangedEvent>();
  public serverOutputs: AbstractOutput[];
  public localOutputs: AbstractOutput[];
  public readonly OUTPUT_TYPES = OUTPUT_TYPES;
  public modalName = '#outputsModal';
  public outputTypes: OutputType[] = [];
  public translatedOutputData: TranslatedOutput[];
  public editMode: boolean;
  public modalTitle: string;
  public currentOutput: AbstractOutput;
  public initialPage = true;
  public viewOutputStatusModal = false;
  public buttonList: ButtonTypes[] = [
    {name: ButtonType.ADD, imgSrc: ImageType.add, disable: false, alwaysEnabled: true},
    {name: ButtonType.EDIT, imgSrc: ImageType.edit, supportsMultiSelect: false},
    {name: ButtonType.DELETE, imgSrc: ImageType.delete, supportsMultiSelect: true},
    {name: ButtonType.UPDATEROW, imgSrc: ImageType.disable, supportsMultiSelect: true, requiresServerId: true},
    {name: ButtonType.ENCODE, imgSrc: ImageType.encode, disable: false, requiresServerId: true},
    {name: ButtonType.STATUS, imgSrc: ImageType.status, disable: false, requiresServerId: true}
  ];
  public tableHeaders: MultipleTableColumns[] = [
    {header: 'Name', key: 'name', visible: true},
    {header: 'Online', key: 'onLine', visible: true, showOnline: true},
    {header: 'Transports', key: 'transportCount', visible: true, translateField: true},
    {header: 'Last Update', key: 'lastUpdateTime', visible: true, translateField: true, showDate: true},
  ];
  public addUpdateEnabled = false;
  public nameValid = false;
  public nameExists = false;
  public nameIconText: string;
  public selectableASICardIds: number[] = [];
  public showATSC1UDP = false;
  public showASIOutput = false;
  public showPortAddressableOutput = false;
  public showHarrisSlotMuxOutput = false;
  public showHarrisMNAOutput = false;
  public showATSC3Output = false;
  public showATSCTranslator = false;
  private outputStatusMap: Map<number, OutputStatus> = new Map<number, OutputStatus>();
  private maxOutputs: number;
  private allASICardIds: number[] = [];
  private availableASICardIds: number[] = [];
  private dirty = false;
  private childOkEnabled = true;
  private subscriptions: Subscription [] = [];

  constructor(
    private changeDetectorRef: ChangeDetectorRef, private clientOutputsModel: ClientOutputsModel,
    private clientNetworkSettingsModel: ClientNetworkSettingsModel, private outputService: OutputsService,
    private clientLicenseModel: ClientLicenseModel, private clientServerModel: ClientServerModel
  ) {
    this.subscriptions.push(this.clientLicenseModel.serverLicenseInfo$.subscribe(
      (serverLicenseInfo) => {
        this.initializeLicensableVariables(serverLicenseInfo);
        this.currentOutput = this.createDefaultOutput(false);
        this.updateShowOutput();
      }));

    this.allASICardIds = this.clientServerModel.getASITransmitCardIds() || [];
  }


  public ngOnInit() {
    this.loadServerOutputs();
    this.validateMaxOutputLimitCheck();
  }


  public ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  public onRevert() {
    this.loadServerOutputs();
    this.updateDirty();
  }

  public validateName() {
    this.updateModalTitle();
    this.updateNameValid();
    this.validateAddUpdateEnabled();
  }

  public onChangeOutputType(): void {
    this.currentOutput = this.createDefaultOutput(true);
    this.updateSelectableASICardIds();
    this.updateShowOutput();
    this.validateName();
  }

  public outputStatusModalCloseHandler() {
    this.modalName = '#outputsModal';
    this.viewOutputStatusModal = false;
    $('#viewOutputStatus').modal('hide');
  }

  public onButtonClicked(event: { message: string; }) {
    switch (event.message) {
      case ActionMessage.ADD:
        this.onAddRow();
        break;
      case ActionMessage.EDIT:
        this.onEditRow();
        break;
      case ActionMessage.DELETE:
        this.onDeleteRow();
        break;
      case ActionMessage.ENABLE_DISABLE:
        this.onEnableDisable();
        break;
      case ActionMessage.ENCODE:
        this.onEncodeRow();
        break;
      case ActionMessage.STATUS:
        this.onViewOutputStatus();
        break;
    }
    this.changeDetectorRef.detectChanges();
  }

  public clickNext() {
    this.initialPage = false;
    this.validateAddUpdateEnabled();
  }

  public clickPrev() {
    this.initialPage = true;
    this.validateAddUpdateEnabled();
  }

  public closeModal(): void {
    this.initialPage = true;
    this.changeDetectorRef.detectChanges();
  }

  public okEnabledChangedHandler(okEnabled: boolean): void {
    this.childOkEnabled = okEnabled;
    this.validateAddUpdateEnabled();
  }

  public addUpdateCurrentOutput() {
    this.localOutputs = updateElementList(this.localOutputs, this.currentOutput, this.editMode) as AbstractOutput[];
    this.updateTranslateTableData();
    this.updateDirty();
    this.validateMaxOutputLimitCheck();
    this.updateAvailableASICardIds();
    this.initialPage = true;
  }

  public onRowClicked(selectedOutput: AbstractOutput) {
    if (isDefined(selectedOutput)) {
      this.currentOutput = cloneDeep(selectedOutput);
      this.updateSelectableASICardIds();
      this.updateShowOutput();
    }
    this.setEncodeButtonEnabled();
    this.setButtonOnlineStatus();
  }

  public getTranslatedRowData(): void {
    this.translatedOutputData = [];
    this.outputStatusMap.forEach((outputStatus, primaryKey) => {
      // added fallback if outputStatus returns with c only
      let foundOutput: AbstractOutput;
      const clonedOutputStatus = cloneDeep(outputStatus);
      const lastUpdateTime = clonedOutputStatus.lastUpdateTime ? clonedOutputStatus.lastUpdateTime : clonedOutputStatus.c;
      if (isUndefined(outputStatus.lastUpdateTime)) {
        foundOutput = this.localOutputs.find((localOutput, index) => index === primaryKey);
      } else {
        foundOutput = this.localOutputs.find(o => o.id === outputStatus.outputId);
      }
      let translatedOutput = null;
      if (foundOutput) {
        translatedOutput = new TranslatedOutput(foundOutput.id, getTransportCount(foundOutput), lastUpdateTime);
      } else {
        translatedOutput = new TranslatedOutput(foundOutput?.id, 0, lastUpdateTime !== null ? lastUpdateTime : null);
      }
      this.translatedOutputData.push(translatedOutput);
    });


  }

  public updateOutputStatusMap() {
    this.subscriptions.push(
      this.clientOutputsModel.outputStatus$.subscribe((outputStatuses) => {
        let index = 0;
        outputStatuses?.forEach((outputStatus) => {
          this.outputStatusMap.set(outputStatus.outputId ? outputStatus.outputId : index, outputStatus);
          index++;
        });
      }));
    this.getTranslatedRowData();
  }

  public updateLocalOutputsResolvedLinks(outputs: AbstractOutput[]) {
    this.outputsChanged.emit(new OutputsChangedEvent(true, outputs));
    this.localOutputs = [...outputs];
    this.getTranslatedRowData();
    this.changeDetectorRef.detectChanges();
  }

  private onUpdateAllRows() {
    const localCopy = this.outputsTableComponent.disableEnableRows('onLine');
    this.localOutputs = [...localCopy];
    this.setButtonOnlineStatus();
    this.changeDetectorRef.detectChanges();
  }

  private loadServerOutputs() {
    this.subscriptions.push(
      this.clientOutputsModel.output$.subscribe((outputs) => {
        this.localOutputs = cloneDeep(outputs);
        this.serverOutputs = cloneDeep(outputs);
        this.updateOutputStatusMap();
        this.getTranslatedRowData();
        this.updateDirty();
        this.changeDetectorRef.detectChanges();
      })
    );
    this.changeDetectorRef.detectChanges();
    this.updateAvailableASICardIds();
  }

  private onAddRow() {
    this.modalName = '#outputsModal';
    this.editMode = false;
    this.childOkEnabled = false;
    this.currentOutput = this.createDefaultOutput(false);
    this.updateSelectableASICardIds();
    this.updateShowOutput();
    this.validateName();
  }

  private onEditRow() {
    this.modalName = '#outputsModal';
    this.editMode = true;
    this.childOkEnabled = true;
    this.currentOutput = cloneDeep(this.outputsTableComponent.selectedRow);
    this.updateSelectableASICardIds();
    this.updateShowOutput();
    this.validateName();
  }

  private onDeleteRow() {
    this.multipleDeletion();
    this.updateDirty();
    this.validateMaxOutputLimitCheck();
  }

  private multipleDeletion() {
    this.localOutputs = this.outputsTableComponent.deleteRows();
    this.updateAvailableASICardIds();
  }

  private updateDirty() {
    this.dirty = !isEqual(this.localOutputs, this.serverOutputs);
    if (this.dirty) {
      console.log('outputs updateDirty is dirty');
      console.log('this.localOutputs: ', this.localOutputs);
      console.log('this.serverOutputs: ', this.serverOutputs);
    }
    this.outputsChanged.emit(new OutputsChangedEvent(this.dirty, this.localOutputs));
  }

  private validateMaxOutputLimitCheck() {
    if (this.maxOutputs <= this.localOutputs?.length) {
      this.outputsTableComponent.disableButtons([ButtonType.ADD]);
    }
  }

  private initializeLicensableVariables(serverLicenseInfo: ServerLicenseInfo): void {
    if (isDefined(serverLicenseInfo?.serverLicense)) {
      this.initializeOutputTypes(serverLicenseInfo.serverLicense);
      this.maxOutputs = serverLicenseInfo.serverLicense.maxOutputs;
    }
  }

  private initializeOutputTypes(serverLicense: ServerLicense): void {
    const atsc3TranslatedTransportEnabled = serverLicense.licensedNetworkTypes?.some(
      licensedNetworkType => licensedNetworkType === LicensedNetworkType.ATSC_3_TRANSLATED);
    serverLicense.licensedOutputTypes.forEach(
      outputType => {
        switch (outputType) {
          case OutputType.TRIVENI:
          case OutputType.UDP:
          case OutputType.ASI:
          case OutputType.AVP:
          case OutputType.MX8400:
          case OutputType.MX5600:
          case OutputType.NETVX:
          case OutputType.MNA:
          case OutputType.SELENIO:
          case OutputType.NET_PROCESSOR:
            this.outputTypes.push(outputType);
            break;
          case OutputType.ATSC3_UDP:
            this.outputTypes.push(outputType);
            if (atsc3TranslatedTransportEnabled) {
              this.outputTypes.push(OutputType.ATSC3_TRANSLATOR);
            }
            break;
        }
      });

    this.outputTypes = this.outputTypes.sort();
    this.outputTypes = this.outputTypes.sort((a: OutputType, b: OutputType) => {
      const aValue = OUTPUT_TYPES_VALUES[a].value;
      const bValue = OUTPUT_TYPES_VALUES[b].value;
      return (aValue < bValue) ? 1 : (aValue > bValue ? -1 : 0);
    });
    if (this.outputTypes.length === 0) {
      this.outputsTableComponent.disableButtons([ButtonType.ADD]);
    }
  }

  private onEncodeRow() {
    const outputIds: any[] = this.outputsTableComponent.selectedRowIds;
    if (outputIds?.length > 0) {
      const elementIds: ElementIds = new ElementIds(outputIds as number[]);
      this.subscriptions.push(
        this.outputService.encodeOutputs(elementIds).subscribe(
          () => {
            //        this.updateOutputsStatus();
          }));
    }
  }

  private onEnableDisable() {
    if (this.outputsTableComponent.selectedRowIds.length > 1) {
      this.onUpdateAllRows();
    } else if (this.outputsTableComponent.selectedRowIds.length === 1) {
      this.currentOutput = this.outputsTableComponent.selectedRow;
      this.currentOutput.onLine = !this.currentOutput.onLine;
      this.updateShowOutput();
      this.updateCurrentOutput();
      this.setButtonOnlineStatus();
    }
    this.updateDirty();
  }

  private updateCurrentOutput() {
    this.localOutputs = insertIntoElementList(this.localOutputs, this.currentOutput) as AbstractOutput[];
    this.updateAvailableASICardIds();
  }

  private setButtonOnlineStatus() {
    if (isDefined(this.outputsTableComponent)) {
      if (this.currentOutput.onLine) {
        this.outputsTableComponent.buttonImage = ImageType.disable;
        this.outputsTableComponent.buttonText = ButtonType.DISABLE;
      } else {
        this.outputsTableComponent.buttonImage = ImageType.enable;
        this.outputsTableComponent.buttonText = ButtonType.ENABLE;
      }
    }
  }

  private updateModalTitle() {
    this.modalTitle =
      (this.editMode ? 'Edit ' : 'Add ') + ' Output ' +
      (this.editMode ? ' - ' : '') +
      (this.editMode ? this.currentOutput.name : '');
  }

  private updateNameValid(): void {
    this.updateNameExists();
    this.nameValid = !this.nameExists && this.currentOutput?.name.length > 0;
    this.nameIconText = this.nameValid ? 'text-success' : 'text-danger';
  }

  private updateNameExists() {
    this.nameExists = isElementNameUnique(this.currentOutput, this.localOutputs, this.editMode);
  }

  private validateAddUpdateEnabled(): void {
    const forceNext = !this.editMode && this.initialPage;
    if (forceNext) {
      this.addUpdateEnabled = false;
    } else {
      this.addUpdateEnabled = this.nameValid && this.childOkEnabled;
    }
  }

  private setEncodeButtonEnabled() {
    if (!this.currentOutput.onLine && isDefined(this.outputsTableComponent)) {
      this.outputsTableComponent.disableButtons([ButtonType.ENCODE]);
    }
  }

  private createDefaultOutput(preserveFields: boolean): AbstractOutput {
    const outputExists = isDefined(this.currentOutput);
    const name = preserveFields && outputExists ? this.currentOutput.name : '';
    const onLine = preserveFields && outputExists ? this.currentOutput.onLine : false;
    const outputType = outputExists ? this.currentOutput.outputType :
      this.outputTypes.length > 0 ? this.outputTypes[0] : undefined;
    let defaultOutput: AbstractOutput;
    switch (outputType) {
      case OutputType.ATSC3_UDP:
        const defaultATSC3UDPOutput: DefaultATSC3UDPOutput = new DefaultATSC3UDPOutput(name, onLine);
        defaultATSC3UDPOutput.nic = this.clientNetworkSettingsModel.getDefaultTrafficNICName();
        defaultOutput = defaultATSC3UDPOutput;
        break;
      case OutputType.UDP:
        const defaultUDPOutput: DefaultUDPOutput = new DefaultUDPOutput(name, onLine);
        defaultUDPOutput.networkInterfaceName = this.clientNetworkSettingsModel.getDefaultTrafficNICName();
        defaultOutput = defaultUDPOutput;
        break;
      case OutputType.MNA:
        const defaultMNAOutput: DefaultMNAOutput = new DefaultMNAOutput(name, onLine);
        defaultMNAOutput.trafficNICName = this.clientNetworkSettingsModel.getDefaultTrafficNICName();
        defaultOutput = defaultMNAOutput;
        break;
      case OutputType.NETVX:
        defaultOutput = new DefaultNetVXOutput(name, onLine);
        break;
      case OutputType.SELENIO:
        defaultOutput = new DefaultSelenioOutput(name, onLine);
        break;
      case OutputType.TRIVENI:
        defaultOutput = new DefaultTriveniOutput(name, onLine);
        break;
      case OutputType.NET_PROCESSOR:
        defaultOutput = new DefaultNetProcessorOutput(name, onLine);
        break;
      case OutputType.AVP:
        defaultOutput = new DefaultAVPOutput(name, onLine);
        break;
      case OutputType.MX5600:
        defaultOutput = new DefaultMX5600Output(name, onLine);
        break;
      case OutputType.MX8400:
        defaultOutput = new DefaultMX8400Output(name, onLine);
        break;
      case OutputType.ATSC3_TRANSLATOR:
        const defaultATSC3TranslatorOutput = new DefaultATSC3TranslatorOutput(name, onLine);
        defaultATSC3TranslatorOutput.nic = this.clientNetworkSettingsModel.getDefaultTrafficNICName();
        defaultOutput = defaultATSC3TranslatorOutput;
        break;
      case OutputType.ASI:
        const defaultASIOutput: DefaultASIOutput = new DefaultASIOutput(name, onLine);
        defaultASIOutput.cardId = this.availableASICardIds?.length > 0 ? this.availableASICardIds[0] : undefined;
        defaultOutput = defaultASIOutput;
        break;

    }
    return defaultOutput !== undefined ? defaultOutput : new DefaultTriveniOutput(name, onLine);
  }

  private onViewOutputStatus() {
    this.modalName = '#viewOutputStatus';
    this.viewOutputStatusModal = true;
  }

  private updateShowOutput(): void {
    this.showATSC3Output = this.showATSC1UDP = this.showASIOutput = this.showHarrisSlotMuxOutput = this.showATSCTranslator =
      this.showPortAddressableOutput = this.showHarrisMNAOutput = false;
    console.log('updateShowOutput this.currentOutput.outputType: ', this.currentOutput.outputType, this.currentOutput);
    switch (this.currentOutput.outputType) {
      case OutputType.ATSC3_UDP:
        this.showATSC3Output = true;
        break;
      case OutputType.UDP:
        this.showATSC1UDP = true;
        break;
      case OutputType.ASI:
        this.showASIOutput = true;
        break;
      case OutputType.SELENIO:
      case OutputType.NETVX:
        this.showHarrisSlotMuxOutput = true;
        break;
      case OutputType.MNA:
        this.showHarrisMNAOutput = true;
        break;
      case OutputType.ATSC3_TRANSLATOR:
        this.showATSCTranslator = true;
        break;
      case OutputType.AVP:
      case OutputType.MX5600:
      case OutputType.MX8400:
      case OutputType.TRIVENI:
      case OutputType.NET_PROCESSOR:
        this.showPortAddressableOutput = true;
        break;

    }
  }

  private updateAvailableASICardIds(): void {
    this.availableASICardIds = this.allASICardIds.filter(cardId => !this.isASICardIDUsed(cardId));
  }

  private isASICardIDUsed(cardId: number): boolean {
    return isDefined(this.localOutputs?.find(output => {
      if (output.outputType === OutputType.ASI) {
        const asiOutput: ASIOutput = output as ASIOutput;
        return asiOutput.cardId === cardId;
      }
      return false;
    }));
  }

  private updateSelectableASICardIds(): void {
    if (this.currentOutput.outputType === OutputType.ASI) {
      const asiOutPut: ASIOutput = this.currentOutput as ASIOutput;
      this.selectableASICardIds = cloneDeep(this.availableASICardIds);
      if (this.editMode) {
        this.selectableASICardIds.unshift(asiOutPut.cardId);
      }

    }
  }

  private updateTranslateTableData() {
    this.translatedOutputData.find(tblOutput => this.currentOutput.id === tblOutput.id);
    const index = this.translatedOutputData.findIndex(tblOutput => this.currentOutput.id === tblOutput.id);
    if (index !== -1) {
      this.translatedOutputData[index].transportCount = getTransportCount(this.currentOutput);
    } else {
      const translatedOutput = new TranslatedOutput(this.currentOutput.id, 0, null);
      this.translatedOutputData.push(translatedOutput);
    }
    this.changeDetectorRef.detectChanges();
  }
}
