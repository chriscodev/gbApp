// Copyright (c) 2025 Triveni Digital, Inc. All rights reserved.

export interface ClickEvent {
  message?: string;
  type?: string;
  e?: HTMLInputElement & EventTarget | null;
  target?: {
    classList: {
      contains: (arg0: string) => string;
      add: (arg0: string) => void;
    };
  };
  preventDefault?: () => void;
}

export interface ModalOptions {
  backdrop?: 'static' | boolean;
  keyboard?: boolean;
}

export type BootstrapFunction = (selector: string) => BootstrapInterfaces;
export type Function = () => {};

export interface BootstrapInterfaces {
  modal(action: 'show' | 'hide', options?: ModalOptions): void;

  remove(): void;

  removeAttr(argument: string): void;

  val(argument: string): void;

  on(argument: string, Function: any): void;

  prop(argument: string, bool: boolean): void;

  click(): void;
}

// tslint:disable-next-line:class-name
export interface onInputFiles extends Blob {
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/File/lastModified) */
  lastModified: number;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/File/name) */
  name: string;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/File/webkitRelativePath) */
  webkitRelativePath: string;
  clientId?: string;
  length?: number;
  id?: number;
}

declare var File: {
  prototype: File;
  new(fileBits: BlobPart[], fileName: string, options?: FilePropertyBag): File;
};
