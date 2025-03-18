import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFooterAddDeleteFileComponent } from './modal-footer-add-delete-file.component';

describe('ModalFooterAddDeleteFileComponent', () => {
  let component: ModalFooterAddDeleteFileComponent;
  let fixture: ComponentFixture<ModalFooterAddDeleteFileComponent>;

  beforeEach( () => {
    TestBed.configureTestingModule({
      declarations: [ ModalFooterAddDeleteFileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalFooterAddDeleteFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
