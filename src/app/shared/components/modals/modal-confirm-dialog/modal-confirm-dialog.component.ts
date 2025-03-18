/*
 * Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.
 */
import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {ConfirmMessageDialog, ImageType} from '../../../../core/models/ui/dynamicTable';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './modal-confirm-dialog.component.html',
  styleUrls: ['./modal-confirm-dialog.component.scss']
})
export class ModalConfirmDialogComponent {
  imageUrl: string;
  title: string;
  message: string;
F

  constructor(public dialogRef: MatDialogRef<ModalConfirmDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public confirmDialog: ConfirmMessageDialog) {
    this.imageUrl = confirmDialog.imageSrc as ImageType;
    this.title = confirmDialog.dialogTitle;
    this.message = confirmDialog.message;
  }

  onCancel(): void {
      this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
