const STORAGE_KEY = "erpVehicularPersonal";

const emptyData = {
  vehicles: [],
  mileage: [],
  maintenance: [],
};

const emptyApp = {
  users: [],
  currentUserId: null,
};

let app = loadApp();

const forms = {
  login: document.querySelector("#loginForm"),
  register: document.querySelector("#registerForm"),
  account: document.querySelector("#accountForm"),
  vehicle: document.querySelector("#vehicleForm"),
  quickMileage: document.querySelector("#quickMileageForm"),
  mileage: document.querySelector("#mileageForm"),
  maintenance: document.querySelector("#maintenanceForm"),
};

const fields = {
  authScreen: document.querySelector("#authScreen"),
  appShell: document.querySelector("#appShell"),
  authMessage: document.querySelector("#authMessage"),
  loginEmail: document.querySelector("#loginEmail"),
  loginPassword: document.querySelector("#loginPassword"),
  registerName: document.querySelector("#registerName"),
  registerEmail: document.querySelector("#registerEmail"),
  registerPassword: document.querySelector("#registerPassword"),
  sessionSummary: document.querySelector("#sessionSummary"),
  ownerName: document.querySelector("#ownerName"),
  ownerEmail: document.querySelector("#ownerEmail"),
  accountSummary: document.querySelector("#accountSummary"),
  profileMainTab: document.querySelector("#profileMainTab"),
  vehiclesMainTab: document.querySelector("#vehiclesMainTab"),
  maintenanceMainTab: document.querySelector("#maintenanceMainTab"),
  profileSection: document.querySelector("#profileSection"),
  vehiclesSection: document.querySelector("#vehiclesSection"),
  maintenanceSection: document.querySelector("#maintenanceSection"),
  vehicleSummaryTab: document.querySelector("#vehicleSummaryTab"),
  vehicleCreateTab: document.querySelector("#vehicleCreateTab"),
  vehicleHistoryTab: document.querySelector("#vehicleHistoryTab"),
  vehicleSummaryPanel: document.querySelector("#vehicleSummaryPanel"),
  vehicleCreatePanel: document.querySelector("#vehicleCreatePanel"),
  vehicleHistoryPanel: document.querySelector("#vehicleHistoryPanel"),
  vehicleName: document.querySelector("#vehicleName"),
  vehicleType: document.querySelector("#vehicleType"),
  vehiclePlate: document.querySelector("#vehiclePlate"),
  vehicleOdometer: document.querySelector("#vehicleOdometer"),
  quickMileageVehicle: document.querySelector("#quickMileageVehicle"),
  quickMileageDate: document.querySelector("#quickMileageDate"),
  quickMileageValue: document.querySelector("#quickMileageValue"),
  mileageVehicle: document.querySelector("#mileageVehicle"),
  mileageDate: document.querySelector("#mileageDate"),
  mileageValue: document.querySelector("#mileageValue"),
  maintenanceVehicle: document.querySelector("#maintenanceVehicle"),
  maintenanceDate: document.querySelector("#maintenanceDate"),
  maintenanceType: document.querySelector("#maintenanceType"),
  maintenanceMileage: document.querySelector("#maintenanceMileage"),
  maintenanceNextMileage: document.querySelector("#maintenanceNextMileage"),
  maintenanceCost: document.querySelector("#maintenanceCost"),
  maintenanceNotes: document.querySelector("#maintenanceNotes"),
  stats: document.querySelector("#stats"),
  maintenanceAlerts: document.querySelector("#maintenanceAlerts"),
  historyVehicle: document.querySelector("#historyVehicle"),
  historyList: document.querySelector("#historyList"),
  vehicleList: document.querySelector("#vehicleList"),
  resetData: document.querySelector("#resetData"),
  logoutButton: document.querySelector("#logoutButton"),
};

forms.register.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = fields.registerName.value.trim();
  const email = normalizeEmail(fields.registerEmail.value);
  const password = fields.registerPassword.value;

  if (app.users.some((user) => user.email === email)) {
    showAuthMessage("Ese correo ya tiene una cuenta creada.");
    return;
  }

  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    passwordHash: await hashPassword(password),
    data: structuredClone(emptyData),
    createdAt: new Date().toISOString(),
  };

  app.users.push(user);
  app.currentUserId = user.id;
  forms.register.reset();
  saveApp();
  render();
});

forms.login.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = normalizeEmail(fields.loginEmail.value);
  const passwordHash = await hashPassword(fields.loginPassword.value);
  const user = app.users.find((item) => item.email === email && item.passwordHash === passwordHash);

  if (!user) {
    showAuthMessage("Correo o password incorrectos.");
    return;
  }

  app.currentUserId = user.id;
  forms.login.reset();
  saveApp();
  render();
});

forms.account.addEventListener("submit", (event) => {
  event.preventDefault();
  const user = currentUser();
  if (!user) return;

  const newEmail = normalizeEmail(fields.ownerEmail.value);
  const emailTaken = app.users.some((item) => item.id !== user.id && item.email === newEmail);
  if (emailTaken) {
    fields.accountSummary.textContent = "Ese correo ya esta usado por otra cuenta.";
    return;
  }

  user.name = fields.ownerName.value.trim();
  user.email = newEmail;
  saveApp();
  render();
});

forms.vehicle.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = currentData();
  if (!data) return;

  const vehicle = {
    id: crypto.randomUUID(),
    name: fields.vehicleName.value.trim(),
    type: fields.vehicleType.value,
    plate: fields.vehiclePlate.value.trim().toUpperCase(),
    odometer: Number(fields.vehicleOdometer.value),
    createdAt: new Date().toISOString(),
  };

  data.vehicles.push(vehicle);
  data.mileage.push({
    id: crypto.randomUUID(),
    vehicleId: vehicle.id,
    date: today(),
    value: vehicle.odometer,
  });

  forms.vehicle.reset();
  saveApp();
  render();
});

forms.quickMileage.addEventListener("submit", (event) => {
  event.preventDefault();
  const vehicleId = fields.quickMileageVehicle.value;
  saveMileageRecord(vehicleId, fields.quickMileageDate.value, Number(fields.quickMileageValue.value));
  forms.quickMileage.reset();
  fields.quickMileageVehicle.value = vehicleId;
  setTodayDefaults();
  render();
});

forms.mileage.addEventListener("submit", (event) => {
  event.preventDefault();
  saveMileageRecord(fields.mileageVehicle.value, fields.mileageDate.value, Number(fields.mileageValue.value));
  forms.mileage.reset();
  setTodayDefaults();
  render();
});

forms.maintenance.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = currentData();
  if (!data) return;

  data.maintenance.push({
    id: crypto.randomUUID(),
    vehicleId: fields.maintenanceVehicle.value,
    date: fields.maintenanceDate.value,
    type: fields.maintenanceType.value.trim(),
    mileage: Number(fields.maintenanceMileage.value),
    nextMileage: Number(fields.maintenanceNextMileage.value || 0),
    cost: Number(fields.maintenanceCost.value || 0),
    notes: fields.maintenanceNotes.value.trim(),
  });
  forms.maintenance.reset();
  setTodayDefaults();
  saveApp();
  render();
});

fields.resetData.addEventListener("click", () => {
  const user = currentUser();
  if (!user) return;

  const shouldReset = confirm("Esto eliminara solo tus vehiculos, kilometrajes y mantenciones. Continuar?");
  if (!shouldReset) return;

  user.data = structuredClone(emptyData);
  saveApp();
  render();
});

fields.logoutButton.addEventListener("click", () => {
  app.currentUserId = null;
  saveApp();
  render();
});

fields.profileMainTab.addEventListener("click", () => {
  setMainTab("profile");
});

fields.vehiclesMainTab.addEventListener("click", () => {
  setMainTab("vehicles");
});

fields.maintenanceMainTab.addEventListener("click", () => {
  setMainTab("maintenance");
});

fields.vehicleSummaryTab.addEventListener("click", () => {
  setVehicleTab("summary");
});

fields.vehicleCreateTab.addEventListener("click", () => {
  setVehicleTab("create");
});

fields.vehicleHistoryTab.addEventListener("click", () => {
  setVehicleTab("history");
});

fields.quickMileageVehicle.addEventListener("change", () => {
  renderStats();
  renderMaintenanceAlerts();
  renderVehicles();
});

fields.historyVehicle.addEventListener("change", () => {
  renderHistory();
});

fields.vehicleList.addEventListener("click", (event) => {
  const data = currentData();
  if (!data) return;

  const editButton = event.target.closest("[data-edit-vehicle]");
  if (editButton) {
    editVehicle(editButton.dataset.editVehicle, data);
    return;
  }

  const deleteButton = event.target.closest("[data-delete-vehicle]");
  if (!deleteButton) return;

  const vehicleId = deleteButton.dataset.deleteVehicle;
  data.vehicles = data.vehicles.filter((vehicle) => vehicle.id !== vehicleId);
  data.mileage = data.mileage.filter((item) => item.vehicleId !== vehicleId);
  data.maintenance = data.maintenance.filter((item) => item.vehicleId !== vehicleId);
  saveApp();
  render();
});

function loadApp() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(emptyApp);

  try {
    const parsed = JSON.parse(saved);

    if (Array.isArray(parsed.vehicles)) {
      return migrateOldState(parsed);
    }

    return {
      ...structuredClone(emptyApp),
      ...parsed,
      users: (parsed.users || []).map((user) => ({
        ...user,
        data: { ...structuredClone(emptyData), ...(user.data || {}) },
      })),
    };
  } catch {
    return structuredClone(emptyApp);
  }
}

function migrateOldState(oldState) {
  const user = {
    id: crypto.randomUUID(),
    name: oldState.account?.name || "Usuario local",
    email: normalizeEmail(oldState.account?.email || "usuario@local.app"),
    passwordHash: "",
    data: {
      vehicles: oldState.vehicles || [],
      mileage: oldState.mileage || [],
      maintenance: oldState.maintenance || [],
    },
    createdAt: new Date().toISOString(),
  };

  return {
    users: [user],
    currentUserId: null,
  };
}

function saveApp() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(app));
}

function currentUser() {
  return app.users.find((user) => user.id === app.currentUserId) || null;
}

function currentData() {
  const user = currentUser();
  if (!user) return null;
  user.data = { ...structuredClone(emptyData), ...(user.data || {}) };
  return user.data;
}

function render() {
  const user = currentUser();

  fields.authScreen.classList.toggle("is-hidden", Boolean(user));
  fields.appShell.classList.toggle("is-hidden", !user);
  fields.authMessage.textContent = "";

  if (!user) return;

  setTodayDefaults();
  renderAccount(user);
  renderVehicleOptions();
  renderStats();
  renderMaintenanceAlerts();
  renderVehicles();
  renderHistory();
}

function renderAccount(user) {
  fields.ownerName.value = user.name;
  fields.ownerEmail.value = user.email;
  fields.sessionSummary.textContent = `Sesion activa: ${user.name}`;
  fields.accountSummary.textContent = `Perfil activo: ${user.name} (${user.email})`;
}

function renderVehicleOptions() {
  const data = currentData();
  const selectedQuickVehicle = fields.quickMileageVehicle.value;
  const selectedMileageVehicle = fields.mileageVehicle.value;
  const selectedMaintenanceVehicle = fields.maintenanceVehicle.value;
  const selectedHistoryVehicle = fields.historyVehicle.value;
  const options = data.vehicles
    .map((vehicle) => `<option value="${vehicle.id}">${escapeHtml(vehicle.name)}</option>`)
    .join("");
  const placeholder = '<option value="" disabled selected>Agrega un vehiculo primero</option>';

  fields.quickMileageVehicle.innerHTML = options || placeholder;
  fields.mileageVehicle.innerHTML = options || placeholder;
  fields.maintenanceVehicle.innerHTML = options || placeholder;
  fields.historyVehicle.innerHTML = options || placeholder;
  fields.quickMileageVehicle.disabled = data.vehicles.length === 0;
  fields.mileageVehicle.disabled = data.vehicles.length === 0;
  fields.maintenanceVehicle.disabled = data.vehicles.length === 0;
  fields.historyVehicle.disabled = data.vehicles.length === 0;

  keepSelectedVehicle(fields.quickMileageVehicle, selectedQuickVehicle, data);
  keepSelectedVehicle(fields.mileageVehicle, selectedMileageVehicle, data);
  keepSelectedVehicle(fields.maintenanceVehicle, selectedMaintenanceVehicle, data);
  keepSelectedVehicle(fields.historyVehicle, selectedHistoryVehicle, data);
}

function keepSelectedVehicle(select, previousValue, data) {
  if (previousValue && data.vehicles.some((vehicle) => vehicle.id === previousValue)) {
    select.value = previousValue;
    return;
  }

  if (data.vehicles.length > 0) {
    select.value = data.vehicles[0].id;
  }
}

function selectedSummaryVehicle(data) {
  const selectedVehicleId = fields.quickMileageVehicle.value;
  return data.vehicles.find((vehicle) => vehicle.id === selectedVehicleId) || data.vehicles[0] || null;
}

function renderStats() {
  const data = currentData();
  const vehicle = selectedSummaryVehicle(data);
  if (!vehicle) {
    fields.stats.innerHTML = `
      <article class="stat"><span>Vehiculo</span><strong>0</strong></article>
      <article class="stat"><span>Mantenciones</span><strong>0</strong></article>
      <article class="stat"><span>Gasto total</span><strong>${formatCurrency(0)}</strong></article>
    `;
    return;
  }

  const maintenanceItems = data.maintenance.filter((item) => item.vehicleId === vehicle.id);
  const totalCost = maintenanceItems.reduce((sum, item) => sum + item.cost, 0);
  const currentMileage = getCurrentMileage(vehicle, data);
  fields.stats.innerHTML = `
    <article class="stat"><span>Kilometraje actual</span><strong>${formatNumber(currentMileage)} km</strong></article>
    <article class="stat"><span>Mantenciones</span><strong>${maintenanceItems.length}</strong></article>
    <article class="stat"><span>Gasto total</span><strong>${formatCurrency(totalCost)}</strong></article>
  `;
}

function renderMaintenanceAlerts() {
  const data = currentData();
  const vehicle = selectedSummaryVehicle(data);
  if (!vehicle) {
    fields.maintenanceAlerts.innerHTML = "";
    return;
  }

  const currentMileage = getCurrentMileage(vehicle, data);
  const nextMaintenance = getNextMaintenance(vehicle.id, data, currentMileage);
  const remaining = nextMaintenance ? nextMaintenance.nextMileage - currentMileage : null;
  const status = formatMaintenanceStatus(nextMaintenance, remaining);

  fields.maintenanceAlerts.innerHTML = `
    <article class="alert-card ${status.className}">
      <span>${escapeHtml(vehicle.name)}</span>
      <strong>${status.text}</strong>
    </article>
  `;
}

function renderVehicles() {
  const data = currentData();
  if (data.vehicles.length === 0) {
    fields.vehicleList.innerHTML = '<div class="empty">Agrega tu primer vehiculo para comenzar el control.</div>';
    return;
  }

  const vehicle = selectedSummaryVehicle(data);
  fields.vehicleList.innerHTML = vehicle
    ? renderVehicleCard(vehicle, data)
    : '<div class="empty">Selecciona un vehiculo para ver su resumen.</div>';
}

function renderVehicleCard(vehicle, data) {
  const mileageItems = data.mileage
    .filter((item) => item.vehicleId === vehicle.id)
    .sort((a, b) => Number(b.value) - Number(a.value));
  const maintenanceItems = data.maintenance
    .filter((item) => item.vehicleId === vehicle.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const currentMileage = getCurrentMileage(vehicle, data);
  const lastMaintenance = maintenanceItems[0];
  const nextMaintenance = getNextMaintenance(vehicle.id, data, currentMileage);
  const remaining = nextMaintenance ? nextMaintenance.nextMileage - currentMileage : null;
  const totalCost = maintenanceItems.reduce((sum, item) => sum + item.cost, 0);
  const maintenanceStatus = formatMaintenanceStatus(nextMaintenance, remaining);

  return `
    <article class="vehicle-card">
      <header>
        <div>
          <h3>${escapeHtml(vehicle.name)}</h3>
          <span class="tag">${escapeHtml(vehicle.type)}${vehicle.plate ? ` - ${escapeHtml(vehicle.plate)}` : ""}</span>
        </div>
        <div class="card-actions">
          <button class="ghost-button small-button" data-edit-vehicle="${vehicle.id}" type="button">Editar</button>
          <button class="delete-button" data-delete-vehicle="${vehicle.id}" type="button">Eliminar</button>
        </div>
      </header>
      <div class="card-grid">
        <div class="mini-box"><span>Kilometraje actual</span><strong>${formatNumber(currentMileage)} km</strong></div>
        <div class="mini-box"><span>Ultima mantencion</span><strong>${lastMaintenance ? formatDate(lastMaintenance.date) : "Pendiente"}</strong></div>
        <div class="mini-box"><span>Proxima mantencion</span><strong>${maintenanceStatus.text}</strong></div>
      </div>
      <p class="muted">Gasto en mantenciones: ${formatCurrency(totalCost)}</p>
      <div class="history">
        ${maintenanceItems.slice(0, 3).map(renderMaintenanceItem).join("") || '<p class="muted">Sin mantenciones registradas.</p>'}
      </div>
    </article>
  `;
}

function editVehicle(vehicleId, data) {
  const vehicle = data.vehicles.find((item) => item.id === vehicleId);
  if (!vehicle) return;

  const name = prompt("Nombre del vehiculo", vehicle.name);
  if (name === null) return;

  const type = prompt("Tipo de vehiculo: Auto, Moto, Camioneta u Otro", vehicle.type);
  if (type === null) return;

  const plate = prompt("Patente", vehicle.plate);
  if (plate === null) return;

  const odometer = prompt("Kilometraje actual", String(vehicle.odometer));
  if (odometer === null) return;

  vehicle.name = name.trim() || vehicle.name;
  vehicle.type = type.trim() || vehicle.type;
  vehicle.plate = plate.trim().toUpperCase();
  vehicle.odometer = Number(odometer) || vehicle.odometer;

  data.mileage.push({
    id: crypto.randomUUID(),
    vehicleId: vehicle.id,
    date: today(),
    value: vehicle.odometer,
  });

  saveApp();
  render();
}

function renderMaintenanceItem(item) {
  return `
    <div class="history-item">
      <div>
        <strong>${escapeHtml(item.type)}</strong><br />
        <small>${formatMaintenanceMileage(item)}</small><br />
        <small>${escapeHtml(item.notes || "Sin notas")}</small>
      </div>
      <div>
        <strong>${formatCurrency(item.cost)}</strong><br />
        <small>${formatDate(item.date)}</small>
      </div>
    </div>
  `;
}

function saveMileageRecord(vehicleId, date, value) {
  const data = currentData();
  if (!data) return;

  data.mileage.push({
    id: crypto.randomUUID(),
    vehicleId,
    date,
    value,
  });

  const vehicle = data.vehicles.find((item) => item.id === vehicleId);
  if (vehicle) {
    vehicle.odometer = Math.max(Number(vehicle.odometer || 0), value);
  }

  saveApp();
}

function renderHistory() {
  const data = currentData();
  if (!data || data.vehicles.length === 0) {
    fields.historyList.innerHTML = '<div class="empty">Agrega un vehiculo para revisar su historial.</div>';
    return;
  }

  if (!fields.historyVehicle.value) {
    fields.historyVehicle.value = data.vehicles[0].id;
  }

  const vehicle = data.vehicles.find((item) => item.id === fields.historyVehicle.value);
  if (!vehicle) {
    fields.historyList.innerHTML = '<div class="empty">Selecciona un vehiculo.</div>';
    return;
  }

  const mileageItems = data.mileage
    .filter((item) => item.vehicleId === vehicle.id)
    .sort((a, b) => b.date.localeCompare(a.date) || Number(b.value) - Number(a.value));
  const maintenanceItems = data.maintenance
    .filter((item) => item.vehicleId === vehicle.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  fields.historyList.innerHTML = `
    <article class="vehicle-card">
      <header>
        <div>
          <h3>${escapeHtml(vehicle.name)}</h3>
          <span class="tag">Historial completo</span>
        </div>
      </header>
      <h4>Mantenciones</h4>
      <div class="history">
        ${maintenanceItems.map(renderMaintenanceItem).join("") || '<p class="muted">Sin mantenciones registradas.</p>'}
      </div>
      <h4>Kilometraje</h4>
      <div class="history">
        ${mileageItems.map(renderMileageItem).join("") || '<p class="muted">Sin kilometrajes registrados.</p>'}
      </div>
    </article>
  `;
}

function renderMileageItem(item) {
  return `
    <div class="history-item">
      <div>
        <strong>${formatNumber(item.value)} km</strong><br />
        <small>Registro de kilometraje</small>
      </div>
      <div>
        <small>${formatDate(item.date)}</small>
      </div>
    </div>
  `;
}

function getCurrentMileage(vehicle, data) {
  const mileageItems = data.mileage.filter((item) => item.vehicleId === vehicle.id);
  const highestMileage = mileageItems.reduce((highest, item) => Math.max(highest, Number(item.value || 0)), 0);
  return Math.max(Number(vehicle.odometer || 0), highestMileage);
}

function getNextMaintenance(vehicleId, data, currentMileage) {
  const maintenanceItems = data.maintenance.filter((item) => item.vehicleId === vehicleId && Number(item.nextMileage) > 0);
  const futureItems = maintenanceItems
    .filter((item) => Number(item.nextMileage) >= currentMileage)
    .sort((a, b) => Number(a.nextMileage) - Number(b.nextMileage));

  if (futureItems.length > 0) return futureItems[0];

  const overdueItems = maintenanceItems.sort((a, b) => Number(b.nextMileage) - Number(a.nextMileage));
  return overdueItems[0] || null;
}

function formatMaintenanceMileage(item) {
  const maintenanceKm = item.mileage ? `${formatNumber(item.mileage)} km realizados` : "Km de mantencion no registrado";
  const nextKm = item.nextMileage ? ` - proxima en ${formatNumber(item.nextMileage)} km` : "";
  return `${maintenanceKm}${nextKm}`;
}

function formatMaintenanceStatus(nextMaintenance, remaining) {
  if (!nextMaintenance) {
    return { text: "Sin programar", className: "is-neutral" };
  }

  if (remaining <= 0) {
    return { text: `Vencida por ${formatNumber(Math.abs(remaining))} km`, className: "is-danger" };
  }

  return { text: `Faltan ${formatNumber(remaining)} km`, className: remaining <= 1000 ? "is-warning" : "is-ok" };
}

function setMainTab(tabName) {
  const isProfile = tabName === "profile";
  const isVehicles = tabName === "vehicles";
  const isMaintenance = tabName === "maintenance";

  fields.profileMainTab.classList.toggle("is-active", isProfile);
  fields.vehiclesMainTab.classList.toggle("is-active", isVehicles);
  fields.maintenanceMainTab.classList.toggle("is-active", isMaintenance);
  fields.profileSection.classList.toggle("is-hidden", !isProfile);
  fields.vehiclesSection.classList.toggle("is-hidden", !isVehicles);
  fields.maintenanceSection.classList.toggle("is-hidden", !isMaintenance);
}

function setVehicleTab(tabName) {
  const isSummary = tabName === "summary";
  const isCreate = tabName === "create";
  const isHistory = tabName === "history";

  fields.vehicleSummaryTab.classList.toggle("is-active", isSummary);
  fields.vehicleCreateTab.classList.toggle("is-active", isCreate);
  fields.vehicleHistoryTab.classList.toggle("is-active", isHistory);
  fields.vehicleSummaryPanel.classList.toggle("is-hidden", !isSummary);
  fields.vehicleCreatePanel.classList.toggle("is-hidden", !isCreate);
  fields.vehicleHistoryPanel.classList.toggle("is-hidden", !isHistory);
}

function showAuthMessage(message) {
  fields.authMessage.textContent = message;
}

function setTodayDefaults() {
  fields.quickMileageDate.value ||= today();
  fields.mileageDate.value ||= today();
  fields.maintenanceDate.value ||= today();
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

async function hashPassword(password) {
  if (!crypto.subtle) return simpleHash(password);

  const bytes = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function simpleHash(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return `local-${Math.abs(hash)}`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value) {
  return new Intl.NumberFormat("es-CL").format(value);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("es-CL").format(new Date(`${value}T00:00:00`));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

render();
