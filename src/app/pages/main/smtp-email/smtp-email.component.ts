// Copyright (c) 2024-2025 Triveni Digital, Inc. All rights reserved.

import {Component, OnDestroy, OnInit} from '@angular/core';
import {cloneDeep, isEqual} from 'lodash';
import {DefaultSmtpSettings, SmtpSettings, SmtpTestMessage} from 'src/app/core/models';
import {AbstractCommitRevertComponent} from '../abstracts/abstract-commit-revert.component';
import {SmtpEmailService} from '../../../core/services/smtp-email.services';
import {ClientSmtpModel} from '../../../core/models/ClientSmtpModel';
import {Observable} from 'rxjs';
import {ComponentCanDeactivate} from '../../../core/guards/canDeactivateGuard';
import {isEmptyValue} from '../../../core/models/dtv/utils/Utils';

@Component({
  selector: 'app-smtp-email',
  templateUrl: './smtp-email.component.html',
  styleUrls: ['./smtp-email.component.scss'],
})
export class SmtpEmailComponent extends AbstractCommitRevertComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
  public localSmtpSettings: SmtpSettings = new DefaultSmtpSettings();
  public editSmtpSettings: SmtpSettings;
  public showPassword: boolean;
  public enableTestButton: boolean;
  public enableTestEmailButton: boolean;
  public enableUpdateButton: boolean;
  public testRecipients: string;
  public requestStatusTest: boolean;
  public alertTestMessage: string;
  public emailTestMessage: string;
  private validHost: boolean;
  private validPort: boolean;
  private validUsername: boolean;
  private validPassword: boolean;
  private validFrom: boolean;
  private validTo: boolean;
  private validRecipient: boolean;
  private readonly emailRegExp: RegExp = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
  private serverSmtpSettings: SmtpSettings;

  constructor(
    private smtpClientModel: ClientSmtpModel,
    private smtpEmailService: SmtpEmailService
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscriptions.push(this.smtpClientModel.smtpEmail$.subscribe((smtpSettings) => {
      // TODO if dirty, display timed out dialog explaining dirty changes will be lost
      console.log('smtpSettings', smtpSettings);
      this.updateSmtpSettings(cloneDeep(smtpSettings));
    }));
  }

  ngOnDestroy() {
    this.cleanUpSubscriptions();
  }

  public onCommit() {
    this.smtpClientModel.update(this.localSmtpSettings).then();
  }

  public onRevert() {
    this.updateSmtpSettings(this.smtpClientModel.getSmtpSettings());
  }

  public updateDirty() {
    this.dirty = !isEqual(this.localSmtpSettings, this.serverSmtpSettings);
  }

  public checkHostValid(): string {
    return this.getValidIcon(this.validHost);
  }

  public checkPortValid(): string {
    return this.getValidIcon(this.validPort);
  }

  public checkUsernameValid(): string {
    return this.getValidIcon(this.validUsername);
  }

  public checkPasswordValid(): string {
    return this.getValidIcon(this.validPassword);
    // const eyeType = !this.showPassword ? 'fr fa fa-eye' : 'fr fa fa-eye-slash';
    // return eyeType + (this.validPassword ? ' text-success' : ' text-danger');
  }

  public checkFromValid(): string {
    return this.getValidIcon(this.validFrom);
  }

  public checkToValid(): string {
    return this.getValidIcon(this.validTo);
  }

  public checkRecipientValid(): string {
    return this.getValidIcon(this.validRecipient);
  }

  public checkValidUpdate(): void {
    this.updateSettings();
  }

  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    this.updateValidPassword();
  }

  public openEditSettingsDialog(): void {
    this.editSmtpSettings = cloneDeep(this.localSmtpSettings);
    this.updateSettings();
  }

  public toggleSMTPEnabled(): void {
    this.updateSettings();
  }

  public toggleSslCheck(): void {
    this.editSmtpSettings.port = this.editSmtpSettings.useSSL === true ? 465 : 25;
    this.updateSettings();
  }

  public toggleAuthReqCheck() {
    this.updateSettings();
  }

  public doUpdateSettings(): void {
    this.localSmtpSettings = this.editSmtpSettings;
    this.updateDirty();
  }

  public doEmailTest(): void {
    const subject = 'Triveni Digital GuideBuilder Test Message';
    const message = 'This is an e-email message sent automatically by GuideBuilder while testing the configured SMTP settings.';
    const smtpTestMessage: SmtpTestMessage = new SmtpTestMessage(this.editSmtpSettings.host,
      this.editSmtpSettings.port, this.editSmtpSettings.useSSL, this.editSmtpSettings.username,
      this.editSmtpSettings.password, subject, message, this.editSmtpSettings.from, this.testRecipients
    );

    const observable: Observable<SmtpTestMessage> = this.smtpEmailService.postSendTestSmtpMessage(smtpTestMessage);
    const observer = {
      next: () => {
        const messageAlert = 'Success Email Testing';
        this.alertTestMessage = 'btn-outline-success';
        this.emailTestMessage = messageAlert;
      },
      error: (error: any) => {
        this.alertTestMessage = 'btn-outline-danger';
        this.emailTestMessage = 'Error: ' + error.message;
      },
      complete: () => {
      }
    };
    this.subscriptions.push(observable.subscribe(observer));
  }

  public updateValidRecipient(): void {
    this.validRecipient = this.testRecipients?.length > 0 && this.checkEmail(this.testRecipients);
    this.updateTestEmailButton();
  }

  public openTestEmailDialog() {
    this.testRecipients = '';
    this.alertTestMessage = '';
    this.emailTestMessage = '';
    this.updateValidRecipient();
  }

  public validateNumber(event: { keyCode: any; preventDefault: () => void; }) {
    const keyCode = event.keyCode;
    const excludedKeys = [8, 37, 39, 46];
    if (
      !(
        (keyCode >= 48 && keyCode <= 57) ||
        (keyCode >= 96 && keyCode <= 105) ||
        excludedKeys?.includes(keyCode)
      )
    ) {
      event.preventDefault();
    }
  }

  public canDeactivate(): boolean {
    return !this.dirty;
  }

  private checkEmail(emailString: string): boolean {
    return this.emailRegExp.test(emailString);
  }

  private getValidIcon(valid: boolean): string {
    return valid ? 'fa-check-circle text-success' : 'fa-times-circle text-danger';
  }

  private updateValidHost(): void {
    this.validHost = this.editSmtpSettings.enabled ? this.editSmtpSettings.host?.length > 0 : true;
  }

  private updateValidPort(): void {
    this.validPort = this.editSmtpSettings.enabled ? this.editSmtpSettings.port > 0 : true;
  }

  private updateValidUsername(): void {
    this.validUsername = this.editSmtpSettings.enabled ? this.editSmtpSettings.username?.length > 0 : true;

  }

  private updateValidPassword(): void {
    this.validPassword = (this.editSmtpSettings.enabled && this.editSmtpSettings.useAuth) ?
      (this.editSmtpSettings.password?.length > 0) : true;
  }

  private updateValidFrom(): void {
    this.validFrom = this.editSmtpSettings.enabled ? (this.checkEmail(this.editSmtpSettings.from) && !isEmptyValue(
      this.editSmtpSettings.from)) : true;

  }

  private updateValidTo(): void {
    this.validTo = this.editSmtpSettings.enabled ? (this.editSmtpSettings.to?.length > 0 && this.checkEmail(
      this.editSmtpSettings.to)) : true;
  }

  private updateOkEnabled(): void {
    const { enabled, useAuth } = this.editSmtpSettings;
    if( enabled ){
      const baseConditions = this.validHost && this.validPort && this.validFrom && this.validTo;
      this.enableUpdateButton = useAuth
        ? baseConditions && this.validUsername && this.validPassword
        : baseConditions;
    }
  }

  private updateTestButton(): void {
    this.enableTestButton = this.editSmtpSettings.enabled && this.validHost && this.validPort;
  }

  private updateTestEmailButton(): void {
    this.enableTestEmailButton = this.validRecipient;
  }

  private updateSettings(): void {
    this.updateValidHost();
    this.updateValidPort();
    this.updateValidUsername();
    this.updateValidPassword();
    this.updateValidFrom();
    this.updateValidTo();
    this.updateTestButton();
    this.updateOkEnabled();
  }

  private updateSmtpSettings(smtpSettings: SmtpSettings) {
    this.localSmtpSettings = smtpSettings;
    this.serverSmtpSettings = cloneDeep(this.localSmtpSettings);
    this.editSmtpSettings = cloneDeep(this.localSmtpSettings);
    this.updateDirty();
    this.updateSettings();
  }
}
