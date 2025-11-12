### Demo 1: Instructions, Prompts, Modes
- [x] [01 Project Walkthrouhg](prompts/01-project-overview.md): Quick walkthrough of the project using Copilot + Running the FE/BE
- [x] [02 Instructions](prompts/02-generate-instructions.md): Generate copilot instructions for this project - using Copilot
- [x] [03 Prompts](prompts/11.1-api-security-review.prompt.md): use task-specific prompt to review the APIs for Security issues
- [x] 04 Chat Modes: Review several modes: [Plan](chatmodes/Plan.chatmode.md), [Debug](chatmodes/Debug.chatmode.md), [4.1-Beast](chatmodes/4.1-Beast-v3.1.chatmode.md)

### Demo 2: Code Review
- [x] [05 Code Review in VS Code](prompts/12-code-review-vs-code.md): review selection + review uncommited changes
- [x] [06 Code Review on GH](https://github.com/commit-ai/copilot-ts-workshop-two/pull/14): get copilot reviw on GH/CI

### Demo 3: Agent+MCP, Coding Agent
- [x] [07 Build MCP](prompts/04-create-superheroes-mcp.prompt.md): Create a Superheroes MCP to better understand the Superhero data schema
- [x] **08 GitHub MCP**: Create and list issues in GitHub using MCP (issue: add docs to App.js)
- [x] **09 Coding Agent**: #assign_copilot_to_issue / "Delegate" button - delegate to Coding Agent to work in the background
- [x] [10 Playwright Tests](prompts/08-adding-e2e-playwright-tests.md): Generate frontend Playwrite tests (as AI TDD)
- [x] [11 QA Playwright MCP + Chat Mode](prompts/09-a-playwright-mcp-with-chatmode-vsc.md): use Playwrite MCP to add edge cases

### Demo 4: Copilot in CLI & github.com
- [ ] 12 **GitHub CLI** - /help, choose model, mcp, agents
- [ ] 13 [Copilot in github.com](https://github.com/copilot) - create issues, tasks, ask, explain


**See below tips & best practices**

---

**Key Tips & Best Practices:**
- [ ] Context: Start a NEW session for every new task/topic!
- [ ] Customize: via instructions, prompts (all IDEs) + chatmodes (VS Code)
- [ ] Customize: Awesome prompts+MCPs repo at https://promptboost.dev
- [ ] Agent: Use (or build) MCPs where it makes sense
- [ ] Agent: Never "Accpet" until happy
- [ ] Agent: Restore Checkpoint
- [ ] Agent: TDD (Test Driven Dev) as Agent stop condition and feedback loop
- [ ] Agent: should run CLI commands to close feedback loop
- [ ] Coding Agent: delegate to a background agent in the cloud
- [ ] Models: Choosing the right models: https://docs.github.com/en/copilot/reference/ai-models/model-comparison
- [ ] Review: Use AI for reviewing code, not just generating it
- [ ] CLI: For a terminal-native experience