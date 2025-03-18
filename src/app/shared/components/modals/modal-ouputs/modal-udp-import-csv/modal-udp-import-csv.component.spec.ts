import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalUdpImportCsvComponent } from './modal-udp-import-csv.component';

describe('ModalUdpImportCsvComponent', () => {
  let component: ModalUdpImportCsvComponent;
  let fixture: ComponentFixture<ModalUdpImportCsvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalUdpImportCsvComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalUdpImportCsvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
