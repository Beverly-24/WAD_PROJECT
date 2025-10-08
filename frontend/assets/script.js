// Frontend logic for FarmTracker
// Update API_BASE if your backend runs on another host/port
const API_BASE = 'http://localhost:3000/api';

async function submitCrop(e) {
  e.preventDefault();
  const payload = {
    farmer_id: getVal('cropFarmerId') || null,
    crop_name: getVal('cropName'),
    quantity: parseFloat(getVal('cropQuantity')||0),
    harvest_date: getVal('harvestDate'),
    price_per_kg: parseFloat(getVal('pricePerKg')||0)
  };
  await post('/crops', payload);
  loadCrops();
  document.getElementById('cropForm').reset();
}

async function submitLivestock(e) {
  e.preventDefault();
  const payload = {
    farmer_id: getVal('livestockFarmerId') || null,
    animal_type: getVal('animalType'),
    count: parseInt(getVal('animalCount')||0),
    price_per_animal: parseFloat(getVal('pricePerAnimal')||0)
  };
  await post('/livestock', payload);
  loadLivestock();
  document.getElementById('livestockForm').reset();
}

async function submitBuyer(e) {
  e.preventDefault();
  const payload = {
    name: getVal('buyerName'),
    email: getVal('buyerEmail'),
    phone: getVal('buyerPhone')
  };
  await post('/buyers', payload);
  loadBuyers();
  document.getElementById('buyerForm').reset();
}

function calculateCropTotal() {
  const q = parseFloat(getVal('cropQuantity')||0);
  const p = parseFloat(getVal('pricePerKg')||0);
  const total = q * p;
  document.getElementById('cropTotal').innerText = `Projected Revenue: N$${total.toFixed(2)}`;
}

function calculateLivestockTotal() {
  const c = parseInt(getVal('animalCount')||0);
  const p = parseFloat(getVal('pricePerAnimal')||0);
  const total = c * p;
  document.getElementById('livestockTotal').innerText = `Total Worth: N$${total.toFixed(2)}`;
}

function getVal(id){const el=document.getElementById(id);return el?el.value.trim():''}

async function post(path, data) {
  try {
    await fetch(API_BASE + path, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
  } catch (err) {
    alert('Error connecting to backend. Make sure server is running and CORS is allowed.');
    console.error(err);
  }
}

async function get(path){
  try {
    const res = await fetch(API_BASE + path);
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function loadCrops(){
  const rows = await get('/crops');
  const tbody = document.querySelector('#cropsTable tbody');
  tbody.innerHTML = '';
  rows.forEach(r=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.crop_id}</td><td>${r.farmer_name||r.farmer_id||''}</td><td>${r.crop_name}</td><td>${r.quantity}</td><td>N$${r.price_per_kg}</td><td>${r.harvest_date?new Date(r.harvest_date).toLocaleDateString():''}</td>`;
    tbody.appendChild(tr);
  });
}

async function loadLivestock(){
  const rows = await get('/livestock');
  const tbody = document.querySelector('#livestockTable tbody');
  tbody.innerHTML = '';
  rows.forEach(r=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.livestock_id}</td><td>${r.farmer_name||r.farmer_id||''}</td><td>${r.animal_type}</td><td>${r.count}</td><td>N$${r.price_per_animal}</td>`;
    tbody.appendChild(tr);
  });
}

async function loadBuyers(){
  const rows = await get('/buyers');
  const tbody = document.querySelector('#buyersTable tbody');
  tbody.innerHTML = '';
  rows.forEach(r=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.buyer_id}</td><td>${r.name}</td><td>${r.email}</td><td>${r.phone}</td>`;
    tbody.appendChild(tr);
  });
}

async function loadDashboard(){
  const data = await get('/summary');
  document.getElementById('totalCrops').innerText = data.total_crops || 0;
  document.getElementById('totalLivestock').innerText = data.total_livestock || 0;
  document.getElementById('projectedSales').innerText = (data.projected_sales||0).toFixed(2);
  document.getElementById('summaryText').innerText = 'Summary loaded from backend API.';
}

// Auto-run when pages load
document.addEventListener('DOMContentLoaded', ()=>{
  if (document.querySelector('#cropsTable')) loadCrops();
  if (document.querySelector('#livestockTable')) loadLivestock();
  if (document.querySelector('#buyersTable')) loadBuyers();
  if (document.querySelector('#summaryText')) loadDashboard();
});
