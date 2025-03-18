import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceExportComponent } from './service-export.component';

describe('ServiceExportComponent', () => {
  let component: ServiceExportComponent;
  let fixture: ComponentFixture<ServiceExportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceExportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
