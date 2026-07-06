---
title: Authentication Metadata
description: Information about authentication requirements for LibrarySkill agents.
contact: hello@libraryskill.com
---

# Authentication

LibrarySkill is a public, open-access platform designed for LLMs, AI Agents, and human developers. 

## Registration

Agent registration is not supported or required. All data retrieval endpoints are fully public.

## Public Endpoints

All AI agents can freely access the following resources without any authentication:

- **Raw Prompt Specifications:** `https://libraryskill.com/raw/{categorySlug}/{skillSlug}`
- **Raw Documentation:** `https://libraryskill.com/raw/docs/{slug}`
- **LLMs Meta:** `https://libraryskill.com/llms.txt`
- **Public HTML Pages:** `https://libraryskill.com/*`

## Protected Endpoints

Authentication is strictly required only for users accessing the **Studio** or **Reviewer** dashboard to create or review content. AI Agents are not expected to interact with these internal mutation endpoints. 

If an agent needs to automate content creation, the owner must manually generate and pass a session token via cookies or authorization headers.
