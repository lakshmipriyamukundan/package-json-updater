import * as latestVersion from 'latest-version';
import readPackageJson = require('read-package-json');
import { Promise as bPromise } from 'bluebird';
// import * as path from 'path';
import * as fs from 'fs';

const readFilePromise = (fPath: string) => {
  return new bPromise((resolve, reject) => {
    readPackageJson(fPath, false, (err: any, data: any) => {
      if (err) {
        return reject(err);
      }

      return resolve(data);
    });
  });
};

export const updaterFun = async (pathToPackage: string, newPath: string) => {
  const packageJsonData: any = await readFilePromise(pathToPackage);

  const dependencies = bPromise.map(
    Object.keys(packageJsonData.dependencies),
    (pkg: any) => {
      return latestVersion(pkg).then(version => {
        const x: any = {};
        x[pkg.toString()] = '^' + version;
        return x;
      });
    },
  );

  const devDep = bPromise.map(
    Object.keys(packageJsonData.devDependencies),
    pkg => {
      return latestVersion(pkg).then(version => {
        const x: any = {};
        x[pkg.toString()] = '^' + version;
        return x;
      });
    },
  );

  const fullData = bPromise.resolve(packageJsonData);

  const results = await bPromise.all([dependencies, devDep, fullData]);

  const newPkg = results[0].reduce(
    (a, c) => ({ ...a, ...c }),
    Object.create(null),
  );
  const newDevPkg = results[1].reduce(
    (a, c) => ({ ...a, ...c }),
    Object.create(null),
  );

  results[2].dependencies = newPkg;
  results[2].devDependencies = newDevPkg;

  await new bPromise((resolve, reject) => {
    fs.writeFile(newPath, JSON.stringify(results[2]), err => {
      if (err) {
        // tslint:disable-next-line:no-console
        console.log('err', err);
        return reject(err);
      }
      // tslint:disable-next-line:no-console
      console.log('created', newPath);
      return resolve();
    });
  });
};
