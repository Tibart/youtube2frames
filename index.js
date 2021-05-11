#!/usr/bin/env node

const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');

// Parse argv TODO: finetune
const argv = process.argv.splice(2);
const videoUrl = new URL(argv[0]);  //'https://www.youtube.com/watch?v=EBYsx1QWF9A'
const interval = argv[1];

// Get info about video
const GetVideoInfo = async (url) => {
    const res = await ytdl.getBasicInfo(url);
    let info = {
        title: res.videoDetails.title,
        lengthSeconds: res.videoDetails.lengthSeconds,
        formats: res.formats,
    };
    return info;
};

const GetFramePlan = async (interval, framesAmount) => {
    let result = [];
    for (let i = 1; i <= framesAmount; i++) {
        result.push(i * interval);      
    }
    return result;
};

const stuff = async (url, interval) => {
    const videoInfo = await GetVideoInfo(url);
    const framesAmount = Math.floor(videoInfo.lengthSeconds / interval);
    const framePlan = await GetFramePlan(interval, framesAmount);

    // Inform about task
    console.log(`Start taking screenshots for '${videoInfo.title}'`);
    process.stdout.write('>');

    // choose format TODO: format needs to be smarter
    const format = ytdl.chooseFormat(videoInfo.formats, { quality: '137' });

    // Create screenshots
    ffmpeg(format.url)
        .on('error', (err) => { 
            console.log('Somthing went wrong!', err.message);
            process.exit(); 
        })
        .on('progress', (progress) => { 
            process.stdout.write('-');
        })
        .on('end', () => { 
            process.stdout.write('>');
            console.log('\nDone!'); 
            process.exit(); 
        })
        .screenshots({ 
            folder: './frames', 
            filename: videoInfo.title + '_%0i.png', 
            timestamps: framePlan,
        });
}

const takeScreenshots = stuff(videoUrl.toString(), interval);

//console.log(process.argv, videoUrl, interval);
