import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookmarkTreeComponent } from './bookmark-tree.component';

describe('BookmarkTreeComponent', () => {
  let component: BookmarkTreeComponent;
  let fixture: ComponentFixture<BookmarkTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookmarkTreeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookmarkTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
