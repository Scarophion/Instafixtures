import { useState } from 'react';
import $ from "jquery"

function Interface(props) {
    var dateString = props.settings.weekBeginning.toISOString().split('T')[0];

    return (
        <div id="interface">
            <div>
                <label htmlFor="dateWeekBeginning">Week beginning: </label><input id="dateWeekBeginning" type="date" min="2023-01-01" value={dateString} onChange={props.callbacks.onDateChanged} />
            </div>
            <div>
                <label htmlFor="txtgameWeek">Game week: </label><input id="txtgameWeek" value={props.settings.gameWeek} onChange={props.callbacks.onGameWeekChanged} />
            </div>
        </div>
    );
}

function AllBlocks({ settings, leagues, teams }) {
    return (
        <>
            <div className="wrapper">
                {leagues.map((league) => (
                    <InstaBlock key={league.leagueId} settings={settings} leagueId={league.leagueId} leagueName={league.leagueName} teams={teams} />
                ))}
            </div>
        </>
    );
}

function InstaBlock(props) {
    var games = GetGames(props);
    var containerClassName = games.length > 4 ? "container combinedDiv" : "container";
    return (
        <div className={containerClassName}>
            <h2>Game Week {props.settings.gameWeek}</h2>
            <h1>{props.leagueName}</h1>
            <GamesSection games={games} teams={props.teams} />
            <div className="footer">
                <img src="/images/logo_75x75.png" />
                <div><span>Manchester Softball League</span></div>
            </div>
        </div>
    );
}

function GamesSection(props) {
    return (
        <div className="results" >
            {props.games.map((game) => (
                <Game key={game.id} game={game} teams={props.teams} />
            ))}
        </div>
    );
}

function Game(props) {
    var homeTeam = props.teams.filter(
        function (data) { return data.ID == props.game.homeTeam }
    )[0];
    var awayTeam = props.teams.filter(
        function (data) { return data.ID == props.game.awayTeam }
    )[0];
    if (!awayTeam) {
        console.log(props.game.awayTeam);
    }
    if (!homeTeam) {
        console.log(props.game.homeTeam);
    }
    return (
        <div className="game">
            <div className="team"><img
                src={awayTeam && awayTeam.Logo || ""} />{awayTeam && awayTeam.Name || ""}
            </div>
            <div className="score">{props.game.awayScore} - {props.game.homeScore}</div>
            <div className="team"><img
                src={homeTeam && homeTeam.Logo || ""} />{homeTeam && homeTeam.Name || ""}</div>
        </div>
    );
}

function GetGames(props) {
    var response = [];
    var games = [];
    var aheadThreeDays = new Date(props.settings.weekBeginning);
    aheadThreeDays.setDate(props.settings.weekBeginning.getDate() + 3);

    $.ajax({
        url: "https://manchester-softball.co.uk/wp-json/sportspress/v2/events?orderby=date&order=desc&before=" + aheadThreeDays.toISOString() + "&after=" + props.settings.weekBeginning.toISOString() + "&leagues=" + props.leagueId,
        type: 'GET',
        dataType: 'json',
        async: false
    })
        .done(function (data) {
            response = data;
        })
        .fail(function () {
            console.log("error");
        });

    games = response.map(g => mapGame(g));

    return games;
}

function mapGame(game) {
    return { id: game.id, date: game.date, homeTeam: game.teams[0], awayTeam: game.teams[1], homeScore: game.main_results[0], awayScore: game.main_results[1] };
}

export default function WeeklyScores() {
    console.log("Loading...");
    const [leagues, setleagues] = useState([{ leagueId: 61, leagueName: "Division 1" }, { leagueId: 63, leagueName: "Division 2" }, { leagueId: "65,67,503", leagueName: "Combined Division 3 & 4" }]);
    //{ leagueId: 65, leagueName: "Division 3" }, { leagueId: 67, leagueName: "Division 4" }
    const [weekBeginning, setweekBeginning] = useState(new Date(2023, 4, 8));
    const [gameWeek, setGameWeek] = useState("1");
    let teams = require('./teams-map.json');

    function onDateChanged(e) {
        var dateString = e.target.value + "T09:00:00";
        var dateObj = new Date(dateString);
        setweekBeginning(dateObj);
    }

    function onGameWeekChanged(e) {
        setGameWeek(e.target.value);
    }

    var settings = { weekBeginning: weekBeginning, gameWeek: gameWeek };
    var callbacks = { onDateChanged: (e => onDateChanged(e)), onGameWeekChanged: (e => onGameWeekChanged(e))};

    return (
        <>
            <Interface settings={settings} callbacks={callbacks} />
            <AllBlocks leagues={leagues} settings={settings} teams={teams} />
        </>
    );
}