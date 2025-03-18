import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalExportServicesComponent } from './modal-export-services.component';

describe('ModalExportServicesComponent', () => {
  let component: ModalExportServicesComponent;
  let fixture: ComponentFixture<ModalExportServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalExportServicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalExportServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
