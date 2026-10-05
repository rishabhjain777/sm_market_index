/**
 * NSE & BSE Index Dashboard - Client-Side Controller
 * Tab switching, countdown auto-refresh, table sorting & filtering, 360° Analyzer
 */

let refreshSeconds = 60;
let refreshTimer = null;
let isPaused = false;

document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    initCountdown();
    initTableSorting();
    initSearchFilter();
    initAnalyzerDropdown();
});

// Tab Switching
function initTabs() {
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-tab");

            tabBtns.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));

            btn.classList.add("active");
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add("active");
            }
        });
    });
}

// Auto-Refresh Countdown
function initCountdown() {
    const timerElem = document.getElementById("countdownTimer");
    const pauseBtn = document.getElementById("pauseRefreshBtn");

    if (timerElem) {
        refreshTimer = setInterval(() => {
            if (!isPaused) {
                refreshSeconds--;
                timerElem.textContent = `${refreshSeconds}s`;
                if (refreshSeconds <= 0) {
                    refreshSeconds = 60;
                    window.location.reload();
                }
            }
        }, 1000);
    }

    if (pauseBtn) {
        pauseBtn.addEventListener("click", () => {
            isPaused = !isPaused;
            pauseBtn.textContent = isPaused ? "▶ Resume" : "⏸ Pause";
            pauseBtn.style.background = isPaused ? "rgba(245, 158, 11, 0.2)" : "";
        });
    }
}

// Search and Table Filter
function initSearchFilter() {
    const searchInputs = document.querySelectorAll(".table-search-input");
    searchInputs.forEach(input => {
        const tableId = input.getAttribute("data-table");
        const table = document.getElementById(tableId);
        if (!table) return;

        input.addEventListener("input", () => {
            const filter = input.value.toLowerCase().trim();
            const rows = table.querySelectorAll("tbody tr");

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(filter) ? "" : "none";
            });
        });
    });
}

// Table Sorting
function initTableSorting() {
    const headers = document.querySelectorAll("table.data-table th.sortable");
    headers.forEach((th, colIdx) => {
        th.style.cursor = "pointer";
        th.addEventListener("click", () => {
            const table = th.closest("table");
            const tbody = table.querySelector("tbody");
            const rows = Array.from(tbody.querySelectorAll("tr"));
            const asc = th.classList.toggle("asc");

            headers.forEach(h => {
                if (h !== th) h.classList.remove("asc", "desc");
            });
            th.classList.toggle("desc", !asc);

            rows.sort((a, b) => {
                let cellA = a.children[colIdx]?.innerText.trim() || "";
                let cellB = b.children[colIdx]?.innerText.trim() || "";

                // Strip currency/percent symbols
                let numA = parseFloat(cellA.replace(/[₹,%]/g, ""));
                let numB = parseFloat(cellB.replace(/[₹,%]/g, ""));

                if (!isNaN(numA) && !isNaN(numB)) {
                    return asc ? numA - numB : numB - numA;
                }
                return asc ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
            });

            rows.forEach(r => tbody.appendChild(r));
        });
    });
}

// 360° Index Analyzer Selector
function initAnalyzerDropdown() {
    const selector = document.getElementById("analyzerIndexSelect");
    if (!selector) return;

    selector.addEventListener("change", () => {
        const selectedCode = selector.value;
        const panels = document.querySelectorAll(".analyzer-panel");
        panels.forEach(p => {
            p.style.display = (p.getAttribute("data-code") === selectedCode) ? "block" : "none";
        });
    });
}
