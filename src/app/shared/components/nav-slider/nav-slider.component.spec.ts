import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavSliderComponent } from './nav-slider.component';

describe('NavSliderComponent', () => {
  let component: NavSliderComponent;
  let fixture: ComponentFixture<NavSliderComponent>;

  beforeEach( () => {
    TestBed.configureTestingModule({
      imports: [NavSliderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
