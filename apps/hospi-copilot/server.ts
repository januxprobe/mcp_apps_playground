import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, "..", "..", "dist", "hospi-copilot");

// Export constants for multi-app integration
export const APP_NAME = "Hospitalisation & Care Journey Copilot";
export const APP_VERSION = "1.0.0";

// Belgian hospital list for dropdown
const BELGIAN_HOSPITALS = [
  { id: "uz-leuven", name: "UZ Leuven", city: "Leuven" },
  { id: "uz-gent", name: "UZ Gent", city: "Gent" },
  { id: "uz-brussel", name: "UZ Brussel", city: "Brussel" },
  { id: "az-sint-jan", name: "AZ Sint-Jan Brugge-Oostende AV", city: "Brugge" },
  { id: "az-groeninge", name: "AZ Groeninge", city: "Kortrijk" },
  { id: "uz-antwerpen", name: "UZ Antwerpen", city: "Antwerpen" },
  { id: "az-sint-lucas", name: "AZ Sint-Lucas", city: "Gent" },
  { id: "az-monica", name: "AZ Monica", city: "Antwerpen" },
  { id: "chu-liege", name: "CHU de Liège", city: "Liège" },
  { id: "cliniques-saint-luc", name: "Cliniques universitaires Saint-Luc", city: "Bruxelles" },
  { id: "hopital-erasme", name: "Hôpital Erasme", city: "Bruxelles" },
  { id: "chu-charleroi", name: "CHU de Charleroi", city: "Charleroi" },
  { id: "az-klina", name: "AZ Klina", city: "Brasschaat" },
  { id: "jessa", name: "Jessa Ziekenhuis", city: "Hasselt" },
  { id: "az-turnhout", name: "AZ Turnhout", city: "Turnhout" },
];

// Date utility functions
function getDefaultAdmissionDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7); // Default to 7 days from now
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
}

function getMinAdmissionDate(): string {
  const date = new Date();
  return date.toISOString().split('T')[0]; // Today
}

function getMaxAdmissionDate(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1); // One year from now
  return date.toISOString().split('T')[0];
}

// Demo data generators
function generateMemberNumber(): string {
  // Belgian NISS-style format: YY.MM.DD-SSS.CC
  const year = Math.floor(Math.random() * 40) + 60; // 60-99 for birth years
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  const check = String(Math.floor(Math.random() * 99)).padStart(2, '0');
  return `${year}.${month}.${day}-${seq}.${check}`;
}

function generateThirdPartyPaymentInfo(state: any): any {
  const roomType = state.roomType || 'multi';
  const isAccident = state.accident || false;

  let coveragePercentage = 100;
  let coverageDescription = "Full coverage (100%)";
  let estimatedCoPay = "€0";
  let priorAuthRequired = false;

  if (roomType === 'single') {
    coveragePercentage = 75;
    coverageDescription = "Partial coverage (75%) - supplement for single room";
    estimatedCoPay = "€50-150 per day (room supplement)";
  }

  // Check if prior authorization needed based on reason
  const reason = (state.reason || '').toLowerCase();
  if (reason.includes('surgery') || reason.includes('operation') || reason.includes('childbirth')) {
    priorAuthRequired = true;
  }

  const coveredItems = [
    "Medical and specialist fees",
    "Room and board",
    "Medications and medical supplies",
    "Diagnostic tests and imaging",
  ];

  if (isAccident) {
    coveredItems.push("Accident-related care");
  }

  if (roomType === 'day') {
    coveredItems.push("Day clinic procedures");
  }

  return {
    coveragePercentage,
    coverageDescription,
    coveredItems,
    estimatedCoPay,
    priorAuthRequired,
  };
}

function generateInsuranceData(state: any): any {
  const memberNumber = generateMemberNumber();
  const thirdPartyPayment = generateThirdPartyPaymentInfo(state);

  return {
    memberNumber,
    policyType: "Premium Health Insurance",
    validUntil: "31/12/2026",
    thirdPartyPayment,
    additionalNotes: [
      "Please bring your eID card to the hospital",
      "Confirm your admission 48 hours in advance",
      state.accident ? "For accident-related admissions, a police report may be required" : null,
    ].filter(Boolean),
  };
}

// Zod schema for hospitalization journey state machine
const HospitalJourneyInput = z.object({
  step: z
    .enum([
      "start",
      "select_member",
      "select_hospital",
      "admission_details",
      "room_type",
      "review",
      "submitted",
    ])
    .default("start"),
  state: z
    .object({
      memberId: z.string().optional(),
      memberName: z.string().optional(),
      hospitalId: z.string().optional(), // ID from dropdown selection
      hospitalName: z.string().optional(),
      hospitalCity: z.string().optional(),
      abroad: z.boolean().optional(),
      admissionDate: z.string().optional(),
      defaultAdmissionDate: z.string().optional(), // Date picker defaults
      minAdmissionDate: z.string().optional(),
      maxAdmissionDate: z.string().optional(),
      reason: z.string().optional(),
      accident: z.boolean().optional(),
      roomType: z.enum(["multi", "single", "day"]).optional(),
      notes: z.string().optional(),
      declarationId: z.string().optional(),
      insuranceData: z.any().optional(), // Generated insurance data
    })
    .optional(),
  goBack: z.boolean().optional(), // For back navigation
});

type HospitalJourneyInputType = z.infer<typeof HospitalJourneyInput>;

/**
 * Creates and configures the MCP server with hospital journey tool and UI resource
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: APP_NAME,
    version: APP_VERSION,
  });

  // Define UI resource URI (versioned for cache control)
  const resourceUri = "ui://hospi-copilot/widget-v3.html";

  // Register the hospital_journey tool with state machine
  registerAppTool(
    server,
    "hospital_journey",
    {
      title: "Hospital Journey",
      description:
        "Guide the user through a hospital admission flow and return UI state for the widget",
      inputSchema: {
        step: z
          .enum([
            "start",
            "select_member",
            "select_hospital",
            "admission_details",
            "room_type",
            "review",
            "submitted",
          ])
          .default("start")
          .describe("Current step in the hospitalization journey"),
        state: z
          .object({
            memberId: z.string().optional(),
            memberName: z.string().optional(),
            hospitalId: z.string().optional(),
            hospitalName: z.string().optional(),
            hospitalCity: z.string().optional(),
            abroad: z.boolean().optional(),
            admissionDate: z.string().optional(),
            defaultAdmissionDate: z.string().optional(),
            minAdmissionDate: z.string().optional(),
            maxAdmissionDate: z.string().optional(),
            reason: z.string().optional(),
            accident: z.boolean().optional(),
            roomType: z.enum(["multi", "single", "day"]).optional(),
            notes: z.string().optional(),
            declarationId: z.string().optional(),
            insuranceData: z.any().optional(),
          })
          .optional()
          .describe("Current state data accumulated through the journey"),
        goBack: z.boolean().optional().describe("Navigate to previous step"),
      },
      annotations: {
        readOnlyHint: true, // No external state modifications
        openWorldHint: false, // Bounded to this app
        destructiveHint: false, // Non-destructive
      },
      _meta: {
        ui: {
          resourceUri, // Links this tool to the UI widget
        },
      },
    },
    async (args) => {
      const parsed: HospitalJourneyInputType =
        HospitalJourneyInput.parse(args);
      const state = parsed.state ?? {};
      let step = parsed.step;

      // Handle back navigation
      if (parsed.goBack) {
        const stepOrder: HospitalJourneyInputType["step"][] = [
          "start", "select_member", "select_hospital", "admission_details", "room_type", "review", "submitted"
        ];
        const currentIndex = stepOrder.indexOf(step);
        if (currentIndex > 0) {
          step = stepOrder[currentIndex - 1];
        }
      }

      let nextStep: HospitalJourneyInputType["step"] = step;
      let message = "";

      // State machine implementation
      switch (step) {
        case "start": {
          nextStep = "select_member";
          message =
            "I'll help you with your hospital admission. For whom is the admission (yourself or a family member)?";
          break;
        }

        case "select_member": {
          nextStep = "select_hospital";
          message =
            "Great! Please provide the patient's name, then we'll select the hospital.";
          break;
        }

        case "select_hospital": {
          // Auto-populate hospital name/city if hospitalId is provided
          if (state.hospitalId && state.hospitalId !== "other") {
            const hospital = BELGIAN_HOSPITALS.find(h => h.id === state.hospitalId);
            if (hospital) {
              state.hospitalName = hospital.name;
              state.hospitalCity = hospital.city;
              // Belgian hospital selected - automatically set location to Belgium
              state.abroad = false;
            }
          }
          nextStep = "admission_details";
          message =
            "Perfect. Now please provide the admission date and the reason (e.g., knee surgery, childbirth).";
          break;
        }

        case "admission_details": {
          // Add date constraints for the date picker
          state.defaultAdmissionDate = getDefaultAdmissionDate();
          state.minAdmissionDate = getMinAdmissionDate();
          state.maxAdmissionDate = getMaxAdmissionDate();

          nextStep = "room_type";
          message =
            "What type of room would you like? Multi-person room, single room, or day admission?";
          break;
        }

        case "room_type": {
          nextStep = "review";
          message =
            "I'll create a summary of your declaration so you can review everything before we submit.";
          break;
        }

        case "review": {
          nextStep = "submitted";
          // Generate fake declaration ID (HSP- prefix easily customizable per customer)
          const fakeId = `HSP-${Math.floor(Math.random() * 900000) + 100000}`;
          state.declarationId = fakeId;

          // Generate complete insurance data
          state.insuranceData = generateInsuranceData(state);

          message =
            "Your hospitalization has been registered (demo). Use this overview and your member number to inform the hospital.";
          break;
        }

        case "submitted": {
          nextStep = "submitted";
          message =
            "Your demo declaration is complete. You can ask additional questions or simulate extra costs.";
          break;
        }
      }

      console.error(`Hospital journey: step=${step} -> nextStep=${nextStep}`);

      return {
        // All critical data in structuredContent (guaranteed to reach widget)
        structuredContent: {
          step: nextStep,
          state,
          hospitalList: BELGIAN_HOSPITALS, // Pass hospital list for dropdown
        },
        // Narrative for the AI model
        content: [
          {
            type: "text",
            text: message,
          },
        ],
      };
    }
  );

  // Register the UI resource
  registerAppResource(
    server,
    "hospi-copilot-widget",
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => {
      const htmlPath = path.join(
        DIST_DIR,
        "widget",
        "apps",
        "hospi-copilot",
        "widget",
        "hospi-copilot-widget.html"
      );
      console.error(`Serving UI resource from: ${htmlPath}`);

      const html = await fs.readFile(htmlPath, "utf-8");

      return {
        contents: [
          {
            uri: resourceUri,
            mimeType: RESOURCE_MIME_TYPE,
            text: html,
          },
        ],
      };
    }
  );

  console.error(`${APP_NAME} created with hospital_journey tool and widget`);

  return server;
}
