import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.scss']
})
export class DocumentationComponent implements OnInit {

  markdownPath$: Observable<string>;

  data = {
    'database-create-form': `${environment.host}/databases/create`
  }

  constructor(protected route: ActivatedRoute) {
    this.markdownPath$ = this.route.url.pipe(
      // tap(console.log),
      map((segments: Array<UrlSegment>) => {
        if(segments.length == 0) {
          return 'index'
        }else{
          return segments.map(
            (segment:UrlSegment) => segment.path ? segment.path : '' )
            .join('/')
        }
      }),
      map((path: string) => {
        return 'assets/docs/' + path + '.md'
      })
    )
  }

  ngOnInit(): void {
  }

}
