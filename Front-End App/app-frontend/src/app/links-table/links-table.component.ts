import { Component } from '@angular/core';
import { SearchBarService } from '../services/search-bar.service';
import { Inject,inject } from '@angular/core';
import { NgIf,NgFor } from '@angular/common';
import { MatTableModule } from '@angular/material/table';




@Component({
  selector: 'app-links-table',
  imports: [NgIf,NgFor,MatTableModule ],
  templateUrl: './links-table.component.html',
  styleUrl: './links-table.component.css'
})



export class LinksTableComponent {

  constructor(){
    ELEMENT_DATA: [
      {name: 'Link Test 1 '}
    ];
  }
  searchBarService = inject(SearchBarService);
  list_of_links = this.searchBarService.tableData.links;
  ELEMENT_DATA = this.list_of_links


  displayedColumns: string[] = ['E-Commerce Platform', 'Link', 'Rating', 'Review'];
  // dataSource = ELEMENT_DATA;
}
