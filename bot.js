const {Client} = require('discord.js');
const{TOKEN, PREFIX} = require('./config');
const ytdl = require('ytdl-core');
const weather = require('./src/weather.js');
const sun = require('./src/sun.js');
const steam = require('./src/steam.js');
const rl = require('./src/rocketleague.js');
const help = require('./src/help.js');
const YoutTube = require('simple-youtube-api');

const client = new Client({disableEveryone : true});

const youtube = new YoutTube('AIzaSyBDIbsYvy6MS3sxixKBMBpR3oFeqjYkenw');

client.on('warn', console.warn);

client.on('error', console.error);

client.on('ready', () => console.log('Ready'));

client.on('disconnect', () => console.log('Disconnecting'));

client.on('reconnecting', () => console.log('Reconnecting'));

client.on('message', async msg => {
    if(msg.author.bot) return undefined;
    if(!msg.content.startsWith(PREFIX)) return undefined;
    const args = msg.content.split(' ');
    const search = args.slice(1).join(' ');
    
    if(msg.content.startsWith(`${PREFIX}play`)){
        const voiceChannel = msg.member.voiceChannel;
        if(!voiceChannel) return msg.channel.send('Not in a voice channel');
        const permissions = voiceChannel.permissionsFor(msg.client.user);
        if(!permissions.has('CONNECT')){
            return msg.channel.send('Cannot connect to voice channel');
        }
        if(!permissions.has('SPEAK')){
            return msg.channel.send('I cannot speak in this voice channel');
        }

        try {
            const video = await youtube.getVideo(args[1]);
        } catch (error) {
            try {
                var videos = await youtube.searchVideos(search, 1);
                var video = await youtube.getVideoByID(videos[0].id);
            } catch (error) {
                console.error(error);
                return msg.channel.send('Cannot find video');
            }
        }
        const song = {
            id: video.id,
            title: video.title,
            url: `https://www.youtube.com/watch?v=${video.id}`
        };
        try {
            var connection = await voiceChannel.join();
        } catch (error) {
            console.error(error);
            msg.channel.send('Cannot join voice channel');
            return undefined;
        }

        const dispatcher = connection.playStream(ytdl(song.url))
            .on('end', () =>{
                console.log('Song ended!');
                voiceChannel.leave();
            })
            .on('error', error => {
                console.error(error);
            });
        dispatcher.setVolumeLogarithmic(5 / 5);
    } else if(msg.content.startsWith(`${PREFIX}stop`)){
        if(!msg.member.voiceChannel) return msg.channel.send('You are not in a voice channel!');
        msg.member.voiceChannel.leave();
        return undefined;
    } else if(msg.content.startsWith(`${PREFIX}weather`)){
        weather.getCoords(args[1], (coords) =>{
            weather.getTemp(coords, (weather) => {
                msg.channel.send(weather);
            });
        });
    } else if(msg.content.startsWith(`${PREFIX}day`)){
        sun.getCoords(args[1], (coords) => {
            sun.getDay(coords, (dayLength) =>{
                msg.channel.send(dayLength);
            });
        });
    } else if(msg.content.startsWith(`${PREFIX}steam`)){
        steam.getPlayer(args[1], args[2], (result) => {
            msg.channel.send(result);
        });
    } else if(msg.content.startsWith(`${PREFIX}rl`)){
        rl.getPlayer(args[1], args[2], (result) => {
            msg.channel.send(result);
        });
    } else if(msg.content.startsWith(`${PREFIX}help`)){
        msg.channel.send(help.help());
    } else if(msg.content.startsWith(`${PREFIX}roll`)){
        msg.channel.send(Math.round(Math.random() * args[1]));
    } else if(msg.content.startsWith(`${PREFIX}flip`)){
        var rand = Math.random();
        if(rand < 0.5) return msg.channel.send('Tails');
        else return msg.channel.send('Heads');
    } else if(msg.content.startsWith(`${PREFIX}bing`)){
        msg.channel.send("bong");
    }
});

client.login(TOKEN);