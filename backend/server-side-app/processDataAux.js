const json2html = require('node-json2html');


/** Returns true if  the page has at least one accessibility error */
function containsErrors(report) {
    if (report.metadata.failed > 0)
      return true
    else
      return false;
}

/** Returns counter errors of types A, AA and AAA in a page*/
function getErrorCounters(report) {
  let countA = 0;
  let countAA = 0;
  let countAAA = 0;
  let failedRulesMap = new Map();

  // act-rules assertions
  let assertionsAct = report.modules['act-rules'].assertions;
  for (let assertion in assertionsAct) {

    // count failed results
    let failed = 0;
    let results = assertionsAct[`${assertion}`].results;
    for (let i = 0; i < results.length; i++) {
      if (results[i].verdict === 'failed')
        failed++;
    }

    if (failed > 0) {
      // count failed rules occurrences
      failedRulesMap.set(assertion, failed);

      // Count A, AA, AAA errors
      let rules = assertionsAct[`${assertion}`].metadata['success-criteria'];
      for (let i = 0; i < rules.length; i++) {
        let level = rules[i].level;
        if (level === 'A')
          countA += failed;
        else if (level === 'AA')
          countAA += failed;
        else if (level === 'AAA')
          countAAA += failed;
      }
    }
  }

  // wcag-techniques assertions
  let assertionsWCAG = report.modules['wcag-techniques'].assertions;
  for (let assertion in assertionsWCAG) {
    
    // count failed results
    let failed = 0;
    let results = assertionsWCAG[`${assertion}`].results;
    for (let i = 0; i < results.length; i++) {
      if (results[i].verdict === 'failed')
        failed++;
    }

    if (failed > 0) {
      // count failed rules occurrences
      failedRulesMap.set(assertion, failed);

      // Count A, AA, AAA errors
      let rules = assertionsWCAG[`${assertion}`].metadata['success-criteria'];

      for (let i = 0; i < rules.length; i++) {
        let level = rules[i].level;
        if (level === 'A')
          countA += failed;
        else if (level === 'AA')
          countAA += failed;
        else if (level === 'AAA')
          countAAA += failed;
      }
    }
  }

  const sortedMapEntries = Array.from(failedRulesMap.entries()).sort((a, b) => b[1] - a[1]);
  const sortedFailedRules = new Map(sortedMapEntries.slice(0, 10));

  return [countA, countAA, countAAA, sortedFailedRules];
}

/** Returns List of the 10 most common accessibility errors across all evaluated website pages */
function mergeSortPageErrorsMaps(pagesErrorsMaps) {
  const combinedMap = new Map();

  for (let pageEntry of Object.entries(pagesErrorsMaps)) {
    for (let [rule, count] of Object.entries(pageEntry[1])) {
      if (combinedMap.has(rule)) {
          combinedMap.set(rule, combinedMap.get(rule) + count);
      } else {
          combinedMap.set(rule, count);
      }
    }
  }
  
  // Sort combined map
  const sortedEntries = Array.from(combinedMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);

  return sortedEntries;
}

function getRatio(counter, pagesLen) {
  return parseFloat(((counter / pagesLen) * 100).toFixed(2));
}

/** Total and percentage of pages for every accessibility indicator */
function websiteData(pagesData, mostCommonErrorsMap) {
  let pagesNoErrors = 0;
  let pagesErrors = 0;
  let pagesErrorsA = 0;
  let pagesErrorsAA = 0;
  let pagesErrorsAAA = 0;

  pagesData.forEach(pageData => {
    if (pageData['contains-errors'] === false)
      pagesNoErrors++
    else
      pagesErrors++;

    if (pageData.errorsA > 0)
      pagesErrorsA++;

    if (pageData.errorsAA > 0)
      pagesErrorsAA++;

    if (pageData.errorsAAA > 0)
      pagesErrorsAAA++;
  });

  let pagesLen = pagesData.length;

  let websiteData = {
    "no_errors": [pagesNoErrors, getRatio(pagesNoErrors, pagesLen)],
    "errors": [pagesErrors, getRatio(pagesErrors, pagesLen)],
    "errorsA": [pagesErrorsA, getRatio(pagesErrorsA, pagesLen)],
    "errorsAA": [pagesErrorsAA, getRatio(pagesErrorsAA, pagesLen)],
    "errorsAAA": [pagesErrorsAAA, getRatio(pagesErrorsAAA, pagesLen)],
    "most_common_errors": mostCommonErrorsMap
  }
  return websiteData;
}

/** Generates HTML template for counter/ratio of accessibility errors indicator */
function generateErrorsTemplate(title, values) {
  const template = {
      '<>': 'div',
      'html': [
          {'<>': 'h3', 'html': title},
          {'<>': 'ul', 'html':
            `<li><strong>Total:</strong> ${values[0]}</li>`+
            `<li><strong>Percentage:</strong> ${values[1]}%</li>`
          }
      ]
  };
  return json2html.render({}, template);
}

/** Generates HTML template for the list of the most common accessibility errors indicator */
function generateMostCommonErrorsTemplate(errors) {
  const template = {
        '<>': 'div',
        'html': [
            {'<>': 'h3', 'html': 'Most common errors'},
            {'<>': 'table', 'html': [
                {'<>': 'thead', 'html': '<tr><th>Index</th><th>Rule/Technique Error Code</th><th>Count</th></tr>'},
                {'<>': 'tbody', 'html': errors.map((error, index )=>
                  `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${error[0]}</td><td>${error[1]}</td>
                  </tr>
                  `
                ).join('')}
            ]}
        ]
  };
  return json2html.render({}, template);
}

function getHtmlReport(data, websiteURL) {

  // Render and generate HTML templates for all accessibility indicators
  const noErrorsHtml = generateErrorsTemplate('Pages with no errors', data.no_errors);
  const errorsHtml = generateErrorsTemplate('Pages with errors', data.errors);
  const errorsAHtml = generateErrorsTemplate('Pages with errors of type A', data.errorsA);
  const errorsAAHtml = generateErrorsTemplate('Pages with errors of type AA', data.errorsAA);
  const errorsAAAHtml = generateErrorsTemplate('Pages with errors of type AAA', data.errorsAAA);
  const mostCommonErrorsHtml = generateMostCommonErrorsTemplate(data.most_common_errors);

  // Combine all the HTML content
  const htmlContent = `
  <html>
  <head>
    <title>Acessibility Indicators Report</title>
    <style>
      body {
        font-family: Roboto, sans-serif;
      }
      table {
        border-collapse: collapse;
        width: 45%;
      }
      th, td {
        border: 1px solid #dddddd;
        text-align: left;
        padding: 8px;
      }
      th {
        background-color: #f2f2f2;
      }
    </style>
  </head>
  <body>
    <h2>Accessibility Indicators Report</h2>

    <h3>Website Evaluated</h3>
    <span>${websiteURL}</span>

    ${noErrorsHtml}
    ${errorsHtml}
    ${errorsAHtml}
    ${errorsAAHtml}
    ${errorsAAAHtml}
    ${mostCommonErrorsHtml}
  </body>
  </html>
  `;

  console.log('HTML report generated:\n', htmlContent);
  return htmlContent;
}

module.exports = {
  containsErrors,
  getErrorCounters,
  mergeSortPageErrorsMaps,
  websiteData,
  getHtmlReport
};