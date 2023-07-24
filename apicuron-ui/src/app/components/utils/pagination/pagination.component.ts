import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from "@angular/common";

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit {


  @Input() totalItems: number;
  @Input() itemsPerPage: number;

  @Input('ngModel') currentPage: number;
  @Output('ngModelChange') currentPageChange = new EventEmitter();

  @Output() pageChanged = new EventEmitter();
  
  @Input() maxSize= 5;


  pages_list(){
    // if the total number of pages is smaller than the total number of items, we use the maximum number of pages instead
    const button_count = this.max_page < this.maxSize ? this.max_page : this.maxSize
    if(this.currentPage < button_count) {
      return [...Array(button_count).keys()].map(x => ++x);
    }
    if(this.currentPage > (this.max_page - button_count)){
      return [...Array(button_count).keys()].map(x => x + (this.max_page - button_count))
    }
    return [...Array(button_count).keys()].map(x => x + this.currentPage - Math.floor(button_count / 2))
  }

  go_to_page(page:number){
    this.currentPageChange.emit(page)
    this.pageChanged.emit({page})
    this.currentPage = page;
  }


  get max_page(){
    return Math.round(this.totalItems / this.itemsPerPage);
  }

  previous_page(){
    if(this.currentPage > 1){
      this.go_to_page(this.currentPage - 1)
    }
  }
  next_page(){
    if(this.currentPage + 1 < this.max_page){
      this.go_to_page(this.currentPage + 1)
    }
  }
  constructor() {
  }

  ngOnInit(): void {
  }

}
