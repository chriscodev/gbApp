import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCertComponent } from './view-cert.component';

describe('ViewCertComponent', () => {
  let component: ViewCertComponent;
  let fixture: ComponentFixture<ViewCertComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewCertComponent]
    });
    fixture = TestBed.createComponent(ViewCertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
