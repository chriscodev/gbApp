import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceMapComponent } from './service-map.component';

describe('ServiceMapComponent', () => {
  let component: ServiceMapComponent;
  let fixture: ComponentFixture<ServiceMapComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
