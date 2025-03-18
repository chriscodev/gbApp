import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalTransportSelectExtensionTypeComponent } from './modal-transport-select-extension-type.component';

describe('ModalTransportSelectExtensionTypeComponent', () => {
  let component: ModalTransportSelectExtensionTypeComponent;
  let fixture: ComponentFixture<ModalTransportSelectExtensionTypeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalTransportSelectExtensionTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalTransportSelectExtensionTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
