const API_PROXY = window.NEIS_CONFIG?.API_PROXY || "/api/neis";

const TIMETABLE_SERVICE_BY_KIND = {
  초등학교: "elsTimetable",
  중학교: "misTimetable",
  고등학교: "hisTimetable",
  특수학교: "spsTimetable",
};

const DEMO_SCHOOL = {
  ATPT_OFCDC_SC_CODE: "B10",
  ATPT_OFCDC_SC_NM: "서울특별시교육청",
  SD_SCHUL_CODE: "7010918",
  SCHUL_NM: "하나고등학교",
  SCHUL_KND_SC_NM: "고등학교",
  LCTN_SC_NM: "서울특별시",
  ORG_RDNMA: "서울특별시 은평구 연서로",
};

const DEMO_TIMETABLE = [
  { PERIO: "1", ITRT_CNTNT: "문학" },
  { PERIO: "2", ITRT_CNTNT: "수학" },
  { PERIO: "3", ITRT_CNTNT: "영어" },
  { PERIO: "4", ITRT_CNTNT: "통합사회" },
  { PERIO: "5", ITRT_CNTNT: "정보" },
  { PERIO: "6", ITRT_CNTNT: "체육" },
];

const DEMO_MEALS = [
  {
    MMEAL_SC_CODE: "2",
    MMEAL_SC_NM: "중식",
    DDISH_NM: "현미밥<br/>미역국<br/>닭갈비<br/>콩나물무침<br/>배추김치",
    CAL_INFO: "742.8 Kcal",
  },
];

const state = {
  selectedSchool: null,
  activeView: "timetable",
  timetableCount: 0,
  mealCount: 0,
  demoMode: false,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const el = {
  schoolForm: $("#school-form"),
  schoolInput: $("#school-input"),
  status: $("#status"),
  demoButton: $("#demo-button"),
  schoolResults: $("#school-results"),
  selectedSchoolName: $("#selected-school-name"),
  selectedSchoolMeta: $("#selected-school-meta"),
  lookupForm: $("#lookup-form"),
  dateInput: $("#date-input"),
  gradeSelect: $("#grade-select"),
  classInput: $("#class-input"),
  lookupButton: $("#lookup-button"),
  dateLabel: $("#date-label"),
  resultTitle: $("#result-title"),
  resultCount: $("#result-count"),
  timetableEmpty: $("#timetable-empty"),
  timetableList: $("#timetable-list"),
  mealEmpty: $("#meal-empty"),
  mealList: $("#meal-list"),
  timetablePanel: $("#panel-timetable"),
  mealPanel: $("#panel-meal"),
  tabs: $$("[data-view]"),
};

init();

function init() {
  el.dateInput.value = toInputDate(new Date());
  fillGradeOptions("고등학교");
  setLookupEnabled(false);
  renderNotice("학교명을 입력하면 검색 결과가 여기에 표시돼요.");
  updateHeader();

  el.schoolForm.addEventListener("submit", searchSchools);
  el.lookupForm.addEventListener("submit", loadAll);
  el.demoButton.addEventListener("click", showDemo);
  el.dateInput.addEventListener("change", updateHeader);
  el.gradeSelect.addEventListener("change", updateHeader);
  el.classInput.addEventListener("input", updateHeader);

  $$("[data-date-jump]").forEach((button) => {
    button.addEventListener("click", () => jumpDate(button.dataset.dateJump));
  });

  el.tabs.forEach((button) => {
    button.addEventListener("click", () => setActiveView(button.dataset.view));
  });
}

async function searchSchools(event) {
  event.preventDefault();
  const query = el.schoolInput.value.trim();

  if (query.length < 2) {
    setStatus("학교 이름을 두 글자 이상 입력해 주세요.", "error");
    return;
  }

  state.demoMode = false;
  setStatus("학교를 검색하고 있어요.", "loading");
  el.schoolResults.innerHTML = "";

  try {
    const data = await requestNeis("schoolInfo", { SCHUL_NM: query, pSize: "20" });
    const schools = extractRows(data, "schoolInfo");
    renderSchools(schools);
    setStatus(`${schools.length}개 학교를 찾았어요.`, "ready");
  } catch (error) {
    renderNotice(error.message);
    setStatus(error.message, "error");
  }
}

function showDemo() {
  state.demoMode = true;
  renderSchools([DEMO_SCHOOL]);
  selectSchool(DEMO_SCHOOL);
  renderTimetable(DEMO_TIMETABLE);
  renderMeals(DEMO_MEALS);
  setStatus("예시 데이터를 표시했어요.", "ready");
}

function renderSchools(schools) {
  el.schoolResults.innerHTML = "";

  if (!schools.length) {
    renderNotice("검색 결과가 없어요. 학교 이름을 조금 더 정확히 입력해 주세요.");
    return;
  }

  const fragment = document.createDocumentFragment();

  schools.forEach((school) => {
    const card = document.createElement("button");
    card.className = "school-card";
    card.type = "button";
    card.innerHTML = `
      <strong>${escapeHtml(school.SCHUL_NM || "학교 이름 없음")}</strong>
      <span>${escapeHtml(school.SCHUL_KND_SC_NM || "학교")}</span>
      <span>${escapeHtml(school.LCTN_SC_NM || school.ATPT_OFCDC_SC_NM || "지역")}</span>
      <p>${escapeHtml(school.ORG_RDNMA || school.ORG_RDNDA || "주소 정보 없음")}</p>
    `;
    card.addEventListener("click", () => selectSchool(school));
    fragment.appendChild(card);
  });

  el.schoolResults.appendChild(fragment);
}

function selectSchool(school) {
  state.selectedSchool = school;
  state.timetableCount = 0;
  state.mealCount = 0;

  el.selectedSchoolName.textContent = school.SCHUL_NM || "선택된 학교";
  el.selectedSchoolMeta.textContent = [school.SCHUL_KND_SC_NM, school.LCTN_SC_NM || school.ATPT_OFCDC_SC_NM, school.ORG_RDNMA]
    .filter(Boolean)
    .join(" · ");

  fillGradeOptions(school.SCHUL_KND_SC_NM || "");
  setLookupEnabled(true);
  clearTimetable("조회하기를 누르면 시간표가 여기에 표시돼요.");
  clearMeals("조회하기를 누르면 급식표가 여기에 표시돼요.");
  setStatus(`${school.SCHUL_NM}을 선택했어요.`, "ready");
}

async function loadAll(event) {
  event.preventDefault();

  if (!state.selectedSchool) {
    setStatus("먼저 학교를 선택해 주세요.", "error");
    return;
  }

  if (state.demoMode) {
    renderTimetable(DEMO_TIMETABLE);
    renderMeals(DEMO_MEALS);
    setStatus("예시 데이터를 표시했어요.", "ready");
    return;
  }

  setStatus("시간표와 급식표를 불러오고 있어요.", "loading");
  const jobs = [loadMeals()];
  const timetableService = getTimetableService(state.selectedSchool);

  if (timetableService) {
    jobs.push(loadTimetable(timetableService));
  } else {
    clearTimetable("이 학교 유형은 시간표 조회가 지원되지 않을 수 있어요.");
  }

  const results = await Promise.allSettled(jobs);
  const failed = results.filter((result) => result.status === "rejected");

  if (failed.length === results.length) {
    setStatus("조회에 실패했어요. Vercel 환경변수와 나이스 API 키를 확인해 주세요.", "error");
    return;
  }

  setStatus(failed.length ? "일부 정보만 불러왔어요." : "시간표와 급식표를 불러왔어요.", "ready");
}

async function loadTimetable(service) {
  try {
    const rows = await requestRows(service, {
      ATPT_OFCDC_SC_CODE: state.selectedSchool.ATPT_OFCDC_SC_CODE,
      SD_SCHUL_CODE: state.selectedSchool.SD_SCHUL_CODE,
      ALL_TI_YMD: compactDate(el.dateInput.value),
      GRADE: el.gradeSelect.value,
      CLASS_NM: el.classInput.value,
      pSize: "100",
    });
    renderTimetable(rows);
  } catch (error) {
    clearTimetable(error.message);
    throw error;
  }
}

async function loadMeals() {
  try {
    const rows = await requestRows("mealServiceDietInfo", {
      ATPT_OFCDC_SC_CODE: state.selectedSchool.ATPT_OFCDC_SC_CODE,
      SD_SCHUL_CODE: state.selectedSchool.SD_SCHUL_CODE,
      MLSV_YMD: compactDate(el.dateInput.value),
      pSize: "10",
    });
    renderMeals(rows);
  } catch (error) {
    clearMeals(error.message);
    throw error;
  }
}

function renderTimetable(rows) {
  const periods = mergePeriods(rows);
  el.timetableList.innerHTML = "";
  state.timetableCount = periods.length;
  updateHeader();

  if (!periods.length) {
    clearTimetable("해당 조건의 시간표가 없어요. 날짜, 학년, 반을 바꿔서 다시 조회해 보세요.");
    return;
  }

  const fragment = document.createDocumentFragment();

  periods.forEach((period) => {
    const card = document.createElement("article");
    card.className = "period-card";
    card.innerHTML = `
      <div class="period-number">${escapeHtml(period.period)}교시</div>
      <div class="card-content">
        <strong>${escapeHtml(period.subjects.join(" / "))}</strong>
        <span>${escapeHtml(`${el.gradeSelect.value}학년 ${el.classInput.value}반`)}</span>
      </div>
    `;
    fragment.appendChild(card);
  });

  el.timetableList.appendChild(fragment);
  el.timetableEmpty.hidden = true;
  el.timetableList.hidden = false;
}

function renderMeals(rows) {
  const meals = [...rows].sort((a, b) => Number(a.MMEAL_SC_CODE || 0) - Number(b.MMEAL_SC_CODE || 0));
  el.mealList.innerHTML = "";
  state.mealCount = meals.length;
  updateHeader();

  if (!meals.length) {
    clearMeals("해당 날짜의 급식표가 없어요. 주말, 공휴일, 방학일 수 있어요.");
    return;
  }

  const fragment = document.createDocumentFragment();

  meals.forEach((meal) => {
    const card = document.createElement("article");
    card.className = "meal-card";
    const items = parseMealItems(meal.DDISH_NM).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
    card.innerHTML = `
      <div class="meal-head">
        <strong>${escapeHtml(meal.MMEAL_SC_NM || "급식")}</strong>
        <span>${escapeHtml(meal.CAL_INFO || "칼로리 정보 없음")}</span>
      </div>
      <ul>${items || "<li>메뉴 정보 없음</li>"}</ul>
    `;
    fragment.appendChild(card);
  });

  el.mealList.appendChild(fragment);
  el.mealEmpty.hidden = true;
  el.mealList.hidden = false;
}

async function requestRows(service, params) {
  const data = await requestNeis(service, params);
  return extractRows(data, service);
}

async function requestNeis(service, params) {
  const url = new URL(API_PROXY, window.location.origin);
  url.searchParams.set("service", service);
  url.searchParams.set("Type", "json");
  url.searchParams.set("pIndex", "1");

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  let response;

  try {
    response = await fetch(url);
  } catch (error) {
    throw new Error("서버에 연결하지 못했어요. Vercel 배포 주소로 접속했는지 확인해 주세요.");
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response) || `서버 오류가 발생했어요. 상태 코드: ${response.status}`);
  }

  return response.json();
}

function extractRows(data, service) {
  const result = data.RESULT || data.result;

  if (result) {
    const code = result.CODE || result.code || "";
    if (code.includes("INFO-200")) {
      return [];
    }
    throw new Error(result.MESSAGE || result.message || "나이스 API에서 오류가 왔어요.");
  }

  const rows = data[service]?.find((section) => section.row)?.row;
  if (!rows) {
    return [];
  }

  return Array.isArray(rows) ? rows : [rows];
}

async function readErrorMessage(response) {
  const text = await response.text();

  if (!text) {
    return "";
  }

  try {
    const data = JSON.parse(text);
    return data.RESULT?.MESSAGE || data.message || text;
  } catch (error) {
    return text;
  }
}

function mergePeriods(rows) {
  const map = new Map();

  rows.forEach((row) => {
    const period = cleanText(row.PERIO);
    if (!period) {
      return;
    }

    if (!map.has(period)) {
      map.set(period, new Set());
    }

    map.get(period).add(cleanText(row.ITRT_CNTNT) || "수업명 없음");
  });

  return [...map.entries()]
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([period, subjects]) => ({ period, subjects: [...subjects] }));
}

function parseMealItems(value = "") {
  return String(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function clearTimetable(message) {
  state.timetableCount = 0;
  el.timetableEmpty.innerHTML = `<img src="./assets/timetable-mark.png" alt="" /><p>${escapeHtml(message)}</p>`;
  el.timetableList.hidden = true;
  el.timetableEmpty.hidden = false;
  updateHeader();
}

function clearMeals(message) {
  state.mealCount = 0;
  el.mealEmpty.innerHTML = `<img src="./assets/timetable-mark.png" alt="" /><p>${escapeHtml(message)}</p>`;
  el.mealList.hidden = true;
  el.mealEmpty.hidden = false;
  updateHeader();
}

function setActiveView(view) {
  state.activeView = view;

  el.tabs.forEach((button) => {
    const active = button.dataset.view === view;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });

  el.timetablePanel.hidden = view !== "timetable";
  el.mealPanel.hidden = view !== "meal";
  updateHeader();
}

function updateHeader() {
  const mealView = state.activeView === "meal";
  el.dateLabel.textContent = formatDate(el.dateInput.value);
  el.resultTitle.textContent = mealView ? "급식표" : `${el.gradeSelect.value || 1}학년 ${el.classInput.value || 1}반 시간표`;
  el.resultCount.textContent = mealView ? `${state.mealCount}식` : `${state.timetableCount}교시`;
}

function fillGradeOptions(kind) {
  const count = kind.includes("초등") || kind.includes("특수") ? 6 : 3;
  el.gradeSelect.innerHTML = "";

  for (let grade = 1; grade <= count; grade += 1) {
    const option = document.createElement("option");
    option.value = String(grade);
    option.textContent = `${grade}학년`;
    el.gradeSelect.appendChild(option);
  }
}

function getTimetableService(school) {
  const kind = school.SCHUL_KND_SC_NM || "";
  return Object.entries(TIMETABLE_SERVICE_BY_KIND).find(([label]) => kind.includes(label))?.[1] || "";
}

function setLookupEnabled(enabled) {
  el.dateInput.disabled = !enabled;
  el.gradeSelect.disabled = !enabled;
  el.classInput.disabled = !enabled;
  el.lookupButton.disabled = !enabled;
}

function renderNotice(message) {
  el.schoolResults.innerHTML = `<div class="notice">${escapeHtml(message)}</div>`;
}

function setStatus(message, type = "loading") {
  el.status.textContent = message;
  el.status.className = `status ${type}`;
}

function jumpDate(type) {
  const date = new Date();
  if (type === "tomorrow") date.setDate(date.getDate() + 1);
  if (type === "next-week") date.setDate(date.getDate() + 7);
  el.dateInput.value = toInputDate(date);
  updateHeader();
}

function toInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function compactDate(value) {
  return value.replaceAll("-", "");
}

function formatDate(value) {
  if (!value) return "조회 결과";
  return new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", weekday: "short" }).format(new Date(`${value}T00:00:00`));
}

function cleanText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
