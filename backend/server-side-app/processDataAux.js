/** Returns true if  the page has at least one accessibility error */
function containsErrors(report) {
    if (report.metadata.failed > 0)
      return true
    else
      return false;
}

/** Returns counter errors of types A, AA and AAA in a page*/
function calculateErrorTypes(report) {
  let countA = 0;
  let countAA = 0;
  let countAAA = 0;

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
  return [countA, countAA, countAAA];
}

/** Returns List of the 10 most common accessibility errors across all evaluated website pages */
function mostCommonErrors(report, pagesLen) {
  // TODO
  return [];
}

function getRatio(counter, pagesLen) {
  return parseFloat(((counter / pagesLen) * 100).toFixed(2));
}

/** Total and percentage of pages for every accessibility indicator */
function websiteData(pagesData) {
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
    "errorsAAA": [pagesErrorsAAA, getRatio(pagesErrorsAAA, pagesLen)]
  }
  return websiteData;
}

module.exports = {
  containsErrors,
  calculateErrorTypes,
  mostCommonErrors,
  websiteData
};