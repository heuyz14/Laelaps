import { Agent } from "@mastra/core/agent";
import { Mastra } from "@mastra/core";
import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";

import { mastraTools } from "./tools";

const model = process.env.MASTRA_MODEL ?? "openai/gpt-4o-mini";

export const runSummaryAgent = new Agent({
  id: "run-summary-agent",
  name: "Run Summary Agent",
  instructions:
    "Summarize an authenticated runner's selected run using only supplied tools and data.",
  model,
  tools: mastraTools,
});

export const historicalAnalystAgent = new Agent({
  id: "historical-analyst-agent",
  name: "Historical Analyst Agent",
  instructions:
    "Answer authenticated training-history questions with evidence and caveats.",
  model,
  tools: mastraTools,
});

export const trainingCoachAgent = new Agent({
  id: "training-coach-agent",
  name: "Training Coach Agent",
  instructions:
    "Give conservative, evidence-based training suggestions from deterministic runner data.",
  model,
  tools: mastraTools,
});

export const recoveryAgent = new Agent({
  id: "recovery-agent",
  name: "Recovery Agent",
  instructions:
    "Interpret deterministic recovery signals without making medical diagnoses.",
  model,
  tools: mastraTools,
});

const workflowInputSchema = z.object({
  runId: z.string().uuid(),
  requestContext: z.record(z.string(), z.unknown()).optional(),
});
const workflowOutputSchema = z.object({
  runId: z.string().uuid(),
  status: z.literal("ready"),
});
const validationStep = createStep({
  id: "validate-run-summary-request",
  inputSchema: workflowInputSchema,
  outputSchema: workflowOutputSchema,
  execute: async ({ inputData }) => ({
    runId: inputData.runId,
    status: "ready" as const,
  }),
});

export const runSummaryWorkflow = createWorkflow({
  id: "run-summary-workflow",
  description:
    "Validates the run summary workflow boundary before provider execution.",
  inputSchema: workflowInputSchema,
  outputSchema: workflowOutputSchema,
})
  .then(validationStep)
  .commit();

export const mastra = new Mastra({
  agents: {
    runSummaryAgent,
    historicalAnalystAgent,
    trainingCoachAgent,
    recoveryAgent,
  },
  tools: mastraTools,
  workflows: { runSummaryWorkflow },
  logger: false,
});
