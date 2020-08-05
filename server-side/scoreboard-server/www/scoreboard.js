var fetchedTeams = 0;
var FETCH_INCREMENT = 15; // temporarily lowered for testing, will be between 100 and 200
var competition = null;
var division = null;

// send them to a team page #*

// data for when a value for competition is entered 
//     to update divisions dropdown
var organization = {
    "Something went wrong. Refresh your browser." : ["Something went wrong. Refresh your browser."]
};

// grab the current competition info
var compFetch = new XMLHttpRequest();
compFetch.open('GET', window.location.href + "/comps");
compFetch.onload = () => {
    organization = JSON.parse(compFetch.responseText);
};
compFetch.send(null);

var scoreboardHeader = '<thead>' 
    + '<th>Team ID</th>' 
    + '<th>Competition</th>' 
    + '<th>Division</th>' 
    + '<th>Play Time</th>' 
    + '<th>Score</th>' 
    + '<th>Warning(s)</th>' 
    + '</thead>';


window.addEventListener('load', (event) => {
    // toggle showing search for competitions 
    var compDropdown = document.getElementById("compDropdown");
    var compButton = document.getElementById("compButton");
    if (compDropdown && compButton) {
        compButton.addEventListener('click', (event) => {
            if (compDropdown.style.display === 'none') {
                compDropdown.style.display = "block";
                compDropdown.getElementsByTagName('input')[0].focus();
            } else {
                compDropdown.style.display = "none";
            }
        });
        compDropdown.style.display = 'none';
    }

    // toggle showing search for divisions 
    var divDropdown = document.getElementById("divDropdown");
    var divButton = document.getElementById("divButton");
    if (divDropdown && divButton) {
        divButton.addEventListener('click', (event) => {
            if (divDropdown.style.display === 'none') {
                divDropdown.style.display = 'block';
                divDropdown.getElementsByTagName('input')[0].focus();
            } else {
                divDropdown.style.display = 'none';
            }
        });
        divDropdown.style.display = 'none';
    }

    // load `increment` teams to the list when the page loads #*
    refreshTeams(FETCH_INCREMENT);


    if (compDropdown) {
        compDropdown.addEventListener('input', (event) => {
            var input = compDropdown.getElementsByTagName('input')[0].value;
            if (input in organization) {
                // update the choices in divisions search when competitions search has a valid choice
                var list = organization[input];
                var cont = '';
                // build list of divisions in entered competition
                for (i = 0; i < list.length; i++) {
                    cont += '<option value="' + list[i] + '">\n'
                }
                divDropdown.getElementsByTagName('datalist')[0].innerHTML = cont;
                divDropdown.getElementsByTagName('input')[0].placeholder = "Search";

                // refresh list of teams upon entry of a valid competition
                refreshTeams(FETCH_INCREMENT);
            } else {
                if (divDropdown) {
                    divDropdown.getElementsByTagName('input')[0].placeholder = "Choose a valid Competition";
                    divDropdown.getElementsByTagName('datalist')[0].innerHTML = '';
                }
            }
        });
        if (divDropdown) {
            divDropdown.addEventListener('input', (event) => {
                // refresh list of teams upon entry of a valid combination of competition and division
                var comp = compDropdown.getElementsByTagName('input')[0].value;
                if ( (comp in organization) && (divDropdown.getElementsByTagName('input'[0]) in organization[comp]) ) {
                    refreshTeams(FETCH_INCREMENT);
                }
            });
        }
    }
});

// load more teams when they scroll to the bottom
window.addEventListener('scroll', (event) => {
    var scoreboard = document.getElementsByTagName('table')[0];
    if (scoreboard) {
        // check if they've reached the bottom and load more teams
        if ( (window.scrollY + window.innerHeight) >= document.body.offsetHeight ) {
            scoreboard.innerHTML+= loadTeams(FETCH_INCREMENT);
        }
    }
});

function loadTeams(amount) {
    var fetch = new XMLHttpRequest();
    fetch.open('POST', window.location.href + '/teams?competition=' + competition + '&division=' + division, false); 
    fetch.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    fetch.onload = () => {
        if(this.status == 200) {
            content = JSON.parse(fetch.responseText);
            table = '';
            // build table with teams
            for (team of content) {
                playtime = team.endTime - team.startTime;  // make sure these are date objects #* 
                table += '<tr>' +
                    '<td>' + team.num + '</td>' +
                    '<td>' + team.competition + '</td>' +
                    '<td>' + team.division + '</td>' +
                    '<td>' + playtime.getHours() + ':' + playtime.getMinutes() + '</td>' +
                    '<td>' + team.score + '</td>' +
                    '<td>' + team.warnings + '</td>' +
                    '</tr>';
            }
            return table;
        }
    };

    fetch.send("loaded=" + fetchedTeams + "&increment=" + amount);
    fetchedTeams += amount;
}

// reset the table of teams and load a new set of `initCount` teams
function refreshTeams(initCount) {
    var scoreboard = document.getElementsByTagName('table')[0];
    scoreboard.innerHTML = scoreboardHeader;
    fetchedTeams = 0;
    scoreboard.innerHTML += loadTeams(initCount);
}