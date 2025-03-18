import { ComponentFixture, TestBed } from '@angular/core/testing';

import {GBStatusComponent} from './gb-status.component';

describe('GBStatusComponent', () => {
  let component: GBStatusComponent;
  let fixture: ComponentFixture<GBStatusComponent>;

  beforeEach( () => {
     TestBed.configureTestingModule({
      declarations: [ GBStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GBStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
