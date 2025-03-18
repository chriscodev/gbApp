import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTransportAtsc3TranslatedTransportStreamComponent } from './modal-transport-atsc3-translated-transport-stream.component';

describe('ModalTransportAtsc3TranslatedTransportStreamComponent', () => {
  let component: ModalTransportAtsc3TranslatedTransportStreamComponent;
  let fixture: ComponentFixture<ModalTransportAtsc3TranslatedTransportStreamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalTransportAtsc3TranslatedTransportStreamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalTransportAtsc3TranslatedTransportStreamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
