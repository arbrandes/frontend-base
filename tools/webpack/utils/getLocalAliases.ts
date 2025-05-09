import fs from 'fs';
import path from 'path';

/*
This function reads in a 'module.config.js' file if it exists and uses its contents to define
a set of webpack resolve.alias aliases for doing local development of application dependencies.
It reads the package.json file of the dependency to determine if it has any peer dependencies, and
then forces those peer dependencies to be resolved with the application's version.  Primarily, this
is useful for making sure there's only one version of those dependencies loaded at once, which is a
problem with both react and react-intl.

The module.config.js file should have the form:

{
  localModules: [
    { moduleName: 'nameOfPackage', dir: '../path/to/repo', dist: '/path/to/dist/in/repo' },
    ... others...
  ],
}

Some working examples, as of the time of this writing:

{ moduleName: '@openedx/paragon/scss', dir: '../paragon', dist: 'scss' }
{ moduleName: '@openedx/paragon', dir: '../paragon', dist: 'dist' }
{ moduleName: '@openedx/frontend-base', dir: '../frontend-base', dist: 'dist' }

*/
export default function getLocalAliases() {
  const aliases: Record<string, string> = {};

  try {
    const moduleConfigPath = path.resolve(process.cwd(), 'module.config.js');
    if (!fs.existsSync(moduleConfigPath)) {
      console.log('No local module configuration file found. This is fine.\n');
      return aliases;
    }

    const { localModules } = require(moduleConfigPath);

    let allPeerDependencies: string[] = [];
    const excludedPeerPackages: string[] = [];
    if (localModules.length > 0) {
      console.info('Resolving modules from local directories via module.config.js.');
    }
    localModules.forEach(({ moduleName, dir, dist = '' }: { moduleName: string, dir: string, dist?: string }) => {
      console.info(`Using local version of ${moduleName} from ${dir}/${dist}.`);

      const { peerDependencies = {}, name } = require(path.resolve(process.cwd(), dir, 'package.json'));
      allPeerDependencies = allPeerDependencies.concat(Object.keys(peerDependencies));
      aliases[moduleName] = path.resolve(process.cwd(), dir, dist);
      excludedPeerPackages.push(name);
    });

    allPeerDependencies = allPeerDependencies.filter((dep) => !excludedPeerPackages.includes(dep));

    allPeerDependencies.forEach((dep) => {
      aliases[dep] = path.resolve(process.cwd(), 'node_modules', dep);
    });
  } catch (e) {
    console.error(e);
    console.error('Error in module.config.js parsing. module.config.js will be ignored.');
    return {};
  }
  return aliases;
}
