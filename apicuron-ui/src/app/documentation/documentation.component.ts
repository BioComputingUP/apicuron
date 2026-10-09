import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewEncapsulation,
} from "@angular/core";
import { ActivatedRoute, Router, UrlSegment, UrlTree } from "@angular/router";
import { Observable, ReplaySubject, Subject, fromEvent } from "rxjs";
import { filter, map, switchMap, take, takeUntil, tap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { MarkdownService } from "ngx-markdown";
import { DOCUMENT, ViewportScroller } from "@angular/common";
import AnchorJS from "anchor-js";
import { HttpClient } from "@angular/common/http";

type TocElement =
  | {
      text: string;
      routerLink: UrlTree;
      children?: TocElement[];
    }
  | {
      text: string;
      href: string;
      children?: TocElement[];
    };

@Component({
  selector: "app-documentation",
  templateUrl: "./documentation.component.html",
  styleUrls: ["./documentation.component.scss"],
  encapsulation: ViewEncapsulation.Emulated,
})
export class DocumentationComponent implements OnInit, OnDestroy {
  markdownPath$: Observable<string>;
  display_toc = true;

  data = {
    "database-create-form": `${environment.host}/resources/create`,
  };
  anchors: any;

  loadedLibraries: { [url: string]: ReplaySubject<void> } = {};
  destroy$ = new Subject<boolean>();
  toc$: Observable<any>;
  markdownContent$: Observable<any>;
  tableOfContents: TocElement[];

  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected markdownService: MarkdownService,
    protected viewport: ViewportScroller,
    protected http: HttpClient
  ) {
    window["markedClick"] = (url: string) => {
      this.router.navigateByUrl(url);
    };
    this.markdownService.renderer.link = (
      href: string,
      title: string,
      text: string
    ): string => {
      if (href.startsWith("/")) {
        return `<a title="${title}" onclick="markedClick('${href}')">${text}</a>`;
      }
      return `<a title="${title}" href="${href}">${text}</a>`;
    };

    this.anchors = new AnchorJS({
      icon: "#",
      placement: "left",
      class: "tw-text-apicuron-purple",
    });

    this.markdownPath$ = this.route.url.pipe(
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

    // this.markdownContent$ = this.markdownPath$
    //   .pipe(
    //     take(1),
    //     switchMap((path: string) => {
    //       return this.http.get(path);
    //     }),
    //     tap(console.log)
    //   )
    // .subscribe(() => {});
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
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
