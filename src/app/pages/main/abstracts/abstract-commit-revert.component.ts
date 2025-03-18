// Copyright (c) 2023 Triveni Digital, Inc. All rights reserved.

import {CommitRevertInterface} from './commit-revert.interface';
import {Subscription} from 'rxjs';

export abstract class AbstractCommitRevertComponent implements CommitRevertInterface {
  dirty = false;
  commit = false;
  hidden = false;
  protected subscriptions: Subscription [] = [];

  abstract onCommit();

  abstract onRevert();

  abstract updateDirty();

  openCommitRevertModal(commit: boolean) {
    this.commit = commit;
  }

  protected cleanUpSubscriptions(): void {
    this.subscriptions?.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }
}
