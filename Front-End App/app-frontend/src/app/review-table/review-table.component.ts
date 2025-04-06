import { Component } from '@angular/core';
import { SearchBarService } from '../services/search-bar.service';
import { Inject,inject } from '@angular/core';
import { NgIf,NgFor } from '@angular/common';


@Component({
  selector: 'app-review-table',
  imports: [],
  templateUrl: './review-table.component.html',
  styleUrl: './review-table.component.css'
})
export class ReviewTableComponent {
  searchBarService = inject(SearchBarService);
  review = this.searchBarService.tableData.report
}
