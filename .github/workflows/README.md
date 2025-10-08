# Upstream Sync Workflow

This workflow keeps the fork synchronized with the upstream repository `ohcnetwork/care_fe`.

## How it works

The workflow automatically:
1. Fetches changes from the upstream repository (ohcnetwork/care_fe)
2. Merges upstream changes into the fork's branches
3. Pushes the updated branches back to the fork

## Branches synchronized

- **develop** (primary branch): Always synced
- **staging** (if exists): Synced if present in both upstream and fork

## Schedule

The workflow runs:
- **Daily at 00:00 UTC** (automatic)
- **On demand** via manual trigger (workflow_dispatch)

## Manual trigger

To manually trigger the sync:

1. Go to the [Actions tab](../../actions/workflows/sync-upstream.yml)
2. Click "Run workflow"
3. Select the branch (usually `develop` or `staging`)
4. Click the green "Run workflow" button

## What happens during sync

1. **Checkout**: Clones the repository with full history
2. **Configure Git**: Sets up git user for commits
3. **Add Upstream**: Adds ohcnetwork/care_fe as upstream remote
4. **Fetch**: Downloads latest changes from upstream and origin
5. **Merge**: Merges upstream changes into the corresponding branch
6. **Push**: Pushes merged changes back to the fork

## Conflict resolution

If merge conflicts occur:
- The workflow will fail and create a notification
- Conflicts must be resolved manually by:
  1. Cloning the repository locally
  2. Running `git fetch upstream`
  3. Running `git merge upstream/develop` (or the appropriate branch)
  4. Resolving conflicts
  5. Committing and pushing the resolution

## Monitoring

Check the workflow status at: [Actions → Sync Fork with Upstream](../../actions/workflows/sync-upstream.yml)

## Technical details

- **Workflow file**: `.github/workflows/sync-upstream.yml`
- **Runner**: ubuntu-latest
- **Permissions**: Uses GITHUB_TOKEN with write access
- **Upstream repository**: https://github.com/ohcnetwork/care_fe.git
