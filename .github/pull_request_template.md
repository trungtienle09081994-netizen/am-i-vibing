# Provider Update/Addition

## Description

Brief description of the AI tool provider being added or updated.

## Provider Details

**Tool Name**: <!-- e.g., "Claude Code", "Cursor Agent" -->  
**Provider ID**: <!-- e.g., "claude-code", "cursor-agent" -->  
**Type**: <!-- agent | interactive | hybrid -->  
**Detection Method**: <!-- environment variables | process checks | custom detectors -->

## Detection Configuration

### Environment Variables
<!-- List the environment variables used for detection -->
- [ ] String detection: `"ENV_VAR_NAME"`
- [ ] Tuple detection: `["ENV_VAR_NAME", "expected-value"]`
- [ ] Environment variable groups: `{ all: [...], any: [...], none: [...] }`

### Process Checks
<!-- If using process tree detection -->
- Process names: `"process-name"`

### Custom Detectors
<!-- If using custom detection logic -->
- [ ] Custom detector functions implemented
- [ ] Logic explanation: <!-- brief description -->

## Testing

### Environment Testing
- [ ] Tested in actual tool environment
- [ ] CLI detection works: `pnpm run cli`
- [ ] Debug output verified: `pnpm run cli --debug`

### Unit Testing
- [ ] Unit tests added to `test/detector.test.ts`
- [ ] Tests pass: `pnpm run test`
- [ ] False positive tests included

### Build & Type Check
- [ ] Build succeeds: `pnpm run build`
- [ ] Type check passes: `pnpm run check`

## Research & Verification

### Environment Variable Source
<!-- Where did you find information about these environment variables? -->
- [ ] Official documentation
- [ ] Tool source code
- [ ] Real environment testing
- [ ] Community/forum discussion
- Source link: <!-- URL if available -->

### Verification Method
<!-- How did you verify the detection works? -->
- [ ] Tested in live environment
- [ ] Reproduced detection conditions
- [ ] Verified with tool version: <!-- version number -->

## Changeset

- [ ] Changeset created: `pnpm changeset`
- [ ] Change type: `patch` | `minor` | `major`

## Checklist

### Provider Definition
- [ ] Added to `src/providers.ts`
- [ ] Follows naming conventions (`kebab-case` ID)
- [ ] Correct provider type assigned
- [ ] Detection method priority followed (env vars > process checks > custom detectors)

### Code Quality
- [ ] No hardcoded values in detection logic
- [ ] Proper TypeScript types used
- [ ] Follows existing code patterns
- [ ] No breaking changes (unless major version)

### Documentation
- [ ] Provider documented in code comments if complex
- [ ] Detection method explained if non-obvious
- [ ] Updated relevant documentation if needed

## Additional Notes

<!-- Any additional context, edge cases, or considerations -->

---

## For Maintainers

### Review Checklist
- [ ] Provider definition follows guidelines
- [ ] Detection method is appropriate and reliable
- [ ] Tests are comprehensive and pass
- [ ] No false positives in common environments
- [ ] Code follows project conventions
- [ ] Changeset is appropriate for the change