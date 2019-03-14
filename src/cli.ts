#!/usr/bin/env node

// import { argv } from 'yargs';
// tslint:disable-next-line:no-var-requires
import yargs = require('yargs');
import { updaterFun } from './updater';

if (!yargs.argv.src || !yargs.argv.dest) {
  // tslint:disable-next-line:no-console
  console.log('Please provide source and destination');
}
// tslint:disable-next-line:no-console
console.log(yargs.argv);
updaterFun(yargs.argv.src as string, yargs.argv.dest as string);
