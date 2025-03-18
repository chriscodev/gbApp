// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.


export interface ProgressBarDataInterface { fileName?: string; progress?: number; loaded?: number; total?: number; type?: ProgressBarType; options?: string; resultReturn?: any }

export enum ProgressBarType{
  IMPORT= 'import',
  EXPORT= 'export',
  DOWNLOAD = 'download',
  ERROR = 'error'
}
