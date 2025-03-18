import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSimpleTableComponent } from './modal-simple-table.component';

describe('ModalSimpleTableComponent', () => {
  let component: ModalSimpleTableComponent;
  let fixture: ComponentFixture<ModalSimpleTableComponent>;

  beforeEach( () => {
    TestBed.configureTestingModule({
      declarations: [ ModalSimpleTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalSimpleTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
