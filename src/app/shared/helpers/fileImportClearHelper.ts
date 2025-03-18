// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {isDefined} from '../../core/models/dtv/utils/Utils';

export function clearFileImportInput(fileInput: HTMLInputElement, fileClick = true){
  if (isDefined(fileInput?.value)){
    fileInput.value = '';
  }
  if (fileClick){
    fileInput.click();
  }
}
