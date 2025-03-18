import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'input[numbersOnly]',
})
export class NumbersOnlyDirective {
  constructor(private el: ElementRef) {}

  @Input('numbersOnlyType') numbersOnlyType: string;

  @HostListener('input', ['$event']) onInputChange(event) {
    const initalValue = this.el.nativeElement.value;
    const preventInput = () => {
      event.stopPropagation();
      event.preventDefault();
    };

    // NUMBER ONLY VALIDATION
    this.el.nativeElement.value = initalValue.replace(/[^0-9]*/g, '');
    if (initalValue !== this.el.nativeElement.value) {
      console.log("this.el.nativeElement.value: ",this.el.nativeElement.value)
      preventInput();
    }

    // for IP port and OTHER BSID validation only
    else if (this.numbersOnlyType === 'port') {
      if ((initalValue as number) > 65535) {
        const allowedValue = initalValue?.substring(0, initalValue?.length - 1);
        this.el.nativeElement.value = allowedValue;
      } else {
        this.el.nativeElement.value = initalValue?.replace(/^0+/, '');
      }
    }

    // for LCT CCI packet count validation only
    else if (this.numbersOnlyType === 'packetCount') {
      if ((initalValue as number) > 2147483647) {
        const allowedValue = initalValue?.substring(0, initalValue?.length - 1);
        this.el.nativeElement.value = allowedValue;
      } else {
        this.el.nativeElement.value = initalValue?.replace(/^0+/, '');
      }
    }
  }
}
