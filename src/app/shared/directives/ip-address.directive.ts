import { Directive, HostListener, ElementRef, Renderer2 } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appIpAddress]'
})
export class IpAddressDirective {
  private regex: RegExp = new RegExp(/^(?:\d{1,3}\.){0,3}\d{0,3}$/);
  private fullIpRegex: RegExp = new RegExp(/^(?:\d{1,3}\.){3}\d{1,3}$/);

  constructor(private el: ElementRef, private renderer: Renderer2, private control: NgControl) {}

  @HostListener('input', ['$event']) onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    let inputValue: string = input.value;

    if (!this.regex.test(inputValue)) {
      inputValue = inputValue.slice(0, -1);
    }


    this.renderer.setProperty(this.el.nativeElement, 'value', inputValue);
    this.control.control?.setValue(inputValue, { emitEvent: false });
  }
}
