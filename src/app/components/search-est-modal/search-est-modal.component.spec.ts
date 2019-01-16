import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchEstModalComponent } from './search-est-modal.component';

describe('SearchEstModalComponent', () => {
  let component: SearchEstModalComponent;
  let fixture: ComponentFixture<SearchEstModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchEstModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchEstModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
