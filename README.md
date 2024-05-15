## Description
The main goal of this project is to develop a web accessibility monitoring platform, aimed at website webmasters, which allows the evaluation and continuous monitoring of the accessibility of web pages. The platform must be able to receive as input the address of a website and the specific pages to be monitored, providing indicators relating to the accessibility of these pages.

## Main Features
- Register websites and pages (associated to websites) to be monitored
- Delete selected websites and pages (along with their evaluations)
- Initiate a new evaluation by choosing a website and at least one page registered in the website domain
- View detailed information about a website, including the list of pages, the website URL, the data of registration, the date of the last evaluation performed to any of its pages, the current state ('To be evaluated'; 'Evaluating'; 'Evaluated'; 'Error in evaluation') and some stats about the last evaluation performed
- The accessibility stats present in the last evaluation of a website include the following indicators:
  - Total and percentage of pages with no accessibility errors
  - Total and percentage of pages with at least one accessibility error
  - Total and percentage of pages with at least one accessibility A error
  - Total and percentage of pages with at least one accessibility AA error
  - Total and percentage of pages with at least one accessibility AAA error
- All websites, pages and evaluations are kept in the DB

### Tech Stack
- HTML/CSS/Javascript
- Typescript
- AngularJS
- NodeJS + ExpressJS
- MongoDB
