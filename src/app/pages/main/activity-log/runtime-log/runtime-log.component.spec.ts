import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuntimeLogComponent } from './runtime-log.component';

describe('RuntimeLogComponent', () => {
  let component: RuntimeLogComponent;
  let fixture: ComponentFixture<RuntimeLogComponent>;

  beforeEach( () => {
    TestBed.configureTestingModule({
      declarations: [ RuntimeLogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RuntimeLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
