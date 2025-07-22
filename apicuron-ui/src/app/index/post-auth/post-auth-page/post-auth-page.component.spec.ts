import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostAuthPageComponent } from './post-auth-page.component';

describe('PostAuthPageComponent', () => {
  let component: PostAuthPageComponent;
  let fixture: ComponentFixture<PostAuthPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostAuthPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostAuthPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
