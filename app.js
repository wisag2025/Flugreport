
const USER = 'wisag', PASS = 'Condor@WISAGinDUS';
const $ = s => document.querySelector(s);
let reports = JSON.parse(localStorage.getItem('flugReports') || '{}');
let editIdx = null;

function login() {
  if ($('#user').value === USER && $('#pass').value === PASS) {
    $('#login').style.display = 'none';
    $('#app').style.display = 'block';
    initApp();
  } else {
    $('#error').innerText = 'Credenciales incorrectas';
  }
}

function initApp() {
  const today = new Date().toISOString().split('T')[0];
  $('#date').value = today;
  loadReports();
  $('#date').addEventListener('change', loadReports);
}

function loadReports() {
  const key = $('#date').value;
  const arr = reports[key] || [];
  const body = $('#tableBody');
  body.innerHTML = '';
  arr.forEach((r, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i+1}</td><td>${r.airline}</td><td>${r.flight}</td><td>${r.std}</td><td>${r.atd}</td>
      <td>${r.code}</td><td>${r.minutes}</td><td>${r.checkin}</td><td>${r.gate}</td><td>${r.sign}</td>
      <td>
        <button onclick="editReport(${i})">✏️</button>
        <button onclick="deleteReport(${i})">🗑️</button>
        <button onclick="exportSingle(${i})">📄</button>
      </td>`;
    body.appendChild(tr);
  });
}

function addReport() {
  const key = $('#date').value;
  const newR = { airline:'', flight:'', std:'', atd:'', code:'', minutes:'', checkin:'', gate:'', sign:'' };
  reports[key] = reports[key] || [];
  reports[key].push(newR);
  editIdx = reports[key].length - 1;
  saveReports();
  loadReports();
  editReport(editIdx);
}

function editReport(i) {
  const r = reports[$('#date').value][i];
  const tr = $('#tableBody').children[i];
  tr.innerHTML = `
    <td>${i+1}</td>
    ${['airline','flight','std','atd','code','minutes','checkin','gate','sign'].map(f =>
      `<td><input value="${r[f]}"></td>`).join('')}
    <td><button onclick="saveEdit(${i})">💾</button></td>`;
}

function saveEdit(i) {
  const tr = $('#tableBody').children[i];
  const inputs = tr.querySelectorAll('input');
  const keys = ['airline','flight','std','atd','code','minutes','checkin','gate','sign'];
  const obj = {};
  inputs.forEach((inp,j) => obj[keys[j]] = inp.value.trim());
  reports[$('#date').value][i] = obj;
  saveReports();
  loadReports();
}

function deleteReport(i) {
  if (!confirm('¿Eliminar este reporte?')) return;
  reports[$('#date').value].splice(i,1);
  saveReports();
  loadReports();
}

function saveReports() {
  localStorage.setItem('flugReports', JSON.stringify(reports));
}

function exportSingle(i) {
  const { jsPDF } = window.jspdf;
  const r = reports[$('#date').value][i];
  const doc = new jsPDF();
  doc.text(`Reporte ${$('#date').value}`,14,15);
  doc.autoTable({
    head: [['Aerolínea','Vuelo','STD','ATD','Delay','Min','Check-in','Gate','Firma']],
    body: [[r.airline,r.flight,r.std,r.atd,r.code,r.minutes,r.checkin,r.gate,r.sign]],
    startY: 20
  });
  doc.save(`Reporte_${r.flight}_${$('#date').value}.pdf`);
}

function exportAll() {
  const { jsPDF } = window.jspdf;
  const arr = reports[$('#date').value] || [];
  if (arr.length === 0) return alert('No hay reportes hoy');
  const doc = new jsPDF();
  doc.text(`Reportes ${$('#date').value}`,14,15);
  doc.autoTable({
    head: [['#','Aerolínea','Vuelo','STD','ATD','Delay','Min','Check-in','Gate','Firma']],
    body: arr.map((r,i)=>[i+1,r.airline,r.flight,r.std,r.atd,r.code,r.minutes,r.checkin,r.gate,r.sign]),
    startY: 20
  });
  doc.save(`AllReportes_${$('#date').value}.pdf`);
}
