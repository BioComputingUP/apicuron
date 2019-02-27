import { Component, OnInit } from '@angular/core';
import {FormGroup, FormsModule, FormBuilder, Validators, ReactiveFormsModule, AbstractControl, FormControl} from '@angular/forms';
import {concat, BehaviorSubject, Observable, combineLatest} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

import {InternalService} from '../services/internal.service';
import {Router} from '@angular/router';
import {add} from 'ngx-bootstrap/chronos';
import {ProgressbarConfig} from 'ngx-bootstrap';
import {AuthService} from '../services/auth.service';

// import {FeatureViewer} from 'feature-viewer-ts-npm';
declare const FeatureViewer;

export function getProgressbarConfig(): ProgressbarConfig {
  return Object.assign(new ProgressbarConfig(), { animate: true, striped: true,  max: 100 });
}

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss'],
  providers: [{ provide: ProgressbarConfig, useFactory: getProgressbarConfig }]
})

export class BrowseComponent implements OnInit {
  loading_finished = false;

  // declaration, data loading
  disprotBrowse = null;

  curatorData = {};

  tableDataSource_f = new BehaviorSubject<any[]>([]);
  tableDataSource = new BehaviorSubject<any[]>([]);
  // displayedColumns = new BehaviorSubject<string[]>([
  //   'disprot_id',
  //   'acc',
  //   'organism',
  //   'ncbi_taxon_id',
  //   'name',
  // ]);
  displayedColumns = new BehaviorSubject<string[]>([
    'curatorName',
    'entriesSum',
    'termsSum',
    'contributed_resources'
  ]);

  // declaration, pagination
  currentPage = new BehaviorSubject<object>({'page': 1});
  pageSize = new BehaviorSubject<number>(10);
  dataOnPage = new BehaviorSubject<any[]>([]);

  // declaration, search
  searchFormControl = new FormControl();
  sortKey = new BehaviorSubject<string>('surname');
  sortDirection = new BehaviorSubject<string>('asc');

  constructor(
              private internalService: InternalService) {
  }

  ngOnInit() {
    const observables = [];
    observables.push(this.internalService.GetDisProtBrowse());
    concat(...observables).subscribe(
      browseData => {
        this.disprotBrowse = browseData;

        // this.disprotBrowse.forEach(currProteinObj => {
        //   let list_involvedCurators = new Set();
        //   currProteinObj.regions.forEach(currRegionObj => {
        //     if (!this.curatorData.hasOwnProperty(currRegionObj.curator)) {
        //       this.curatorData[currRegionObj.curator] = {
        //         curatorName: currRegionObj.curator,
        //         entriesSum: 0,
        //         termsSum: 0,
        //         disprotIDs: [],
        //         uniprotACCs: []
        //       }
        //     }
        //     list_involvedCurators.add(currRegionObj.curator);
        //     this.curatorData[currRegionObj.curator].termsSum++;
        //   });
        //   list_involvedCurators.forEach(key => {
        //      this.curatorData[key].entriesSum++;
        //      this.curatorData[key].disprotIDs.push(currProteinObj.disprot_id);
        //      this.curatorData[key].uniprotACCs.push(currProteinObj.acc);
        //   });
        //   //
        //   // console.log(currProteinObj)
        // });



        // console.log();

        this.tableDataSource_f.next(this.disprotBrowse);
        // console.log(browseData);
      },
      err => console.log(err),
      () => {
        this.disprotBrowse.forEach(currObj => {
          currObj['number_disprot_terms'] = currObj['contribution'].length;
          const entriesSet = new Set();
          const resourcesSet = new Set();
          currObj['contribution'].forEach(currEntry => {
            entriesSet.add(currEntry.resource_entry_id);
            resourcesSet.add(currEntry.resource);
          });
          currObj['number_disprot_entries'] = Array.from(entriesSet).length;
          currObj['contributed_resources'] = Array.from(resourcesSet).join(', ');
          currObj['displayName'] = currObj.firstname + ' ' + currObj.surname;
        });
        combineLatest(this.tableDataSource_f, this.searchFormControl.valueChanges, this.sortKey, this.sortDirection)
          .subscribe(([changedHeroData, searchTerm, sortKey, sortDirection]) => {
            const heroesArray = Object.values(changedHeroData);
            let filteredHeroes: any[];

            if (!searchTerm) {
              filteredHeroes = heroesArray;
            } else {
              const filteredResults = heroesArray.filter(hero => {
                return Object.values(hero).reduce((prev, curr) => {
                  if (curr) {
                    // console.log(curr.toString().toLowerCase());
                    // console.log(JSON.stringify(curr).toLowerCase());
                    return prev || JSON.stringify(curr).toLowerCase().includes(searchTerm.toLowerCase());
                  }
                  return prev;
                }, false);
              });
              filteredHeroes = filteredResults;
            }

            const sortedHeroes = filteredHeroes.sort((a, b) => {
              if (a[sortKey] > b[sortKey]) {
                return sortDirection === 'asc' ? 1 : -1;
              }
              if (a[sortKey] < b[sortKey]) {
                return sortDirection === 'asc' ? -1 : 1;
              }
              return 0;
            });

            this.tableDataSource.next(sortedHeroes);
          });

        this.searchFormControl.setValue('');

        combineLatest(this.tableDataSource, this.currentPage, this.pageSize)
          .subscribe(([allSources, currentPage, pageSize]) => {
            const startingIndex = (currentPage['page'] - 1) * pageSize;
            const onPage = allSources.slice(startingIndex, startingIndex + pageSize);
            this.dataOnPage.next(onPage);
          });

        this.loading_finished = true;
      }
    );
  }

  exampleSearch() {
    // const exampleSearch = 'Cellular tumor antigen p53';
    const exampleSearch = 'P04637';
    this.searchFormControl.setValue(exampleSearch);
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

}



// pmidPattern = new RegExp(/^[0-9]{7}$|^[0-9]{8}$/mi);
// upaccPattern = new RegExp(/^[OPQ][0-9][A-Z0-9]{3}[0-9](-[0-9]+)*$|^[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}(-[0-9]+)*$/mi);




// examplePubMed() {
//   const examplePMID = '27899601';
//   // this.pubmedForm.controls.simple.get('pmid').setValue(examplePMID);
// }

//

// pageChanged(event: PageChangedEvent): void {
//   // const startItem = (this.currentPage.value - 1)* this.pageSize;
//   const startItem = (event.page - 1) * this.pageSize;
//   const endItem = event.page * this.pageSize;
//   this.dataOnPage_old = this.disprotBrowse.slice(startItem, endItem);
//   this.tableDataSource.next(this.disprotBrowse.slice(startItem, endItem));
//   // this.returnedArray = this.contentArray.slice(startItem, endItem);
// }
//



// combineLatest(this.disprotBrowse, this.searchFormControl.valueChanges).subscribe(
//   ([changedBrowseData, searchTerm]) => {
//     const browseArray = Object.values(changedBrowseData);
//     console.log(browseArray)
//
//     if (!searchTerm) {
//       console.log('!searchTerm')
//
//       this.browseDataFiltered = browseArray;
//       this.dataOnPage_old = this.browseDataFiltered.slice(0, this.pageSize);
//
//       return;
//     }
//     const filteredResults = browseArray.filter(entry => {
//       return Object.values(entry).reduce((prev, curr) => {
//         console.log('browseArray.filter')
//
//         return prev || curr.toString().toLowerCase().includes(searchTerm.toLowerCase());
//       }, false);
//     });
//     this.browseDataFiltered = browseArray;
//     this.dataOnPage_old = this.browseDataFiltered.slice(0, this.pageSize);
//
//   }
//
//
// );





// checkPublication() {
//   const observables = [];
//   let sequences = '';
//   const uniprotIds = [];
//
//   observables.push(this.externalService.GetPubMedBibliography(this.pmid.value));
//   concat(...observables).subscribe(
//     seq => {this.fasta = JSON.parse(seq);
//     },
//     err => console.log(err),
//     () => {
//     });
//
//
//
//
//
//   // this.pmid.setValue('');
//
//
//
//
// }




// validatePMID(control: AbstractControl) {
//   if (control.value === '' || this.pmidPattern.test(control.value)) {
//     return null;
//   }
//   return {validPMID: true};
// }











// buildPubmedForm(){
//   this.pubmedForm = this.fb.group({
//     simple: this.fb.group({
//       pmid: ['', this.validatePMID.bind(this)],
//       upacc: ['', this.validatePMID.bind(this)],
//       missingPMID: [''],
//     }),
//
//     advanced: this.fb.group({
//       pmid: [''],
//       uniprot:['']
//     }),
//     });
//
//   this.pubmedForm.controls.simple.get('pmid').valueChanges.subscribe((data)=> {
//     this.pubmedData.title = null;
//     this.pubmedData.abstract = null;
//     if (!data) {
//       this.pubmedForm.controls.simple.get('missingPMID').reset();
//     }
//     if(this.pmidPattern.test(data)){
//
//       const observables = [];
//       let sequences = '';
//       const uniprotIds = [];
//       //
//       observables.push(this.externalService.GetPubMedBibliography(data));
//       concat(...observables).subscribe(
//         seq => {
//           console.log(seq)
//           this.pubmedData.title = seq['resultList'].result[0].title;
//           this.pubmedData.abstract = seq['resultList'].result[0].abstractText;
//           },
//         err => console.log(err),
//         () => console.log('ok'));
//       this.fasta.err = 'yes PubMedID'
//     } else {
//       this.fasta.err = 'non PubMedID'
//     }
//   });
//   this.pubmedForm.controls.simple.get('upacc').valueChanges.subscribe((data)=> {
//     this.uniprotData = null;
//     this.mobiDBData = null;
//     // if (!data) {
//     //   this.pubmedForm.controls.simple.get('missingPMID').reset();
//     // }
//     if(this.upaccPattern.test(data)){
//       const observables = [];
//       observables.push(this.externalService.GetProteinsAPI(data));
//       observables.push(this.externalService.GetmobidbConsensus(data))
//       concat(...observables).subscribe(
//         seq => {
//           if(seq.hasOwnProperty('mobidb_consensus')){
//             this.mobiDBData = seq;
//           }else {
//             this.uniprotData = seq[0];
//           }},
//         err => console.log(err),
//         () => {console.log('ok');
//
//           let fv = new FeatureViewer(this.uniprotData.sequence.sequence,
//             '#' + 'featureviewer', {
//               showSubFeatures: true,
//               toolbar: false, //current zoom & mouse position
//               bubbleHelp: false,
//               flagColor: "#D6B26D",
//               zoomMax: 10 //define the maximum range of the zoom
//             });
//
//
//           // console.log(this.mobiDBData.mobidb_consensus);
//           if (this.mobiDBData) {
//             let colors = {
//               D: "#ec1c17",
//               C: "#bbbbbb",
//               S: "#0087BD"
//             }
//             let mobidbFeatureRegionFull = [];
//             let mobidbFeatureRegionMissingRes = [];
//             let mobidbFeatureRegionMobile = [];
//             for (let method of this.mobiDBData.mobidb_consensus.disorder.derived) {
//               if (method['method'] == "full") {
//                 for (let region of method['regions']) {
//                   mobidbFeatureRegionFull.push({"x": region[0], "y": region[1], color: colors[region[2].toUpperCase()]})
//
//                 }
//               }
//               if (method['method'] == "mobile") {
//                 for (let region of method['regions']) {
//                   mobidbFeatureRegionMobile.push({"x": region[0], "y": region[1], color: colors[region[2].toUpperCase()]})
//
//                 }
//               }
//               if (method['method'] == "missing_residues") {
//                 for (let region of method['regions']) {
//                   mobidbFeatureRegionMissingRes.push({"x": region[0], "y": region[1], color: colors[region[2].toUpperCase()]})
//
//                 }
//               }
//             }
//
//             // if (mobidbFeatureRegionFull) {
//             //   fv.addFeature({
//             //     data: mobidbFeatureRegionFull,
//             //     type: "rect",
//             //     name: "MobiDB",
//             //     hasSubFeatures: true,
//             //   });
//             // }
//
//             let subfeaturesMobiDB=[];
//
//                 if (mobidbFeatureRegionMobile){
//                   subfeaturesMobiDB.push({
//                     data: mobidbFeatureRegionMobile,
//                     type: "rect",
//                     name: "MobiDB Mobile",
//                   });
//                 }
//                 if (mobidbFeatureRegionMissingRes){
//
//                   subfeaturesMobiDB.push({
//                     data: mobidbFeatureRegionMissingRes,
//                     type: "rect",
//                     name: "MobiDB Missing Res.",
//                   });
//
//                 }
//
//             fv.onFlagSelected((d) => {
//               // console.log('feature');
//
//               console.log('SELECTED FEATURE', d.detail);
//               if (d.detail.id == "MobiDB")
//
//                 fv.addSubFeature({
//                   parentId: d.detail.dom_id,
//                   subFeatures: subfeaturesMobiDB
//                 })
//
//
//             });
//
//           }
//        });
//       this.fasta.err = 'yes PubMedID'
//
//     } else {
//       this.fasta.err = 'non PubMedID'
//     }
//   });
//
// }
