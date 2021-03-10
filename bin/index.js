#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

import { program } from 'commander/esm.mjs';
import sharp from 'sharp';

program
    .usage('recursive-resize|recres [options]')
    .option('-i, --input <directory>','input directory to recursively resize')
    .option('-o, --output <directory>','output directory to place resized images/thumbnails')
    .requiredOption('-w, --width <pixels>','the new width for each image')
    .option('-t, --thumbnail <pixels>','if defined, the new width for each thumbnail')
    .option('-d, --debug','show extra output');
program.parse(process.argv);
const options = program.opts();

// Validate the options
if (!options.input && !options.output) {
    console.log('You must specify either an input or an output directory. For help, use recres -h');
    process.exit(0);
} else {
    if (!options.input) {
        options.input = path.join(process.cwd(),'/');
        console.log(`No input directory specified, using ${options.input}`);
    }
    if (!options.output) {
        options.output = path.join(process.cwd(),'/');
        console.log(`No output directory specifeid, using ${options.input}`);
    }
}

// Don't allow invalid numbers/entries
options.width = Number(options.width);
if (options.width <= 0) {
    console.log('Width must be greater than 0!');
    process.exit(0);
}
if (options.thumbnail) {
    options.thumbnail = Number(options.thumbnail);
    if (options.thumbnail <= 0) {
        console.log('Thumbnail width must be greater than 0!');
        process.exit(0);
    }
}

// Log that we're starting
options.input = path.resolve(options.input);
options.output = path.resolve(options.output);
console.log(`Recursively resizing all images from ${options.input} to ${options.output}, changing with to ${options.width}px.`);
if (options.thumbnail) {
    console.log(`Generating thumbnails with width of ${options.thumbnail}px.`);
}

// Crawl input directory
let totalImages = 0;
const imageArray = [];
function crawlDirectory(directory,branch) {
    let directoryTotal = 0;
    const dir = fs.opendirSync(directory);

    // Check if this directory exists in output, and if it doesn't, create it.
    if (!fs.existsSync(path.resolve(options.output,branch))) {
        fs.mkdirSync(path.resolve(options.output,branch));
    }

    let item = dir.readSync();
    console.group();
    while (item) {
        if (item.isDirectory()) {
            // Call recursively
            crawlDirectory(path.resolve(directory,item.name),branch+'/'+item.name);
        }

        if (item.isFile()) {
            // See if it matches our descriptions
            if (/.+((\.png)|(\.jpg)|(\.jpeg))/i.test(item.name)) {
                // Found an image
                directoryTotal++;
                totalImages++;
                imageArray.push({
                    fullsize: branch+'/'+item.name,
                    thumbnail: (options.thumbnail ? branch+'/tn-'+item.name : '')
                })
                if (options.debug) {
                    console.log(branch+'/'+item.name);
                }
            }
        }

        item = dir.readSync();
    }
    console.groupEnd();
    dir.closeSync();
    if (options.debug) {
        console.log(`Found ${directoryTotal} images in ${directory}`);
    }
}

// Actually do the crawling
let time = Date.now();
crawlDirectory(options.input,'.');
console.log(`Found a total of ${totalImages} images in ${Date.now()-time}ms.`);
console.log(`Resizing images...`);

// Set up for our loop
let progress = 0;
if (options.thumbnail) {
    // Twice as many images...
    totalImages *= 2;
}
time = Date.now();

// Ah, the big boi loop
for (let i = 0; i < imageArray.length; i++) {
    // Resize and rewrite each file
    sharp(path.resolve(options.input,imageArray[i].fullsize))
    .resize(options.width)
    .toFile(path.resolve(options.output,imageArray[i].fullsize))
    .then((value) => {
        progressed(imageArray[i].fullsize);
    })
    .catch((err) => {
        console.log(`Problem outputting ${imageArray[i].fullsize}!`);
        console.error(err);
        process.exit(1);
    });
    // Thumbnail?
    if (options.thumbnail) {
        sharp(path.resolve(options.input,imageArray[i].fullsize))
        .resize(options.thumbnail)
        .toFile(path.resolve(options.output,imageArray[i].thumbnail))
        .then((value) => {
            progressed(imageArray[i].thumbnail);
        })
        .catch((err) => {
            console.log(`Problem outputting thumbnail ${imageArray[i].thumbnail}!`);
            console.error(err);
            process.exit(1);
        });
    }
}

// Call when each image is loaded
function progressed(filename) {
    progress++;
    if (options.debug) {
        console.log(`${Math.trunc(progress/totalImages*100)}% - ${filename}`);
    }
    if (progress >= totalImages) {
        console.log(`Done! Output ${totalImages} images in ${Date.now()-time}ms.`);
        process.exit(0);
    }
}