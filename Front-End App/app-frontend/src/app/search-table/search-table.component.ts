import { Component } from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import { Table_Data } from '../models/table.model';

// export interface PeriodicElement {
//   name: string;
//   position: number;
//   weight: number;
//   symbol: string;
// }
export interface ReviewElement {
  name: string;
  position: string;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: ReviewElement[] = [
  {position: 'Amazon', name: 'Link Test 1 ', weight: 3, symbol: 'Review Test 1'},
  {position: 'Ebay', name: 'Link Test 2', weight: 4, symbol: 'Review Test 2'}
];

@Component({
  selector: 'app-search-table',
  imports: [MatTableModule],
  templateUrl: './search-table.component.html',
  styleUrl: './search-table.component.css'
})
export class SearchTableComponent {
  displayedColumns: string[] = ['E-Commerce Platform', 'Link', 'Rating', 'Review'];
  dataSource = ELEMENT_DATA;

}
