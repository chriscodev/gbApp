import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalOutputsAtsc3TranslatorComponent } from './modal-outputs-atsc3-translator.component';

describe('ModalOutputsAtsc3TranslatorComponent', () => {
  let component: ModalOutputsAtsc3TranslatorComponent;
  let fixture: ComponentFixture<ModalOutputsAtsc3TranslatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalOutputsAtsc3TranslatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalOutputsAtsc3TranslatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
