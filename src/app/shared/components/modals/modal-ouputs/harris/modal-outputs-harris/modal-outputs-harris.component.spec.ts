import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalOutputsHarrisComponent } from './modal-outputs-harris.component';

describe('ModalOutputsHarrisComponent', () => {
  let component: ModalOutputsHarrisComponent;
  let fixture: ComponentFixture<ModalOutputsHarrisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalOutputsHarrisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalOutputsHarrisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
