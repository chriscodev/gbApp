import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCommitRevertDialogComponent } from './modal-commit-revert-dialog.component';

describe('ModalCommitRevertDialogComponent', () => {
  let component: ModalCommitRevertDialogComponent;
  let fixture: ComponentFixture<ModalCommitRevertDialogComponent>;

  beforeEach( () => {
    TestBed.configureTestingModule({
      declarations: [ ModalCommitRevertDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCommitRevertDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
