import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalOutputsAsiComponent } from './modal-outputs-asi.component';

describe('ModalOutputsAsiComponent', () => {
  let component: ModalOutputsAsiComponent;
  let fixture: ComponentFixture<ModalOutputsAsiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalOutputsAsiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalOutputsAsiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
