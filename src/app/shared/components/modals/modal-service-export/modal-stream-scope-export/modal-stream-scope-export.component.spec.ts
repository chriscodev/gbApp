import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalStreamScopeExportComponent } from './modal-stream-scope-export.component';

describe('ModalStreamScopeExportComponent', () => {
  let component: ModalStreamScopeExportComponent;
  let fixture: ComponentFixture<ModalStreamScopeExportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalStreamScopeExportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalStreamScopeExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
