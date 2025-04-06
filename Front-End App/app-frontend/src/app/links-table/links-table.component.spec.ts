import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinksTableComponent } from './links-table.component';

describe('LinksTableComponent', () => {
  let component: LinksTableComponent;
  let fixture: ComponentFixture<LinksTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinksTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinksTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
