(() => {
  var t = {
      921: (t) => {
        const n = window.indexedDB.open("budgetDB", 1),
          o = n.result;
        let r, a;
        function c() {
          (r = o.transaction(["budgetStore"], "readwrite")),
            (a = r.objectStore("budgetStore"));
          const e = a.getAll();
          e.onsuccess = function () {
            e.result.length > 0 &&
              fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(e.result),
                headers: {
                  Accept: "application/json, text/plain, */*",
                  "Content-Type": "application/json",
                },
              })
                .then((e) => e.json())
                .then((e) => {
                  0 !== e.length &&
                    ((r = o.transaction(["budgetStore"], "readwrite")),
                    r.objectStore("budgetStore").clear(),
                    console.log("Store cleared!"));
                });
          };
        }
        (window.onload = function (e) {
          window.indexedDB ||
            alert(
              "IndexedDB not supported on your browser, offline transactions will not be recorded"
            );
        }),
          (n.onupgradeneeded = function (e) {
            o.createObjectStore("budgetStore", { autoIncrement: !0 });
          }),
          (n.onerror = function (e) {
            console.log("Open budgetDb error:", e.target.errorCode);
          }),
          (n.onsuccess = function (e) {
            navigator.onLine && c();
          }),
          (t.exports.saveRecord = function (t) {
            n.onsuccess = function (n) {
              (r = o.transaction("budgetStore", "readwrite")),
                (a = r.objectStore("budgetStore")),
                a.add(t),
                (o.onerror = function (t) {
                  console.log("Save record error:", e.target.errorCode);
                });
            };
          }),
          window.addEventListener("online", c);
      },
    },
    n = {};
  function o(e) {
    var r = n[e];
    if (void 0 !== r) return r.exports;
    var a = (n[e] = { exports: {} });
    return t[e](a, a.exports, o), a.exports;
  }
  (() => {
    const { saveRecord: e } = o(921);
    let t,
      n = [];
    function r() {
      let e = n.reduce((e, t) => e + parseInt(t.value), 0);
      document.querySelector("#total").textContent = e;
    }
    function a() {
      let e = document.querySelector("#tbody");
      (e.innerHTML = ""),
        n.forEach((t) => {
          let n = document.createElement("tr");
          (n.innerHTML = `\n      <td>${t.name}</td>\n      <td>${t.value}</td>\n    `),
            e.appendChild(n);
        });
    }
    function c() {
      let e = n.slice().reverse(),
        o = 0,
        r = e.map((e) => {
          let t = new Date(e.date);
          return `${t.getMonth() + 1}/${t.getDate()}/${t.getFullYear()}`;
        }),
        a = e.map((e) => ((o += parseInt(e.value)), o));
      t && t.destroy();
      let c = document.getElementById("myChart").getContext("2d");
      t = new Chart(c, {
        type: "line",
        data: {
          labels: r,
          datasets: [
            {
              label: "Total Over Time",
              fill: !0,
              backgroundColor: "#6666ff",
              data: a,
            },
          ],
        },
      });
    }
    function i(t) {
      let o = document.querySelector("#t-name"),
        i = document.querySelector("#t-amount"),
        l = document.querySelector(".form .error");
      if ("" === o.value || "" === i.value)
        return void (l.textContent = "Missing Information");
      l.textContent = "";
      let d = { name: o.value, value: i.value, date: new Date().toISOString() };
      t || (d.value *= -1),
        n.unshift(d),
        c(),
        a(),
        r(),
        fetch("/api/transaction", {
          method: "POST",
          body: JSON.stringify(d),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
        })
          .then((e) => e.json())
          .then((e) => {
            e.errors
              ? (l.textContent = "Missing Information")
              : ((o.value = ""), (i.value = ""));
          })
          .catch((t) => {
            e(d), (o.value = ""), (i.value = "");
          });
    }
    fetch("/api/transaction")
      .then((e) => e.json())
      .then((e) => {
        (n = e), r(), a(), c();
      }),
      (document.querySelector("#add-btn").onclick = function () {
        i(!0);
      }),
      (document.querySelector("#sub-btn").onclick = function () {
        i(!1);
      });
  })();
})();
