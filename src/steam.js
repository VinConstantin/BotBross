var unirest = require('unirest');
const {API_STEAM} = require('../config.js')

function getSteamID(vanityUrl, cb){
    if(vanityUrl != undefined && vanityUrl.length != 17){
        var req = unirest("GET", "https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key="+ API_STEAM +"&vanityurl="+vanityUrl);
        req.end(function(result){
            var string = JSON.parse(result.raw_body);
            cb(string.response.steamid);
        });
    } else if(vanityUrl != undefined && vanityUrl.length == 17){
        cb(vanityUrl);
    } else {
        cb();
    }
}

function getSteamPersona(steamId, cb){
    var req = unirest("GET", "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key="+ API_STEAM +"&steamids="+steamId);
    req.end(function(result){
        var string = JSON.parse(result.raw_body);
        cb(string.response.players[0].personaname);
    });
}

exports.getPlayer = function(parameter, parameter2, cb){
	getSteamID(parameter2, (steamid) => {
        if(steamid != undefined){
            getSteamPersona(steamid, (name) => {
                var req = unirest("GET", "http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key="+ API_STEAM +"&steamid="+steamid+"&format=json");
                req.end(function (result) {
                    var string = JSON.parse(result.raw_body);
                    if(string.response.total_count > 2){
                        if(parameter == "played"){
                            cb({
                                embed: {
                                    color: 0x0099ff,
                                    title: name,
                                    description: 'Top most played games',
                                    thumbnail: {
                                        url: 'http://media.steampowered.com/steamcommunity/public/images/apps/'+string.response.games[0].appid + '/'+ string.response.games[0].img_logo_url+'.jpg',
                                    },
                                    fields: [
                                        {
                                            name: '\u200b',
                                            value: '\u200b',
                                        },
                                        {
                                            name: string.response.games[0].name,
                                            value: 'Time played last 2 weeks: ' + Number(string.response.games[0].playtime_2weeks / 60).toFixed(2)
                                            + 'Hrs\nTime played forever: ' + Number(string.response.games[0].playtime_forever/60).toFixed(2) + 'Hrs\n\u200b',
                                        },
                                        {
                                            name: string.response.games[1].name,
                                            value: 'Time played last 2 weeks: ' + Number(string.response.games[1].playtime_2weeks / 60).toFixed(2)
                                            + 'Hrs\nTime played forever: ' + Number(string.response.games[1].playtime_forever/60).toFixed(2) + 'Hrs\n\u200b',
                                        },
                                        {
                                            name: string.response.games[2].name,
                                            value: 'Time played last 2 weeks: ' + Number(string.response.games[2].playtime_2weeks / 60).toFixed(2)
                                            + 'Hrs\nTime played forever: ' + Number(string.response.games[2].playtime_forever/60).toFixed(2) + 'Hrs\n\u200b',
                                        },
                                    ],
                                    timestamp: new Date(),
                                    footer: {
                                        text: 'Data  from steam',
                                    },
                                },
                            });
                        } else {
                            cb("Invalid entry");
                        }
                    } else {
                        cb("Invalid entry");
                    }
                });
            }); 
        } else {
            cb("Invalid entry");
        }
    });  
}