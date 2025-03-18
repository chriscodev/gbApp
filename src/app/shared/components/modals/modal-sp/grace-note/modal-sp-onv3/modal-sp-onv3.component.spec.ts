import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSpOnv3Component } from './modal-sp-onv3.component';

describe('ModalSpOnv3Component', () => {
  let component: ModalSpOnv3Component;
  let fixture: ComponentFixture<ModalSpOnv3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalSpOnv3Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalSpOnv3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
