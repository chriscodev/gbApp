/*
 * Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.
 */

import {AbstractElement} from './AbstractElement';

export class SmtpSettings extends AbstractElement {
  public constructor(public enabled: boolean, public host: string, public port: number, public useSSL: boolean,
                     public useAuth: boolean, public username: string, public password: string, public from: string,
                     public to: string, public id?: number, public clientId?: string) {
    super(id, clientId);
  }
}

export class DefaultSmtpSettings extends SmtpSettings {
  public constructor() {
    super(false, '', 25, false, false, '', '', '', '');
  }
}

export class SmtpTestMessage {
  public constructor(public host: string, public port: number, public useSSL: boolean, public username: string,
                     public password, public subject: string, public message: string, public from: string,
                     public to: string) {
  }
}
