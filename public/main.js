/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

eval("const { saveRecord } = __webpack_require__(/*! ./indexedDB */ \"./src/indexedDB.js\");\n\nlet transactions = [];\nlet myChart;\n\nfetch(\"/api/transaction\")\n  .then((response) => {\n    return response.json();\n  })\n  .then((data) => {\n    // save db data on global variable\n    transactions = data;\n\n    populateTotal();\n    populateTable();\n    populateChart();\n  });\n\nfunction populateTotal() {\n  // reduce transaction amounts to a single total value\n  let total = transactions.reduce((total, t) => {\n    return total + parseInt(t.value);\n  }, 0);\n\n  let totalEl = document.querySelector(\"#total\");\n  totalEl.textContent = total;\n}\n\nfunction populateTable() {\n  let tbody = document.querySelector(\"#tbody\");\n  tbody.innerHTML = \"\";\n\n  transactions.forEach((transaction) => {\n    // create and populate a table row\n    let tr = document.createElement(\"tr\");\n    tr.innerHTML = `\n      <td>${transaction.name}</td>\n      <td>${transaction.value}</td>\n    `;\n\n    tbody.appendChild(tr);\n  });\n}\n\nfunction populateChart() {\n  // copy array and reverse it\n  let reversed = transactions.slice().reverse();\n  let sum = 0;\n\n  // create date labels for chart\n  let labels = reversed.map((t) => {\n    let date = new Date(t.date);\n    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;\n  });\n\n  // create incremental values for chart\n  let data = reversed.map((t) => {\n    sum += parseInt(t.value);\n    return sum;\n  });\n\n  // remove old chart if it exists\n  if (myChart) {\n    myChart.destroy();\n  }\n\n  let ctx = document.getElementById(\"myChart\").getContext(\"2d\");\n\n  myChart = new Chart(ctx, {\n    type: \"line\",\n    data: {\n      labels,\n      datasets: [\n        {\n          label: \"Total Over Time\",\n          fill: true,\n          backgroundColor: \"#6666ff\",\n          data,\n        },\n      ],\n    },\n  });\n}\n\nfunction sendTransaction(isAdding) {\n  let nameEl = document.querySelector(\"#t-name\");\n  let amountEl = document.querySelector(\"#t-amount\");\n  let errorEl = document.querySelector(\".form .error\");\n\n  // validate form\n  if (nameEl.value === \"\" || amountEl.value === \"\") {\n    errorEl.textContent = \"Missing Information\";\n    return;\n  } else {\n    errorEl.textContent = \"\";\n  }\n\n  // create record\n  let transaction = {\n    name: nameEl.value,\n    value: amountEl.value,\n    date: new Date().toISOString(),\n  };\n\n  // if subtracting funds, convert amount to negative number\n  if (!isAdding) {\n    transaction.value *= -1;\n  }\n\n  // add to beginning of current array of data\n  transactions.unshift(transaction);\n\n  // re-run logic to populate ui with new record\n  populateChart();\n  populateTable();\n  populateTotal();\n\n  // also send to server\n  fetch(\"/api/transaction\", {\n    method: \"POST\",\n    body: JSON.stringify(transaction),\n    headers: {\n      Accept: \"application/json, text/plain, */*\",\n      \"Content-Type\": \"application/json\",\n    },\n  })\n    .then((response) => {\n      return response.json();\n    })\n    .then((data) => {\n      if (data.errors) {\n        errorEl.textContent = \"Missing Information\";\n      } else {\n        // clear form\n        nameEl.value = \"\";\n        amountEl.value = \"\";\n      }\n    })\n    .catch((err) => {\n      // fetch failed, so save in indexed db\n      saveRecord(transaction);\n\n      // clear form\n      nameEl.value = \"\";\n      amountEl.value = \"\";\n    });\n}\n\ndocument.querySelector(\"#add-btn\").onclick = function () {\n  sendTransaction(true);\n};\n\ndocument.querySelector(\"#sub-btn\").onclick = function () {\n  sendTransaction(false);\n};\n\n\n//# sourceURL=webpack://budget-app/./src/index.js?");

/***/ }),

/***/ "./src/indexedDB.js":
/*!**************************!*\
  !*** ./src/indexedDB.js ***!
  \**************************/
/***/ ((module) => {

eval("const request = window.indexedDB.open(\"budgetDB\", 3);\n\nwindow.onload = function (evt) {\n  if (!window.indexedDB) {\n    alert(\n      \"IndexedDB not supported on your browser, offline transactions will not be recorded\"\n    );\n  }\n};\n\nrequest.onupgradeneeded = function (evt) {\n  const db = evt.target.result;\n  db.createObjectStore(\"budgetStore\", {\n    autoIncrement: true,\n  });\n};\n\nrequest.onerror = function (evt) {\n  console.log(\"Open budgetDb error:\", evt.target.errorCode);\n};\n\nrequest.onsuccess = function (evt) {\n  if (navigator.onLine) {\n    checkDB();\n  }\n};\n\nfunction saveRecord(data) {\n  const db = request.result;\n  const tx = db.transaction([\"budgetStore\"], \"readwrite\");\n  const store = tx.objectStore(\"budgetStore\");\n  store.add(data);\n\n  db.onerror = function (err) {\n    console.log(\"Save record error:\", evt.target.errorCode);\n  };\n}\n\nfunction checkDB() {\n  const db = request.result;\n  const tx = db.transaction([\"budgetStore\"], \"readwrite\");\n  const store = tx.objectStore(\"budgetStore\");\n  const getAllData = store.getAll();\n  getAllData.onsuccess = function () {\n    if (getAllData.result.length > 0) {\n      fetch(\"/api/transaction/bulk\", {\n        method: \"POST\",\n        body: JSON.stringify(getAllData.result),\n        headers: {\n          Accept: \"application/json, text/plain, */*\",\n          \"Content-Type\": \"application/json\",\n        },\n      })\n        .then((response) => response.json())\n        .then((res) => {\n          if (res.length !== 0) {\n            const tx = db.transaction([\"budgetStore\"], \"readwrite\");\n            const store = tx.objectStore(\"budgetStore\");\n            store.clear();\n\n            console.log(\"Store cleared!\");\n          }\n        });\n    }\n  };\n}\n\nmodule.exports.saveRecord = saveRecord;\nwindow.addEventListener(\"online\", checkDB);\n\n\n//# sourceURL=webpack://budget-app/./src/indexedDB.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.js");
/******/ 	
/******/ })()
;