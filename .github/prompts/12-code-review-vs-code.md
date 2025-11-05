# VS Code Features

# Review Selection
Select the code you want to review, then:
- Right-click -> Generate Code - > Review

Let's review the newly added backend code compare API in /backend/server.ts

# Customized Review Selection Instructions
We can customize selection review using custom instructions - add reference to MD file in settings.json:
```json
{
  "github.copilot.chat.reviewSelection.instructions": [
    { "file": "guidance/backend-review-guidelines.md" },
    { "file": "guidance/frontend-review-guidelines.md" }
  ]
}
```

# Review Uncommitted Changes
In the Source Control View:
- Click "Code Review - Uncommitted Changes" (icon '< >')

NOTE: Available also in JetBrains!