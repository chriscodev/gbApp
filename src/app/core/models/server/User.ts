// Copyright (c) 2023-2024 Triveni Digital, Inc. All rights reserved.

import {AbstractElement} from '../AbstractElement';
import {AbstractCommitUpdate} from '../CommitUpdate';
import {v4 as uuidv4} from 'uuid';

export enum PrivilegeLevel {
  Admin = 'Admin',
  Program_Editor_Only = 'Program Editor Only',
  API = 'API',
  Readonly = 'Readonly'
}

export const SELECTABLE_PRIVILEGE_LEVELS: PrivilegeLevel[] = [PrivilegeLevel.Admin, PrivilegeLevel.API, PrivilegeLevel.Readonly];

export class User extends AbstractElement {
  constructor(public name: string, public password: string, public privilegeLevel: PrivilegeLevel, public id?: number) {
    super(id, 'User-' + uuidv4());
  }
}

export class UsersUpdate extends AbstractCommitUpdate<User> {
  constructor(public added: User[], public updated: User[], public deleted: number[]) {
    super(added, updated, deleted);
  }
}
