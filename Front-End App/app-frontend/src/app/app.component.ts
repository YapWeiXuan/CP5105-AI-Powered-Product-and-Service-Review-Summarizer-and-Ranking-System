import { Component, signal , computed ,ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import {MatToolbar} from '@angular/material/toolbar'
import { SearchBarComponent } from './search-bar/search-bar.component';
import { SearchTableComponent } from './search-table/search-table.component';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { SearchBarService } from './services/search-bar.service';
import { inject } from '@angular/core';
import { ReviewTableComponent } from './review-table/review-table.component';
import { LinksTableComponent } from './links-table/links-table.component';

// install Angular materials
// Using ng add @angular/material

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    HeaderComponent,
    MatToolbar,
    SearchBarComponent,
    // SearchTableComponent,
    NgIf,
    MatButtonModule,
    MatProgressSpinnerModule,
    ReviewTableComponent,
    LinksTableComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent{
  // query_loading = signal(false)
  // query_received = signal(false)

  // constructor(private changeDetectorRef: ChangeDetectorRef ){
  //   this.searchBarService.query_loading()
  // }


  searchBarService = inject(SearchBarService);
  query_loading = computed(() => this.searchBarService.query_loading());
  query_received = computed(() => this.searchBarService.query_received());
  links_received = computed(() => this.searchBarService.links_received());

  // constructor(){
  //   private searchBarService : SearchBarService
  // }



  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.query_loading = computed(() => this.searchBarService.query_loading());
    this.query_received = computed(() => this.searchBarService.query_received());
    this.links_received = computed(() => this.searchBarService.links_received());
    // this.query_loading.set(false);
    // this.query_received.set(false);
    // this.links_received.set(false)
    console.log('query_loading : ', this.query_loading)
  }

  title = 'app-frontend';

  elseBlock = "Enter a Query in the search bar ^"
}
