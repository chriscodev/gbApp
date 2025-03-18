import {  ComponentFixture, TestBed } from '@angular/core/testing';

import { AlarmConfigurationComponent } from './alarm-configuration.component';

describe('ConfigurationComponent', () => {
  let component: AlarmConfigurationComponent;
  let fixture: ComponentFixture<AlarmConfigurationComponent>;

  beforeEach((() => {
    TestBed.configureTestingModule({
      declarations: [ AlarmConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlarmConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
