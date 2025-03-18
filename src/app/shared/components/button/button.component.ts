import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent implements OnInit {
  @Input() className: string;
  @Input() btnType: string;
  @Input() btnToggle: string;
  @Input() btnTarget: string;
  @Input() btnClick: string;
  @Input() btnLabel: string;
  @Input() disabled: string;

  btnIcon = '';

  constructor() {}

  ngOnInit(): void {
    this.loadButton(this.btnType);
  }

  loadButton(btnFunction) {
    switch (btnFunction) {
      case 'add':
        this.btnIcon = 'fa-plus';
        break;
      case 'edit':
        this.btnIcon = 'fa-edit';
        break;
      case 'close':
        this.btnIcon = 'fa-times';
        break;
      case 'commit':
        this.btnIcon = 'fa-check';
        break;
      case 'revert':
        this.btnIcon = 'fa-undo';
        break;
    }
  }
}
