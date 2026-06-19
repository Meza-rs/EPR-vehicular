import { createClient } from "@supabase/supabase-js";
import { inject } from "@vercel/analytics";

const STORAGE_KEY = "erpVehicularPersonal";
const TESSERACT_CDN_URL = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

inject();

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

let app = structuredClone(emptyApp);
let maintenancePlanDraft = [];
let maintenancePlanDraftType = "";
let activePlanVehicleId = null;
let ocrEnginePromise = null;
let ocrPreviewUrl = "";
let saveQueue = Promise.resolve();
let appMessage = null;
let appMessageTimeout = null;

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
  appMessage: document.querySelector("#appMessage"),
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
  dashboardPhotoButton: document.querySelector("#dashboardPhotoButton"),
  dashboardPhotoInput: document.querySelector("#dashboardPhotoInput"),
  dashboardOcrPanel: document.querySelector("#dashboardOcrPanel"),
  dashboardPhotoPreview: document.querySelector("#dashboardPhotoPreview"),
  ocrStatus: document.querySelector("#ocrStatus"),
  ocrProgressBar: document.querySelector("#ocrProgressBar"),
  ocrCandidates: document.querySelector("#ocrCandidates"),
  ocrMileageValue: document.querySelector("#ocrMileageValue"),
  ocrWarning: document.querySelector("#ocrWarning"),
  confirmOcrMileage: document.querySelector("#confirmOcrMileage"),
  maintenanceVehicle: document.querySelector("#maintenanceVehicle"),
  maintenanceDate: document.querySelector("#maintenanceDate"),
  maintenanceMileage: document.querySelector("#maintenanceMileage"),
  maintenanceCurrentMileage: document.querySelector("#maintenanceCurrentMileage"),
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
  logoutButton: document.querySelector("#logoutButton"),
};

forms.register.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!ensureSupabaseReady()) return;

  const name = fields.registerName.value.trim();
  const email = normalizeEmail(fields.registerEmail.value);
  const password = fields.registerPassword.value;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;

    if (data.session?.user) {
      await upsertProfile(data.user.id, name, email);
    }

    forms.register.reset();
    if (data.session?.user) {
      await loadAuthenticatedUser(data.session.user);
      render();
    } else {
      showAuthMessage("Cuenta creada. Revisa tu correo si Supabase pide confirmar la cuenta antes de entrar.");
    }
  } catch (error) {
    showAuthMessage(`No se pudo crear la cuenta. ${error.message || "Intentalo nuevamente."}`);
  }
});

forms.login.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!ensureSupabaseReady()) return;

  const email = normalizeEmail(fields.loginEmail.value);
  const password = fields.loginPassword.value;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    await loadAuthenticatedUser(data.user);
    forms.login.reset();
    render();
  } catch (error) {
    showAuthMessage(`Correo o password incorrectos. ${error.message || ""}`.trim());
  }
});

forms.account.addEventListener("submit", async (event) => {
  event.preventDefault();
  const user = currentUser();
  if (!user) return;

  const newEmail = normalizeEmail(fields.ownerEmail.value);
  const newName = fields.ownerName.value.trim();
  const emailChanged = newEmail !== user.email;

  try {
    const updatePayload = { data: { name: newName } };
    if (emailChanged) updatePayload.email = newEmail;

    const { error } = await supabase.auth.updateUser(updatePayload);
    if (error) throw error;

    await upsertProfile(user.id, newName, newEmail);
    user.name = newName;
    user.email = newEmail;
    fields.accountSummary.textContent = emailChanged
      ? "Perfil actualizado. Si cambiaste el correo, Supabase puede pedir confirmacion."
      : "Perfil actualizado correctamente.";
    render();
  } catch (error) {
    fields.accountSummary.textContent = `No se pudo actualizar el perfil. ${error.message || ""}`.trim();
  }
});

forms.vehicle.addEventListener("submit", async (event) => {
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
  await saveApp();
  showAppMessage(`Vehiculo ${vehicle.name} creado correctamente.`, "success");
  fields.quickMileageVehicle.value = vehicle.id;
  setMainTab("vehicles");
  setVehicleTab("summary");
  render();
});

forms.quickMileage.addEventListener("submit", async (event) => {
  event.preventDefault();
  const vehicleId = fields.quickMileageVehicle.value;
  await saveMileageRecord(vehicleId, fields.quickMileageDate.value, Number(fields.quickMileageValue.value));
  const vehicle = currentData()?.vehicles.find((item) => item.id === vehicleId);
  forms.quickMileage.reset();
  fields.quickMileageVehicle.value = vehicleId;
  setTodayDefaults();
  showAppMessage(`Kilometraje actualizado${vehicle ? ` para ${vehicle.name}` : ""}.`, "success");
  render();
});

fields.dashboardPhotoButton.addEventListener("click", () => {
  const data = currentData();
  const vehicle = selectedSummaryVehicle(data);
  if (!vehicle) {
    renderOcrMessage("Agrega o selecciona un vehículo antes de tomar la foto.", "warning");
    return;
  }

  fields.dashboardPhotoInput.value = "";
  fields.dashboardPhotoInput.click();
});

fields.dashboardPhotoInput.addEventListener("change", async () => {
  const file = fields.dashboardPhotoInput.files?.[0];
  if (!file) return;
  await handleDashboardPhoto(file);
});

fields.ocrCandidates.addEventListener("click", (event) => {
  const candidateButton = event.target.closest("[data-ocr-candidate]");
  if (!candidateButton) return;
  fields.ocrCandidates.querySelectorAll("[data-ocr-candidate]").forEach((button) => {
    button.classList.toggle("is-selected", button === candidateButton);
  });
  fields.ocrMileageValue.value = candidateButton.dataset.ocrCandidate;
  updateOcrWarning();
});

fields.ocrMileageValue.addEventListener("input", () => {
  updateOcrWarning();
});

fields.confirmOcrMileage.addEventListener("click", async () => {
  await confirmOcrMileage();
});

forms.maintenance.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = currentData();
  if (!data) return;

  const selectedRows = [...fields.maintenancePlanSelection.querySelectorAll("[data-maintenance-plan]")]
    .filter((row) => row.querySelector("[data-performed]").checked);
  if (selectedRows.length === 0) {
    fields.maintenanceBatchMessage.textContent = "Selecciona al menos una mantención realizada.";
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
  setTodayDefaults();
  await saveApp();
  const maintenanceMessage = `${selectedRows.length} mantención${selectedRows.length === 1 ? "" : "es"} registrada${selectedRows.length === 1 ? "" : "s"} correctamente.`;
  fields.maintenanceBatchMessage.textContent = maintenanceMessage;
  showAppMessage(maintenanceMessage, "success");
  fields.quickMileageVehicle.value = vehicleId;
  setMainTab("vehicles");
  setVehicleTab("summary");
  render();
});

fields.logoutButton.addEventListener("click", async () => {
  await supabase?.auth.signOut();
  app.currentUserId = null;
  app.users = [];
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
  resetOcrPanel();
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
  renderMaintenanceCurrentMileageNote();
  renderMaintenancePlanSelection();
});

fields.maintenanceMileage.addEventListener("input", () => {
  renderMaintenanceCurrentMileageNote();
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

fields.vehicleList.addEventListener("click", async (event) => {
  const data = currentData();
  if (!data) return;

  const editButton = event.target.closest("[data-edit-vehicle]");
  if (editButton) {
    await editVehicle(editButton.dataset.editVehicle, data);
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
    `Eliminar ${vehicle?.name || "vehículo"}`,
    `Se perderán permanentemente este vehículo, ${mileageCount} registros de kilometraje, ${maintenanceCount} mantenciones realizadas y ${planCount} tareas de su plan. Esta acción no se puede deshacer.`,
  );
  if (!shouldDelete) return;

  data.vehicles = data.vehicles.filter((vehicle) => vehicle.id !== vehicleId);
  data.mileage = data.mileage.filter((item) => item.vehicleId !== vehicleId);
  data.maintenance = data.maintenance.filter((item) => item.vehicleId !== vehicleId);
  data.maintenancePlans = data.maintenancePlans.filter((item) => item.vehicleId !== vehicleId);
  await saveApp();
  showAppMessage(`${vehicle?.name || "Vehiculo"} eliminado correctamente.`, "success");
  render();
});

fields.backToVehicleSummary.addEventListener("click", () => {
  setVehicleTab("summary");
});

fields.addPlanItem.addEventListener("click", async () => {
  await addPlanItemToVehicle();
});

fields.maintenancePlanEditList.addEventListener("click", async (event) => {
  const deleteButton = event.target.closest("[data-delete-plan-item]");
  if (!deleteButton) return;
  await deletePlanItem(deleteButton.dataset.deletePlanItem);
});

fields.maintenancePlanEditForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await saveMaintenancePlanEdits();
});

// Inicia la app leyendo la sesion actual de Supabase.
async function initApp() {
  if (!ensureSupabaseReady()) {
    render();
    return;
  }

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    if (data.session?.user) {
      await loadAuthenticatedUser(data.session.user);
    }
  } catch (error) {
    showAuthMessage(`No se pudo cargar la sesión. ${error.message || ""}`.trim());
  }

  render();
}

// Comprueba que existan las variables de entorno necesarias para Supabase.
function ensureSupabaseReady() {
  if (supabase) return true;
  showAuthMessage("Falta configurar Supabase. Agrega VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env y en Vercel.");
  return false;
}

// Carga perfil y datos remotos del usuario autenticado.
async function loadAuthenticatedUser(authUser) {
  const profile = await loadProfile(authUser);
  const data = await loadRemoteData(authUser.id);
  app = {
    users: [{
      id: authUser.id,
      name: profile.name,
      email: profile.email,
      data,
      createdAt: authUser.created_at || new Date().toISOString(),
    }],
    currentUserId: authUser.id,
  };
}

// Obtiene o crea el perfil publico asociado al usuario de Supabase Auth.
async function loadProfile(authUser) {
  const fallback = {
    name: authUser.user_metadata?.name || authUser.email?.split("@")[0] || "Usuario",
    email: authUser.email || "",
  };
  const { data, error } = await supabase
    .from("profiles")
    .select("name,email")
    .eq("id", authUser.id)
    .maybeSingle();

  if (error) throw error;
  if (data) return { name: data.name || fallback.name, email: data.email || fallback.email };

  await upsertProfile(authUser.id, fallback.name, fallback.email);
  return fallback;
}

// Guarda el perfil del usuario en Supabase.
async function upsertProfile(userId, name, email) {
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    name,
    email,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

// Lee todas las colecciones del usuario desde Supabase y las convierte al formato de la UI.
async function loadRemoteData(userId) {
  const [
    vehicles,
    mileage,
    maintenancePlans,
    maintenance,
  ] = await Promise.all([
    fetchTable("vehicles", userId),
    fetchTable("mileage_records", userId),
    fetchTable("maintenance_plans", userId),
    fetchTable("maintenance_records", userId),
  ]);

  return {
    vehicles: vehicles.map(mapVehicleFromDb),
    mileage: mileage.map(mapMileageFromDb),
    maintenancePlans: maintenancePlans.map(mapPlanFromDb),
    maintenance: maintenance.map(mapMaintenanceFromDb),
  };
}

// Lee una tabla filtrada por usuario.
async function fetchTable(table, userId) {
  const { data, error } = await supabase.from(table).select("*").eq("user_id", userId);
  if (error) throw error;
  return data || [];
}

// Sincroniza el estado actual completo hacia Supabase.
function saveApp() {
  const user = currentUser();
  if (!user || !supabase) return Promise.resolve();

  saveQueue = saveQueue
    .catch(() => {})
    .then(() => persistCurrentUserData(user))
    .catch((error) => {
      showDataError(error);
    });
  return saveQueue;
}

// Reemplaza las colecciones remotas del usuario por el estado actual de la UI.
async function persistCurrentUserData(user) {
  const data = { ...structuredClone(emptyData), ...(user.data || {}) };
  await upsertProfile(user.id, user.name, user.email);

  await deleteUserRows("maintenance_records", user.id);
  await deleteUserRows("maintenance_plans", user.id);
  await deleteUserRows("mileage_records", user.id);
  await deleteUserRows("vehicles", user.id);

  await insertRows("vehicles", data.vehicles.map((vehicle) => mapVehicleToDb(vehicle, user.id)));
  await insertRows("mileage_records", data.mileage.map((item) => mapMileageToDb(item, user.id)));
  await insertRows("maintenance_plans", data.maintenancePlans.map((plan) => mapPlanToDb(plan, user.id)));
  await insertRows("maintenance_records", data.maintenance.map((item) => mapMaintenanceToDb(item, user.id)));
}

async function deleteUserRows(table, userId) {
  const { error } = await supabase.from(table).delete().eq("user_id", userId);
  if (error) throw error;
}

async function insertRows(table, rows) {
  if (rows.length === 0) return;
  const { error } = await supabase.from(table).insert(rows);
  if (error) throw error;
}

function mapVehicleFromDb(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    plate: row.plate || "",
    odometer: Number(row.odometer || 0),
    createdAt: row.created_at,
  };
}

function mapVehicleToDb(vehicle, userId) {
  return {
    id: vehicle.id,
    user_id: userId,
    name: vehicle.name,
    type: vehicle.type,
    plate: vehicle.plate || null,
    odometer: Number(vehicle.odometer || 0),
    created_at: vehicle.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function mapMileageFromDb(row) {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    date: row.record_date,
    value: Number(row.value || 0),
  };
}

function mapMileageToDb(item, userId) {
  return {
    id: item.id,
    user_id: userId,
    vehicle_id: item.vehicleId,
    record_date: item.date,
    value: Number(item.value || 0),
  };
}

function mapPlanFromDb(row) {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    type: row.type,
    intervalKm: Number(row.interval_km || 0),
    priority: row.priority || "Media",
    nextMileage: Number(row.next_mileage || 0),
    notes: row.notes || "",
  };
}

function mapPlanToDb(plan, userId) {
  return {
    id: plan.id,
    user_id: userId,
    vehicle_id: plan.vehicleId,
    type: plan.type,
    interval_km: Number(plan.intervalKm || 0),
    priority: plan.priority || "Media",
    next_mileage: Number(plan.nextMileage || 0),
    notes: plan.notes || "",
    updated_at: new Date().toISOString(),
  };
}

function mapMaintenanceFromDb(row) {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    date: row.record_date,
    type: row.type,
    mileage: Number(row.mileage || 0),
    nextMileage: Number(row.next_mileage || 0),
    cost: Number(row.cost || 0),
    notes: row.notes || "",
  };
}

function mapMaintenanceToDb(item, userId) {
  return {
    id: item.id,
    user_id: userId,
    vehicle_id: item.vehicleId,
    record_date: item.date,
    type: item.type,
    mileage: Number(item.mileage || 0),
    next_mileage: Number(item.nextMileage || 0),
    cost: Number(item.cost || 0),
    notes: item.notes || "",
  };
}

// Devuelve el usuario que tiene la sesion abierta.
function currentUser() {
  return app.users.find((user) => user.id === app.currentUserId) || null;
}

// Devuelve y completa las colecciones de datos del usuario actual.
function currentData() {
  const user = currentUser();
  if (!user) return null;
  user.data = { ...structuredClone(emptyData), ...(user.data || {}) };
  return user.data;
}

// Redibuja todas las secciones visibles con los datos mas recientes.
function render() {
  const user = currentUser();

  fields.authScreen.classList.toggle("is-hidden", Boolean(user));
  fields.appShell.classList.toggle("is-hidden", !user);

  if (!user) return;
  fields.authMessage.textContent = "";

  setTodayDefaults();
  renderAccount(user);
  renderVehicleOptions();
  renderStats();
  renderMaintenanceAlerts();
  renderVehicles();
  renderPresetPreview();
  renderMaintenanceCurrentMileageNote();
  renderMaintenancePlanSelection();
  renderHistoryFilterOptions();
  renderHistory();
  renderAppMessage();
}

// Muestra los datos del perfil y el nombre de la sesion activa.
function renderAccount(user) {
  fields.ownerName.value = user.name;
  fields.ownerEmail.value = user.email;
  fields.sessionSummary.textContent = `Sesion activa: ${user.name}`;
  fields.accountSummary.textContent = `Perfil activo: ${user.name} (${user.email})`;
}

// Actualiza todos los desplegables que permiten seleccionar un vehiculo.
function renderVehicleOptions() {
  const data = currentData();
  const selectedQuickVehicle = fields.quickMileageVehicle.value;
  const selectedMaintenanceVehicle = fields.maintenanceVehicle.value;
  const selectedHistoryVehicle = fields.historyVehicle.value;
  const options = data.vehicles
    .map((vehicle) => `<option value="${vehicle.id}">${escapeHtml(vehicle.name)}</option>`)
    .join("");
  const placeholder = '<option value="" disabled selected>Agrega un vehículo primero</option>';

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

// Construye el plan sugerido editable al crear un vehiculo nuevo.
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
    fields.maintenancePresetPreview.innerHTML = '<p class="muted">No hay mantenciones seleccionadas. Puedes agregar una mantención personalizada abajo.</p>';
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
          <input data-plan-selected type="checkbox" ${item.selected ? "checked" : ""} aria-label="Incluir mantención" />
          <input data-plan-name type="text" value="${escapeHtml(item.type)}" aria-label="Nombre de mantención" />
          <label class="interval-input">
            <input data-plan-interval type="number" min="100" step="100" value="${item.intervalKm}" aria-label="Periodicidad en kilómetros" />
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

// Sincroniza la casilla Seleccionar todas del editor inicial del plan.
function updateSelectAllState() {
  const selectedCount = maintenancePlanDraft.filter((item) => item.selected).length;
  fields.selectAllMaintenance.checked = maintenancePlanDraft.length > 0 && selectedCount === maintenancePlanDraft.length;
  fields.selectAllMaintenance.indeterminate = selectedCount > 0 && selectedCount < maintenancePlanDraft.length;
}

// Agrega una mantencion personalizada al borrador del nuevo vehiculo.
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

// Muestra las tareas del plan ordenadas por vencimiento y prioridad.
function renderMaintenancePlanSelection() {
  const data = currentData();
  if (!data) return;

  const vehicleId = fields.maintenanceVehicle.value;
  const vehicle = data.vehicles.find((item) => item.id === vehicleId);
  if (!vehicle) {
    fields.maintenanceCurrentMileage.textContent = "";
    fields.maintenancePlanSelection.innerHTML = '<div class="empty">Selecciona un vehículo con plan de mantención.</div>';
    return;
  }

  if (!fields.maintenanceMileage.value) {
    fields.maintenanceMileage.value = getCurrentMileage(vehicle, data);
  }
  renderMaintenanceCurrentMileageNote();
  const currentMileage = getCurrentMileage(vehicle, data);
  const performedMileage = Number(fields.maintenanceMileage.value) || currentMileage;
  const plans = data.maintenancePlans
    .filter((plan) => plan.vehicleId === vehicleId)
    .map((plan) => ({ ...plan, remaining: plan.nextMileage - currentMileage }))
    .sort((a, b) => a.remaining - b.remaining || priorityRank(a.priority) - priorityRank(b.priority));

  if (plans.length === 0) {
    fields.maintenancePlanSelection.innerHTML = '<div class="empty">Este vehículo no tiene mantenciones en su plan.</div>';
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
          <small>Próxima programada: ${formatNumber(plan.nextMileage)} km</small>
          ${plan.notes ? `<small class="plan-task-notes">${escapeHtml(plan.notes)}</small>` : ""}
        </span>
        <span class="priority priority-${plan.priority.toLowerCase()}">${plan.priority}</span>
        <span class="maintenance-schedule">
          <strong class="remaining-km">${status.text}</strong>
          <label>
            Próxima en km
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

// Muestra el kilometraje actual del vehiculo seleccionado en el formulario de mantenciones.
function renderMaintenanceCurrentMileageNote() {
  const data = currentData();
  const vehicle = data?.vehicles.find((item) => item.id === fields.maintenanceVehicle.value);
  if (!fields.maintenanceCurrentMileage) return;

  if (!vehicle) {
    fields.maintenanceCurrentMileage.textContent = "";
    return;
  }

  const currentMileage = getCurrentMileage(vehicle, data);
  const enteredMileage = Number(fields.maintenanceMileage.value || 0);
  const suffix = enteredMileage && enteredMileage !== currentMileage
    ? ` Km ingresado: ${formatNumber(enteredMileage)} km.`
    : "";
  fields.maintenanceCurrentMileage.textContent = `Kilometraje actual de ${vehicle.name}: ${formatNumber(currentMileage)} km.${suffix}`;
}

// Recalcula los proximos kilometrajes sugeridos al cambiar el km realizado.
function updateSuggestedNextMileages() {
  const performedMileage = Number(fields.maintenanceMileage.value || 0);
  if (performedMileage <= 0) return;

  fields.maintenancePlanSelection.querySelectorAll("[data-next-mileage]").forEach((input) => {
    input.value = performedMileage + Number(input.dataset.intervalKm || 0);
  });
}

// Traduce una diferencia de kilometraje a un estado legible y visual.
function formatPlanRemaining(remaining) {
  if (remaining < 0) return { text: `Vencida por ${formatNumber(Math.abs(remaining))} km`, className: "is-overdue" };
  if (remaining === 0) return { text: "Corresponde ahora", className: "is-due" };
  if (remaining <= 1000) return { text: `Faltan ${formatNumber(remaining)} km`, className: "is-near" };
  return { text: `Faltan ${formatNumber(remaining)} km`, className: "is-planned" };
}

// Mantiene sincronizada la casilla para seleccionar todos los trabajos.
function updatePerformedSelectAllState() {
  const checkboxes = [...fields.maintenancePlanSelection.querySelectorAll("[data-performed]")];
  const selectedCount = checkboxes.filter((checkbox) => checkbox.checked).length;
  fields.selectAllPerformedMaintenance.checked = checkboxes.length > 0 && selectedCount === checkboxes.length;
  fields.selectAllPerformedMaintenance.indeterminate = selectedCount > 0 && selectedCount < checkboxes.length;
}

// Crea el filtro de tipos usando las mantenciones del vehiculo elegido.
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

// Conserva la seleccion de un desplegable despues de volver a renderizar.
function keepSelectedVehicle(select, previousValue, data) {
  if (previousValue && data.vehicles.some((vehicle) => vehicle.id === previousValue)) {
    select.value = previousValue;
    return;
  }

  if (data.vehicles.length > 0) {
    select.value = data.vehicles[0].id;
  }
}

// Obtiene el vehiculo seleccionado para el panel principal.
function selectedSummaryVehicle(data) {
  const selectedVehicleId = fields.quickMileageVehicle.value;
  return data.vehicles.find((vehicle) => vehicle.id === selectedVehicleId) || data.vehicles[0] || null;
}

// Calcula kilometraje, cantidad de trabajos y gasto del vehiculo activo.
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

// Muestra la mantencion vencida o proxima mas urgente del vehiculo.
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

// Renderiza la tarjeta resumen del vehiculo seleccionado.
function renderVehicles() {
  const data = currentData();
  if (data.vehicles.length === 0) {
    fields.vehicleList.innerHTML = '<div class="empty">Agrega tu primer vehículo para comenzar el control.</div>';
    return;
  }

  const vehicle = selectedSummaryVehicle(data);
  fields.vehicleList.innerHTML = vehicle
    ? renderVehicleCard(vehicle, data)
    : '<div class="empty">Selecciona un vehículo para ver su resumen.</div>';
}

// Genera el contenido de una tarjeta con resumen, historial y plan.
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
        <div class="mini-box"><span>Última mantención</span><strong>${lastMaintenance ? formatDate(lastMaintenance.date) : "Pendiente"}</strong></div>
        <div class="mini-box maintenance-summary-box">
          <span>Próxima mantención</span>
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

// Genera una fila compacta para una tarea del plan de mantencion.
function renderMaintenancePlan(plan) {
  return `
    <div class="plan-item">
      <div>
        <strong>${escapeHtml(plan.type)}</strong>
        <small>Cada ${formatNumber(plan.intervalKm)} km</small>
        ${plan.notes ? `<small>${escapeHtml(plan.notes)}</small>` : ""}
      </div>
      <span class="priority priority-${plan.priority.toLowerCase()}">${plan.priority}</span>
      <small>Próxima: ${formatNumber(plan.nextMileage)} km</small>
    </div>
  `;
}

// Abre el editor del plan para el vehiculo indicado.
function openMaintenancePlanEditor(vehicleId) {
  activePlanVehicleId = vehicleId;
  setVehicleTab("plan");
  renderMaintenancePlanEditor();
}

// Dibuja los campos editables de todas las tareas del plan actual.
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
          Notas de esta mantención
          <textarea data-edit-plan-notes rows="2" placeholder="Aceite, filtro, repuesto o especificacion recomendada...">${escapeHtml(plan.notes || "")}</textarea>
        </label>
        <small>Próxima programada: ${formatNumber(plan.nextMileage)} km</small>
      </article>
    `).join("")
    : '<div class="empty">Este vehículo no tiene mantenciones en su plan.</div>';
}

// Crea una tarea nueva dentro del plan del vehiculo seleccionado.
async function addPlanItemToVehicle() {
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
  await saveApp();
  showAppMessage(`Mantencion ${type} agregada al plan.`, "success");
  renderMaintenancePlanEditor();
}

// Elimina una tarea del plan despues de pedir confirmacion al usuario.
async function deletePlanItem(planId) {
  const data = currentData();
  if (!data) return;
  const plan = data.maintenancePlans.find((item) => item.id === planId);
  const shouldDelete = confirmDeletion(
    `Eliminar ${plan?.type || "mantención"} del plan`,
    "Esta tarea dejará de aparecer en los avisos y en la lista de mantenciones por realizar. Los trabajos ya registrados en el historial se conservarán. Esta acción no se puede deshacer.",
  );
  if (!shouldDelete) return;

  data.maintenancePlans = data.maintenancePlans.filter((item) => item.id !== planId);
  await saveApp();
  showAppMessage(`${plan?.type || "Mantencion"} eliminada del plan.`, "success");
  renderMaintenancePlanEditor();
}

// Guarda cambios de nombre, intervalo, prioridad y notas del plan.
async function saveMaintenancePlanEdits() {
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

  await saveApp();
  fields.planEditMessage.textContent = "Plan actualizado correctamente.";
  showAppMessage("Plan de mantención actualizado correctamente.", "success");
  renderMaintenancePlanEditor();
  renderMaintenancePlanSelection();
  renderVehicles();
}

// Permite modificar los datos basicos de un vehiculo existente.
async function editVehicle(vehicleId, data) {
  const vehicle = data.vehicles.find((item) => item.id === vehicleId);
  if (!vehicle) return;

  const name = prompt("Nombre del vehículo", vehicle.name);
  if (name === null) return;

  const type = prompt("Tipo de vehículo: Auto, Moto, Camioneta u Otro", vehicle.type);
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

  await saveApp();
  showAppMessage(`Vehiculo ${vehicle.name} actualizado correctamente.`, "success");
  render();
}

// Genera una fila del historial para una mantencion realizada.
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

// Devuelve las recomendaciones base segun el tipo de vehiculo.
function presetsForVehicleType(vehicleType) {
  if (vehicleType === "Camioneta") return MAINTENANCE_PRESETS.Auto;
  return MAINTENANCE_PRESETS[vehicleType] || [];
}

// Convierte el borrador seleccionado en tareas permanentes del vehiculo.
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

// Copia al borrador los valores actualmente escritos en el formulario.
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

// Asigna un orden numerico para ordenar prioridades de mayor a menor.
function priorityRank(priority) {
  return { Alta: 1, Media: 2, Baja: 3 }[priority] || 4;
}

// Muestra una advertencia comun antes de cualquier eliminacion permanente.
function confirmDeletion(title, detail) {
  return window.confirm(`${title}\n\n${detail}\n\n¿Estas seguro de que deseas continuar?`);
}

// Carga Tesseract.js solo cuando se necesita reconocer una imagen.
function loadOcrEngine() {
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  if (ocrEnginePromise) return ocrEnginePromise;

  ocrEnginePromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TESSERACT_CDN_URL;
    script.async = true;
    script.onload = () => {
      if (window.Tesseract) {
        resolve(window.Tesseract);
        return;
      }
      reject(new Error("No se pudo iniciar el motor OCR."));
    };
    script.onerror = () => reject(new Error("No se pudo cargar Tesseract.js. Revisa tu conexion a internet."));
    document.head.appendChild(script);
  });

  return ocrEnginePromise;
}

// Procesa la foto del tablero y muestra candidatos para confirmar.
async function handleDashboardPhoto(file) {
  const data = currentData();
  const vehicle = selectedSummaryVehicle(data);
  if (!vehicle) {
    renderOcrMessage("Selecciona un vehículo antes de procesar la foto.", "warning");
    return;
  }

  if (ocrPreviewUrl) URL.revokeObjectURL(ocrPreviewUrl);
  ocrPreviewUrl = URL.createObjectURL(file);
  fields.dashboardPhotoPreview.src = ocrPreviewUrl;
  fields.dashboardOcrPanel.classList.remove("is-hidden");
  fields.ocrCandidates.innerHTML = "";
  fields.ocrMileageValue.value = "";
  fields.ocrWarning.textContent = "";
  setOcrProgress(0);
  renderOcrMessage("Cargando OCR local...", "info");

  try {
    const text = await recognizeMileageFromImage(file);
    const currentMileage = getCurrentMileage(vehicle, data);
    const candidates = extractMileageCandidates(text, currentMileage);
    renderOcrResult(candidates, ocrPreviewUrl);
  } catch (error) {
    fields.ocrMileageValue.value = "";
    fields.ocrCandidates.innerHTML = "";
    setOcrProgress(0);
    renderOcrMessage(`${error.message || "No se pudo reconocer la imagen."} Puedes escribir el kilometraje manualmente.`, "warning");
  }
}

// Ejecuta el OCR restringiendo el reconocimiento a caracteres numericos.
async function recognizeMileageFromImage(file) {
  const Tesseract = await loadOcrEngine();
  renderOcrMessage("Reconociendo numeros en la foto...", "info");

  const result = await Tesseract.recognize(file, "eng", {
    tessedit_char_whitelist: "0123456789., ",
    logger: (message) => {
      if (message.status === "recognizing text" && typeof message.progress === "number") {
        setOcrProgress(message.progress);
      }
    },
  });

  setOcrProgress(1);
  return result?.data?.text || "";
}

// Extrae, limpia y ordena posibles kilometrajes desde el texto OCR.
function extractMileageCandidates(text, currentMileage) {
  const matches = [...String(text).matchAll(/(?:^|[^\d])(\d{1,3}(?:[.,\s]\d{3})+|\d{3,8})(?=$|[^\d])/g)]
    .map((match) => match[1]);
  const uniqueCandidates = [...new Set(matches.map(normalizeMileageCandidate).filter(Boolean))]
    .filter((value) => value >= 100)
    .sort((a, b) => {
      const aIsForward = a >= currentMileage ? 0 : 1;
      const bIsForward = b >= currentMileage ? 0 : 1;
      if (aIsForward !== bIsForward) return aIsForward - bIsForward;
      return Math.abs(a - currentMileage) - Math.abs(b - currentMileage);
    });

  return uniqueCandidates.slice(0, 6);
}

// Convierte valores como 55.100, 55,100 o 55 100 a 55100.
function normalizeMileageCandidate(value) {
  const digits = String(value).replace(/\D/g, "");
  if (digits.length < 3 || digits.length > 8) return null;
  const number = Number(digits);
  return Number.isFinite(number) ? number : null;
}

// Dibuja los candidatos detectados y deja uno listo para confirmar.
function renderOcrResult(candidates) {
  if (candidates.length === 0) {
    fields.ocrCandidates.innerHTML = "";
    fields.ocrMileageValue.value = "";
    renderOcrMessage("No encontre un kilometraje claro. Escribe el valor manualmente o prueba con otra foto.", "warning");
    return;
  }

  fields.ocrCandidates.innerHTML = `
    <p>Candidatos detectados</p>
    <div>
      ${candidates.map((candidate, index) => `
        <button class="ghost-button ${index === 0 ? "is-selected" : ""}" data-ocr-candidate="${candidate}" type="button">
          ${formatNumber(candidate)} km
        </button>
      `).join("")}
    </div>
  `;
  fields.ocrMileageValue.value = candidates[0];
  renderOcrMessage("Revisa el kilometraje detectado antes de confirmarlo.", "success");
  updateOcrWarning();
}

// Guarda el kilometraje reconocido despues de la revision del usuario.
async function confirmOcrMileage() {
  const data = currentData();
  const vehicle = selectedSummaryVehicle(data);
  const mileage = Number(fields.ocrMileageValue.value);
  if (!vehicle || !Number.isFinite(mileage) || mileage <= 0) {
    renderOcrMessage("Ingresa un kilometraje valido antes de confirmar.", "warning");
    return;
  }

  const currentMileage = getCurrentMileage(vehicle, data);
  if (mileage < currentMileage) {
    const shouldContinue = window.confirm(
      `El kilometraje detectado (${formatNumber(mileage)} km) es menor al kilometraje actual (${formatNumber(currentMileage)} km).\n\n¿Quieres guardarlo de todas formas?`,
    );
    if (!shouldContinue) return;
  }

  await saveMileageRecord(vehicle.id, fields.quickMileageDate.value || today(), mileage);
  fields.quickMileageValue.value = mileage;
  showAppMessage(`Kilometraje ${formatNumber(mileage)} km guardado correctamente.`, "success");
  renderOcrMessage(`Kilometraje ${formatNumber(mileage)} km guardado correctamente.`, "success");
  renderVehicleOptions();
  renderStats();
  renderMaintenanceAlerts();
  renderVehicles();
  renderHistory();
}

// Actualiza la barra de progreso del OCR.
function setOcrProgress(progress) {
  const safeProgress = Math.max(0, Math.min(1, Number(progress) || 0));
  fields.ocrProgressBar.style.width = `${Math.round(safeProgress * 100)}%`;
}

// Muestra mensajes del flujo OCR con un estado visual simple.
function renderOcrMessage(message, status = "info") {
  fields.dashboardOcrPanel.classList.remove("is-hidden");
  fields.ocrStatus.textContent = message;
  fields.ocrStatus.dataset.status = status;
}

// Limpia el panel OCR cuando cambia el vehiculo seleccionado.
function resetOcrPanel() {
  fields.dashboardOcrPanel.classList.add("is-hidden");
  fields.ocrCandidates.innerHTML = "";
  fields.ocrMileageValue.value = "";
  fields.ocrWarning.textContent = "";
  setOcrProgress(0);
  if (ocrPreviewUrl) {
    URL.revokeObjectURL(ocrPreviewUrl);
    ocrPreviewUrl = "";
  }
  fields.dashboardPhotoPreview.removeAttribute("src");
}

// Advierte cuando el kilometraje a confirmar retrocede respecto del actual.
function updateOcrWarning() {
  const data = currentData();
  const vehicle = selectedSummaryVehicle(data);
  const mileage = Number(fields.ocrMileageValue.value);
  if (!vehicle || !Number.isFinite(mileage) || mileage <= 0) {
    fields.ocrWarning.textContent = "";
    return;
  }

  const currentMileage = getCurrentMileage(vehicle, data);
  fields.ocrWarning.textContent = mileage < currentMileage
    ? `Atencion: este valor es menor al kilometraje actual (${formatNumber(currentMileage)} km).`
    : "";
}

// Registra un kilometraje y actualiza el odometro del vehiculo.
async function saveMileageRecord(vehicleId, date, value) {
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

  await saveApp();
}

// Muestra el historial completo del vehiculo y aplica el filtro elegido.
function renderHistory() {
  const data = currentData();
  if (!data || data.vehicles.length === 0) {
    fields.historyList.innerHTML = '<div class="empty">Agrega un vehículo para revisar su historial.</div>';
    return;
  }

  if (!fields.historyVehicle.value) {
    fields.historyVehicle.value = data.vehicles[0].id;
  }

  const vehicle = data.vehicles.find((item) => item.id === fields.historyVehicle.value);
  if (!vehicle) {
    fields.historyList.innerHTML = '<div class="empty">Selecciona un vehículo.</div>';
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

// Genera una fila visual para un registro de kilometraje.
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

// Obtiene el mayor kilometraje conocido entre el vehiculo y sus registros.
function getCurrentMileage(vehicle, data) {
  const mileageItems = data.mileage.filter((item) => item.vehicleId === vehicle.id);
  const highestMileage = mileageItems.reduce((highest, item) => Math.max(highest, Number(item.value || 0)), 0);
  return Math.max(Number(vehicle.odometer || 0), highestMileage);
}

// Busca las tareas vencidas mas urgentes o el siguiente grupo coincidente.
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

// Resume los kilometrajes realizado y proximo de una mantencion historica.
function formatMaintenanceMileage(item) {
  const maintenanceKm = item.mileage ? `${formatNumber(item.mileage)} km realizados` : "Km de mantención no registrado";
  const nextKm = item.nextMileage ? ` - próxima en ${formatNumber(item.nextMileage)} km` : "";
  return `${maintenanceKm}${nextKm}`;
}

// Crea el texto y estilo del aviso para un grupo de mantenciones.
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

// Cambia entre las secciones principales Perfil, Vehiculos y Mantenciones.
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

// Cambia entre las vistas internas de la seccion Vehiculos.
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

// Presenta errores o avisos en la pantalla de acceso.
function showAuthMessage(message) {
  fields.authMessage.textContent = message;
}

// Muestra un aviso temporal para operaciones realizadas dentro de la app.
function showAppMessage(message, status = "success") {
  appMessage = { message, status };
  renderAppMessage();

  if (appMessageTimeout) clearTimeout(appMessageTimeout);
  appMessageTimeout = window.setTimeout(() => {
    appMessage = null;
    renderAppMessage();
  }, 4500);
}

// Redibuja el aviso general sin interrumpir el flujo de trabajo.
function renderAppMessage() {
  if (!fields.appMessage) return;
  fields.appMessage.textContent = appMessage?.message || "";
  fields.appMessage.dataset.status = appMessage?.status || "";
  fields.appMessage.classList.toggle("is-visible", Boolean(appMessage));
}

// Muestra problemas de sincronizacion con Supabase sin ocultarlos en consola.
function showDataError(error) {
  const message = error?.message || "No se pudo sincronizar con Supabase.";
  console.error(error);
  showAppMessage(`No se pudo guardar en la base de datos. ${message}`, "warning");
  window.alert(`No se pudo guardar en la base de datos. ${message}`);
}

// Completa con la fecha actual los campos de fecha que esten vacios.
function setTodayDefaults() {
  fields.quickMileageDate.value ||= today();
  fields.maintenanceDate.value ||= today();
}

// Devuelve la fecha actual en el formato YYYY-MM-DD de los inputs HTML.
function today() {
  return new Date().toISOString().slice(0, 10);
}

// Limpia y normaliza correos para compararlos sin diferencias de mayusculas.
function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

// Genera una huella de la password para no guardarla como texto visible.
async function hashPassword(password) {
  if (!crypto.subtle) return simpleHash(password);

  const bytes = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

// Proporciona una huella local basica cuando Web Crypto no esta disponible.
function simpleHash(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return `local-${Math.abs(hash)}`;
}

// Formatea montos como pesos chilenos.
function formatCurrency(value) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

// Formatea numeros usando separadores locales de Chile.
function formatNumber(value) {
  return new Intl.NumberFormat("es-CL").format(value);
}

// Convierte una fecha almacenada al formato visible chileno.
function formatDate(value) {
  return new Intl.DateTimeFormat("es-CL").format(new Date(`${value}T00:00:00`));
}

// Escapa texto ingresado por usuarios antes de insertarlo en HTML.
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

initApp();
