// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {
  ActionMessage,
  ButtonType,
  ButtonTypes,
  buttonTypeToActionMessageMap,
  ConfirmMessageDialog,
  ImageType,
  MultipleTableColumns
} from '../../../../core/models/ui/dynamicTable';
import {MatDialog} from '@angular/material/dialog';
import {MatTableDataSource} from '@angular/material/table';
import {ModalConfirmDialogComponent} from '../modal-confirm-dialog/modal-confirm-dialog.component';
import * as _swal from 'sweetalert';
import {SweetAlert} from 'sweetalert/typings/core';
import {isDefined, isUndefined} from '../../../../core/models/dtv/utils/Utils';
import {MatPaginator} from '@angular/material/paginator';
import {convertDecToHex} from '../../../helpers/decimalToHexadecimal';
import {changeDateFormat} from '../../../helpers/appWideFunctions';
import {MatSort} from '@angular/material/sort';
import {cloneDeep} from 'lodash';

const swal: SweetAlert = _swal as any;

@Component({
  selector: 'app-modal-dynamic-tb-translate',
  templateUrl: './modal-dynamic-tb-translate.component.html',
  styleUrls: ['./modal-dynamic-tb-translate.component.scss']
})
export class ModalDynamicTbTranslateComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('fileInput', {static: false}) fileInput: ElementRef;
  @Input() tableData: any;
  @Input() translateTableData: any;
  @Input() tableHeaders: MultipleTableColumns[];
  @Input() tableDispHeaders: string[];
  @Input() objectTableType: string;
  @Input() buttonList: ButtonTypes[];
  @Input() pagination = false;
  @Input() enableSearch = false;
  @Input() multiSelect = false;
  @Input() enableScroll = false;
  @Input() enableSort = false;
  @Input() modalName: string;
  @Input() rowsPerPage = 10;
  @Input() tableMaxHeight = '380px';
  @Input() confirmDialog: ConfirmMessageDialog;
  @Input() objectTitle: string;
  @Input() showMoveRowSelection = false;
  rowIndex: number;
  // tslint:disable-next-line:ban-types
  @Input() getCellValue: Function;
  @Output() buttonClicked: EventEmitter<any> = new EventEmitter();
  @Output() rowClicked: EventEmitter<any> = new EventEmitter();
  // used when user needs to double-clicked row
  @ViewChild('editRow') editRow: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  dataSource: MatTableDataSource<any> = new MatTableDataSource([]);
  selectedRow: any;
  selectedRowValid: boolean;
  searchString: string;
  selectedRows: any[] = [];
  selectedRowIds: any[] = [];
  buttonImage = ImageType.disable;
  buttonText = ButtonType.DISABLE;
  currentIndex = 0;

  constructor(private cdr: ChangeDetectorRef, private dialog: MatDialog) {
    this.selectedRowValid = false;
  }


  public updateTranslateTableData(translateTableData: any): void {
    this.translateTableData = translateTableData;
    this.ngOnInit();
  }

  ngOnInit(): void {
    // show and hide specific columns from display, but keep it as a part of the actual json for DB purpose
    this.tableDispHeaders = this.tableHeaders
      .filter((col) => col.visible)
      .map((col) => col.key);
    if (this.translateTableData?.length > 0) {
      this.mergedData();
    } else {
      this.dataSource = new MatTableDataSource<any>(this.tableData);
    }
    this.defaultBtnToggle();
    this.setDefaultTableSelection();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.tableData) {
      if (this.translateTableData?.length > 0) {
        this.mergedData();
      } else {
        this.dataSource = new MatTableDataSource<any>(this.tableData);
      }
      this.enablePagination();
      this.updatePagination();
      if (changes?.hasOwnProperty('tableData')) {
        this.resetMultipleSelection();
        this.selectedRows = this.selectedRows
          .map(selectedRow => this.dataSource.data.find(row => row.id === selectedRow.id))
          .filter(Boolean);
      }
      this.defaultBtnToggle();
    }
    this.setDefaultTableSelection();
  }

  enablePagination() {
    if (this.dataSource.data.length > 10) {
      this.pagination = true;
      this.dataSource.paginator = this.paginator;
    }
  }

  selectRow(row: any, event: MouseEvent) {
    if (event.ctrlKey || event.metaKey) {
      if (this.multiSelect) {
        this.selectedRowValid = true;
        this.toggleRowSelection(row);
      }
    } else {
      const checkId = isDefined(row?.clientId) ? row?.clientId : row?.id;
      if (isDefined(checkId)) {
        // DO NOT REMOVE this change this is required for translate or secondary table else it will give fields from secondary table
        if (this.translateTableData?.length > 0) {
          this.selectedRow = this.tableData.find(
            serverData => serverData.id === row.id && serverData.clientId === row.clientId);
        } else {
          this.selectedRow = row;
        }


        this.selectedRowIds = [];
        this.selectedRowIds.push(checkId?.toString());
        this.selectedRows = [row];
        this.selectedRowValid = true;
        const rowIndex = this.dataSource.data.indexOf(row);
        if (this.selectedRowIds.length > 1) {
          this.setMultipleRowSelection();
        } else {
          this.setRowSelection(rowIndex);
        }
      }
    }
    this.currentIndex = this.tableData?.findIndex(
      index => index.id === this.selectedRow?.id && index.clientId === this.selectedRow?.clientId);
    this.defaultBtnToggle();
    if (this.selectedRowIds.length >= 1) {
      this.rowClicked.emit(this.selectedRow);
    }

    this.cdr.detectChanges();
  }

  rowIsSelected(row: {
    hasOwnProperty: (arg0: string) => any;
    clientId: { toString: () => any; };
    id: { toString: () => any; };
  }): boolean {
    const rowId = row?.hasOwnProperty('clientId') ? row?.clientId?.toString() : row?.id?.toString();
    if (this.selectedRowIds.length >= 1) {
      return this.selectedRowIds.includes(rowId);
    } else {
      return this.selectedRow === rowId;
    }
  }

  disableAllButtons() {
    const buttons = document.querySelectorAll('.actButton');
    buttons.forEach(button => {
      (button as HTMLButtonElement).disabled = true;
    });
  }

  /** this function allows clients to call this function to disable buttons based on Type
   * eg : this.dynamicTableComponent.disableButtons([ButtonType.DELETE]);
   *  should be used if you need to disable a button based on row selected also implement the
   *  rowClicked() in the dynamic class  and call the above as needed example in USER
   */
  public disableButtons(btnNames: string[]) {
    if (btnNames && btnNames.length > 0) {
      this.buttonList?.forEach(item => {
        if (btnNames.includes(item.name)) {
          const disableBtn = document.getElementById(item.name + '-' + this.objectTableType);
          if (disableBtn) {
            disableBtn.setAttribute('disabled', 'true');
          }
        }
      });
    }
  }

  defaultBtnToggle() {
    this.buttonList?.forEach((item) => {
      const buttons = document.getElementsByName(
        item.name + '-' + this.objectTableType) as NodeListOf<HTMLButtonElement>;

      buttons.forEach(button => {
        if (item.restricted) {
          button.disabled = true;
        } else {
          const serverIdValid = isDefined(this.selectedRow?.id) && this.selectedRow?.id > 0;
          const idValid = serverIdValid || !item.requiresServerId;
          if (item.alwaysEnabled) {
            button.disabled = false;
          } else if (this.dataSource.data.length === 0) {
            button.disabled = true;
          } else {
            if (this.selectedRowIds.length === 1) {
              button.disabled = !idValid;
            } else if (this.selectedRowIds.length > 1) {
              button.disabled = item.supportsMultiSelect ? !idValid : true;
            } else if (this.selectedRowIds.length === 0) {
              button.disabled = true;
            }
          }
        }
      });
    });
  }

  enableButtons(btnNames: string[]) {
    if (btnNames && btnNames.length > 0) {
      this.buttonList?.forEach(item => {
        if (btnNames.includes(item.name)) {
          const disableBtn = document.getElementById(item.name + '-' + this.objectTableType);
          if (disableBtn) {
            if (disableBtn.hasAttribute('disabled')) {
              disableBtn.removeAttribute('disabled');
            }
          }
        }
      });
    }
  }

  resetMultipleSelection() {
    this.buttonList?.forEach((item) => {
      const buttons = document.getElementsByName(
        item.name + '-' + this.objectTableType) as NodeListOf<HTMLButtonElement>;
      buttons.forEach(button => {
        if (this.selectedRowIds.length > 1 && isUndefined(item.supportsMultiSelect)) {
          button.disabled = true;
        }
      });
    });
    this.selectedRowIds = [];
    this.selectedRow = null;
    this.defaultBtnToggle();

  }

  isSelected(row: { index: number; }) {
    return row.index !== -1;
  }

  updateRow(type?: string) {
    if (isUndefined(this.selectedRow)) {
      this.invalidSelection();
    } else {
      const message = type === 'status' ? ActionMessage.STATUS : type === 'encode' ? ActionMessage.ENCODE : ActionMessage.EDIT;
      const objType = this.objectTableType;
      const data = {message, objType};
      this.buttonClicked.emit(data);
    }
  }

  enabledDisableData() {
    if (isUndefined(this.selectedRow)) {
      this.invalidSelection();
    } else {
      const message = ActionMessage.ENABLE_DISABLE;
      const data = {message};
      this.buttonClicked.emit(data);
      this.cdr.detectChanges();
    }
  }

  deleteRow() {
    if (isUndefined(this.selectedRow)) {
      this.invalidSelection();
    } else {
      if (isUndefined(this.confirmDialog)) {
        const message = ActionMessage.DELETE;
        const record = this.selectedRow;
        const data = {message, record};
        this.buttonClicked.emit(data);
      } else {
        const dialogRef = this.dialog.open(ModalConfirmDialogComponent, {data: this.confirmDialog});
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            const message = ActionMessage.DELETE;
            const record = this.selectedRow;
            const data = {message, record};
            this.buttonClicked.emit(data);
          }
        });
      }
    }
    localStorage.removeItem(this.objectTableType);
  }

  invalidSelection() {
    setTimeout(() => {
      swal('', 'Please select a row to Edit', 'error');
    }, 100);
  }

  applyFilter() {
    this.dataSource.filter = this.searchString.trim().toLowerCase();
  }

  enableSorting() {
    if (this.enableSort) {
      this.dataSource.sort = this.sort;
    }
  }

  ngAfterViewInit() {
    this.enableSorting();
    if (!this.enableScroll) {
      this.updatePagination();
    }
    this.defaultBtnToggle();
    if (this.dataSource?.data?.length > 0) {
      this.setDefaultTableSelection();
    }
  }

  updatePagination() {
    if (this.dataSource.data.length > this.rowsPerPage) {
      this.pagination = true;
      this.dataSource.paginator = this.paginator;
    }
  }

  doubleClickUpdateRow() {

    if (this.editRow && this.editRow.nativeElement) {
      this.editRow.nativeElement.click();
    }
  }

  convertDecToHexComponent(val: string) {
    return ' 0x' + convertDecToHex(val);
  }

  convertBtnToMessageType(buttonType: string) {
    return buttonTypeToActionMessageMap[buttonType];
  }

  setMessageType(buttonType: string, e: Event) {
    console.log(buttonType);
    // added code block to clear file input on import click to trigger on change
    const eventPointer = e as PointerEvent;
    // if (eventPointer?.pointerType === 'mouse' && buttonType === ButtonType.IMPORT) {
    //    clearFileImportInput(this.fileInput.nativeElement, true);
    //  }

    let message: ActionMessage = this.convertBtnToMessageType(buttonType);
    if (e !== null) {
      message = ActionMessage.IMPORT;
    }
    const data = {message, e};
    this.buttonClicked.emit(data);
    this.cdr.detectChanges();
  }

  getNestedValue(obj: any, path: string): any {
    const parts = path.split('.');
    return parts.reduce((elem, current) => elem && elem[current], obj);
  }

  getCount(elementObject: string | any[]) {
    return elementObject !== null ? elementObject.length : 0;
  }

  ngOnDestroy(): void {
  }

  convertDate(val: string) {
    return changeDateFormat(val);
  }

  moveToNextRow() {
    if (this.currentIndex < this.dataSource.data.length - 1) {
      this.currentIndex++;
      this.selectedRow = this.dataSource.data[this.currentIndex];
    }
    this.cdr.detectChanges();
    this.setRowSelection(this.currentIndex);
  }

  moveToPreviousRow() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.selectedRow = this.dataSource.data[this.currentIndex];
    }
    this.cdr.detectChanges();
    this.setRowSelection(this.currentIndex);
  }

  setModalName(actionType: string) {
    let modalName = '';
    if (actionType === 'Remove') {
      modalName = '#confirmModal';
    } else if (actionType === 'Add' || actionType === 'Edit') {
      // actionType === 'Status' || actionType === 'Encode' - removed momentarily since the data target is set to show the add/edit modal
      // Added status/encode to allow the logic for other pages designed by code dev to work TODO check if needed still
      modalName = this.modalName;
    }
    return modalName;
  }

  setDefaultTableSelection() {
    this.rowIndex = this.getRowSelection();

    if (isDefined(this.rowIndex)) {
      this.currentIndex = this.rowIndex;
    } else {
      this.currentIndex = 0;
    }
    this.selectedRow = this.dataSource.data[this.currentIndex];
    this.selectedRowIds.push(this.selectedRow?.id);
    this.selectedRowValid = true;
    this.selectRow(this.selectedRow, new MouseEvent('click'));

  }

  toggleRowSelection(row: any): void {
    const checkId = row?.hasOwnProperty('clientId') ? row.clientId : row.id;
    const index = this.selectedRowIds.indexOf(checkId);

    if (index >= 0) {
      this.selectedRowIds.splice(index, 1);
      this.selectedRows.splice(index, 1);
    } else {
      this.selectedRowIds.push(checkId);
      this.selectedRows.push(row);
    }
    this.selectedRowValid = true;
  }

  // Added this method to handle row deselection as of now it works unless we need a special case
  deselectRow(row: any): void {
    const index = this.selectedRows.indexOf(row);
    if (index >= 0) {
      this.selectedRowIds.splice(index, 1);
    }
  }

  isHighlighted(row: any): boolean {
    return this.selectedRows.includes(row);
  }

  mergedData() {
    const mergedData = this.tableData.map((item1: { id: number; clientId: string; }) => {
      const item2 = this.translateTableData.find((item: { id: number; clientId: string; }) => {
        return (item1.id === -1 && item1.clientId === item.clientId) || (item1.id === item.id && item1.id !== -1);
      });
      return {...item1, ...item2};
    });
    this.dataSource = new MatTableDataSource<any>(mergedData);
  }

  // set localstorage row selection based on table type
  setRowSelection(rIndex: number): void {
    localStorage.setItem(this.objectTableType, String(rIndex));
  }

  // set localstorage multiple row selection based on table type
  setMultipleRowSelection(): void {
    const rowIndices = this.selectedRows.map(row => this.dataSource.data.indexOf(row));
    localStorage.setItem(this.objectTableType, JSON.stringify(rowIndices));
  }

  // get localstorage row selection based on table type
  getRowSelection() {
    const localStorageValue = localStorage.getItem(this.objectTableType);
    return localStorageValue !== null ? JSON.parse(localStorageValue) : 0;
  }

  moveRowUp() {
    if (this.currentIndex > 0) {
      const previousIndex = this.currentIndex - 1;
      [this.dataSource.data[this.currentIndex], this.dataSource.data[previousIndex]] =
        [this.dataSource.data[previousIndex], this.dataSource.data[this.currentIndex]];

      // Update the index
      this.currentIndex--;
      this.dataSource._updateChangeSubscription();
      this.setRowSelection(this.currentIndex);
    }
  }

  moveRowDown() {
    if (this.currentIndex < this.dataSource.data.length - 1) {
      const nextIndex = this.currentIndex + 1;
      [this.dataSource.data[this.currentIndex], this.dataSource.data[nextIndex]] =
        [this.dataSource.data[nextIndex], this.dataSource.data[this.currentIndex]];
      this.currentIndex++;
      this.dataSource._updateChangeSubscription();
      this.setRowSelection(this.currentIndex);
    }
  }

  deleteRows() {
    const selectedRowIds = new Set(
      this.selectedRows.map(row => (row.id > 0 ? row.id : row.clientId).toString())
    );
    this.dataSource.data = this.dataSource.data.filter((tbData) => {
      const idToCheck = tbData.id > 0 ? tbData.id.toString() : tbData.clientId.toString();
      const isMatch = selectedRowIds.has(idToCheck);
      return !isMatch;
    });
    this.cdr.detectChanges();
    this.setRowSelection(0);
    return this.dataSource.data;
  }

  onActionButtonClicked(button, $event) {
    if (button.name.includes('UpdateRow')) {
      this.enabledDisableData();
    } else if (button.name.includes('Remove')) {
      this.deleteRow();
    } else if (button.name.includes('Import') || button.name.includes('Add File')) {
      this.setMessageType(button.name, $event);
    } else {
      this.setMessageType(button.name, null);
    }
  }


  disableEnableRows(fieldName: string) {
    const selectedRowIds = new Set(
      this.selectedRows.map(row => (row.id > 0 ? row.id : row.clientId).toString())
    );
    if (selectedRowIds.size === 0) {
      return;
    }
    const localDataCopy = cloneDeep(this.tableData);
    const firstRouteID = Array.from(selectedRowIds)[0];
    const firstSelectedRow = localDataCopy.find(tbData => {
      return firstRouteID > 0
        ? tbData.id === Number(firstRouteID)
        : tbData.clientId === String(firstRouteID);
    });

    if (firstSelectedRow) {
      const newEnabledState = !firstSelectedRow[fieldName];
      selectedRowIds.forEach(selectID => {
        localDataCopy.forEach(tData => {
          if (tData.id > 0 && tData.id === Number(selectID)) {
            tData[fieldName] = newEnabledState;
          } else if (tData.clientId === selectID) {
            tData[fieldName] = newEnabledState;
          }
        });
      });
    }
    return localDataCopy;
  }
}
