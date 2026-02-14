import { App } from "@modelcontextprotocol/ext-apps";

// Initialize the MCP App
const app = new App({
  name: "Hospi-Copilot Widget",
  version: "1.0.0",
});

// Type definitions
type Language = 'en' | 'nl' | 'fr';

type Hospital = {
  id: string;
  name: string;
  city: string;
};

type HospState = {
  step:
    | "start"
    | "select_member"
    | "select_hospital"
    | "admission_details"
    | "room_type"
    | "review"
    | "submitted";
  language?: Language;
  state: {
    memberId?: string;
    memberName?: string;
    hospitalId?: string;
    hospitalName?: string;
    hospitalCity?: string;
    abroad?: boolean;
    admissionDate?: string;
    defaultAdmissionDate?: string;
    minAdmissionDate?: string;
    maxAdmissionDate?: string;
    reason?: string;
    accident?: boolean;
    roomType?: string;
    notes?: string;
    declarationId?: string;
    insuranceData?: any;
  };
  hospitalList?: Hospital[];
};

// UI Translations
const TRANSLATIONS = {
  en: {
    header: {
      title: "Hospitalisation & Care Journey",
      subtitle: "Conversational admission declaration for your insurance",
    },
    steps: {
      step1: "Step 1: Who is being admitted?",
      step2: "Step 2: Hospital Selection",
      step3: "Step 3: Admission Details",
      step4: "Step 4: Room Type",
      step5: "Overview: Hospitalization (Demo)",
    },
    fields: {
      patientName: "Patient Name",
      patientNamePlaceholder: "E.g., yourself or child",
      selectHospital: "Select Hospital",
      selectFromNetwork: "-- Select from our network --",
      other: "Other (specify below)",
      hospitalName: "Hospital Name",
      hospitalNamePlaceholder: "E.g., Custom Hospital",
      city: "City / Municipality",
      cityPlaceholder: "City or municipality",
      hospitalLocation: "Hospital Location",
      belgium: "Belgium",
      abroad: "Abroad",
      admissionDate: "Admission Date",
      admissionDateHint: "Select a date between today and one year from now",
      reason: "Reason for Admission",
      reasonPlaceholder: "E.g., knee surgery, childbirth",
      accident: "Is this the result of an accident?",
      no: "No",
      yes: "Yes",
      roomType: "Room Type",
      multiRoom: "Multi-person room",
      singleRoom: "Single room",
      dayAdmission: "Day admission",
    },
    buttons: {
      next: "Next",
      back: "← Back",
      review: "Review",
      submit: "Submit Declaration",
    },
    review: {
      declarationId: "Declaration ID",
      patientInfo: "Patient Information",
      patient: "Patient",
      memberNumber: "Member Number",
      policyType: "Policy Type",
      validUntil: "Valid Until",
      admissionDetails: "Admission Details",
      hospital: "Hospital",
      admissionDate: "Admission Date",
      reason: "Reason",
      accident: "Accident",
      roomType: "Room Type",
      thirdPartyPayment: "Third-Party Payment",
      thirdPartyPaymentTooltip: "Direct billing arrangement where your insurer pays the hospital directly for covered services",
      coverage: "Coverage",
      coveredItems: "Covered Items:",
      estimatedCoPay: "Estimated Co-Pay:",
      priorAuthRequired: "Prior authorization required",
      priorAuthMessage: "for this type of admission. Please contact your insurer before the admission date.",
      importantNotes: "Important Notes",
      noOrUnknown: "No or unknown",
    },
    stepProgress: "Step {current} of {total}",
    validationErrors: {
      nameRequired: "Please enter the patient's name",
      hospitalRequired: "Please select a hospital or enter a custom hospital name",
      cityRequired: "Please enter the hospital city",
      dateRequired: "Please select an admission date",
      reasonRequired: "Please enter the reason for admission",
    },
  },
  nl: {
    header: {
      title: "Ziekenhuisopname & Zorgtraject",
      subtitle: "Conversationele opname-aangifte voor uw verzekering",
    },
    steps: {
      step1: "Stap 1: Wie wordt opgenomen?",
      step2: "Stap 2: Ziekenhuis Selectie",
      step3: "Stap 3: Opname Gegevens",
      step4: "Stap 4: Kamertype",
      step5: "Overzicht: Ziekenhuisopname (Demo)",
    },
    fields: {
      patientName: "Naam Patiënt",
      patientNamePlaceholder: "Bijv., uzelf of kind",
      selectHospital: "Selecteer Ziekenhuis",
      selectFromNetwork: "-- Selecteer uit ons netwerk --",
      other: "Andere (specificeer hieronder)",
      hospitalName: "Ziekenhuis Naam",
      hospitalNamePlaceholder: "Bijv., Aangepast Ziekenhuis",
      city: "Stad / Gemeente",
      cityPlaceholder: "Stad of gemeente",
      hospitalLocation: "Ziekenhuis Locatie",
      belgium: "België",
      abroad: "Buitenland",
      admissionDate: "Opnamedatum",
      admissionDateHint: "Selecteer een datum tussen vandaag en één jaar vanaf nu",
      reason: "Reden voor Opname",
      reasonPlaceholder: "Bijv., knieoperatie, bevalling",
      accident: "Is dit het gevolg van een ongeval?",
      no: "Nee",
      yes: "Ja",
      roomType: "Kamertype",
      multiRoom: "Meerpersoonskamer",
      singleRoom: "Eenpersoonskamer",
      dayAdmission: "Dagopname",
    },
    buttons: {
      next: "Volgende",
      back: "← Terug",
      review: "Controleren",
      submit: "Aangifte Indienen",
    },
    review: {
      declarationId: "Aangiftenummer",
      patientInfo: "Patiënt Informatie",
      patient: "Patiënt",
      memberNumber: "Lidnummer",
      policyType: "Polistype",
      validUntil: "Geldig Tot",
      admissionDetails: "Opname Gegevens",
      hospital: "Ziekenhuis",
      admissionDate: "Opnamedatum",
      reason: "Reden",
      accident: "Ongeval",
      roomType: "Kamertype",
      thirdPartyPayment: "Derdebetalersregeling",
      thirdPartyPaymentTooltip: "Directe factureringsregeling waarbij uw verzekeraar het ziekenhuis rechtstreeks betaalt voor gedekte diensten",
      coverage: "Dekking",
      coveredItems: "Gedekte Zaken:",
      estimatedCoPay: "Geschat Eigen Risico:",
      priorAuthRequired: "Voorafgaande toestemming vereist",
      priorAuthMessage: "voor dit type opname. Neem contact op met uw verzekeraar voor de opnamedatum.",
      importantNotes: "Belangrijke Opmerkingen",
      noOrUnknown: "Nee of onbekend",
    },
    stepProgress: "Stap {current} van {total}",
    validationErrors: {
      nameRequired: "Voer de naam van de patiënt in",
      hospitalRequired: "Selecteer een ziekenhuis of voer een aangepaste ziekenhuisnaam in",
      cityRequired: "Voer de stad van het ziekenhuis in",
      dateRequired: "Selecteer een opnamedatum",
      reasonRequired: "Voer de reden voor opname in",
    },
  },
  fr: {
    header: {
      title: "Parcours d'Hospitalisation & Soins",
      subtitle: "Déclaration d'admission conversationnelle pour votre assurance",
    },
    steps: {
      step1: "Étape 1 : Qui est admis ?",
      step2: "Étape 2 : Sélection de l'Hôpital",
      step3: "Étape 3 : Détails de l'Admission",
      step4: "Étape 4 : Type de Chambre",
      step5: "Aperçu : Hospitalisation (Démo)",
    },
    fields: {
      patientName: "Nom du Patient",
      patientNamePlaceholder: "Par ex., vous-même ou enfant",
      selectHospital: "Sélectionner l'Hôpital",
      selectFromNetwork: "-- Sélectionner dans notre réseau --",
      other: "Autre (spécifier ci-dessous)",
      hospitalName: "Nom de l'Hôpital",
      hospitalNamePlaceholder: "Par ex., Hôpital Personnalisé",
      city: "Ville / Commune",
      cityPlaceholder: "Ville ou commune",
      hospitalLocation: "Localisation de l'Hôpital",
      belgium: "Belgique",
      abroad: "Étranger",
      admissionDate: "Date d'Admission",
      admissionDateHint: "Sélectionnez une date entre aujourd'hui et un an à partir de maintenant",
      reason: "Motif de l'Admission",
      reasonPlaceholder: "Par ex., chirurgie du genou, accouchement",
      accident: "Est-ce le résultat d'un accident ?",
      no: "Non",
      yes: "Oui",
      roomType: "Type de Chambre",
      multiRoom: "Chambre multi-personnes",
      singleRoom: "Chambre individuelle",
      dayAdmission: "Admission de jour",
    },
    buttons: {
      next: "Suivant",
      back: "← Retour",
      review: "Réviser",
      submit: "Soumettre la Déclaration",
    },
    review: {
      declarationId: "ID de Déclaration",
      patientInfo: "Informations sur le Patient",
      patient: "Patient",
      memberNumber: "Numéro de Membre",
      policyType: "Type de Police",
      validUntil: "Valide Jusqu'au",
      admissionDetails: "Détails de l'Admission",
      hospital: "Hôpital",
      admissionDate: "Date d'Admission",
      reason: "Motif",
      accident: "Accident",
      roomType: "Type de Chambre",
      thirdPartyPayment: "Tiers Payant",
      thirdPartyPaymentTooltip: "Arrangement de facturation directe où votre assureur paie l'hôpital directement pour les services couverts",
      coverage: "Couverture",
      coveredItems: "Éléments Couverts :",
      estimatedCoPay: "Quote-part Estimée :",
      priorAuthRequired: "Autorisation préalable requise",
      priorAuthMessage: "pour ce type d'admission. Veuillez contacter votre assureur avant la date d'admission.",
      importantNotes: "Notes Importantes",
      noOrUnknown: "Non ou inconnu",
    },
    stepProgress: "Étape {current} sur {total}",
    validationErrors: {
      nameRequired: "Veuillez entrer le nom du patient",
      hospitalRequired: "Veuillez sélectionner un hôpital ou entrer un nom d'hôpital personnalisé",
      cityRequired: "Veuillez entrer la ville de l'hôpital",
      dateRequired: "Veuillez sélectionner une date d'admission",
      reasonRequired: "Veuillez entrer le motif de l'admission",
    },
  },
};

// Handle tool results from server
app.ontoolresult = (result: any) => {
  console.error("📥 Tool result received:", result);
  const data = result.structuredContent as HospState;
  renderStep(data);
};

// Helper to get translations
function getT(language: Language = 'en') {
  return TRANSLATIONS[language] || TRANSLATIONS.en;
}

// Helper to call the journey tool
async function callJourney(
  update: Partial<HospState["state"]>,
  step: HospState["step"],
  goBack: boolean = false,
  language: Language = 'en'
) {
  try {
    console.error(`🔧 Calling hospital_journey: step=${step}`, update);
    const result = await app.callServerTool({
      name: "hospital_journey",
      arguments: {
        step,
        language,
        state: update,
        goBack,
      },
    });
    console.error(`📥 Tool result:`, result);
    const data = result.structuredContent as HospState;
    renderStep(data);
  } catch (error) {
    console.error(`❌ Error calling hospital_journey:`, error);
  }
}

// Get step number for progress indicator
function getStepNumber(step: HospState["step"]): { current: number; total: number } {
  const stepMap: Record<HospState["step"], number> = {
    start: 0,
    select_member: 1,
    select_hospital: 2,
    admission_details: 3,
    room_type: 4,
    review: 5,
    submitted: 5,
  };
  return { current: stepMap[step], total: 5 };
}

// Render progress indicator
function renderProgressBar(step: HospState["step"], language: Language = 'en'): string {
  const { current, total } = getStepNumber(step);
  if (current === 0 || step === "submitted") return "";

  const t = getT(language);
  const percentage = (current / total) * 100;
  const progressText = t.stepProgress.replace('{current}', current.toString()).replace('{total}', total.toString());

  return `
    <div class="hospi-progress">
      <div class="hospi-progress-text">${progressText}</div>
      <div class="hospi-progress-bar">
        <div class="hospi-progress-fill" style="width: ${percentage}%"></div>
      </div>
    </div>
  `;
}

// Validation function
function validateStep(step: HospState["step"], state: HospState["state"], language: Language = 'en'): string | null {
  const t = getT(language);
  switch (step) {
    case "select_member":
      if (!state.memberName?.trim()) {
        return t.validationErrors.nameRequired;
      }
      break;
    case "select_hospital":
      if (!state.hospitalName?.trim()) {
        return t.validationErrors.hospitalRequired;
      }
      if (!state.hospitalCity?.trim()) {
        return t.validationErrors.cityRequired;
      }
      break;
    case "admission_details":
      if (!state.admissionDate?.trim()) {
        return t.validationErrors.dateRequired;
      }
      if (!state.reason?.trim()) {
        return t.validationErrors.reasonRequired;
      }
      break;
  }
  return null;
}

// Show validation error
function showValidationError(message: string) {
  const existing = document.querySelector(".hospi-validation-error");
  if (existing) existing.remove();

  const error = document.createElement("div");
  error.className = "hospi-validation-error";
  error.textContent = message;

  const container = document.getElementById("hospi-step-container");
  if (container && container.firstChild) {
    container.firstChild.insertBefore(error, container.firstChild.firstChild);
  }

  setTimeout(() => error.remove(), 4000);
}

// Render back button
function renderBackButton(step: HospState["step"], state: HospState["state"], language: Language = 'en'): string {
  // Show back button on steps 2-5 (select_hospital through review)
  const showBack = ["select_hospital", "admission_details", "room_type", "review"].includes(step);
  if (!showBack) return "";

  const t = getT(language);
  return `<button id="backBtn" class="hospi-btn hospi-btn-secondary">${t.buttons.back}</button>`;
}

// Create tooltip
function createTooltip(term: string, explanation: string): string {
  return `
    <span class="hospi-tooltip">
      ${term}
      <span class="hospi-tooltip-text">${explanation}</span>
    </span>
  `;
}

// Helper to get room type label
function getRoomTypeLabel(roomType: string | undefined, language: Language = 'en'): string {
  const t = getT(language);
  if (roomType === "multi") return t.fields.multiRoom;
  if (roomType === "single") return t.fields.singleRoom;
  if (roomType === "day") return t.fields.dayAdmission;
  return "-";
}

// Update header with language-specific translations
function updateHeader(language: Language = 'en') {
  const t = getT(language);
  const headerTitle = document.querySelector(".hospi-header h2");
  const headerSubtitle = document.querySelector(".hospi-subtitle");

  if (headerTitle) {
    headerTitle.textContent = `🏥 ${t.header.title}`;
  }
  if (headerSubtitle) {
    headerSubtitle.textContent = t.header.subtitle;
  }
}

// Main render function
function renderStep(data: HospState) {
  const container = document.getElementById("hospi-step-container");
  if (!container) return;

  const { step, state, language = 'en' } = data;

  // Update header with correct language
  updateHeader(language);
  const t = getT(language);

  console.error(`🎨 Rendering step: ${step}, language: ${language}`);

  // Clear existing content
  container.innerHTML = "";

  if (step === "select_member") {
    container.innerHTML = `
      ${renderProgressBar(step, language)}
      <div class="hospi-card">
        <h3>${t.steps.step1}</h3>
        <div class="hospi-field">
          <label>${t.fields.patientName}</label>
          <input id="memberName" placeholder="${t.fields.patientNamePlaceholder}" value="${
            state.memberName ?? ""
          }" />
        </div>
        <div class="hospi-actions">
          ${renderBackButton(step, state, language)}
          <button id="memberNext" class="hospi-btn hospi-btn-primary">${t.buttons.next}</button>
        </div>
      </div>
    `;

    document.getElementById("memberNext")?.addEventListener("click", () => {
      const memberName = (document.getElementById("memberName") as HTMLInputElement).value;
      const updatedState = { ...state, memberName };

      const error = validateStep("select_member", updatedState, language);
      if (error) {
        showValidationError(error);
        return;
      }

      callJourney(updatedState, "select_member", false, language);
    });

    document.getElementById("backBtn")?.addEventListener("click", () => {
      callJourney(state, "select_member", true, language);
    });

    return;
  }

  if (step === "select_hospital") {
    const hospitalList = data.hospitalList || [];
    const hospitalOptions = hospitalList
      .map(
        (h) =>
          `<option value="${h.id}" ${state.hospitalId === h.id ? "selected" : ""}>${h.name} (${h.city})</option>`
      )
      .join("");

    const showCustomFields = !state.hospitalId || state.hospitalId === "other";

    container.innerHTML = `
      ${renderProgressBar(step, language)}
      <div class="hospi-card">
        <h3>${t.steps.step2}</h3>
        <div class="hospi-field">
          <label>${t.fields.selectHospital}</label>
          <select id="hospitalSelect">
            <option value="">${t.fields.selectFromNetwork}</option>
            ${hospitalOptions}
            <option value="other" ${state.hospitalId === "other" ? "selected" : ""}>${t.fields.other}</option>
          </select>
        </div>
        <div id="customHospitalFields" style="display: ${showCustomFields ? "block" : "none"}">
          <div class="hospi-field">
            <label>${t.fields.hospitalName}</label>
            <input id="hospitalName" placeholder="${t.fields.hospitalNamePlaceholder}" value="${
              state.hospitalName ?? ""
            }" />
          </div>
          <div class="hospi-field">
            <label>${t.fields.city}</label>
            <input id="hospitalCity" placeholder="${t.fields.cityPlaceholder}" value="${
              state.hospitalCity ?? ""
            }" />
          </div>
        </div>
        <div class="hospi-field">
          <label>${t.fields.hospitalLocation}</label>
          <div class="hospi-radio-group">
            <label class="hospi-radio-option">
              <input type="radio" name="abroad" value="false" ${!state.abroad ? "checked" : ""} />
              <span class="hospi-radio-label">
                <span class="hospi-radio-icon">🇧🇪</span>
                <span class="hospi-radio-text">${t.fields.belgium}</span>
              </span>
            </label>
            <label class="hospi-radio-option">
              <input type="radio" name="abroad" value="true" ${state.abroad ? "checked" : ""} />
              <span class="hospi-radio-label">
                <span class="hospi-radio-icon">🌍</span>
                <span class="hospi-radio-text">${t.fields.abroad}</span>
              </span>
            </label>
          </div>
        </div>
        <div class="hospi-actions">
          ${renderBackButton(step, state, language)}
          <button id="hospitalNext" class="hospi-btn hospi-btn-primary">${t.buttons.next}</button>
        </div>
      </div>
    `;

    // Toggle custom fields and location radio buttons based on selection
    const selectEl = document.getElementById("hospitalSelect") as HTMLSelectElement;
    const customFieldsEl = document.getElementById("customHospitalFields");
    const abroadRadios = document.querySelectorAll('input[name="abroad"]') as NodeListOf<HTMLInputElement>;
    const belgiumRadio = document.querySelector('input[name="abroad"][value="false"]') as HTMLInputElement;

    // Function to update radio button states
    const updateLocationRadios = (hospitalId: string) => {
      if (hospitalId && hospitalId !== "other") {
        // Belgian hospital selected - disable radios and select Belgium
        abroadRadios.forEach(radio => {
          radio.disabled = true;
          radio.parentElement?.classList.add('hospi-radio-disabled');
        });
        if (belgiumRadio) belgiumRadio.checked = true;
      } else {
        // Custom or no selection - enable radios
        abroadRadios.forEach(radio => {
          radio.disabled = false;
          radio.parentElement?.classList.remove('hospi-radio-disabled');
        });
      }
    };

    // Initialize state on render
    updateLocationRadios(selectEl.value);

    selectEl?.addEventListener("change", () => {
      const value = selectEl.value;
      if (customFieldsEl) {
        customFieldsEl.style.display = value === "other" || !value ? "block" : "none";
      }
      updateLocationRadios(value);
    });

    document.getElementById("hospitalNext")?.addEventListener("click", () => {
      const hospitalId = (document.getElementById("hospitalSelect") as HTMLSelectElement).value;
      let hospitalName = state.hospitalName || "";
      let hospitalCity = state.hospitalCity || "";

      if (hospitalId && hospitalId !== "other") {
        // Use selected hospital from dropdown
        const hospital = hospitalList.find((h) => h.id === hospitalId);
        if (hospital) {
          hospitalName = hospital.name;
          hospitalCity = hospital.city;
        }
      } else {
        // Use custom fields
        hospitalName = (document.getElementById("hospitalName") as HTMLInputElement)?.value || "";
        hospitalCity = (document.getElementById("hospitalCity") as HTMLInputElement)?.value || "";
      }

      const abroad = (document.querySelector('input[name="abroad"]:checked') as HTMLInputElement)?.value === "true";

      const updatedState = {
        ...state,
        hospitalId: hospitalId || "other",
        hospitalName,
        hospitalCity,
        abroad,
      };

      const error = validateStep("select_hospital", updatedState, language);
      if (error) {
        showValidationError(error);
        return;
      }

      callJourney(updatedState, "select_hospital", false, language);
    });

    document.getElementById("backBtn")?.addEventListener("click", () => {
      callJourney(state, "select_hospital", true, language);
    });

    return;
  }

  if (step === "admission_details") {
    const defaultDate = state.defaultAdmissionDate || state.admissionDate || "";
    const minDate = state.minAdmissionDate || "";
    const maxDate = state.maxAdmissionDate || "";

    container.innerHTML = `
      ${renderProgressBar(step, language)}
      <div class="hospi-card">
        <h3>${t.steps.step3}</h3>
        <div class="hospi-field">
          <label>${t.fields.admissionDate}</label>
          <input
            type="date"
            id="admissionDate"
            value="${state.admissionDate || defaultDate}"
            min="${minDate}"
            max="${maxDate}"
          />
          <div class="hospi-field-hint">${t.fields.admissionDateHint}</div>
        </div>
        <div class="hospi-field">
          <label>${t.fields.reason}</label>
          <input id="reason" placeholder="${t.fields.reasonPlaceholder}" value="${
            state.reason ?? ""
          }" />
        </div>
        <div class="hospi-field">
          <label>${t.fields.accident}</label>
          <div class="hospi-radio-group">
            <label class="hospi-radio-option">
              <input type="radio" name="accident" value="false" ${!state.accident ? "checked" : ""} />
              <span class="hospi-radio-label">
                <span class="hospi-radio-icon">✅</span>
                <span class="hospi-radio-text">${t.fields.no}</span>
              </span>
            </label>
            <label class="hospi-radio-option">
              <input type="radio" name="accident" value="true" ${state.accident ? "checked" : ""} />
              <span class="hospi-radio-label">
                <span class="hospi-radio-icon">⚠️</span>
                <span class="hospi-radio-text">${t.fields.yes}</span>
              </span>
            </label>
          </div>
        </div>
        <div class="hospi-actions">
          ${renderBackButton(step, state, language)}
          <button id="detailsNext" class="hospi-btn hospi-btn-primary">${t.buttons.next}</button>
        </div>
      </div>
    `;

    document.getElementById("detailsNext")?.addEventListener("click", () => {
      const admissionDate = (document.getElementById("admissionDate") as HTMLInputElement).value;
      const reason = (document.getElementById("reason") as HTMLInputElement).value;
      const accident = (document.querySelector('input[name="accident"]:checked') as HTMLInputElement)?.value === "true";

      const updatedState = {
        ...state,
        admissionDate,
        reason,
        accident,
      };

      const error = validateStep("admission_details", updatedState, language);
      if (error) {
        showValidationError(error);
        return;
      }

      callJourney(updatedState, "admission_details", false, language);
    });

    document.getElementById("backBtn")?.addEventListener("click", () => {
      callJourney(state, "admission_details", true, language);
    });

    return;
  }

  if (step === "room_type") {
    container.innerHTML = `
      ${renderProgressBar(step, language)}
      <div class="hospi-card">
        <h3>${t.steps.step4}</h3>
        <div class="hospi-field">
          <label>${t.fields.roomType}</label>
          <div class="hospi-radio-group">
            <label class="hospi-radio-option">
              <input type="radio" name="roomType" value="multi" ${
                state.roomType === "multi" || !state.roomType ? "checked" : ""
              } />
              <span class="hospi-radio-label">
                <span class="hospi-radio-icon">🛏️</span>
                <span class="hospi-radio-text">${t.fields.multiRoom}</span>
              </span>
            </label>
            <label class="hospi-radio-option">
              <input type="radio" name="roomType" value="single" ${
                state.roomType === "single" ? "checked" : ""
              } />
              <span class="hospi-radio-label">
                <span class="hospi-radio-icon">🚪</span>
                <span class="hospi-radio-text">${t.fields.singleRoom}</span>
              </span>
            </label>
            <label class="hospi-radio-option">
              <input type="radio" name="roomType" value="day" ${
                state.roomType === "day" ? "checked" : ""
              } />
              <span class="hospi-radio-label">
                <span class="hospi-radio-icon">⏰</span>
                <span class="hospi-radio-text">${t.fields.dayAdmission}</span>
              </span>
            </label>
          </div>
        </div>
        <div class="hospi-actions">
          ${renderBackButton(step, state, language)}
          <button id="roomNext" class="hospi-btn hospi-btn-primary">${t.buttons.review}</button>
        </div>
      </div>
    `;

    document.getElementById("roomNext")?.addEventListener("click", () => {
      const roomType = (document.querySelector('input[name="roomType"]:checked') as HTMLInputElement)?.value || "multi";
      callJourney({ ...state, roomType }, "room_type", false, language);
    });

    document.getElementById("backBtn")?.addEventListener("click", () => {
      callJourney(state, "room_type", true, language);
    });

    return;
  }

  if (step === "review" || step === "submitted") {
    const roomTypeLabel = getRoomTypeLabel(state.roomType, language);
    const insuranceData = state.insuranceData || {};
    const thirdParty = insuranceData.thirdPartyPayment || {};
    const coverageBadgeClass = thirdParty.coveragePercentage === 100 ? "full-coverage" : "partial-coverage";

    const coveredItemsList = (thirdParty.coveredItems || [])
      .map((item: string) => `<li>${item}</li>`)
      .join("");

    const additionalNotesList = (insuranceData.additionalNotes || [])
      .map((note: string) => `<li>${note}</li>`)
      .join("");

    container.innerHTML = `
      ${renderProgressBar(step, language)}
      <div class="hospi-card">
        <h3>${t.steps.step5}</h3>
        ${
          state.declarationId
            ? `<div class="hospi-declaration-id">${t.review.declarationId}: ${state.declarationId}</div>`
            : ""
        }

        <div class="hospi-section">
          <h4>${t.review.patientInfo}</h4>
          <ul class="hospi-summary">
            <li><strong>${t.review.patient}</strong><span>${state.memberName ?? "-"}</span></li>
            ${
              insuranceData.memberNumber
                ? `<li><strong>${t.review.memberNumber}</strong><span>${insuranceData.memberNumber}</span></li>`
                : ""
            }
            ${
              insuranceData.policyType
                ? `<li><strong>${t.review.policyType}</strong><span>${insuranceData.policyType}</span></li>`
                : ""
            }
            ${
              insuranceData.validUntil
                ? `<li><strong>${t.review.validUntil}</strong><span>${insuranceData.validUntil}</span></li>`
                : ""
            }
          </ul>
        </div>

        <div class="hospi-section">
          <h4>${t.review.admissionDetails}</h4>
          <ul class="hospi-summary">
            <li><strong>${t.review.hospital}</strong><span>${state.hospitalName ?? "-"}${
      state.hospitalCity ? " (" + state.hospitalCity + ")" : ""
    }</span></li>
            <li><strong>${t.review.admissionDate}</strong><span>${state.admissionDate ?? "-"}</span></li>
            <li><strong>${t.review.reason}</strong><span>${state.reason ?? "-"}</span></li>
            <li><strong>${t.review.accident}</strong><span>${state.accident ? t.fields.yes : t.review.noOrUnknown}</span></li>
            <li><strong>${t.review.roomType}</strong><span>${roomTypeLabel}</span></li>
          </ul>
        </div>

        ${
          thirdParty.coveragePercentage
            ? `
        <div class="hospi-section">
          <h4>${createTooltip(
            t.review.thirdPartyPayment,
            t.review.thirdPartyPaymentTooltip
          )}</h4>
          <div class="hospi-coverage-badge ${coverageBadgeClass}">
            ${thirdParty.coveragePercentage}% ${t.review.coverage}
          </div>
          <p class="hospi-coverage-description">${thirdParty.coverageDescription}</p>

          <div class="hospi-field">
            <strong>${t.review.coveredItems}</strong>
            <ul class="hospi-covered-items">
              ${coveredItemsList}
            </ul>
          </div>

          <div class="hospi-field">
            <strong>${t.review.estimatedCoPay}</strong>
            <span>${thirdParty.estimatedCoPay}</span>
          </div>

          ${
            thirdParty.priorAuthRequired
              ? `<p class="hospi-note">⚠️ <strong>${t.review.priorAuthRequired}</strong> ${t.review.priorAuthMessage}</p>`
              : ""
          }
        </div>
        `
            : ""
        }

        ${
          additionalNotesList
            ? `
        <div class="hospi-section">
          <h4>${t.review.importantNotes}</h4>
          <ul class="hospi-additional-notes">
            ${additionalNotesList}
          </ul>
        </div>
        `
            : ""
        }

        ${
          step === "review"
            ? `
        <div class="hospi-actions">
          ${renderBackButton(step, state, language)}
          <button id="submitBtn" class="hospi-btn hospi-btn-primary">${t.buttons.submit}</button>
        </div>
        `
            : ""
        }
      </div>
    `;

    if (step === "review") {
      document.getElementById("submitBtn")?.addEventListener("click", () => {
        callJourney(state, "review", false, language);
      });

      document.getElementById("backBtn")?.addEventListener("click", () => {
        callJourney(state, "review", true, language);
      });
    }

    return;
  }
}

// Connect to MCP host
console.error("🔌 Connecting Hospi-Copilot Widget to MCP host...");
app.connect();
console.error("✅ Hospi-Copilot Widget initialized");
