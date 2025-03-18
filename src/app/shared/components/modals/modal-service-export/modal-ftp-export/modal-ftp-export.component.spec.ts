import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFtpExportComponent } from './modal-ftp-export.component';

describe('ModalFtpExportComponent', () => {
  let component: ModalFtpExportComponent;
  let fixture: ComponentFixture<ModalFtpExportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalFtpExportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalFtpExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
