import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSpSchedulesearchComponent } from './modal-sp-schedulesearch.component';

describe('ModalSpSchedulesearchComponent', () => {
  let component: ModalSpSchedulesearchComponent;
  let fixture: ComponentFixture<ModalSpSchedulesearchComponent>;

  beforeEach( () => {
   TestBed.configureTestingModule({
      declarations: [ ModalSpSchedulesearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalSpSchedulesearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
