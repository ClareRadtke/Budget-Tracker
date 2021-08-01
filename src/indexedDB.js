const request = window.indexedDB.open("budgetDB", 3);

window.onload = function (evt) {
  if (!window.indexedDB) {
    alert(
      "IndexedDB not supported on your browser, offline transactions will not be recorded"
    );
  }
};

request.onupgradeneeded = function (evt) {
  const db = evt.target.result;
  db.createObjectStore("budgetStore", {
    autoIncrement: true,
  });
};

request.onerror = function (evt) {
  console.log("Open budgetDb error:", evt.target.errorCode);
};

request.onsuccess = function (evt) {
  if (navigator.onLine) {
    checkDB();
  }
};

function saveRecord(data) {
  const db = request.result;
  const tx = db.transaction(["budgetStore"], "readwrite");
  const store = tx.objectStore("budgetStore");
  store.add(data);

  db.onerror = function (err) {
    console.log("Save record error:", evt.target.errorCode);
  };
}

function checkDB() {
  const db = request.result;
  const tx = db.transaction(["budgetStore"], "readwrite");
  const store = tx.objectStore("budgetStore");
  const getAllData = store.getAll();
  getAllData.onsuccess = function () {
    if (getAllData.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAllData.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((res) => {
          if (res.length !== 0) {
            const tx = db.transaction(["budgetStore"], "readwrite");
            const store = tx.objectStore("budgetStore");
            store.clear();

            console.log("Store cleared!");
          }
        });
    }
  };
}

module.exports.saveRecord = saveRecord;
window.addEventListener("online", checkDB);
