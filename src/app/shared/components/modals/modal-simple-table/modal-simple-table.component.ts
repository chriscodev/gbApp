/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

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
  ButtonTypes,
  buttonTypeToActionMessageMap,
  ConfirmMessageDialog,
  MultipleTableColumns
} from '../../../../core/models/ui/dynamicTable';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatDialog} from '@angular/material/dialog';
import {isUndefined} from '../../../../core/models/dtv/utils/Utils';
import {SweetAlert} from 'sweetalert/typings/core';
import * as _swal from 'sweetalert';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort, MatSortModule, Sort} from '@angular/material/sort';

const swal: SweetAlert = _swal as any;

@Component({
  selector: 'app-modal-simple-table',
  templateUrl: './modal-simple-table.component.html',
  styleUrls: ['./modal-simple-table.component.scss'],
})
export class ModalSimpleTableComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() tableData: any;
  @Input() tableHeaders: MultipleTableColumns[];
  @Input() tableDispHeaders: string[];
  @Input() buttonList: ButtonTypes[];
  @Input() objectTableType: string;
  @Input() enableSearch = false;
  @Input() enableScroll = false;
  @Input() pagination = false;
  @Input() modalName: string;
  @ViewChild('editRow') editRow: ElementRef;
  @ViewChild(MatSort) sort: MatSort;
  @Output() buttonClicked: EventEmitter<any> = new EventEmitter();
  @Input() columnIdentifier = '';
  @Input() multiSelect = false;
  @Input() confirmDialog: ConfirmMessageDialog;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Input() rowsPerPage = 10;
  @Input() objectTitle = '';
  @Input() tableMaxHeight = '380px';
  @Input() tableSortDisabled: boolean;
  dataSource: MatTableDataSource<any> = new MatTableDataSource([]);

  currentIndex = 0;
  selectedRows: any[] = [];
  selectedRow: any;
  selectedRowValid: boolean;
  searchString: string;
  checkerBox = false;

  constructor(private cdr: ChangeDetectorRef, private dialog: MatDialog) {
    this.selectedRowValid = false;
  }

  ngOnInit(): void {
    this.tableDispHeaders = this.tableHeaders
      .filter((col) => col.visible)
      .map((col) => col.key);
    this.columnIdentifier = this.getFirstColumnName();
    this.dataSource = new MatTableDataSource<any>(this.tableData);
    this.selectedRowValid = false;
    this.setDefaultTableSelection();

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.tableData) {
      this.dataSource = new MatTableDataSource<any>(this.tableData);
      this.enablePagination();
      this.updatePagination();
      this.setDefaultTableSelection();
      this.dataSource.sort = this.sort;
    }
  }

  // Search Function for table
  applyFilter() {
    this.dataSource.filter = this.searchString.trim().toLowerCase();
  }

  selectRow(row, event) {
    if (isUndefined(row)) {
      this.selectedRow = null;
      this.selectedRowValid = false;
      this.selectedRows = [];
    } else {
      this.currentIndex = this.dataSource.data.indexOf(row);
      this.selectedRow = row;
      this.selectedRowValid = true;
      this.setRowSelection(row[this.columnIdentifier]);
      const index = this.selectedRows.indexOf(row);
      if (index === -1) {
        this.selectedRows = [row];
      }
    }
  }

  rowIsSelected(row) {
    return row ? row[this.columnIdentifier] : undefined;
  }

  isSelected(row) {
    return row.index !== -1;
  }

  invalidSelection() {
    setTimeout(() => {
      swal('', 'Please select a row to Edit', 'error');
    }, 100);
  }

  setMessageType(buttonType) {
    if (isUndefined(this.selectedRow)) {
      this.invalidSelection();
    } else {
      const message: ActionMessage = this.convertBtnToMessageType(buttonType);
      console.log('ActionType in setMessageType: ' + message);
      const data = {message};
      this.buttonClicked.emit(data);
      this.cdr.detectChanges();
    }
  }

  updateZip() {
    const message = ActionMessage.UPDATE_ZIP;
    const data = {message};
    this.buttonClicked.emit(data);
    this.cdr.detectChanges();
  }

  convertBtnToMessageType(buttonType) {
    return buttonTypeToActionMessageMap[buttonType];
  }

  isHighlighted(row: any): boolean {
    return this.selectedRows.includes(row);
  }

  doubleClickUpdateRow() {
    const message = ActionMessage.EDIT;
    const data = {message};
    this.editRow.nativeElement.click();
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy DYNAMIC TABLE');
  }

  getFirstColumnName(): string | undefined {
    if (this.tableHeaders && this.tableHeaders.length > 0) {
      return this.tableHeaders[0].key;
    }
    return undefined;
  }

  setDefaultTableSelection() {
    const lastAccessedRowIndex = this.getRowSelection();
    const rowWithoutId = this.tableData.find(row => !row.id);
    let index = rowWithoutId;
    if (lastAccessedRowIndex?.length > 0) {
      index = lastAccessedRowIndex;
      this.selectedRow = this.tableData.find(row => row[this.columnIdentifier] === lastAccessedRowIndex);
    } else {
      this.selectedRow = rowWithoutId;
    }
    if (index !== -1) {
      this.selectRow(this.selectedRow, new MouseEvent('click'));
      this.selectedRowValid = true;
    } else {
      this.selectedRowValid = false;
    }
  }

  enablePagination() {
    if (this.pagination) {
      this.pagination = true;
      this.dataSource.paginator = this.paginator;
    }
  }

  updatePagination() {
    if (this.pagination) {
      this.dataSource.paginator = this.paginator;
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.enablePagination();
    this.updatePagination();

  }

  setRowSelection(rIndex: string): void {
    console.log('Simple Template Local storage set for:  ' + this.objectTableType + ' -- ' + rIndex);
    localStorage.setItem(this.objectTableType, rIndex);
  }

  getRowSelection() {
    const localStorageValue = localStorage.getItem(this.objectTableType);
    console.log(this.objectTableType + ' Local Storage row selected :- ' + localStorageValue);
    return localStorageValue !== null ? localStorageValue : '';
  }

  sortTable(sortState: Sort){
    console.log('sortTable', sortState);
  }

  updateMasterCheckbox(){
  }

  toggleAll(event: any): void {
    console.log('toggleAll', event.target.checked);
    this.dataSource.data.forEach(row => (row.sendEmailEnabled = event.target.checked));
    const data = 'toggleAll';
    this.buttonClicked.emit(data);
  }

  resetCheckerBox(){
    this.checkerBox = false;
  }
}
