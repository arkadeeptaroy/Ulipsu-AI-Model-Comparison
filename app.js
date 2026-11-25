"use strict";
(function () {
  const menu = document.getElementById("menu-btn");
  const nav = document.getElementById("nav-menu");
  const links = Array.from(nav.querySelectorAll("a[href^='#']"));
  const desktop = window.matchMedia("(min-width: 1100px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setMenu(open) {
    menu.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("menu-open", open);
    nav.classList.toggle("active", open);
  }
  menu.addEventListener("click", () => setMenu(menu.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("click", event => {
    if (!desktop.matches && !menu.contains(event.target) && !nav.contains(event.target)) setMenu(false);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      menu.focus();
    }
  });
  desktop.addEventListener("change", () => setMenu(false));
  links.forEach(link => link.addEventListener("click", () => setMenu(false)));
  const sections = links.map(link => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  let scheduled = false;
  function updateNavigation() {
    scheduled = false;
    let current = "";
    for (const section of sections) if (section.getBoundingClientRect().top <= 120) current = "#" + section.id;
    for (const link of links) {
      const active = link.getAttribute("href") === current;
      link.classList.toggle("active-scroll", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
  }
  window.addEventListener("scroll", () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateNavigation); }
  }, {passive: true});
  updateNavigation();

  document.querySelectorAll("[role='tablist']").forEach(list => {
    const tabs = Array.from(list.querySelectorAll("[role='tab']"));
    function activate(tab, focus = false) {
      for (const item of tabs) {
        const selected = item === tab;
        item.classList.toggle("active", selected);
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
        const panel = document.getElementById(item.getAttribute("aria-controls"));
        if (panel) {
          panel.hidden = !selected;
          panel.classList.toggle("active-panel", selected);
        }
      }
      if (focus) tab.focus();
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab));
      tab.addEventListener("keydown", event => {
        let next;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index + tabs.length - 1) % tabs.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        else return;
        event.preventDefault();
        activate(tabs[next], true);
      });
    });
    if (tabs.length) activate(tabs.find(tab => tab.getAttribute("aria-selected") === "true") || tabs[0]);
  });

  const radarData = [["Gemini 3",98,92,95,90,100],["GPT 5.5+",40,98,90,98,85],["GPT-4o",40,85,93,80,85],["Sarvam AI",80,95,80,95,95]];
  const characterData = [["Set C (Gemini)",107],["Set G (Sarvam)",118],["Set F (GPT-4o)",119],["Set E (Minimax)",120],["Set B (GPT-5.5+)",125],["Set A (GPT 5.5 - Eng+Hin)",133],["Set D (Gemma)",152]];
  function showFallback(canvasId, detailsId) {
    document.getElementById(canvasId).parentElement.hidden = true;
    document.getElementById(detailsId).open = true;
  }
  if (typeof Chart === "undefined") {
    showFallback("radarChart", "radar-data");
    showFallback("cpsBarChart", "count-data");
    return;
  }
  Chart.defaults.color = "#A1A1A6";
  Chart.defaults.font.family = "'Figtree', sans-serif";
  Chart.defaults.borderColor = "rgba(255,255,255,.08)";
  const palette = ["#0A84FF","#6EB8FF","#F5F5F7","#8b5cf6"];
  try {
    new Chart(document.getElementById("radarChart"), {
      type: "radar",
      data: {
        labels: ["Pedagogy","Register","Pacing score","Grammar","Accuracy"],
        datasets: radarData.map((row,i) => ({
          label: row[0], data: row.slice(1), borderColor: palette[i],
          pointBackgroundColor: palette[i], backgroundColor: palette[i] + "14",
          borderWidth: 1.5, pointRadius: 3, borderDash: i > 1 ? [4,3] : []
        }))
      },
      options: {
        responsive: true, maintainAspectRatio: false, animation: reducedMotion ? false : {duration: 300},
        scales: { r: { min: 0, max: 100, ticks: { display: false, stepSize: 25 },
          angleLines: {color: "rgba(255,255,255,.12)"}, grid: {color: "rgba(255,255,255,.12)"},
          pointLabels: {color: "#A1A1A6", font: {size: 11, weight: "600"}} } },
        plugins: {legend: {position: "bottom", labels: {usePointStyle: true, color: "#F5F5F7", font: {size: 11}}}}
      }
    });
  } catch (_) { showFallback("radarChart", "radar-data"); }
  try {
    const barColors = ["#0A84FF","#8b5cf6","#F5F5F7","#A1A1A6","#6EB8FF","#636366","#8E8E93"];
    new Chart(document.getElementById("cpsBarChart"), {
      type: "bar",
      data: {
        labels: characterData.map(row => row[0].replace("Set A (GPT 5.5 - Eng+Hin)", "Set A (GPT 5.5)")),
        datasets: [{label: "Characters", data: characterData.map(row => row[1]),
          backgroundColor: barColors, borderRadius: 4, barPercentage: 0.65}]
      },
      options: {indexAxis: "y", responsive: true, maintainAspectRatio: false,
        animation: reducedMotion ? false : {duration: 300},
        scales: {x: {beginAtZero: true, title: {display: true, text: "Characters"}},
          y: {grid: {display: false}, ticks: {color: "#F5F5F7", font: {size: 11}}}},
        plugins: {legend: {display: false}}
      }
    });
  } catch (_) { showFallback("cpsBarChart", "count-data"); }
})();
