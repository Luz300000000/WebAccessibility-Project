import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import urlRegexSafe from 'url-regex-safe';

import { WebsiteService } from '../website.service';
import { Website } from '../website';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Page } from '../page';
import { PageService } from '../page.service';
import { sanitizeURL, sleep } from '../util';

@Component({
  selector: 'app-website-form',
  templateUrl: './website-form.component.html',
  styleUrls: ['./website-form.component.css'],
})
export class WebsiteFormComponent {
  constructor(
    private websiteService: WebsiteService,
    private pageService: PageService,
    private _snackBar: MatSnackBar
  ) {}

  pagesURLs: String[] = [];
  urlRegex = urlRegexSafe({ returnString: true });

  urlFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern(this.urlRegex),
  ]);
  pageFormControl = new FormControl('', Validators.pattern(this.urlRegex));

  onSubmit(): void {
    let websiteURL =
      this.urlFormControl.value == null ? '' : sanitizeURL(this.urlFormControl.value);
    let createdDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let state = 'Por avaliar';

    this.pagesURLs.forEach((pageURL) => {
      this.addPage(pageURL, websiteURL, createdDate);
    });

    const addWebsiteAsync = async () => {
      await sleep(200);
      this.addWebsite(websiteURL, createdDate, state);
    };

    addWebsiteAsync();
    this._snackBar.open('The website has been registered.', 'OK');
  }

  addWebsite(url: String, createdDate: String, state: String): void {
    url = url.trim();
    if (!url) return;
    else if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }
    this.websiteService
      .addWebsite({ url, createdDate, state } as Website)
      .subscribe();
  }

  addPage(url: String, websiteURL: String, createdDate: String): void {
    if (!url || !websiteURL) return;
    else {
      this.pageService
        .addPage({ url, websiteURL, createdDate, state:'Por avaliar' } as Page)
        .subscribe();
    }
  }

  addPageURL(): void {
    let pageURL = this.pageFormControl.value;
    let websiteURL = this.urlFormControl.value;

    if (pageURL !== null && websiteURL !== null) {
      websiteURL = sanitizeURL(this.urlFormControl.value!);
      pageURL = sanitizeURL(this.pageFormControl.value!);

      if (websiteURL.endsWith('/')) {
        websiteURL = websiteURL.slice(0, -1);
      }
      if (
        this.pageFormControl.valid &&
        this.urlFormControl.valid &&
        pageURL.startsWith(websiteURL + '/')
      ) {
        this.pagesURLs.push(pageURL);
        console.log(this.pagesURLs);
        this._snackBar.open('Page added successfully.', 'OK');

      } else
        alert(
          'Invalid page URL!\nPlease insert a valid page URL with the correct domain.'
        );
    }
  }

  resetPagesURLs(): void {
    this.pagesURLs = [];
    this.pageFormControl.reset();
    console.log(this.pagesURLs);
  }
}
