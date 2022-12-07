const express = require("express");
const app = express();
const cors = require("cors");
const fetch = require("node-fetch");
const dotenv = require("dotenv");
dotenv.config();

const apiKey = process.env.API_KEY || "";
const platformRoutingValue = "na1.api.riotgames.com";
const regionalRoutingValue = "americas.api.riotgames.com";

app.use(cors());
app.use(express.json());

app.get("/api/latestMatches", async (req, res) => {
    const summonerName = req.query.summoner;
    if (summonerName) {
        // Get the puuid
        const summonerApi = `https://${platformRoutingValue}/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${apiKey}`;
        let puuid = await fetch(summonerApi)
            .then(res => res.json())
            .then(res => res.puuid);

        if (!puuid) {
            res.status(400).send(`No summoner with name ${summonerName}`);
        } else {
            // Get the list of matches
            const matchesApi = `https://${regionalRoutingValue}/lol/match/v5/matches/by-puuid/${puuid}/ids?count=5&api_key=${apiKey}`;
            let matchesRes = await fetch(matchesApi)
                .then(res => res.json());

            // Get the info in each match
            const matchInfoList = [];
            for (const matchId of matchesRes) {
                const matchInfoApi = `https://${regionalRoutingValue}/lol/match/v5/matches/${matchId}?api_key=${apiKey}`;
                let matchInfoApiRes = await fetch(matchInfoApi)
                    .then(res => res.json())
                    .then(res => {
                        // Remove unecessary participants
                        return {
                            gameDuration: res.info.gameDuration,
                            participantInfo: res.info.participants.filter(participant => participant.puuid === puuid)[0]
                        }
                    })
                    .then(res => {
                        // Create the final JSON object
                        let participantInfo = res.participantInfo;
    
                        let itemsList = [
                            participantInfo.item0, 
                            participantInfo.item1, 
                            participantInfo.item2, 
                            participantInfo.item3, 
                            participantInfo.item4, 
                            participantInfo.item5, 
                            participantInfo.item6
                        ];
    
                        let spellsList = [
                            participantInfo.spell1Casts,
                            participantInfo.spell2Casts,
                            participantInfo.spell3Casts,
                            participantInfo.spell4Casts
                        ];
    
                        return {
                            outcome: participantInfo.win,
                            gameDuration: res.gameDuration,
                            summonerName: participantInfo.summonerName,
                            spells: spellsList,
                            championName: participantInfo.championName,
                            kills: participantInfo.kills,
                            deaths: participantInfo.deaths,
                            assists: participantInfo.assists,
                            items: itemsList,
                            championLevel: participantInfo.champLevel,
                            totalCreepScore: participantInfo.totalMinionsKilled
                        }
                    });
                
                matchInfoList.push(matchInfoApiRes);
            }
            res.json(matchInfoList);
        }
    } else {
        res.status(400).send("Summoner name required in query parameters");
    }
});

app.listen(5000, () => {
    console.log("Server has started on port 5000");
});