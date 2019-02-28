import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadalldataComponent } from './loadalldata.component';

describe('LoadalldataComponent', () => {
  let component: LoadalldataComponent;
  let fixture: ComponentFixture<LoadalldataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadalldataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadalldataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
