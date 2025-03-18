import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalConfirmDialogComponent } from './modal-confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ModalConfirmDialogComponent;
  let fixture: ComponentFixture<ModalConfirmDialogComponent>;

  beforeEach( () => {
    TestBed.configureTestingModule({
      declarations: [ ModalConfirmDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
