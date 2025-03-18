import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDataAddElementsComponent } from './modal-data-add-elements.component';
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from '@angular/core';

describe('ModalDataElementsComponent', () => {
  let component: ModalDataAddElementsComponent;
  let fixture: ComponentFixture<ModalDataAddElementsComponent>;

  beforeEach( () => {
    TestBed.configureTestingModule({
      declarations: [ ModalDataAddElementsComponent ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDataAddElementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
