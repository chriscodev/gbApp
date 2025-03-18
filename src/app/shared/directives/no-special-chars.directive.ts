// Copyright (c) 2024 Triveni Digital, Inc. All rights reserved.

import {Directive, HostListener} from '@angular/core';

@Directive({
  selector: '[appNoSpecialChars]'
})
export class NoSpecialCharsDirective {
  private regex: RegExp = new RegExp(/^[a-zA-Z0-9\s\.\-]*$/); // Allows letters, numbers, and spaces
  private specialKeys: Array<string> = [
    'Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete'
  ]; // Allow backspace, tab, navigation keys, etc.

  constructor() {
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Allow the following special keys for navigation and control
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }

    // Get the input value with the new key added
    const inputValue: string = (event.target as HTMLInputElement).value.concat(event.key);

    // If the input doesn't match the regex (contains special characters), prevent the key input
    if (!String(inputValue).match(this.regex)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    const pastedInput: string = event.clipboardData?.getData('text') || '';
    if (!pastedInput.match(this.regex)) {
      event.preventDefault();
    }
  }
}
