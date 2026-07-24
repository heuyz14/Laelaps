# Phase 2: Core Platform

Status: Draft  
Target: Week 2  
Depends on: Phase 1

## Executive Summary

Phase 2 builds the non-AI running product: run CRUD, history, detail views, goals, shoes, and dashboard summaries. The application should be useful with AI disabled.

## Scope

In scope:

- Create, edit, delete, and view runs
- Run history with filters and sorting
- Run detail page
- Dashboard summary cards
- Goal tracking basics
- Shoe tracking basics

Out of scope:

- AI summaries
- External sync from Garmin or Strava
- Advanced training plan generation

## Deliverables

- Run form with validation
- Run history table/list
- Run detail route
- Dashboard cards
- Goal and shoe data models
- CRUD tests for user-owned data

## Acceptance Criteria

- A signed-in user can manage runs end to end.
- Invalid distance, duration, and date values are rejected.
- Dashboard metrics update after run changes.
- Deleted runs no longer appear in history or analytics.
- User data remains isolated by RLS.
