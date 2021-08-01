const request = window.indexedDB.open("budgetDB", 1);
const db = request.result;
let tx, store;

window.onload = function (evt) {
  if (!window.indexedDB) {
    alert(
      "IndexedDB not supported on your browser, offline transactions will not be recorded"
    );
  }
};

request.onupgradeneeded = function (evt) {
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

export function saveRecord(data) {
  request.onsuccess = function (evt) {
    tx = db.transaction("budgetStore", "readwrite");
    store = tx.objectStore("budgetStore");
    store.add(data);

    db.onerror = function (err) {
      console.log("Save record error:", e.target.errorCode);
    };
  };
}

function checkDB() {
  tx = db.transaction(["budgetStore"], "readwrite");
  store = tx.objectStore("budgetStore");
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
            tx = db.transaction(["budgetStore"], "readwrite");
            tx.objectStore("budgetStore").clear();

            console.log("Store cleared!");
          }
        });
    }
  };
}

window.addEventListener("online", checkDB);
