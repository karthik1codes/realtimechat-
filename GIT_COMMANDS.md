# Git Commands to Create a Pull Request

## Quick Steps

### 1. Check Current Status

```bash
# See what files have changed
git status

# See the changes
git diff
```

### 2. Create a New Branch (Recommended)

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or using newer git syntax
git switch -c feature/your-feature-name
```

**Example:**
```bash
git checkout -b feature/auto-login-persistence
```

### 3. Stage Your Changes

```bash
# Add all changed files
git add .

# Or add specific files
git add src/App.tsx src/components/ChatInterface.tsx
```

### 4. Commit Your Changes

```bash
git commit -m "Add automatic login persistence and message fetching"
```

**Good commit message format:**
```bash
git commit -m "feat: Add automatic login persistence and message fetching

- Persist username and room selection in localStorage
- Auto-load messages on page reload
- Add periodic message refresh every 30 seconds
- Add logout button to chat interface"
```

### 5. Push to Remote Repository

```bash
# Push your branch to remote (first time)
git push -u origin feature/your-feature-name

# Or if branch already exists
git push
```

### 6. Create Pull Request

#### Option A: Via GitHub Web Interface (Easiest)

1. Go to your repository on GitHub
2. You'll see a banner: "Compare & pull request"
3. Click it and fill in the PR details
4. Click "Create pull request"

#### Option B: Via GitHub CLI (if installed)

```bash
# Install GitHub CLI first: https://cli.github.com/
gh pr create --title "Add automatic login persistence" --body "Description of changes"
```

#### Option C: Via Git Command (opens browser)

```bash
# Open PR creation page in browser
gh pr create --web
```

---

## Complete Workflow Example

```bash
# 1. Check status
git status

# 2. Create feature branch
git checkout -b feature/auto-login-persistence

# 3. Stage changes
git add .

# 4. Commit
git commit -m "feat: Add automatic login persistence and message fetching"

# 5. Push to remote
git push -u origin feature/auto-login-persistence

# 6. Create PR (via GitHub web or CLI)
gh pr create --web
```

---

## Alternative: Direct Commit to Main (Not Recommended for PRs)

If you want to commit directly to main branch (not recommended for pull requests):

```bash
# Stage changes
git add .

# Commit
git commit -m "Your commit message"

# Push
git push origin main
```

---

## Useful Git Commands

```bash
# See commit history
git log --oneline

# See which branch you're on
git branch

# Switch branches
git checkout main
git checkout feature/your-branch

# Pull latest changes
git pull origin main

# Merge main into your branch (before creating PR)
git checkout feature/your-branch
git merge main
```

---

## Before Creating PR

Make sure to:

1. ✅ **Test your changes** - Make sure everything works
2. ✅ **Check for conflicts** - Pull latest main branch
3. ✅ **Write good commit message** - Clear description of changes
4. ✅ **Update documentation** - If you changed features

---

## Pull Request Best Practices

- **Clear title**: Describe what the PR does
- **Description**: Explain why and how
- **Small changes**: Keep PRs focused and small
- **Test before**: Make sure code works
- **Review yourself**: Check the diff before submitting

---

## Example PR Title and Description

**Title:**
```
feat: Add automatic login persistence and message fetching
```

**Description:**
```markdown
## Changes
- Added localStorage persistence for username and room selection
- Messages now auto-load on page reload
- Added periodic message refresh (every 30 seconds)
- Added logout button to chat interface

## Testing
- [x] Login persists after page reload
- [x] Room selection persists after page reload
- [x] Messages load automatically
- [x] Logout button works correctly

## Screenshots
(Add screenshots if UI changed)
```

