import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeoutModalsComponent } from './timeout-modals.component';

describe('TimeoutModalsComponent', () => {
  let component: TimeoutModalsComponent;
  let fixture: ComponentFixture<TimeoutModalsComponent>;

  beforeEach((() => {
    TestBed.configureTestingModule({
      declarations: [ TimeoutModalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeoutModalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
