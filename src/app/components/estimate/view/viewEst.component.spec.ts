import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEstComponent } from './viewEst.component';

describe('ViewComponent', () => {
  let component: ViewEstComponent;
  let fixture: ComponentFixture<ViewEstComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewEstComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewEstComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
