# Phase 4: AI Platform

Status: Draft  
Target: Week 3, second half through Week 4  
Depends on: Phase 3

## Executive Summary

Phase 4 introduces Mastra agents, tools, workflows, memory, and saved insights. AI behavior must be grounded in application-generated analytics and authenticated user context.

## Scope

In scope:

- Mastra project structure
- Typed agent tools
- Run summary agent
- Historical analyst agent
- Training coach workflow
- Recovery analysis workflow
- Memory design
- Prompt strategy
- Saved AI insights
- AI usage tracking

Out of scope:

- Medical diagnosis
- Autonomous plan changes without user review
- Arbitrary database access
- External wearable sync

## Guardrails

- Agents can explain metrics but cannot be the source of truth for metrics.
- Tools must derive user identity from authenticated server context.
- Agent outputs should cite the run, time window, or metric source they used.
- Coaching advice should remain bounded, non-medical, and uncertainty-aware.

## Acceptance Criteria

- Run summaries are generated from scoped run and comparison data.
- Historical analysis answers trend questions with cited metrics.
- Training recommendations use recent volume, effort, and goal context.
- AI failures degrade gracefully without breaking core run logging.
- AI usage is stored for auditing and rate-limit analysis.
