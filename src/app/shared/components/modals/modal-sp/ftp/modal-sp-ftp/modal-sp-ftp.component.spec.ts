import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSpFtpComponent } from './modal-sp-ftp.component';

describe('ModalSpFtpComponent', () => {
  let component: ModalSpFtpComponent;
  let fixture: ComponentFixture<ModalSpFtpComponent>;

  beforeEach( () => {
   TestBed.configureTestingModule({
      declarations: [ ModalSpFtpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalSpFtpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
