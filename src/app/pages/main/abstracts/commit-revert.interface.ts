// Copyright (c) 2023 Triveni Digital, Inc. All rights reserved.

export interface CommitRevertInterface {
  onCommit();

  onRevert();

  openCommitRevertModal(commit: boolean);

  updateDirty();
}
