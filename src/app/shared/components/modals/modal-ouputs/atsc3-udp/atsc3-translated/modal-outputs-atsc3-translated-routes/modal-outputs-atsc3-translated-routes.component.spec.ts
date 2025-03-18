import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalOutputsAtsc3TranslatedRoutesComponent } from './modal-outputs-atsc3-translated-routes.component';

describe('ModalOutputsAtsc3TranslatedRoutesComponent', () => {
  let component: ModalOutputsAtsc3TranslatedRoutesComponent;
  let fixture: ComponentFixture<ModalOutputsAtsc3TranslatedRoutesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalOutputsAtsc3TranslatedRoutesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalOutputsAtsc3TranslatedRoutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
