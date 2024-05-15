import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { WebsiteService } from '../website.service';
import { Website } from '../website';
import { MatSort, Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { PageService } from '../page.service';
import { Page } from '../page';
import { sleep } from '../util';

@Component({
  selector: 'app-websites',
  templateUrl: './websites.component.html',
  styleUrls: ['./websites.component.css']
})
export class WebsitesComponent implements OnInit {

  websites: Website[] = [];
  filteredWebsites: Website[] = []; // Array para armazenar websites filtrados
  estadoFiltrado: string = ''; // Estado selecionado para filtro     
  
  displayedColumns: string[] = ['url', 'createdDate', 'lastEvaluationDate', 'state'];

  @ViewChild(MatSort) sort: MatSort = new MatSort;

  constructor(
    private websiteService: WebsiteService,
    private pageService: PageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const getWebsitesAsync = async () => {
      this.getWebsites();
      await sleep(10000);
      this.getWebsites();
    };
    getWebsitesAsync();
  }

  navigateToWebsite(websiteId: String): void {
    this.router.navigate(['/website/', websiteId]);
  }

  getWebsites(): void {
    this.websiteService.getWebsites()
      .subscribe(websites => {
        this.websites = websites;
        this.applyFilter(); // Aplica o filtro após obter os websites
      });
  }

  getWebsitePages(websiteURL: string): Page[] {
    let pages: Page[] = [];
    this.pageService.getPagesFromWebsite(websiteURL)
      .subscribe(result => pages = result);

    return pages;
  }

  // Aplica o filtro com base no estado selecionado
  applyFilter(): void {
    this.filteredWebsites = this.websites.filter(website => {
      return !this.estadoFiltrado || website.state === this.estadoFiltrado;
    });
  }

  // Função para ordenar os dados
  sortData(sort: Sort) {
    const data = this.filteredWebsites.slice();
    if (!sort.active || sort.direction === '') {
      return;
    }
    
    this.filteredWebsites = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'createdDate':
          return compare(a.createdDate, b.createdDate, isAsc);
        case 'lastEvaluationDate':
          return compare(a.lastEvaluationDate, b.lastEvaluationDate, isAsc);
        default:
          return 0;
      }
    });

    function compare(a: number | string, b: number | string, isAsc: boolean) {
      return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }
  }

}
