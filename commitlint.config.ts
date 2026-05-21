import type { UserConfig } from '@commitlint/types';

/** Returns true for Dependabot and other automated dependency bump commits. */
function isAutomatedDependencyCommit(message: string) {
  const subject = message.split('\n')[0]?.trim() ?? message;

  return (
    subject.startsWith('chore(deps):') ||
    subject.startsWith('chore(deps-dev):') ||
    subject.startsWith('chore: bump') ||
    subject.startsWith('build(deps):') ||
    subject.startsWith('Updating') ||
    /dependabot/i.test(message)
  );
}

const Configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  ignores: [(message) => isAutomatedDependencyCommit(message)],
};

export default Configuration;
