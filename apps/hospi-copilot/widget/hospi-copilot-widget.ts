import { App } from "@modelcontextprotocol/ext-apps";

// Initialize the MCP App
const app = new App({
  name: "Hospi-Copilot Widget",
  version: "1.0.0",
});

// Type definitions
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

// Handle tool results from server
app.ontoolresult = (result: any) => {
  console.error("📥 Tool result received:", result);
  const data = result.structuredContent as HospState;
  renderStep(data);
};

// Helper to call the journey tool
async function callJourney(
  update: Partial<HospState["state"]>,
  step: HospState["step"],
  goBack: boolean = false
) {
  try {
    console.error(`🔧 Calling hospital_journey: step=${step}`, update);
    const result = await app.callServerTool({
      name: "hospital_journey",
      arguments: {
        step,
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
function renderProgressBar(step: HospState["step"]): string {
  const { current, total } = getStepNumber(step);
  if (current === 0 || step === "submitted") return "";

  const percentage = (current / total) * 100;
  return `
    <div class="hospi-progress">
      <div class="hospi-progress-text">Step ${current} of ${total}</div>
      <div class="hospi-progress-bar">
        <div class="hospi-progress-fill" style="width: ${percentage}%"></div>
      </div>
    </div>
  `;
}

// Validation function
function validateStep(step: HospState["step"], state: HospState["state"]): string | null {
  switch (step) {
    case "select_member":
      if (!state.memberName?.trim()) {
        return "Please enter the patient's name";
      }
      break;
    case "select_hospital":
      if (!state.hospitalName?.trim()) {
        return "Please select a hospital or enter a custom hospital name";
      }
      if (!state.hospitalCity?.trim()) {
        return "Please enter the hospital city";
      }
      break;
    case "admission_details":
      if (!state.admissionDate?.trim()) {
        return "Please select an admission date";
      }
      if (!state.reason?.trim()) {
        return "Please enter the reason for admission";
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
function renderBackButton(step: HospState["step"], state: HospState["state"]): string {
  // Show back button on steps 2-5 (select_hospital through review)
  const showBack = ["select_hospital", "admission_details", "room_type", "review"].includes(step);
  if (!showBack) return "";

  return `<button id="backBtn" class="hospi-btn hospi-btn-secondary">← Back</button>`;
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

// Main render function
function renderStep(data: HospState) {
  const container = document.getElementById("hospi-step-container");
  if (!container) return;

  const { step, state } = data;

  console.error(`🎨 Rendering step: ${step}`);

  // Clear existing content
  container.innerHTML = "";

  if (step === "select_member") {
    container.innerHTML = `
      ${renderProgressBar(step)}
      <div class="hospi-card">
        <h3>Step 1: Who is being admitted?</h3>
        <div class="hospi-field">
          <label>Patient Name</label>
          <input id="memberName" placeholder="E.g., yourself or child" value="${
            state.memberName ?? ""
          }" />
        </div>
        <div class="hospi-actions">
          ${renderBackButton(step, state)}
          <button id="memberNext" class="hospi-btn hospi-btn-primary">Next</button>
        </div>
      </div>
    `;

    document.getElementById("memberNext")?.addEventListener("click", () => {
      const memberName = (document.getElementById("memberName") as HTMLInputElement).value;
      const updatedState = { ...state, memberName };

      const error = validateStep("select_member", updatedState);
      if (error) {
        showValidationError(error);
        return;
      }

      callJourney(updatedState, "select_member");
    });

    document.getElementById("backBtn")?.addEventListener("click", () => {
      callJourney(state, "select_member", true);
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
      ${renderProgressBar(step)}
      <div class="hospi-card">
        <h3>Step 2: Hospital Selection</h3>
        <div class="hospi-field">
          <label>Select Hospital</label>
          <select id="hospitalSelect">
            <option value="">-- Select from our network --</option>
            ${hospitalOptions}
            <option value="other" ${state.hospitalId === "other" ? "selected" : ""}>Other (specify below)</option>
          </select>
        </div>
        <div id="customHospitalFields" style="display: ${showCustomFields ? "block" : "none"}">
          <div class="hospi-field">
            <label>Hospital Name</label>
            <input id="hospitalName" placeholder="E.g., Custom Hospital" value="${
              state.hospitalName ?? ""
            }" />
          </div>
          <div class="hospi-field">
            <label>City / Municipality</label>
            <input id="hospitalCity" placeholder="City or municipality" value="${
              state.hospitalCity ?? ""
            }" />
          </div>
        </div>
        <div class="hospi-field">
          <label>Hospital Location</label>
          <div class="hospi-radio-group">
            <label class="hospi-radio-option">
              <input type="radio" name="abroad" value="false" ${!state.abroad ? "checked" : ""} />
              <span class="hospi-radio-label">
                <span class="hospi-radio-icon">🇧🇪</span>
                <span class="hospi-radio-text">Belgium</span>
              </span>
            </label>
            <label class="hospi-radio-option">
              <input type="radio" name="abroad" value="true" ${state.abroad ? "checked" : ""} />
              <span class="hospi-radio-label">
                <span class="hospi-radio-icon">🌍</span>
                <span class="hospi-radio-text">Abroad</span>
              </span>
            </label>
          </div>
        </div>
        <div class="hospi-actions">
          ${renderBackButton(step, state)}
          <button id="hospitalNext" class="hospi-btn hospi-btn-primary">Next</button>
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

      const error = validateStep("select_hospital", updatedState);
      if (error) {
        showValidationError(error);
        return;
      }

      callJourney(updatedState, "select_hospital");
    });

    document.getElementById("backBtn")?.addEventListener("click", () => {
      callJourney(state, "select_hospital", true);
    });

    return;
  }

  if (step === "admission_details") {
    const defaultDate = state.defaultAdmissionDate || state.admissionDate || "";
    const minDate = state.minAdmissionDate || "";
    const maxDate = state.maxAdmissionDate || "";

    container.innerHTML = `
      ${renderProgressBar(step)}
      <div class="hospi-card">
        <h3>Step 3: Admission Details</h3>
        <div class="hospi-field">
          <label>Admission Date</label>
          <input
            type="date"
            id="admissionDate"
            value="${state.admissionDate || defaultDate}"
            min="${minDate}"
            max="${maxDate}"
          />
          <div class="hospi-field-hint">Select a date between today and one year from now</div>
        </div>
        <div class="hospi-field">
          <label>Reason for Admission</label>
          <input id="reason" placeholder="E.g., knee surgery, childbirth" value="${
            state.reason ?? ""
          }" />
        </div>
        <div class="hospi-field">
          <label>Is this the result of an accident?</label>
          <div class="hospi-radio-group">
            <label class="hospi-radio-option">
              <input type="radio" name="accident" value="false" ${!state.accident ? "checked" : ""} />
              <span class="hospi-radio-label">
                <span class="hospi-radio-icon">✅</span>
                <span class="hospi-radio-text">No</span>
              </span>
            </label>
            <label class="hospi-radio-option">
              <input type="radio" name="accident" value="true" ${state.accident ? "checked" : ""} />
              <span class="hospi-radio-label">
                <span class="hospi-radio-icon">⚠️</span>
                <span class="hospi-radio-text">Yes</span>
              </span>
            </label>
          </div>
        </div>
        <div class="hospi-actions">
          ${renderBackButton(step, state)}
          <button id="detailsNext" class="hospi-btn hospi-btn-primary">Next</button>
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

      const error = validateStep("admission_details", updatedState);
      if (error) {
        showValidationError(error);
        return;
      }

      callJourney(updatedState, "admission_details");
    });

    document.getElementById("backBtn")?.addEventListener("click", () => {
      callJourney(state, "admission_details", true);
    });

    return;
  }

  if (step === "room_type") {
    container.innerHTML = `
      ${renderProgressBar(step)}
      <div class="hospi-card">
        <h3>Step 4: Room Type</h3>
        <div class="hospi-field">
          <label>Room Type</label>
          <div class="hospi-radio-group">
            <label class="hospi-radio-option">
              <input type="radio" name="roomType" value="multi" ${
                state.roomType === "multi" || !state.roomType ? "checked" : ""
              } />
              <span class="hospi-radio-label">
                <span class="hospi-radio-icon">🛏️</span>
                <span class="hospi-radio-text">Multi-person room</span>
              </span>
            </label>
            <label class="hospi-radio-option">
              <input type="radio" name="roomType" value="single" ${
                state.roomType === "single" ? "checked" : ""
              } />
              <span class="hospi-radio-label">
                <span class="hospi-radio-icon">🚪</span>
                <span class="hospi-radio-text">Single room</span>
              </span>
            </label>
            <label class="hospi-radio-option">
              <input type="radio" name="roomType" value="day" ${
                state.roomType === "day" ? "checked" : ""
              } />
              <span class="hospi-radio-label">
                <span class="hospi-radio-icon">⏰</span>
                <span class="hospi-radio-text">Day admission</span>
              </span>
            </label>
          </div>
        </div>
        <div class="hospi-actions">
          ${renderBackButton(step, state)}
          <button id="roomNext" class="hospi-btn hospi-btn-primary">Review</button>
        </div>
      </div>
    `;

    document.getElementById("roomNext")?.addEventListener("click", () => {
      const roomType = (document.querySelector('input[name="roomType"]:checked') as HTMLInputElement)?.value || "multi";
      callJourney({ ...state, roomType }, "room_type");
    });

    document.getElementById("backBtn")?.addEventListener("click", () => {
      callJourney(state, "room_type", true);
    });

    return;
  }

  if (step === "review" || step === "submitted") {
    const roomTypeLabel =
      state.roomType === "multi"
        ? "Multi-person room"
        : state.roomType === "single"
        ? "Single room"
        : state.roomType === "day"
        ? "Day admission"
        : "-";

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
      ${renderProgressBar(step)}
      <div class="hospi-card">
        <h3>Overview: Hospitalization (Demo)</h3>
        ${
          state.declarationId
            ? `<div class="hospi-declaration-id">Declaration ID: ${state.declarationId}</div>`
            : ""
        }

        <div class="hospi-section">
          <h4>Patient Information</h4>
          <ul class="hospi-summary">
            <li><strong>Patient</strong><span>${state.memberName ?? "-"}</span></li>
            ${
              insuranceData.memberNumber
                ? `<li><strong>Member Number</strong><span>${insuranceData.memberNumber}</span></li>`
                : ""
            }
            ${
              insuranceData.policyType
                ? `<li><strong>Policy Type</strong><span>${insuranceData.policyType}</span></li>`
                : ""
            }
            ${
              insuranceData.validUntil
                ? `<li><strong>Valid Until</strong><span>${insuranceData.validUntil}</span></li>`
                : ""
            }
          </ul>
        </div>

        <div class="hospi-section">
          <h4>Admission Details</h4>
          <ul class="hospi-summary">
            <li><strong>Hospital</strong><span>${state.hospitalName ?? "-"}${
      state.hospitalCity ? " (" + state.hospitalCity + ")" : ""
    }</span></li>
            <li><strong>Admission Date</strong><span>${state.admissionDate ?? "-"}</span></li>
            <li><strong>Reason</strong><span>${state.reason ?? "-"}</span></li>
            <li><strong>Accident</strong><span>${state.accident ? "Yes" : "No or unknown"}</span></li>
            <li><strong>Room Type</strong><span>${roomTypeLabel}</span></li>
          </ul>
        </div>

        ${
          thirdParty.coveragePercentage
            ? `
        <div class="hospi-section">
          <h4>${createTooltip(
            "Third-Party Payment",
            "Direct billing arrangement where your insurer pays the hospital directly for covered services"
          )}</h4>
          <div class="hospi-coverage-badge ${coverageBadgeClass}">
            ${thirdParty.coveragePercentage}% Coverage
          </div>
          <p class="hospi-coverage-description">${thirdParty.coverageDescription}</p>

          <div class="hospi-field">
            <strong>Covered Items:</strong>
            <ul class="hospi-covered-items">
              ${coveredItemsList}
            </ul>
          </div>

          <div class="hospi-field">
            <strong>Estimated Co-Pay:</strong>
            <span>${thirdParty.estimatedCoPay}</span>
          </div>

          ${
            thirdParty.priorAuthRequired
              ? `<p class="hospi-note">⚠️ <strong>Prior authorization required</strong> for this type of admission. Please contact your insurer before the admission date.</p>`
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
          <h4>Important Notes</h4>
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
          ${renderBackButton(step, state)}
          <button id="submitBtn" class="hospi-btn hospi-btn-primary">Submit Declaration</button>
        </div>
        `
            : ""
        }
      </div>
    `;

    if (step === "review") {
      document.getElementById("submitBtn")?.addEventListener("click", () => {
        callJourney(state, "review");
      });

      document.getElementById("backBtn")?.addEventListener("click", () => {
        callJourney(state, "review", true);
      });
    }

    return;
  }
}

// Connect to MCP host
console.error("🔌 Connecting Hospi-Copilot Widget to MCP host...");
app.connect();
console.error("✅ Hospi-Copilot Widget initialized");
