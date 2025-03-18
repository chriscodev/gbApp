import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTcpExportComponent } from './modal-tcp-export.component';

describe('ModalTcpExportComponent', () => {
  let component: ModalTcpExportComponent;
  let fixture: ComponentFixture<ModalTcpExportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalTcpExportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalTcpExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
