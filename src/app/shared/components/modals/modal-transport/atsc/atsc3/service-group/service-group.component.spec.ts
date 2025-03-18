import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceGroupComponent } from './service-group.component';

describe('ServiceGroupComponent', () => {
  let component: ServiceGroupComponent;
  let fixture: ComponentFixture<ServiceGroupComponent>;

  beforeEach( () => {
    TestBed.configureTestingModule({
      imports: [ServiceGroupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
