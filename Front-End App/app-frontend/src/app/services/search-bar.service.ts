import { effect, Injectable, signal,Inject,inject } from '@angular/core';
import { PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from '@angular/common';
// import { WindowRef } from './services/windowRef.service';
import { CommonModule, DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Table_Data } from '../models/table.model';
import { delay, finalize ,tap} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SearchBarService {
  private httpClient = inject(HttpClient);
  // tableData : any =  Array<Table_Data>;
  tableData :   Table_Data = {
    query: '',
    links: ["Back End Isn't Connected!"],
    report: ` Back End Isn't Connected!
    `
  };

  private API_URL = 'http://127.0.0.1:8000/'


  overlayOpen = signal(false);

  recentSearches = signal<string[]>(JSON.parse(window.localStorage.getItem('recentSearches()')?? '[]') )
  searchTerm = signal('');
  query_loading = signal(false)
  query_received = signal(false)
  links_received = signal(false)
  string_query = ""
  string_links = ""
  string_review =""
  articleNumber = signal('');

  constructor( @Inject(DOCUMENT) document:Document){
    document.defaultView //defaultView is the window object
  }

  // async search(searchTerm:string,articleNumber:string){
  async search(searchTerm:string){

    //perform the search
    console.log('service this.query_loading 1' , this.query_loading() )
    this.query_loading.set(true)
    console.log('service this.query_loading 2' , this.query_loading() )
    this.links_received.set(false)
    this.query_received.set(false)

    this.searchTerm.set(searchTerm)
    this.overlayOpen.set(false)
    this.addToRecentSearches(searchTerm);

    //Send API Request to BackEnd to get the Links
    var formData : FormData = new FormData()
    formData.append('request', searchTerm)
    // formData.append('no_of_articles', articleNumber)
    console.log(formData)
    // await delay(3000)
    var subscription = await  this.httpClient
    .post(this.API_URL+'response_GET_LINKS',formData)
    .pipe(
      finalize(()=>this.links_received.set(true))
    )
    .subscribe(
      (resData) =>{
        console.log(resData);
        // resData = JSON.stringify(resData)

        this.tableData = resData as Table_Data;
        // {query: 'shampoo', links: Array(3), html_texts: Array(3), report: ''}
        // this.tableData.query = resData.query
        this.links_received.set(true)


        // string_query =

        console.log(this.links_received())

        console.log('this.tableData.query' ,this.tableData.query);
    }
  )

  //

  //Send API Request to BackEnd to get Review Ranking List
  var subscription = await  this.httpClient
    .post(this.API_URL+'response_GET_REVIEW',formData)
    .pipe(
      finalize(()=>this.query_received.set(true))
    )
    .subscribe(
      (resData) =>{
        console.log(resData);
        // resData = JSON.stringify(resData)

        this.tableData = resData as Table_Data;
        // {query: 'shampoo', links: Array(3), html_texts: Array(3), report: ''}
        // this.tableData.query = resData.query

        // string_query =

        // this.query_loading.set(false)

        console.log('this.tableData.query' ,this.tableData.query);
    }


  )

  // this.query_received.set(true)



  return this.tableData

  }







  addToRecentSearches(searchTerm: string){
    const lowerCaseTerm = searchTerm.toLowerCase();
    this.recentSearches.set([
      lowerCaseTerm,
      ...this.recentSearches().filter(s => s !== lowerCaseTerm),
    ])

  }

  deleteRecentSearch(searchTerm: string){
    this.recentSearches.set(this.recentSearches().filter(s => s!= searchTerm))
  }

  //Whenever signal changes, the effect is called
  saveLocalStorage = effect(() => {
    window.localStorage.setItem('recentSearches()',JSON.stringify(this.recentSearches()))
    // JSON stringify to change from string to string[]
  })

  clearSearch(){
    this.searchTerm.set('')
    this.overlayOpen.set(true)
  }
}
