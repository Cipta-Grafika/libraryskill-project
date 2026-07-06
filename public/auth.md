# Authentication Metadata (auth.md)

LibrarySkill is a public, open-access platform designed for LLMs, AI Agents, and humans. 

## Public Endpoints (No Authentication Required)
All AI agents can freely access the following resources without any authentication or registration:
- Raw Prompt Specifications: `https://libraryskill.com/raw/{categorySlug}/{skillSlug}`
- Raw Documentation: `https://libraryskill.com/raw/docs/{slug}`
- LLMs Meta: `https://libraryskill.com/llms.txt`
- Public HTML Pages: `https://libraryskill.com/*`

## Protected Endpoints (For Authors & Reviewers Only)
Authentication is only required for users accessing the Studio or Reviewer dashboard. AI Agents are not expected to access these internal mutation endpoints unless explicitly granted session tokens by their owners.

No automated agent registration (`register_uri`) is supported at this time.
