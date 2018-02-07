var unirest = require('unirest');
const {API_RL} = require('../config.js');

exports.getPlayer = function(parameter, parameter2, cb){
    var req = unirest("GET", "https://api.rocketleaguestats.com/v1/player?unique_id="+parameter2+"&platform_id=1&apikey="+API_RL);
    req.end(function (result) {
        var string = JSON.parse(result.raw_body);
        var stats = new Array(6);
		if(parameter2 != null){
			if(string.code != null){
				cb("Invalid entry");
			}
			else {
				if(parameter == 'stats'){
					cb({
						embed: {
							color: 0x0099ff,
							title: string.displayName,
							description: 'Major stats for ' + string.displayName,
							thumbnail: {
								url: 'http://media.steampowered.com/steamcommunity/public/images/apps/252950/3854e40582bc14b8ba3c9ee163a0fa64bc538def.jpg',
							},
							fields: [
								{
									name: '\u200b',
									value: '\u200b',
								},
								{
									name: 'Goals',
									value: string.stats.goals,
									inline: true,
								},
								{
									name: 'Saves',
									value: string.stats.saves,
									inline: true,
								},
								{
									name: 'Wins',
									value: string.stats.wins,
									inline: true,
								},
								{
									name: 'MVPS',
									value: string.stats.mvps,
									inline: true,
								},
								{
									name: 'Shots',
									value: string.stats.shots,
									inline: true,
								},
								{
									name: 'Assists',
									value: string.stats.assists,
									inline: true,
								},
							],
							timestamp: new Date(),
							footer: {
								text: 'Data  from rocket league stats',
							},
						},
					});
				} else if(parameter == 'ranked'){
					var stats = new Array(4);
					stats[0] = string.rankedSeasons["6"]["10"].rankPoints;
					stats[1] = string.rankedSeasons["6"]["11"].rankPoints;
					stats[2] = string.rankedSeasons["6"]["12"].rankPoints;
					stats[3] = string.rankedSeasons["6"]["13"].rankPoints;
					stats[4] = string.displayName;
					cb({
						embed: {
							color: 0x0099ff,
							title: string.displayName,
							description: 'Major stats for ' + string.displayName,
							thumbnail: {
								url: 'http://media.steampowered.com/steamcommunity/public/images/apps/252950/3854e40582bc14b8ba3c9ee163a0fa64bc538def.jpg',
							},
							fields: [
								{
									name: '\u200b',
									value: '\u200b',
								},
								{
									name: 'Solo duel',
									value: string.rankedSeasons['6']['10'].rankPoints,
									inline: true,
								},
								{
									name: 'Doubles',
									value: string.rankedSeasons['6']['11'].rankPoints,
									inline: true,
								},
								{
									name: 'Solo standard',
									value: string.rankedSeasons['6']['12'].rankPoints,
									inline: true,
								},
								{
									name: 'Standard',
									value: string.rankedSeasons['6']['13'].rankPoints,
									inline: true,
								},
							],
							timestamp: new Date(),
							footer: {
								text: 'Data  from rocket league stats',
							},
						},
					});
				} else {
					cb("Choose a category");
				}
			}
		} else {
			cb("no id");
		}
    });  
}

