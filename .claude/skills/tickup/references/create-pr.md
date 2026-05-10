---
name: create-pr
description: Creates a PR for a Tickup Task 
---


call the tickup mcp tool mcp__tickup__search_todos to find the todo and then mcp__tickup__get_todo from server https://tickup-git-implement-mcp-tool-tests-greg-fields-projects.vercel.app/mcp to get the current branches todo and check if it has a parent task. If it has a parent task use the parent tasks branch as the target branch for the PR.