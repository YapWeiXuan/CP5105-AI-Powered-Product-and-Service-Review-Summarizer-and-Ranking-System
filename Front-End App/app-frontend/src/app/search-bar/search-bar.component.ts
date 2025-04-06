import { Component,inject } from '@angular/core';
import {MatIconButton} from '@angular/material/button'
import {MatIcon} from '@angular/material/icon'
import {OverlayModule} from '@angular/cdk/overlay'
import { SearchBarService } from '../services/search-bar.service';
import { SearchOverlayComponent } from "../components/search-overlay/search-overlay.component";
import { NgClass } from '@angular/common';
import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';
import { delay } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [MatIconButton, MatIcon, OverlayModule, SearchOverlayComponent, NgClass],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})

export class SearchBarComponent {
  constructor(@Inject(DOCUMENT) public document: Document) {}

  searchBarService = inject(SearchBarService);
  overlayOpen = this.searchBarService.overlayOpen;
  searchTerm = this.searchBarService.searchTerm;
  query_loading = this.searchBarService.query_loading;
  articleNumber = this.searchBarService.articleNumber;


  // search(searchTerm: string, articleNumber: string){
  search(searchTerm: string){

    // delay(2000)
    // console.log('search',articleNumber, typeof(articleNumber))
    // let text = articleNumber.toString();
    // var y: number = +articleNumber;
    // console.log('search',articleNumber, y)

    if (!searchTerm) return;

    // this.searchBarService.search(searchTerm,articleNumber)
    this.searchBarService.search(searchTerm)

    // this.searchBarService



  }

  clearSearch(){
    this.searchBarService.clearSearch();
  }



}
