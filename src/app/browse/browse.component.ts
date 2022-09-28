import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, combineLatest} from 'rxjs';
import {InternalService} from '../services/internal.service';
import {AuthService} from '../services/auth.service';
import {UntypedFormControl, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Router, ActivatedRoute} from '@angular/router';
import { HttpParams} from '@angular/common/http';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', maxHeight: '0',  visibility: 'hidden'})),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('1000ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class BrowseComponent implements OnInit {
  statObj = {
    count_biocurators: 0,
    resources: []
  };

  columnsFormNew;
  currentPageModel = 1;
  collapseColumns = true;
  searchForm: UntypedFormGroup;
  loading_finished = false;
  loading_new_table = true;
  loading_resources = true;

  radioModel = '20';
  isExpansionDetailRow = true;
  expandedElement: any;
  selectedRow = '';
  localAuth = new BehaviorSubject<object>({});
  displayedColumns = new BehaviorSubject<object>(['family_name', 'given_name', 'orcid', 'resources']);
  currentPage = new BehaviorSubject<object>({
    'page': 1
  });
  pageSize = new BehaviorSubject<number>(20);
  dataOnPage = new BehaviorSubject<any[]>([]);
  totalItems: number;
  sortKey = new BehaviorSubject<string>('curator_orcid');
  sortDirection = new BehaviorSubject<string>('asc');
  map_resources = {};


  constructor(public authService: AuthService,
              private route: ActivatedRoute,
              private fb: UntypedFormBuilder,
              private router: Router,
              private internalService: InternalService) {
  }

  ngOnInit() {
    let redirect_homepage = this.route.snapshot.queryParams.hasOwnProperty('from_homepage');
    this.searchForm = this.fb.group({
      area: null,
      key: null,
      // firstDay:  new Date(1990, 0, 1),
      // lastDay:  new Date(),
      start: null,
      resources: this.fb.group({})
    });


    Object.keys(this.route.snapshot.queryParams).forEach(currParam => {
      // console.log('currParam', currParam);
      if ([
        'curator_name',
        'curator_orcid',
        // 'resource_uri'
      ].includes(currParam)) {
        this.searchForm.get('area').setValue(currParam);
        this.searchForm.get('key').setValue(this.route.snapshot.queryParams[currParam]);
      } else {
        if (currParam === 'sort_field') {
          this.sortKey.next(this.route.snapshot.queryParams[currParam]);
        } else if (currParam === 'sort_value') {
          this.sortDirection.next(this.route.snapshot.queryParams[currParam]);
        } else if (currParam === 'page_size') {
          if (['10', '20', '50'].includes(this.route.snapshot.queryParams[currParam])) {
            this.pageSize.next(Number(this.route.snapshot.queryParams[currParam]));
            this.radioModel = this.route.snapshot.queryParams[currParam];
          }

        } else if (currParam === 'page') {
          this.currentPageModel = Number(this.route.snapshot.queryParams[currParam]) + 1;

          // this.currentPage = Number(this.route.snapshot.queryParams[currParam]) + 1
          this.currentPage.next({page: Number(this.route.snapshot.queryParams[currParam]) + 1});
        }
      }
    });
    if (!this.searchForm.get('area').value) {
      this.searchForm.get('area').setValue('curator_name');
    }
    this.authService.loginData.subscribe(authData => {
      if (this.localAuth.value !== authData) {
        this.localAuth.next(authData);
      }
    });

    this.columnsFormNew = this.fb.group({
      orcid: this.fb.control(true),
      name: this.fb.control(true),
      generation_reports: this.fb.control(false),
      generation_count: this.fb.control(true),
      revision_reports: this.fb.control(false),
      revision_count: this.fb.control(true),
      invalidation_reports: this.fb.control(false),
      invalidation_count: this.fb.control(true),
      badge: this.fb.control(true),

    });

    this.columnsFormNew.valueChanges.subscribe(columsObj => {
      // console.log(columsObj);
      const newDisplayedColumns = [];
      Object.keys(columsObj).forEach(currColumn => {
        if (columsObj[currColumn]) {
          newDisplayedColumns.push(currColumn);
        }
      });
      this.displayedColumns.next(newDisplayedColumns);
    });


    this.localAuth.subscribe(authData => {
      // console.log('authData', authData);
      // if (!authData.hasOwnProperty('initial')) {
      this.loading_new_table = true;
      this.dataOnPage.next([]);
      this.totalItems = 0;


      combineLatest(this.searchForm.valueChanges,
        this.pageSize,
        this.sortKey,
        this.sortDirection,
        this.currentPage,
      ).subscribe(([formData,
                     pageSize,
                     sortKey,
                     sortDirection,
                     currentPage]) => {

        const search_params = {
          sort_field: sortKey,
          sort_value: sortDirection,
          page_size: pageSize.toString(),
          page: (currentPage['page'] - 1).toString(),
          // first_day: formData.firstDay.toISOString().slice(0, 10),
          // last_day: formData.lastDay.toISOString().slice(0, 10),

        };
        if (formData.key && formData.key !== '') {
          search_params[formData.area] = formData.key;
        }
        const activeResources = [];
        Object.keys(this.searchForm.get('resources').value).forEach(currResource => {
          // console.log('this.searchForm.get(\'resources\')', this.searchForm.get('resources'));
          // console.log('currResource', currResource);
          // console.log('this.searchForm.get(\'resources\').get(currResource)', this.searchForm.get('resources').get(currResource));

          if (this.searchForm.get('resources').get(currResource).value) {
            activeResources.push(currResource);
          }
        });
        search_params['resource'] = activeResources.length > 0 ? activeResources.join('|') : 'none';

        this.loading_finished = false;
        this.loading_new_table = true;
        this.router.navigate(['curators'], {queryParams: search_params});
        if (!this.loading_resources) {
          this.internalService.getBrowseWithCount(new HttpParams({ fromObject: search_params})).subscribe((browseData) => {


            // const biocuratorsData = browseData.body.map(currBiocurator =>  {
            //   const currData = currBiocurator.statistics.filter(currDataObj => {
            //     return !currDataObj.hasOwnProperty('resource_uri');
            //   })[0];
            //
            //   const listResources = currBiocurator.statistics.filter(currDataObj => {
            //     return currDataObj.hasOwnProperty('resource_uri');
            //   }).map(x => x.resource_uri);
            //
            //   // console.log(listResources );
            //   return {
            //     curator_orcid: currBiocurator.curator_orcid,
            //     family_name: currBiocurator.family_name,
            //     given_name: currBiocurator.given_name,
            //     ranking: currData.ranking,
            //     score_total: currData.total_score,
            //     generation_count: currData.generation_count,
            //     revision_count: currData.revision_count,
            //     invalidation_count: currData.invalidation_count,
            //     generation_score: currData.generation_score,
            //     revision_score: currData.revision_score,
            //     invalidation_score: currData.invalidation_score,
            //     listResources: listResources,
            //     medals_count: currData.medals_count,
            //     badges_count: currData.badges_count,
            //   };
            // });

            this.dataOnPage.next( browseData.body);
            this.totalItems = parseInt(browseData.headers.get('count'));

            // const keys = browseData.headers.keys();
            // console.log('browseData', browseData);
            // console.log('browseData', browseData.headers.get('count'));




            // this.dataOnPage.next(browseData);
            // this.totalItems = browseData.count_biocurators;
            // browseData.list_resources.forEach(currResource => {
            //   this.map_resources[currResource.resource_uri] = currResource;
            // });
            //



          }, (err) => {
          }, () => {
            console.log(redirect_homepage, this.totalItems, this.totalItems === 1);

            if (redirect_homepage && this.totalItems === 1) {
              console.log('yeeeee', redirect_homepage, this.totalItems);

              this.router.navigate(['orcid/' + this.dataOnPage.value[0].curator_orcid]);
            }
            redirect_homepage = false;


            this.loading_new_table = false;
            this.loading_finished = true;
            // console.log('finish');
          });
        }

      });

      this.internalService.GetStat().subscribe((statData) => {
        this.statObj = statData;
        let listPreResources = [];
        if (this.route.snapshot.queryParams.hasOwnProperty('resource_uri') && this.route.snapshot.queryParams.resource_uri !== 'none') {
          listPreResources = this.route.snapshot.queryParams.resource_uri.split('|');
        }

        statData['resources'].forEach(currResource => {
          this.map_resources[currResource.resource_uri] = currResource;
          const resources = this.searchForm.get('resources') as UntypedFormGroup;
          // console.log(listPreResources);

          if (listPreResources.includes(currResource['resource_id']) || listPreResources.length === 0) {
            resources.addControl(currResource['resource_id'], new UntypedFormControl(true));
          } else {
            resources.addControl(currResource['resource_id'], new UntypedFormControl(false));

          }
        });
      }, (err) => {
      }, () => {
        this.loading_resources = false;
        this.searchForm.get('start').setValue(true);
        // console.log('this.route.snapshot.queryParams', this.route.snapshot.queryParams);
      });

    });
  }


  adjustSort(key: string) {
    if (this.sortKey.value === key) {
      if (this.sortDirection.value === 'asc') {
        this.sortDirection.next('desc');
      } else {
        this.sortDirection.next('asc');
      }
      return;
    }
    this.sortKey.next(key);
    this.sortDirection.next('asc');
  }

  calc_by_terms(row) {
    const map_terms = {};
    const set_terms_name = new Set();
    if (row) {
      row.forEach(curr_activity => {
        set_terms_name.add(curr_activity.activity_term);
        if (!map_terms.hasOwnProperty(curr_activity.activity_term)) {
          map_terms[curr_activity.activity_term] = new Set();
        }
        map_terms[curr_activity.activity_term].add(curr_activity.entity_uri);
      });
      const out_put = [];
      Array.from(set_terms_name).sort().forEach( (currTerm: string) => {
        if (map_terms.hasOwnProperty(currTerm)) {
          // console.log('map_terms[currTerm]', map_terms[currTerm]);
          // console.log('map_terms[currTerm].length', map_terms[currTerm].length);
          // console.log('map_terms[currTerm].length.toString()', map_terms[currTerm].length.toString());
          // out_put.push('<strong>' + currTerm + ':</strong> ');
          out_put.push('<strong>' + currTerm + ':</strong> ' + map_terms[currTerm].size.toString());
        }
      });
      return '<small>' + out_put.join('<br>') + '</small>';
    } else {
      return '';
    }

  }

  calc_html_resources(row) {
    const out_put = [];
    // console.log('calc_html_resources', row);
    Array.from(row).forEach(currTerm => {
      // console.log('calc_html_resources v', currTerm);
      // console.log('calc_html_resources v', this.map_resources[currTerm.toString()]['resource_name']);

      out_put.push('<span class="badge  badge-pill badge-apicuron pl-1 text-center small">' + this.map_resources[currTerm.toString()]['resource_name'] + '</span>');
      });


    return '' + out_put.join(' ') + '';
  }

  calc_html_categories(row) {
    const out_put = [];
    if (Array.isArray(row)) {
      row.forEach(currTerm => {
        out_put.push('<strong>' + currTerm['activity_category'] + ': </strong>' + currTerm['count_activity_category'].toString());
      });
    }

    return '<small>' + out_put.join('<br>') + '</small>';
  }

  changeValuePageSize(itemsPerPage: string) {
    this.pageSize.next(Number(itemsPerPage));
  }


}
