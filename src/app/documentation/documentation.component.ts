import {
  Component,
  Inject,
  OnInit,
  Renderer2,
  ViewEncapsulation,
} from "@angular/core";
import { ActivatedRoute, Router, UrlSegment } from "@angular/router";
import { Observable, ReplaySubject } from "rxjs";
import { map, tap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { MarkdownService } from "ngx-markdown";
import { DOCUMENT, ViewportScroller } from "@angular/common";
import AnchorJS from "anchor-js";

@Component({
  selector: "app-documentation",
  templateUrl: "./documentation.component.html",
  styleUrls: ["./documentation.component.scss"],
  encapsulation: ViewEncapsulation.Emulated,
})
export class DocumentationComponent implements OnInit {
  markdownPath$: Observable<string>;
  display_toc = true;

  data = {
    "database-create-form": `${environment.host}/databases/create`,
  };
  anchors: any;

  loadedLibraries: { [url: string]: ReplaySubject<void> } = {};

  loadScript(url: string): Observable<void> {
    if (this.loadedLibraries[url]) {
      return this.loadedLibraries[url].asObservable();
    }

    this.loadedLibraries[url] = new ReplaySubject();

    const script = this.document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    script.onload = () => {
      this.loadedLibraries[url].next();
      this.loadedLibraries[url].complete();
    };

    this.document.body.appendChild(script);

    return this.loadedLibraries[url].asObservable();
  }

  constructor(
    protected route: ActivatedRoute,
    protected markdownService: MarkdownService,
    protected viewport: ViewportScroller,
    @Inject(DOCUMENT) private readonly document: Document
  ) {
      
      ["/marked-script.js",
      "/prism-script.js",
      "/prism-script-json.js",
      "/prism-script-bash.js"].map((link) => this.loadScript(link))

    this.anchors = new AnchorJS();
    this.markdownPath$ = this.route.url.pipe(
      // tap(console.log),
      map((segments: Array<UrlSegment>) => {
        if (segments.length == 0) {
          return "index";
        } else {
          return segments
            .map((segment: UrlSegment) => (segment.path ? segment.path : ""))
            .join("/");
        }
      }),
      map((path: string) => {
        return "assets/docs/" + path + ".md";
      })
    );
  }

  onLoad($event) {
    this.route.fragment.subscribe((frag) => {
      this.viewport.scrollToAnchor(frag);
    });
  }

  onDocumentReady() {
    this.anchors.add("main h1, main h2, main h3, main h4, main h5, main h6");
  }

  ngOnInit(): void {}
}
