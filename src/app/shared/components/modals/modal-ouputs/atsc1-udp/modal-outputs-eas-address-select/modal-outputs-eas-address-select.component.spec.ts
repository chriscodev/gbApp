import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalOutputsEasAddressSelectComponent } from './modal-outputs-eas-address-select.component';

describe('ModalOutputsEasAddressSelectComponent', () => {
  let component: ModalOutputsEasAddressSelectComponent;
  let fixture: ComponentFixture<ModalOutputsEasAddressSelectComponent>;

  beforeEach( () => {
    TestBed.configureTestingModule({
      declarations: [ ModalOutputsEasAddressSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalOutputsEasAddressSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
