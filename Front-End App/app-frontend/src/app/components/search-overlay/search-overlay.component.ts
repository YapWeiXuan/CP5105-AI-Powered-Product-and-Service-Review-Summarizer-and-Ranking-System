import { Component, computed, inject } from '@angular/core';
import {MatDivider} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import { SearchBarService } from '../../services/search-bar.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-search-overlay',
  imports: [MatDivider, MatListModule, MatIcon],
  templateUrl: './search-overlay.component.html',
  styleUrl: './search-overlay.component.css'
})
export class SearchOverlayComponent {
  searchBarService = inject(SearchBarService);
  // recentSearches = this.searchBarService.recentSearches;
  recentSearches = computed(() => this.searchBarService.recentSearches().slice(0,5))
  searchTerm = this.searchBarService.searchTerm()

  deleteRecentSearch(searchTerm: string){
    this.searchBarService.deleteRecentSearch(searchTerm)

  }

  addToQuery(Term:string){
    this.searchBarService.searchTerm.set(Term)
    this.searchBarService.overlayOpen.set(false)
  }

  performSearch(searchTerm:string){
    this.searchBarService.search(searchTerm)
  }


}
