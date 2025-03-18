import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalOutputsViewRoutesComponent } from './modal-outputs-view-routes.component';

describe('ModalOutputsViewRoutesComponent', () => {
  let component: ModalOutputsViewRoutesComponent;
  let fixture: ComponentFixture<ModalOutputsViewRoutesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalOutputsViewRoutesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalOutputsViewRoutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
