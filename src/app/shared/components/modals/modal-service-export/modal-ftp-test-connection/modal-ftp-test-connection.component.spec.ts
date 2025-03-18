import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFtpTestConnectionComponent } from './modal-ftp-test-connection.component';

describe('ModalFtpTestConnectionComponent', () => {
  let component: ModalFtpTestConnectionComponent;
  let fixture: ComponentFixture<ModalFtpTestConnectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalFtpTestConnectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalFtpTestConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
