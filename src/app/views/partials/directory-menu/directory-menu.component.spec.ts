import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectoryMenuComponent } from './directory-menu.component';

describe('DirectoryMenuComponent', () => {
  let component: DirectoryMenuComponent;
  let fixture: ComponentFixture<DirectoryMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DirectoryMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DirectoryMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
