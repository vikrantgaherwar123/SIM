import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTodaysEstimateComponent } from './view-todays-estimate.component';

describe('ViewTodaysEstimateComponent', () => {
  let component: ViewTodaysEstimateComponent;
  let fixture: ComponentFixture<ViewTodaysEstimateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewTodaysEstimateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTodaysEstimateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
