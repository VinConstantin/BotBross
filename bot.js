const {Client} = require('discord.js');
const{TOKEN, PREFIX, API_YOUTUBE} = require('./config');
const ytdl = require('ytdl-core');
const weather = require('./src/weather.js');
const sun = require('./src/sun.js');
const steam = require('./src/steam.js');
const rl = require('./src/rocketleague.js');
const help = require('./src/help.js');
const google = require('./src/googleCloud.js');
const YoutTube = require('simple-youtube-api');

const client = new Client({disableEveryone : true});

const queue = new Map();

const channels = new Map();

const bobQuotes = ['Happy little trees', 'Beat the devil', 'Happy accidents', 'Let\'s go crazy', 'Happy little clouds'];

const youtube = new YoutTube(API_YOUTUBE);

client.on('warn', console.warn);

client.on('error', console.error);

client.on('ready', () => console.log('Ready'));

client.on('disconnect', () => console.log('Disconnecting'));

client.on('reconnecting', () => console.log('Reconnecting'));

// Auto voiceChannel scaling
client.on('voiceStateUpdate', async (oldMember, newMember) => {
    if(newMember.voiceChannel != undefined){
        if(newMember.voiceChannel.parent.name == 'self-expanding'){
            const channelQueue = channels.get(newMember.voiceChannelID);
            if(!channelQueue){
                const channelConstruct = {
                    members: [],
                    name: bobQuotes[Math.floor(Math.random() * bobQuotes.length)]
                };
                channelConstruct.members.push(newMember.id);
                channels.set(newMember.voiceChannelID, channelConstruct);
                const channel = await newMember.guild.createChannel(channelConstruct.name, 'voice');
                channel.setParent(newMember.voiceChannel.parent);
            } else {
                channelQueue.members.push(newMember.id);
            }
        }
    }
    if(oldMember.voiceChannel == undefined) return undefined;
    if(oldMember.voiceChannel.parent.name == 'self-expanding'){
        const channelQueue = channels.get(oldMember.voiceChannelID);
        channelQueue.members.splice(channelQueue.members.indexOf(oldMember.voiceChannelID), 1);
        if(channelQueue.members.length == 0){
            oldMember.voiceChannel.delete('automatic deletion');
            channels.delete(oldMember.voiceChannelID);
        }
    }
});

// Message event
client.on('message', async msg => {
    if(msg.author.bot) return undefined;
    if(!msg.content.startsWith(PREFIX)) return undefined;
    const args = msg.content.split(' ');
    const search = args.slice(1).join(' ');
    const serverQueue = queue.get(msg.guild.id);
    
    // Play event 
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

        if(!serverQueue) {
            const queueConstruct = {
                textChannel: msg.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                volume: 5,
                playing: true
            };
            queue.set(msg.guild.id, queueConstruct);

            queueConstruct.songs.push(song);
            msg.channel.send(`**${song.title}** is now playing!`);

            try {
                var connection = await voiceChannel.join();
                queueConstruct.connection = connection;
                play(msg.guild, queueConstruct.songs[0]);
            } catch (error) {
                console.error(error);
                msg.channel.send('Cannot join voice channel');
                queue.delete(msg.guild.id);
                return undefined;
            }
        } else {
            serverQueue.songs.push(song);
            msg.channel.send(`**${song.title}** has been added to the queue!`);
        }
        return undefined;
    } else if(msg.content.startsWith(`${PREFIX}skip`)){
        if(!serverQueue) return msg.channel.send('Nothing to skip');
        serverQueue.connection.dispatcher.end();
        return undefined;
    } else if(msg.content.startsWith(`${PREFIX}stop`)){
        if(!msg.member.voiceChannel) return msg.channel.send('You are not in a voice channel!');
        msg.member.voiceChannel.leave();
        return undefined;
    } else if(msg.content.startsWith(`${PREFIX}list`)){
        const serverQueue = queue.get(msg.guild.id);
        if(serverQueue){
            if(serverQueue.songs[1]){
                console.log(serverQueue.songs.length);
                var result = '**Queue list**```';
                for(var i = 1; i < serverQueue.songs.length; i++){
                    result += i + '. ' + serverQueue.songs[i].title + '\n';
                }
                msg.channel.send(result + '```');
            } else {
                msg.channel.send("No queue!");
            }
        } else {
            msg.channel.send("No queue!");
        }
        return undefined;
    } else if(msg.content.startsWith(`${PREFIX}pause`)){
        if(serverQueue && serverQueue.playing){
            serverQueue.playing = false;
            serverQueue.connection.dispatcher.pause();
            return msg.channel.send('Music is paused!');
        }
        return msg.channel.send('No music playing!');
    } else if(msg.content.startsWith(`${PREFIX}resume`)){
        if(serverQueue && !serverQueue.playing){
            serverQueue.playing = true;
            serverQueue.connection.dispatcher.resume();
            return msg.channel.send('Music was resumed!');
        }
        return msg.channel.send('No music playing!');
    } else if(msg.content.startsWith(`${PREFIX}weather`)){
        weather.getCoords(args[1], (coords) =>{
            weather.getTemp(coords, (weather) => {
                msg.channel.send(weather);
            });
        });
        return undefined;
    } else if(msg.content.startsWith(`${PREFIX}day`)){
        sun.getCoords(args[1], (coords) => {
            sun.getDay(coords, (dayLength) =>{
                msg.channel.send(dayLength);
            });
        });
        return undefined;
    } else if(msg.content.startsWith(`${PREFIX}steam`)){
        steam.getPlayer(args[1], args[2], (result) => {
            msg.channel.send(result);
        });
        return undefined;
    } else if(msg.content.startsWith(`${PREFIX}rl`)){
        rl.getPlayer(args[1], args[2], (result) => {
            msg.channel.send(result);
        });
        return undefined;
    } else if(msg.content.startsWith(`${PREFIX}help`)){
        msg.channel.send(help.help());
        return undefined;
    } else if(msg.content.startsWith(`${PREFIX}roll`)){
        if(args[1] == undefined) args[1] = 10;
        msg.channel.send(Math.round(Math.random() * args[1]));
        return undefined;
    } else if(msg.content.startsWith(`${PREFIX}flip`)){
        var rand = Math.random();
        if(rand < 0.5) return msg.channel.send('Tails');
        else return msg.channel.send('Heads');
    } else if(msg.content.startsWith(`${PREFIX}bing`)){
        msg.channel.send("bong");
        return undefined;
    } else if(msg.content.startsWith(`${PREFIX}reee`)){
        msg.channel.send('REEEEEEEE', tts = true);
        return undefined;
    } else if(msg.content.startsWith(`${PREFIX}text`)){
        google.getText(args[1], (myMessage) => {
            msg.channel.send(myMessage);
        });
        return undefined;
    } else if(msg.content.startsWith(`${PREFIX}label`)){
        google.getLabel(args[1], (myMessage) => {
            msg.channel.send(myMessage);
        });
        return undefined;
    }
    return undefined;
});

function play(guild, song){
    const serverQueue = queue.get(guild.id);

    if(!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }
    const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
        .on('end', () =>{
            console.log('Song ended!');
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
        .on('error', error => console.error(error));
    dispatcher.setVolumeLogarithmic(5 / 5);
}

client.login(TOKEN);