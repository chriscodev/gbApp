import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalNetworksAtscNetworkComponent } from './modal-networks-atsc-network.component';

describe('ModalNetworksAtscNetworkComponent', () => {
  let component: ModalNetworksAtscNetworkComponent;
  let fixture: ComponentFixture<ModalNetworksAtscNetworkComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalNetworksAtscNetworkComponent]
    });
    fixture = TestBed.createComponent(ModalNetworksAtscNetworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
