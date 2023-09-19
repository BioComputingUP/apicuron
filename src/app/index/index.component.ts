import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ResourcesService } from '../resource/service/resources.service';
import { Resource } from '../models/resource.model';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit, AfterViewInit {
  resources$: Observable<Resource[]>;

  search_biocurators_text = ''
  
  // @ViewChild("search_biocurators", { static: false }) search_biocurators_button: ElementRef;

  constructor(protected resourceService: ResourcesService) {
    this.resources$ = this.resourceService.getAllResources();
  }
  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    
  }

}
