/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractCommitRevertComponent } from '../../../../pages/main/abstracts/abstract-commit-revert.component';
import * as _swal from 'sweetalert';
import { SweetAlert } from 'sweetalert/typings/core';
const swal: SweetAlert = _swal as any;
@Component({
  selector: 'app-modal-commit-revert-dialog',
  templateUrl: './modal-commit-revert-dialog.component.html',
  styleUrls: ['./modal-commit-revert-dialog.component.scss']
})
export class ModalCommitRevertDialogComponent extends AbstractCommitRevertComponent implements OnInit {
  @Output() parentCommit = new EventEmitter<void>();
  @Output() parentRevert = new EventEmitter<void>();
  @Output() parentUpdateDirty = new EventEmitter<void>();
  @Input() dirty;

  constructor() {
    super();
  }
  ngOnInit(): void {
  }

  onCommit() {
    this.parentCommit.emit();
  }

  onRevert() {
    this.parentRevert.emit();
  }

  updateDirty() {
    this.parentUpdateDirty.emit();
  }
}
