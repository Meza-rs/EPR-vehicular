const STORAGE_KEY = "erpVehicularPersonal";
const BACKUP_VERSION = 1;

const MAINTENANCE_PRESETS = {
  Auto: [
    { type: "Cambio de aceite motor", intervalKm: 10000, priority: "Alta" },
    { type: "Cambio de filtro de aceite", intervalKm: 10000, priority: "Alta" },
    { type: "Revision de frenos", intervalKm: 10000, priority: "Alta" },
    { type: "Cambio de filtro de polen", intervalKm: 15000, priority: "Media" },
    { type: "Cambio de filtro de aire", intervalKm: 20000, priority: "Media" },
    { type: "Rotacion de neumaticos", intervalKm: 10000, priority: "Media" },
    { type: "Cambio de refrigerante", intervalKm: 40000, priority: "Alta" },
    { type: "Cambio de liquido de frenos", intervalKm: 40000, priority: "Alta" },
    { type: "Cambio de bujias", intervalKm: 40000, priority: "Media" },
    { type: "Cambio de correa de distribucion", intervalKm: 80000, priority: "Alta" },
  ],
  Moto: [
    { type: "Cambio de aceite motor", intervalKm: 5000, priority: "Alta" },
    { type: "Limpieza y lubricacion de cadena", intervalKm: 800, priority: "Alta" },
    { type: "Ajuste de tension de cadena", intervalKm: 1000, priority: "Alta" },
    { type: "Revision de frenos", intervalKm: 5000, priority: "Alta" },
    { type: "Cambio de filtro de aire", intervalKm: 10000, priority: "Media" },
    { type: "Cambio de kit de arrastre", intervalKm: 20000, priority: "Alta" },
    { type: "Cambio de bujia", intervalKm: 10000, priority: "Media" },
    { type: "Cambio de refrigerante", intervalKm: 20000, priority: "Alta" },
    { type: "Revision de neumaticos", intervalKm: 5000, priority: "Alta" },
  ],
};

const emptyData = {
  vehicles: [],
  mileage: [],
  maintenance: [],
  maintenancePlans: [],
};

const emptyApp = {
  users: [],
  currentUserId: null,
};

let app = loadApp();
let maintenancePlanDraft = [];
let maintenancePlanDraftType = "";
let activePlanVehicleId = null;

const forms = {
  login: document.querySelector("#loginForm"),
  register: document.querySelector("#registerForm"),
  account: document.querySelector("#accountForm"),
  vehicle: document.querySelector("#vehicleForm"),
  quickMileage: document.querySelector("#quickMileageForm"),
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
  vehiclePlanPanel: document.querySelector("#vehiclePlanPanel"),
  vehicleName: document.querySelector("#vehicleName"),
  vehicleType: document.querySelector("#vehicleType"),
  vehiclePlate: document.querySelector("#vehiclePlate"),
  vehicleOdometer: document.querySelector("#vehicleOdometer"),
  selectAllMaintenance: document.querySelector("#selectAllMaintenance"),
  maintenancePresetPreview: document.querySelector("#maintenancePresetPreview"),
  customMaintenanceName: document.querySelector("#customMaintenanceName"),
  customMaintenanceInterval: document.querySelector("#customMaintenanceInterval"),
  customMaintenancePriority: document.querySelector("#customMaintenancePriority"),
  addCustomMaintenance: document.querySelector("#addCustomMaintenance"),
  quickMileageVehicle: document.querySelector("#quickMileageVehicle"),
  quickMileageDate: document.querySelector("#quickMileageDate"),
  quickMileageValue: document.querySelector("#quickMileageValue"),
  maintenanceVehicle: document.querySelector("#maintenanceVehicle"),
  maintenanceDate: document.querySelector("#maintenanceDate"),
  maintenanceMileage: document.querySelector("#maintenanceMileage"),
  maintenanceNotes: document.querySelector("#maintenanceNotes"),
  selectAllPerformedMaintenance: document.querySelector("#selectAllPerformedMaintenance"),
  maintenancePlanSelection: document.querySelector("#maintenancePlanSelection"),
  maintenanceBatchMessage: document.querySelector("#maintenanceBatchMessage"),
  stats: document.querySelector("#stats"),
  maintenanceAlerts: document.querySelector("#maintenanceAlerts"),
  historyVehicle: document.querySelector("#historyVehicle"),
  historyMaintenanceFilter: document.querySelector("#historyMaintenanceFilter"),
  historyList: document.querySelector("#historyList"),
  vehicleList: document.querySelector("#vehicleList"),
  backToVehicleSummary: document.querySelector("#backToVehicleSummary"),
  maintenancePlanEditForm: document.querySelector("#maintenancePlanEditForm"),
  maintenancePlanEditList: document.querySelector("#maintenancePlanEditList"),
  planEditorVehicleName: document.querySelector("#planEditorVehicleName"),
  planNewName: document.querySelector("#planNewName"),
  planNewInterval: document.querySelector("#planNewInterval"),
  planNewPriority: document.querySelector("#planNewPriority"),
  planNewNotes: document.querySelector("#planNewNotes"),
  addPlanItem: document.querySelector("#addPlanItem"),
  planEditMessage: document.querySelector("#planEditMessage"),
  exportData: document.querySelector("#exportData"),
  importData: document.querySelector("#importData"),
  importDataFile: document.querySelector("#importDataFile"),
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

  data.maintenancePlans.push(...createMaintenancePlans(vehicle));

  forms.vehicle.reset();
  maintenancePlanDraft = [];
  maintenancePlanDraftType = "";
  renderPresetPreview(true);
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

forms.maintenance.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = currentData();
  if (!data) return;

  const selectedRows = [...fields.maintenancePlanSelection.querySelectorAll("[data-maintenance-plan]")]
    .filter((row) => row.querySelector("[data-performed]").checked);
  if (selectedRows.length === 0) {
    fields.maintenanceBatchMessage.textContent = "Selecciona al menos una mantencion realizada.";
    return;
  }

  const vehicleId = fields.maintenanceVehicle.value;
  const mileage = Number(fields.maintenanceMileage.value);
  const date = fields.maintenanceDate.value;
  const notes = fields.maintenanceNotes.value.trim();

  selectedRows.forEach((row) => {
    const plan = data.maintenancePlans.find((item) => item.id === row.dataset.maintenancePlan);
    if (!plan) return;
    const maintenance = {
      id: crypto.randomUUID(),
      vehicleId,
      date,
      type: plan.type,
      mileage,
      nextMileage: Number(row.querySelector("[data-next-mileage]").value || mileage + plan.intervalKm),
      cost: Number(row.querySelector("[data-performed-cost]").value || 0),
      notes: [plan.notes, notes].filter(Boolean).join(" | "),
    };
    data.maintenance.push(maintenance);
    plan.nextMileage = maintenance.nextMileage;
  });

  forms.maintenance.reset();
  fields.maintenanceVehicle.value = vehicleId;
  fields.maintenanceBatchMessage.textContent = "";
  setTodayDefaults();
  saveApp();
  render();
});

fields.resetData.addEventListener("click", () => {
  const user = currentUser();
  if (!user) return;

  const shouldReset = confirmDeletion(
    "Limpiar todos mis datos",
    "Se eliminaran permanentemente todos tus vehiculos, kilometrajes, planes de mantencion e historial de trabajos. Tu cuenta se conservara. Esta accion no se puede deshacer.",
  );
  if (!shouldReset) return;

  user.data = structuredClone(emptyData);
  saveApp();
  render();
});

fields.exportData.addEventListener("click", () => {
  exportCurrentUserData();
});

fields.importData.addEventListener("click", () => {
  fields.importDataFile.value = "";
  fields.importDataFile.click();
});

fields.importDataFile.addEventListener("change", async () => {
  const file = fields.importDataFile.files?.[0];
  if (!file) return;
  await importCurrentUserData(file);
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
  renderPresetPreview();
});

fields.vehicleHistoryTab.addEventListener("click", () => {
  setVehicleTab("history");
});

fields.quickMileageVehicle.addEventListener("change", () => {
  renderStats();
  renderMaintenanceAlerts();
  renderVehicles();
});

fields.vehicleType.addEventListener("change", () => {
  renderPresetPreview(true);
});

fields.selectAllMaintenance.addEventListener("change", () => {
  maintenancePlanDraft.forEach((item) => {
    item.selected = fields.selectAllMaintenance.checked;
  });
  renderPresetPreview();
});

fields.maintenancePresetPreview.addEventListener("change", (event) => {
  const row = event.target.closest("[data-plan-id]");
  if (!row) return;
  const item = maintenancePlanDraft.find((entry) => entry.id === row.dataset.planId);
  if (!item) return;

  if (event.target.matches("[data-plan-selected]")) item.selected = event.target.checked;
  if (event.target.matches("[data-plan-name]")) item.type = event.target.value.trim();
  if (event.target.matches("[data-plan-interval]")) item.intervalKm = Number(event.target.value || 0);
  if (event.target.matches("[data-plan-priority]")) item.priority = event.target.value;
  updateSelectAllState();
});

fields.addCustomMaintenance.addEventListener("click", () => {
  addCustomMaintenanceToDraft();
});

fields.maintenanceVehicle.addEventListener("change", () => {
  const data = currentData();
  const vehicle = data?.vehicles.find((item) => item.id === fields.maintenanceVehicle.value);
  fields.maintenanceMileage.value = vehicle ? getCurrentMileage(vehicle, data) : "";
  renderMaintenancePlanSelection();
});

fields.maintenanceMileage.addEventListener("input", () => {
  updateSuggestedNextMileages();
});

fields.selectAllPerformedMaintenance.addEventListener("change", () => {
  fields.maintenancePlanSelection.querySelectorAll("[data-performed]").forEach((checkbox) => {
    checkbox.checked = fields.selectAllPerformedMaintenance.checked;
  });
});

fields.maintenancePlanSelection.addEventListener("change", (event) => {
  if (!event.target.matches("[data-performed]")) return;
  updatePerformedSelectAllState();
  fields.maintenanceBatchMessage.textContent = "";
});

fields.historyVehicle.addEventListener("change", () => {
  renderHistoryFilterOptions();
  renderHistory();
});

fields.historyMaintenanceFilter.addEventListener("change", () => {
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

  const planButton = event.target.closest("[data-edit-plan]");
  if (planButton) {
    openMaintenancePlanEditor(planButton.dataset.editPlan);
    return;
  }

  const deleteButton = event.target.closest("[data-delete-vehicle]");
  if (!deleteButton) return;

  const vehicleId = deleteButton.dataset.deleteVehicle;
  const vehicle = data.vehicles.find((item) => item.id === vehicleId);
  const maintenanceCount = data.maintenance.filter((item) => item.vehicleId === vehicleId).length;
  const mileageCount = data.mileage.filter((item) => item.vehicleId === vehicleId).length;
  const planCount = data.maintenancePlans.filter((item) => item.vehicleId === vehicleId).length;
  const shouldDelete = confirmDeletion(
    `Eliminar ${vehicle?.name || "vehiculo"}`,
    `Se perderan permanentemente este vehiculo, ${mileageCount} registros de kilometraje, ${maintenanceCount} mantenciones realizadas y ${planCount} tareas de su plan. Esta accion no se puede deshacer.`,
  );
  if (!shouldDelete) return;

  data.vehicles = data.vehicles.filter((vehicle) => vehicle.id !== vehicleId);
  data.mileage = data.mileage.filter((item) => item.vehicleId !== vehicleId);
  data.maintenance = data.maintenance.filter((item) => item.vehicleId !== vehicleId);
  data.maintenancePlans = data.maintenancePlans.filter((item) => item.vehicleId !== vehicleId);
  saveApp();
  render();
});

fields.backToVehicleSummary.addEventListener("click", () => {
  setVehicleTab("summary");
});

fields.addPlanItem.addEventListener("click", () => {
  addPlanItemToVehicle();
});

fields.maintenancePlanEditList.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-plan-item]");
  if (!deleteButton) return;
  deletePlanItem(deleteButton.dataset.deletePlanItem);
});

fields.maintenancePlanEditForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveMaintenancePlanEdits();
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
  renderPresetPreview();
  renderMaintenancePlanSelection();
  renderHistoryFilterOptions();
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
  const selectedMaintenanceVehicle = fields.maintenanceVehicle.value;
  const selectedHistoryVehicle = fields.historyVehicle.value;
  const options = data.vehicles
    .map((vehicle) => `<option value="${vehicle.id}">${escapeHtml(vehicle.name)}</option>`)
    .join("");
  const placeholder = '<option value="" disabled selected>Agrega un vehiculo primero</option>';

  fields.quickMileageVehicle.innerHTML = options || placeholder;
  fields.maintenanceVehicle.innerHTML = options || placeholder;
  fields.historyVehicle.innerHTML = options || placeholder;
  fields.quickMileageVehicle.disabled = data.vehicles.length === 0;
  fields.maintenanceVehicle.disabled = data.vehicles.length === 0;
  fields.historyVehicle.disabled = data.vehicles.length === 0;

  keepSelectedVehicle(fields.quickMileageVehicle, selectedQuickVehicle, data);
  keepSelectedVehicle(fields.maintenanceVehicle, selectedMaintenanceVehicle, data);
  keepSelectedVehicle(fields.historyVehicle, selectedHistoryVehicle, data);
}

function renderPresetPreview(forceReset = false) {
  const vehicleType = fields.vehicleType.value;
  if (forceReset || maintenancePlanDraftType !== vehicleType) {
    maintenancePlanDraftType = vehicleType;
    maintenancePlanDraft = presetsForVehicleType(vehicleType).map((preset) => ({
      id: crypto.randomUUID(),
      type: preset.type,
      intervalKm: preset.intervalKm,
      priority: preset.priority,
      selected: true,
      custom: false,
    }));
  }

  if (maintenancePlanDraft.length === 0) {
    fields.maintenancePresetPreview.innerHTML = '<p class="muted">No hay mantenciones seleccionadas. Puedes agregar una mantencion personalizada abajo.</p>';
    updateSelectAllState();
    return;
  }

  fields.maintenancePresetPreview.innerHTML = `
    <div class="preset-table-header">
      <span>Usar</span><span>Mantencion</span><span>Periodicidad</span><span>Prioridad</span>
    </div>
    <div class="preset-plan-list">
      ${maintenancePlanDraft.map((item) => `
        <div class="preset-plan-row" data-plan-id="${item.id}">
          <input data-plan-selected type="checkbox" ${item.selected ? "checked" : ""} aria-label="Incluir mantencion" />
          <input data-plan-name type="text" value="${escapeHtml(item.type)}" aria-label="Nombre de mantencion" />
          <label class="interval-input">
            <input data-plan-interval type="number" min="100" step="100" value="${item.intervalKm}" aria-label="Periodicidad en kilometros" />
            <span>km</span>
          </label>
          <select data-plan-priority aria-label="Prioridad">
            ${["Alta", "Media", "Baja"].map((priority) => `<option value="${priority}" ${item.priority === priority ? "selected" : ""}>${priority}</option>`).join("")}
          </select>
        </div>
      `).join("")}
    </div>
  `;
  updateSelectAllState();
}

function updateSelectAllState() {
  const selectedCount = maintenancePlanDraft.filter((item) => item.selected).length;
  fields.selectAllMaintenance.checked = maintenancePlanDraft.length > 0 && selectedCount === maintenancePlanDraft.length;
  fields.selectAllMaintenance.indeterminate = selectedCount > 0 && selectedCount < maintenancePlanDraft.length;
}

function addCustomMaintenanceToDraft() {
  const type = fields.customMaintenanceName.value.trim();
  const intervalKm = Number(fields.customMaintenanceInterval.value);
  if (!type || intervalKm <= 0) {
    fields.customMaintenanceName.focus();
    return;
  }

  maintenancePlanDraft.push({
    id: crypto.randomUUID(),
    type,
    intervalKm,
    priority: fields.customMaintenancePriority.value,
    selected: true,
    custom: true,
  });
  fields.customMaintenanceName.value = "";
  fields.customMaintenanceInterval.value = "";
  fields.customMaintenancePriority.value = "Media";
  renderPresetPreview();
}

function renderMaintenancePlanSelection() {
  const data = currentData();
  if (!data) return;

  const vehicleId = fields.maintenanceVehicle.value;
  const vehicle = data.vehicles.find((item) => item.id === vehicleId);
  if (!vehicle) {
    fields.maintenancePlanSelection.innerHTML = '<div class="empty">Selecciona un vehiculo con plan de mantencion.</div>';
    return;
  }

  if (!fields.maintenanceMileage.value) {
    fields.maintenanceMileage.value = getCurrentMileage(vehicle, data);
  }
  const currentMileage = getCurrentMileage(vehicle, data);
  const performedMileage = Number(fields.maintenanceMileage.value) || currentMileage;
  const plans = data.maintenancePlans
    .filter((plan) => plan.vehicleId === vehicleId)
    .map((plan) => ({ ...plan, remaining: plan.nextMileage - currentMileage }))
    .sort((a, b) => a.remaining - b.remaining || priorityRank(a.priority) - priorityRank(b.priority));

  if (plans.length === 0) {
    fields.maintenancePlanSelection.innerHTML = '<div class="empty">Este vehiculo no tiene mantenciones en su plan.</div>';
    fields.selectAllPerformedMaintenance.checked = false;
    fields.selectAllPerformedMaintenance.disabled = true;
    return;
  }

  fields.selectAllPerformedMaintenance.disabled = false;
  fields.selectAllPerformedMaintenance.checked = false;
  fields.selectAllPerformedMaintenance.indeterminate = false;
  fields.maintenancePlanSelection.innerHTML = plans.map((plan) => {
    const status = formatPlanRemaining(plan.remaining);
    return `
      <div class="performed-maintenance-row ${status.className}" data-maintenance-plan="${plan.id}">
        <label class="performed-check" title="Marcar como realizada">
          <input data-performed type="checkbox" />
        </label>
        <span class="performed-maintenance-name">
          <strong>${escapeHtml(plan.type)}</strong>
          <small>Proxima programada: ${formatNumber(plan.nextMileage)} km</small>
          ${plan.notes ? `<small class="plan-task-notes">${escapeHtml(plan.notes)}</small>` : ""}
        </span>
        <span class="priority priority-${plan.priority.toLowerCase()}">${plan.priority}</span>
        <span class="maintenance-schedule">
          <strong class="remaining-km">${status.text}</strong>
          <label>
            Proxima en km
            <input data-next-mileage data-interval-km="${plan.intervalKm}" type="number" min="0" step="1" value="${performedMileage + plan.intervalKm}" />
          </label>
        </span>
        <span class="performed-cost">
          <small>Costo</small>
          <input data-performed-cost type="number" min="0" step="100" placeholder="$ 0" />
        </span>
      </div>
    `;
  }).join("");
}

function updateSuggestedNextMileages() {
  const performedMileage = Number(fields.maintenanceMileage.value || 0);
  if (performedMileage <= 0) return;

  fields.maintenancePlanSelection.querySelectorAll("[data-next-mileage]").forEach((input) => {
    input.value = performedMileage + Number(input.dataset.intervalKm || 0);
  });
}

function formatPlanRemaining(remaining) {
  if (remaining < 0) return { text: `Vencida por ${formatNumber(Math.abs(remaining))} km`, className: "is-overdue" };
  if (remaining === 0) return { text: "Corresponde ahora", className: "is-due" };
  if (remaining <= 1000) return { text: `Faltan ${formatNumber(remaining)} km`, className: "is-near" };
  return { text: `Faltan ${formatNumber(remaining)} km`, className: "is-planned" };
}

function updatePerformedSelectAllState() {
  const checkboxes = [...fields.maintenancePlanSelection.querySelectorAll("[data-performed]")];
  const selectedCount = checkboxes.filter((checkbox) => checkbox.checked).length;
  fields.selectAllPerformedMaintenance.checked = checkboxes.length > 0 && selectedCount === checkboxes.length;
  fields.selectAllPerformedMaintenance.indeterminate = selectedCount > 0 && selectedCount < checkboxes.length;
}

function renderHistoryFilterOptions() {
  const data = currentData();
  if (!data) return;

  const previousFilter = fields.historyMaintenanceFilter.value;
  const types = [...new Set(data.maintenance
    .filter((item) => item.vehicleId === fields.historyVehicle.value)
    .map((item) => item.type))]
    .sort((a, b) => a.localeCompare(b));

  fields.historyMaintenanceFilter.innerHTML = `
    <option value="">Todas las mantenciones</option>
    ${types.map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join("")}
  `;

  if (types.includes(previousFilter)) fields.historyMaintenanceFilter.value = previousFilter;
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
  const maintenanceGroup = getNextMaintenanceGroup(vehicle.id, data, currentMileage);
  const status = formatMaintenanceGroupStatus(maintenanceGroup, currentMileage);

  fields.maintenanceAlerts.innerHTML = `
    <article class="alert-card ${status.className}">
      <div>
        <span>${escapeHtml(vehicle.name)}</span>
        <strong>${status.text}</strong>
      </div>
      <p>${escapeHtml(status.names)}</p>
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
  const maintenanceGroup = getNextMaintenanceGroup(vehicle.id, data, currentMileage);
  const totalCost = maintenanceItems.reduce((sum, item) => sum + item.cost, 0);
  const maintenanceStatus = formatMaintenanceGroupStatus(maintenanceGroup, currentMileage);
  const plans = data.maintenancePlans
    .filter((plan) => plan.vehicleId === vehicle.id)
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority));

  return `
    <article class="vehicle-card">
      <header>
        <div>
          <h3>${escapeHtml(vehicle.name)}</h3>
          <span class="tag">${escapeHtml(vehicle.type)}${vehicle.plate ? ` - ${escapeHtml(vehicle.plate)}` : ""}</span>
        </div>
        <div class="card-actions">
          <button class="ghost-button small-button" data-edit-vehicle="${vehicle.id}" type="button">Editar</button>
          <button class="ghost-button small-button" data-edit-plan="${vehicle.id}" type="button">Modificar plan</button>
          <button class="delete-button" data-delete-vehicle="${vehicle.id}" type="button">Eliminar</button>
        </div>
      </header>
      <div class="card-grid">
        <div class="mini-box"><span>Kilometraje actual</span><strong>${formatNumber(currentMileage)} km</strong></div>
        <div class="mini-box"><span>Ultima mantencion</span><strong>${lastMaintenance ? formatDate(lastMaintenance.date) : "Pendiente"}</strong></div>
        <div class="mini-box maintenance-summary-box">
          <span>Proxima mantencion</span>
          <strong>${maintenanceStatus.text}</strong>
          <small>${escapeHtml(maintenanceStatus.names)}</small>
        </div>
      </div>
      <p class="muted">Gasto en mantenciones: ${formatCurrency(totalCost)}</p>
      <div class="history">
        ${maintenanceItems.slice(0, 3).map(renderMaintenanceItem).join("") || '<p class="muted">Sin mantenciones registradas.</p>'}
      </div>
      ${plans.length ? `
        <h4>Plan recomendado</h4>
        <div class="plan-list">
          ${plans.map(renderMaintenancePlan).join("")}
        </div>
      ` : ""}
    </article>
  `;
}

function renderMaintenancePlan(plan) {
  return `
    <div class="plan-item">
      <div>
        <strong>${escapeHtml(plan.type)}</strong>
        <small>Cada ${formatNumber(plan.intervalKm)} km</small>
        ${plan.notes ? `<small>${escapeHtml(plan.notes)}</small>` : ""}
      </div>
      <span class="priority priority-${plan.priority.toLowerCase()}">${plan.priority}</span>
      <small>Proxima: ${formatNumber(plan.nextMileage)} km</small>
    </div>
  `;
}

function openMaintenancePlanEditor(vehicleId) {
  activePlanVehicleId = vehicleId;
  setVehicleTab("plan");
  renderMaintenancePlanEditor();
}

function renderMaintenancePlanEditor() {
  const data = currentData();
  if (!data) return;
  const vehicle = data.vehicles.find((item) => item.id === activePlanVehicleId);
  if (!vehicle) {
    setVehicleTab("summary");
    return;
  }

  fields.planEditorVehicleName.textContent = `Plan de ${vehicle.name}`;
  const plans = data.maintenancePlans
    .filter((item) => item.vehicleId === vehicle.id)
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority) || a.type.localeCompare(b.type));

  fields.maintenancePlanEditList.innerHTML = plans.length
    ? plans.map((plan) => `
      <article class="plan-edit-item" data-edit-plan-item="${plan.id}" data-original-interval="${plan.intervalKm}">
        <div class="plan-edit-row">
          <label>
            Mantencion
            <input data-edit-plan-name type="text" value="${escapeHtml(plan.type)}" required />
          </label>
          <label>
            Periodicidad en km
            <input data-edit-plan-interval type="number" min="100" step="100" value="${plan.intervalKm}" required />
          </label>
          <label>
            Prioridad
            <select data-edit-plan-priority>
              ${["Alta", "Media", "Baja"].map((priority) => `<option value="${priority}" ${plan.priority === priority ? "selected" : ""}>${priority}</option>`).join("")}
            </select>
          </label>
          <button class="delete-button" data-delete-plan-item="${plan.id}" type="button">Eliminar</button>
        </div>
        <label>
          Notas de esta mantencion
          <textarea data-edit-plan-notes rows="2" placeholder="Aceite, filtro, repuesto o especificacion recomendada...">${escapeHtml(plan.notes || "")}</textarea>
        </label>
        <small>Proxima programada: ${formatNumber(plan.nextMileage)} km</small>
      </article>
    `).join("")
    : '<div class="empty">Este vehiculo no tiene mantenciones en su plan.</div>';
}

function addPlanItemToVehicle() {
  const data = currentData();
  const vehicle = data?.vehicles.find((item) => item.id === activePlanVehicleId);
  const type = fields.planNewName.value.trim();
  const intervalKm = Number(fields.planNewInterval.value);
  if (!vehicle || !type || intervalKm < 100) {
    fields.planEditMessage.textContent = "Ingresa un nombre y una periodicidad valida.";
    return;
  }

  data.maintenancePlans.push({
    id: crypto.randomUUID(),
    vehicleId: vehicle.id,
    type,
    intervalKm,
    priority: fields.planNewPriority.value,
    nextMileage: getCurrentMileage(vehicle, data) + intervalKm,
    notes: fields.planNewNotes.value.trim(),
  });
  fields.planNewName.value = "";
  fields.planNewInterval.value = "";
  fields.planNewPriority.value = "Media";
  fields.planNewNotes.value = "";
  fields.planEditMessage.textContent = "Mantencion agregada al plan.";
  saveApp();
  renderMaintenancePlanEditor();
}

function deletePlanItem(planId) {
  const data = currentData();
  if (!data) return;
  const plan = data.maintenancePlans.find((item) => item.id === planId);
  const shouldDelete = confirmDeletion(
    `Eliminar ${plan?.type || "mantencion"} del plan`,
    "Esta tarea dejara de aparecer en los avisos y en la lista de mantenciones por realizar. Los trabajos ya registrados en el historial se conservaran. Esta accion no se puede deshacer.",
  );
  if (!shouldDelete) return;

  data.maintenancePlans = data.maintenancePlans.filter((item) => item.id !== planId);
  saveApp();
  renderMaintenancePlanEditor();
}

function saveMaintenancePlanEdits() {
  const data = currentData();
  const vehicle = data?.vehicles.find((item) => item.id === activePlanVehicleId);
  if (!vehicle) return;

  fields.maintenancePlanEditList.querySelectorAll("[data-edit-plan-item]").forEach((row) => {
    const plan = data.maintenancePlans.find((item) => item.id === row.dataset.editPlanItem);
    if (!plan) return;
    const newType = row.querySelector("[data-edit-plan-name]").value.trim();
    const newInterval = Number(row.querySelector("[data-edit-plan-interval]").value);
    const intervalChanged = newInterval !== Number(row.dataset.originalInterval);
    const previousType = plan.type;

    plan.type = newType || plan.type;
    plan.intervalKm = newInterval || plan.intervalKm;
    plan.priority = row.querySelector("[data-edit-plan-priority]").value;
    plan.notes = row.querySelector("[data-edit-plan-notes]").value.trim();

    if (intervalChanged) {
      const lastMaintenance = data.maintenance
        .filter((item) => item.vehicleId === vehicle.id && item.type.toLowerCase() === previousType.toLowerCase())
        .sort((a, b) => Number(b.mileage) - Number(a.mileage))[0];
      const baseMileage = lastMaintenance?.mileage || getCurrentMileage(vehicle, data);
      plan.nextMileage = Number(baseMileage) + plan.intervalKm;
    }
  });

  saveApp();
  fields.planEditMessage.textContent = "Plan actualizado correctamente.";
  renderMaintenancePlanEditor();
  renderMaintenancePlanSelection();
  renderVehicles();
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

function presetsForVehicleType(vehicleType) {
  if (vehicleType === "Camioneta") return MAINTENANCE_PRESETS.Auto;
  return MAINTENANCE_PRESETS[vehicleType] || [];
}

function createMaintenancePlans(vehicle) {
  syncMaintenancePlanDraft();
  return maintenancePlanDraft
    .filter((item) => item.selected && item.type && item.intervalKm > 0)
    .map((item) => ({
    id: crypto.randomUUID(),
    vehicleId: vehicle.id,
    type: item.type,
    intervalKm: item.intervalKm,
    priority: item.priority,
    nextMileage: vehicle.odometer + item.intervalKm,
    notes: item.notes || "",
  }));
}

function syncMaintenancePlanDraft() {
  fields.maintenancePresetPreview.querySelectorAll("[data-plan-id]").forEach((row) => {
    const item = maintenancePlanDraft.find((entry) => entry.id === row.dataset.planId);
    if (!item) return;
    item.selected = row.querySelector("[data-plan-selected]").checked;
    item.type = row.querySelector("[data-plan-name]").value.trim();
    item.intervalKm = Number(row.querySelector("[data-plan-interval]").value || 0);
    item.priority = row.querySelector("[data-plan-priority]").value;
  });
}

function priorityRank(priority) {
  return { Alta: 1, Media: 2, Baja: 3 }[priority] || 4;
}

function confirmDeletion(title, detail) {
  return window.confirm(`${title}\n\n${detail}\n\n¿Estas seguro de que deseas continuar?`);
}

function exportCurrentUserData() {
  const user = currentUser();
  if (!user) return;

  const backup = {
    app: "ERP Vehicular Personal",
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    user: {
      name: user.name,
      email: user.email,
    },
    data: structuredClone(user.data),
  };
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeName = user.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "usuario";
  link.href = url;
  link.download = `erp-vehicular-${safeName}-${today()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function importCurrentUserData(file) {
  const user = currentUser();
  if (!user) return;

  try {
    const backup = JSON.parse(await file.text());
    const importedData = validateBackup(backup);
    const shouldImport = confirmDeletion(
      "Cargar respaldo JSON",
      `Los datos actuales de esta cuenta seran reemplazados por ${importedData.vehicles.length} vehiculos, ${importedData.mileage.length} registros de kilometraje, ${importedData.maintenance.length} mantenciones y ${importedData.maintenancePlans.length} tareas de plan. Tu correo y password actuales se conservaran.`,
    );
    if (!shouldImport) return;

    user.data = importedData;
    if (backup.user?.name) user.name = String(backup.user.name).trim() || user.name;
    saveApp();
    render();
    window.alert("El respaldo se cargo correctamente.");
  } catch (error) {
    window.alert(`No se pudo cargar el respaldo. ${error.message || "El archivo JSON no es valido."}`);
  }
}

function validateBackup(backup) {
  if (!backup || typeof backup !== "object" || !backup.data || typeof backup.data !== "object") {
    throw new Error("El archivo no corresponde a un respaldo de ERP Vehicular Personal.");
  }
  if (backup.version !== BACKUP_VERSION) {
    throw new Error(`La version ${backup.version ?? "desconocida"} del respaldo no es compatible.`);
  }

  const keys = ["vehicles", "mileage", "maintenance", "maintenancePlans"];
  keys.forEach((key) => {
    if (!Array.isArray(backup.data[key])) throw new Error(`Falta la lista ${key} en el respaldo.`);
  });

  return {
    vehicles: structuredClone(backup.data.vehicles),
    mileage: structuredClone(backup.data.mileage),
    maintenance: structuredClone(backup.data.maintenance),
    maintenancePlans: structuredClone(backup.data.maintenancePlans),
  };
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
  const selectedType = fields.historyMaintenanceFilter.value;
  const maintenanceItems = data.maintenance
    .filter((item) => item.vehicleId === vehicle.id)
    .filter((item) => !selectedType || item.type === selectedType)
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

function getNextMaintenanceGroup(vehicleId, data, currentMileage) {
  const planItems = data.maintenancePlans.filter((item) => item.vehicleId === vehicleId && Number(item.nextMileage) > 0);
  const scheduledItems = planItems.length > 0
    ? planItems
    : data.maintenance.filter((item) => item.vehicleId === vehicleId && Number(item.nextMileage) > 0);

  if (scheduledItems.length === 0) return [];

  const overdueItems = scheduledItems.filter((item) => Number(item.nextMileage) <= currentMileage);
  if (overdueItems.length > 0) {
    const mostUrgentMileage = Math.min(...overdueItems.map((item) => Number(item.nextMileage)));
    return overdueItems.filter((item) => Number(item.nextMileage) === mostUrgentMileage);
  }

  const nextMileage = Math.min(...scheduledItems.map((item) => Number(item.nextMileage)));
  return scheduledItems.filter((item) => Number(item.nextMileage) === nextMileage);
}

function formatMaintenanceMileage(item) {
  const maintenanceKm = item.mileage ? `${formatNumber(item.mileage)} km realizados` : "Km de mantencion no registrado";
  const nextKm = item.nextMileage ? ` - proxima en ${formatNumber(item.nextMileage)} km` : "";
  return `${maintenanceKm}${nextKm}`;
}

function formatMaintenanceGroupStatus(maintenanceGroup, currentMileage) {
  if (maintenanceGroup.length === 0) {
    return { text: "Sin programar", names: "Sin mantenciones en el plan", className: "is-neutral" };
  }

  const nextMileage = Number(maintenanceGroup[0].nextMileage);
  const remaining = nextMileage - currentMileage;
  const names = maintenanceGroup.map((item) => item.type).join(" · ");

  if (remaining <= 0) {
    const text = remaining === 0
      ? "Corresponde ahora"
      : `Vencida por ${formatNumber(Math.abs(remaining))} km`;
    return { text, names, className: "is-danger" };
  }

  return {
    text: `Faltan ${formatNumber(remaining)} km`,
    names,
    className: remaining <= 1000 ? "is-warning" : "is-ok",
  };
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
  const isPlan = tabName === "plan";

  fields.vehicleSummaryTab.classList.toggle("is-active", isSummary);
  fields.vehicleCreateTab.classList.toggle("is-active", isCreate);
  fields.vehicleHistoryTab.classList.toggle("is-active", isHistory);
  fields.vehicleSummaryPanel.classList.toggle("is-hidden", !isSummary);
  fields.vehicleCreatePanel.classList.toggle("is-hidden", !isCreate);
  fields.vehicleHistoryPanel.classList.toggle("is-hidden", !isHistory);
  fields.vehiclePlanPanel.classList.toggle("is-hidden", !isPlan);
}

function showAuthMessage(message) {
  fields.authMessage.textContent = message;
}

function setTodayDefaults() {
  fields.quickMileageDate.value ||= today();
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
