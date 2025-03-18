// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.
import {cloneDeep} from 'lodash';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {
  ActionMessage,
  ButtonType,
  ButtonTypes,
  ImageType,
  MultipleTableColumns
} from '../../../../../../../../core/models/ui/dynamicTable';
import {
  ModalDynamicTbTranslateComponent
} from '../../../../../modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {
  AbstractExtension,
  BondedBSIDsExtension,
  DefaultBondedBSIDsExtension,
  EXTENSION_TYPES,
  ExtensionType,
} from '../../../../../../../../core/models/dtv/network/Extension';
import {isDefined} from '../../../../../../../../core/models/dtv/utils/Utils';
import {ATSC3Transport} from '../../../../../../../../core/models/dtv/network/physical/Transport';
import {updateElementList} from '../../../../../../../../core/models/AbstractElement';
import {BootstrapFunction} from '../../../../../../../../core/interfaces/interfaces';

declare var $: BootstrapFunction;

@Component({
  selector: 'app-modal-transport-select-extension-type',
  templateUrl: './modal-transport-select-extension-type.component.html',
  styleUrls: ['./modal-transport-select-extension-type.component.scss']
})
export class ModalTransportSelectExtensionTypeComponent implements OnChanges, OnInit {
  @Input() atsc3TransportStream: ATSC3Transport;
  @Output() tableExtensionsChanged: EventEmitter<AbstractExtension[]> = new EventEmitter();
  @ViewChild(ModalDynamicTbTranslateComponent) tableExtensionsDynamicTable: ModalDynamicTbTranslateComponent;
  public readonly modalName = '#modalSelectExtensionType';
  public readonly modalTitle = 'Add Transport Extensions';
  public objectTableType = 'TableExtensions';
  public buttonList: ButtonTypes[] = [
    {name: ButtonType.ADD, imgSrc: ImageType.add, alwaysEnabled: true},
    {name: ButtonType.EDIT, imgSrc: ImageType.edit},
    {name: ButtonType.DELETE, imgSrc: ImageType.delete, supportsMultiSelect: true},
  ];
  public tableHeaders: MultipleTableColumns[] = [
    {header: 'Type', key: 'displayBsids', visible: true, showImg: '&#x1f517;', translateField: true}
  ];
  public readonly EXTENSION_TYPES = EXTENSION_TYPES;
  public extensionTypes: ExtensionType[] = Object.values(ExtensionType);
  public localTableExtensions: AbstractExtension[];
  public localBSIDExtensionTypes: TranslatedBSIDExtensionType[] = [];
  public editMode: boolean;
  public localBSIDExtension: BondedBSIDsExtension = new DefaultBondedBSIDsExtension();

  constructor(private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.extensionTypes = [];
    this.extensionTypes.push(ExtensionType.BONDED_BSIDS);
    this.updateLocalBSIDExtensionTypes();

  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (isDefined(changes.extensions?.currentValue)) {
      this.localTableExtensions = cloneDeep(changes.extensions.currentValue);
      this.updateLocalBSIDExtensionTypes();
      this.cdr.detectChanges();
    }
    if (isDefined(changes.editMode?.currentValue)) {
      this.editMode = changes.editMode.currentValue;
    }
  }

  public bondedBSIDsExtensionChangedHandler(updateBondedBSIDsExtension: BondedBSIDsExtension): void {
    console.log('tableExtensionsChangedHandler bondedBSIDsExtensionChanged: ', updateBondedBSIDsExtension);
    this.localBSIDExtension = updateBondedBSIDsExtension;
    this.addUpdateExtension();
    this.updateLocalBSIDExtensionTypes();
    this.tableExtensionsChanged.emit(this.localTableExtensions);
  }

  public closeModal() {
    $('#modalSelectExtensionType').modal('hide');
  }

  public addUpdateBondedBSID(): void {
    this.closeModal();
    $('#modalAddBondedBSID').modal('show');
  }

  public onButtonClicked($event): void {
    switch ($event.message) {
      case ActionMessage.ADD:
        this.onAddRow();
        break;
      case ActionMessage.EDIT:
        this.onEditRow();
        break;
      case ActionMessage.DELETE:
        this.onDeleteRow();
        break;
    }
    this.cdr.detectChanges();
  }

  public onRowClicked(extension: AbstractExtension): void {
   this.buttonDisableEnable();
  }

  public buttonDisableEnable(){
    if (this.tableExtensionsDynamicTable?.dataSource.data?.length === 0) {
      this.tableExtensionsDynamicTable?.enableButtons([ButtonType.ADD]);
    } else {
      this.tableExtensionsDynamicTable?.disableButtons([ButtonType.ADD]);
      console.log('TE onRowClicked disabled Add');
    }
    this.cdr.detectChanges();
  }

  private onAddRow() {
    this.editMode = false;
    this.localBSIDExtension = new DefaultBondedBSIDsExtension();
    $('#modalSelectExtensionType').modal('show');
  }

  private onEditRow() {
    this.editMode = true;
    this.localBSIDExtension = this.tableExtensionsDynamicTable.selectedRow;
    $('#modalAddBondedBSID').modal('show');
  }

  private onDeleteRow() {
    this.multipleDeletion();
    if (this.localTableExtensions?.length === 0) {
      this.tableExtensionsDynamicTable?.enableButtons([ButtonType.ADD]);
    }
    this.tableExtensionsChanged.emit(this.localTableExtensions);
  }

  private multipleDeletion() {
    if (this.tableExtensionsDynamicTable.selectedRowIds.length > 0) {
      for (let i = 0; i < this.tableExtensionsDynamicTable.selectedRowIds.length; i++) {
        const selectID = this.tableExtensionsDynamicTable?.selectedRowIds[i];
        this.localTableExtensions = this.localTableExtensions.filter((extension) => {
          const idMatch = extension.id.toString() === selectID.toString();
          const clientIdMatch = extension.clientId === selectID.toString();
          return idMatch && clientIdMatch;
        });
      }
    } else {
      this.localTableExtensions = this.localTableExtensions.filter(
        extension => extension.clientId !== this.tableExtensionsDynamicTable.selectedRow.clientId);
    }
    this.atsc3TransportStream.extensions = this.localTableExtensions;
    this.updateLocalBSIDExtensionTypes();
  }

  private addUpdateExtension() {
    this.localTableExtensions = updateElementList(this.localTableExtensions, this.localBSIDExtension,
      this.editMode) as AbstractExtension[];
    this.atsc3TransportStream.extensions = this.localTableExtensions;
    this.updateLocalBSIDExtensionTypes();

  }

  private updateLocalBSIDExtensionTypes(): void {
    this.localBSIDExtensionTypes = [];
    this.localTableExtensions = this.atsc3TransportStream.extensions as BondedBSIDsExtension[];
    this.localTableExtensions.forEach(extension => {
      const bsidExtension: BondedBSIDsExtension = extension as BondedBSIDsExtension;
      const extensionType = EXTENSION_TYPES[bsidExtension.type];
      const bsidsDispString = extensionType.displayName + ' (' + bsidExtension.bondedBsids + ')';
      const bsidsString = bsidExtension.bondedBsids;
      this.localBSIDExtension.displayBsids = bsidsDispString;
      this.localBSIDExtensionTypes.push(
        new TranslatedBSIDExtensionType(bsidExtension.id, bsidsDispString, bsidsString));
    });
  }

}


export class TranslatedBSIDExtensionType {
  public constructor(public id: number, public displayBsids: string, public bondedBsids: string) {
  }
}
