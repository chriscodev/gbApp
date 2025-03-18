import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTransportImportCsvComponent } from './modal-transport-import-csv.component';

describe('ModalTransportImportCsvComponent', () => {
  let component: ModalTransportImportCsvComponent;
  let fixture: ComponentFixture<ModalTransportImportCsvComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalTransportImportCsvComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalTransportImportCsvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
