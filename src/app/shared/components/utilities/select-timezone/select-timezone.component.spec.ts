import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectTimezoneComponent } from './select-timezone.component';
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from '@angular/core';

describe('SelectTimezoneComponent', () => {
  let component: SelectTimezoneComponent;
  let fixture: ComponentFixture<SelectTimezoneComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SelectTimezoneComponent],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectTimezoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
