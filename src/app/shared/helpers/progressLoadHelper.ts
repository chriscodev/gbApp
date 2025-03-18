/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {ProgressBarType} from '../../core/interfaces/ProgressBarDataInterface';


export function progressLoader(loaded: number, total: number, fileName?: string, type?: ProgressBarType) {
  const progress = Math.round((100 * loaded) / total);
  return {loaded, total, progress, fileName, type};
}
