observeWrapperChanges();

function observeWrapperChanges() {
  const wrapper = document.querySelector('#divHienthiKQHT');
  if (!wrapper) {
    return;
  }

  const observer = new MutationObserver(handleMutations);
  observer.observe(wrapper, { childList: true });
}

/**
 *
 * @param {MutationRecord[]} mutations
 * @param {MutationObserver} observer
 */
function handleMutations(mutations, observer) {
  for (const mutation of mutations) {
    if (mutation.type === 'childList' && mutation.addedNodes.length) {
      /** @type {HTMLTableElement | null} */
      const markTable = document.querySelector('#divHienthiKQHT table');

      if (markTable) {
        displayMarkPopupButton(markTable);
        observer.disconnect();
      }
    }
  }
}

/**
 *
 * @param {HTMLTableElement} markTable
 * @returns
 */
function displayMarkPopupButton(markTable) {
  const needAssessmentClassRows = Array.from(
    markTable.querySelectorAll('tr')
  ).filter(
    (tr) =>
      tr.childElementCount === 9 &&
      tr.children[4].textContent?.includes('Khảo sát')
  );

  if (!needAssessmentClassRows.length) {
    return;
  }

  const assessmentUrl = /** @type {HTMLAnchorElement} */ (
    needAssessmentClassRows[0].children[4].children[0]
  ).href;
  const studentId = assessmentUrl.substring(
    assessmentUrl.indexOf('&PID=') + 5,
    assessmentUrl.indexOf('&classId=')
  );

  needAssessmentClassRows.forEach((row) => {
    const classId = row.children[1].textContent;
    row.children[7].innerHTML = `<img src="/Content/images/detail.png" width="17" style="cursor:pointer" title="click để xem chi tiết" onclick="ShowMarkDetail('${classId}(224)','${studentId}')">`;
  });
}
