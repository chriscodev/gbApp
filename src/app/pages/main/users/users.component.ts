// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {validateAlphanumeric} from '../../../shared/helpers/alphaNumericValidator';
import {PrivilegeLevel, SELECTABLE_PRIVILEGE_LEVELS, User} from '../../../core/models/server/User';
import {ClientUsersModel} from '../../../core/models/ClientUsersModel';
import {AbstractCommitRevertComponent} from '../abstracts/abstract-commit-revert.component';
import {cloneDeep, isEqual} from 'lodash';
import {
  ActionMessage,
  ButtonType,
  ButtonTypes,
  ImageType,
  MultipleTableColumns
} from '../../../core/models/ui/dynamicTable';
import {
  ModalDynamicTbTranslateComponent
} from '../../../shared/components/modals/modal-dynamic-tb-translate/modal-dynamic-tb-translate.component';
import {ComponentCanDeactivate} from '../../../core/guards/canDeactivateGuard';
import {ClickEvent} from '../../../core/interfaces/interfaces';
import {deleteElementList, isElementIdMatch, updateElementList} from '../../../core/models/AbstractElement';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  providers: [],
})
export class UsersComponent extends AbstractCommitRevertComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
  @ViewChild(ModalDynamicTbTranslateComponent) usersTableComponent: ModalDynamicTbTranslateComponent;
  public title = 'Add User';
  public nameIconText: string;
  public passwordIconText: string;
  public iconText: string;
  public showPassword = false;
  public editMode = false;
  public editableUser = false;
  public okEnabled = false;
  public privilegeLevels = SELECTABLE_PRIVILEGE_LEVELS;
  public currentUser: User = new User('', '', PrivilegeLevel.Admin);
  public modalName = '#usersModal';
  public buttonList: ButtonTypes[] = [
    {name: ButtonType.ADD, imgSrc: ImageType.add, alwaysEnabled: true},
    {name: ButtonType.DELETE, imgSrc: ImageType.delete},
    {name: ButtonType.EDIT, imgSrc: ImageType.edit}
  ];
  public tableHeaders: MultipleTableColumns[] = [
    {header: 'ID', key: 'id', visible: false},
    {header: 'Username', key: 'name', visible: true},
    {header: 'Privilege', key: 'privilegeLevel', visible: true}
  ];
  public localUsers: User[] = [];
  private serverUsers: User[] = [];
  private nameValid: boolean;
  private passwordValid: boolean;

  constructor(private userModel: ClientUsersModel) {
    super();
  }

  public ngOnInit(): void {
    this.subscriptions.push(this.userModel.users$.subscribe((users: User[]) => {
      // TODO if dirty, warn user
      this.updateUsers(users);
      this.updateSettingsValid();
    }));
  }

  public ngOnDestroy(): void {
    this.cleanUpSubscriptions();
  }

  public onRevert() {
    this.loadServerUsers();
  }

  public onCommit() {
    this.userModel.update(this.localUsers).then(() => this.dirty = false);
  }

  public updateDirty() {
    this.dirty = !isEqual(this.localUsers, this.serverUsers);
  }

  public addUpdateCurrentUser() {
    this.localUsers = updateElementList(this.localUsers, this.currentUser, this.editMode) as User[];
    this.updateDirty();
  }

  public onButtonClicked($event: ClickEvent) {
    switch ($event.message) {
      case ActionMessage.ADD:
        this.onAddRow();
        break;
      case ActionMessage.EDIT:
        this.onEditRow();
        break;
      case ActionMessage.DELETE:
        this.onDeleteRows();
        break;
    }
  }

  public inputSettings(): void {
    this.updateSettingsValid();
  }

  public canDeactivate(): boolean {
    return !this.dirty;
  }

  public toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  public checkAlphanumeric(event: any): boolean {
    return validateAlphanumeric(event);
  }

  public rowClicked(row: any) {
    if (row.privilegeLevel === PrivilegeLevel.Admin && this.getAdminUserCount() === 1) {
      this.usersTableComponent?.disableButtons([ButtonType.DELETE]);
    }
  }

  private updateSettingsValid(): void {
    this.updateNameValid();
    this.updatePasswordValid();
    this.updateOkEnabled();
  }

  private updateNameValid(): void {
    const userExist = this.localUsers.find(user => {
      const idMatch = isElementIdMatch(user, this.currentUser);
      const nameMatch = user.name === this.currentUser?.name || this.currentUser?.name === 'super';
      return this.editMode && idMatch ? false : nameMatch;
    });
    this.nameValid = !userExist && this.currentUser?.name?.length > 0;
    this.nameIconText = this.nameValid ? 'text-success' : 'text-danger';
  }

  private updatePasswordValid() {
    this.passwordValid = this.currentUser?.password?.length > 0;
    this.passwordIconText = this.passwordValid ? 'text-success' : 'text-danger';
  }

  private onAddRow(): void {
    this.editMode = false;
    this.editableUser = true;
    this.currentUser = new User('', '', PrivilegeLevel.Admin);
    this.title = 'Add User';
    this.updateSettingsValid();
  }

  private onEditRow(): void {
    this.editMode = true;
    this.currentUser = cloneDeep(this.usersTableComponent.selectedRow);
    this.editableUser = !(this.currentUser?.id > 0);
    this.title = 'Edit User - ' + this.currentUser.name;
    this.updateSettingsValid();
  }

  private onDeleteRows(): void {
    this.multipleDeletion();
    this.updateDirty();
  }

  private multipleDeletion() {
    this.localUsers = deleteElementList(this.localUsers, this.usersTableComponent) as User[];
  }

  private loadServerUsers() {
    this.updateUsers(this.userModel.usersSubject.getValue());
  }

  private updateUsers(users: User[]) {
    this.serverUsers = cloneDeep(users);
    this.localUsers = cloneDeep(this.serverUsers);
    this.updateDirty();
  }

  private getAdminUserCount(): number {
    return this.localUsers.filter((user: User) => user.privilegeLevel === PrivilegeLevel.Admin).length;
  }

  private updateOkEnabled(): void {
    this.okEnabled = this.nameValid && this.passwordValid;
  }
}
