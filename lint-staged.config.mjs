/**
 * Supplies a project type check without appending staged filenames to TypeScript.
 * Takes no inputs; lint-staged's filename list is intentionally unused.
 * @returns The command to run while unstaged edits to partially staged files are hidden.
 */
function getTypecheckCommand() {
  return 'npm run typecheck';
}

export default {
  '*.{ts,tsx}': 'oxlint',
  '*': 'prettier --check --ignore-unknown',
  '**/*': getTypecheckCommand,
};
