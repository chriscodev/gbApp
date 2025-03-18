import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalOutputsAtsc3UdpComponent } from './modal-outputs-atsc3-udp.component';

describe('ModalOutputsAtsc3UdpNewComponent', () => {
  let component: ModalOutputsAtsc3UdpComponent;
  let fixture: ComponentFixture<ModalOutputsAtsc3UdpComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalOutputsAtsc3UdpComponent]
    });
    fixture = TestBed.createComponent(ModalOutputsAtsc3UdpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
