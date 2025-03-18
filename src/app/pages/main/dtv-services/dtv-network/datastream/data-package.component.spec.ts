import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataPackageComponent } from './data-package.component';

describe('DataStreamComponent', () => {
  let component: DataPackageComponent;
  let fixture: ComponentFixture<DataPackageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DataPackageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataPackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
