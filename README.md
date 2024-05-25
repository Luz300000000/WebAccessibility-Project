## Description
- The main goal of this project is to develop a web accessibility monitoring platform, aimed at website webmasters, which allows the evaluation and continuous accessibility monitoring of web pages. The platform must be able to receive as input the address of a website and the specific pages to be monitored, providing indicators relating to the accessibility of these pages.

## Main Features
- Register websites and pages (associated to websites) to be monitored
- Delete selected websites and pages (along with their evaluations)
- Initiate a new evaluation by choosing a website and at least one page registered in the website domain
- View detailed information about a website, including the list of pages, the website URL, the data of registration, the date of the last evaluation performed to any of its pages, the current state ('To be evaluated'; 'Evaluating'; 'Evaluated'; 'Error in evaluation') and some stats about the last evaluation performed
- Statistics for the last evaluation performed in a website, according to some accessibility indicators
  - These statistics can also be downloaded as an HTML file
- Search for the last evaluation of a specific page and access more details about that evaluation (each accessibility test performed over an element, stats, etc)
- All websites, pages and evaluations are kept in the DB
---
### Additional Note
- **To run the project**
  - Prepare a mongo server and set the URI in the backend (`app.js`) as the following:
```
const mongoDB_URI = <mongo-connection-string>;
```
- Install all necessary npm packages:
```
> npm install
```
### Tech Stack
- HTML/CSS/Javascript
- Typescript
- AngularJS
- NodeJS + ExpressJS
- MongoDB
