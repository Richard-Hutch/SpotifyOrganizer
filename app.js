const client_id = "45d081854dd645af9ace7d813d3f7ae4";
const redirect_uri = "http://127.0.0.1:5500/mainpage.html";
const scopes = "user-read-email user-read-private"
const authURL = "https://accounts.spotify.com/authorize" + 
    "?client_id=" + client_id + 
    "&response_type=token" + 
    "&redirect_uri=" + encodeURI(redirect_uri) + 
    "&show_dialog=true"  +
    "&scope=" + encodeURIComponent(scopes);
let userHash;
let accessToken;
let url = "";

//PARAMETERS
let SEARCH_ITEM = "&searchItem=";
let SEARCH_OPTION = "&searchOption=";

//on each page load, check if user is logged into spotify account. If not, have them log in
window.onload = function(){
    checkLoggedIn(1);
    checkParameters();
}


//check if user presses the enter key while the focused on the search bar
document.addEventListener("keyup", function(event){
    let element = document.getElementById("search-input");
    if (event.code === "Enter" && element === document.activeElement){
       search(element.value);
    }
});

function checkLoggedIn(order = 0){
    if (order === 1){
        if (!location.href.includes("halt")){
            //user does not have access token, meaning not logged in
            if (!location.href.includes("access_token=")){
                location.href = "/halt.html";
            }
        }
        //get access token
        if (window.location.hash){
            accessToken = window.location.hash.substring(14, window.location.hash.indexOf("&"));
        }
    }else {
        if (window.location.hash){
            return true;
        }else{ 
            return false;
        }
    }

}
function authorize(){
    window.location = authURL;
    //user denied login
    if (location.href.includes("error=access_denied")){
        location.href = "/halt.html";
    }else{
        console.log("true");
        timerActive = true;
    }
}

function logout(){
    location.href = "/halt.html"; //by changing url, userHash is lost
}

function checkParameters(){
    userHash = window.location.hash.substring(1); //cuts out the '#'
    //GET PARAMETERS OF HASH BY KEY AND VALUE 
    let params = {};
    userHash.split('&').map(key =>{
        let temp = key.split('=');
        params[temp[0]] = temp[1];
    })
    console.log(params);
    //check if a search is being made
    console.log(params.item);
    if (params.searchItem && params.searchOption){
        let val = decodeURI(params.searchItem);
        let option = params.searchOption;
        //document.getElementById("searching-for-id").innerText += " " + val.toUpperCase(); 
        document.getElementById("searching-for-query-id").innerText = val.toUpperCase();
        doSearch(val,option);
    }
}
/*
TO-DO: make sure that user does not include & or = in their search
*/
function search(){

    let key = document.getElementById("search-input").value;
    let option = document.getElementById("select-ID").value; //retrieve what criteria to search by
    window.location.assign("/result.html?" + window.location.hash + SEARCH_ITEM + key + SEARCH_OPTION + option);
    // document.getElementById("element-data-id").innerHTML = "hello";
}

function createHTML(dataMap){
    console.log(dataMap);
    const WRAPPER_DIV = document.createElement('div'); 
    const CONTAINER_DIV = document.createElement('div'); 
    const TRACK_ARROW_IMG_DIV = document.createElement('div'); 

    const IFRAME_ATR = document.createElement('iframe');
    const IMG_ATR = document.createElement('img');
    const BODY = document.querySelector('body');
    BODY.append(WRAPPER_DIV);
    WRAPPER_DIV.append(CONTAINER_DIV);
    CONTAINER_DIV.append(TRACK_ARROW_IMG_DIV);
    TRACK_ARROW_IMG_DIV.append(IMG_ATR);
        
    WRAPPER_DIV.setAttribute("class", "track-wrapper");
    CONTAINER_DIV.setAttribute("class", "track-card-container");
    console.log(dataMap.get("uri"));
    IFRAME_ATR.setAttribute("src", "https://open.spotify.com/embed/track/" + dataMap.get("uri"));
    IFRAME_ATR.setAttribute("width", "350");
    IFRAME_ATR.setAttribute("height", "80");
    IFRAME_ATR.setAttribute("frameborder", "0");
    IFRAME_ATR.setAttribute("allowtransparency", "true");
    IFRAME_ATR.setAttribute("allow", "encypted-media");
    IMG_ATR.setAttribute("src","resources/down-arrow2.svg");
    IMG_ATR.setAttribute("alt","down arrow svg");
    IMG_ATR.setAttribute("id","card-svg-id");
}
async function doSearch(val, option){
    let dataStr = null;

    if (val === ""){
        alert("Search is empty!");
    }else{
        //
        console.log("option = " + option);
        val = "\""+ val + "\"";
        console.log("searching for: " + val);
        let market = "&market=from_token";
        let type = "&type=track";
        let limit = "&limit=5";
        url = "https://api.spotify.com/v1/search?q=";
        //append track: to exclusively search track titles
        if (option === "SongStrict"){
            url += "track:";
        }else if (option === "Playlist"){
            type = "&type=playlist";
        }
        url += val + type + limit + market;
        dataStr = "Data not found";
        fetch(url, 
        {
            method: "GET",
            headers:{
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + accessToken
            }
        })
        .then((response)=>response.json())
        .then(function(data){

            //handle playlist searching
            if (option === "Playlist"){
                if (data.playlists.items[0] == null){
                    alert("No results found");
                }else{
                    console.log(JSON.stringify(data, null , 2));
                }
            }
            //handle track searching
            else{
                //no result from search found
                if (data.tracks.items[0] == null){
                    alert("No Result found");
                    callHomePg();
                }else{
                    
                    console.log(JSON.stringify(data, null , 2));
                    //for each item, get the name
                    data.tracks.items.forEach(function(key){
                        let dataMap = new Map();
                        //dataStr = key.name + ", by ";
                        //for each artist in the item get the name
                        let artists = "";
                        key.artists.forEach(function(key2){
                            artists += key2.name + ", ";
                            //dataStr += key2.name + ", ";
                        });
                        artists = artists.substr(0, artists.length - 2);
                        console.log("artists = " + artists);
                        //get the id of the track
                        //dataStr += " ID: " + key.id;
                        //console.log(dataStr);
                        dataMap.set("name", key.name);
                        dataMap.set("artists", artists);
                        dataMap.set("uri", key.uri.replace("spotify:track:", ""));
                        dataMap.set("id", key.id);
                        console.log("id = " + dataMap.get("id") + " " + key.id);
                        dataMap.set("popularity", key.popularity);
                        
                        //GET AUDIO FEATURES
                        let audioFeatureURL = "https://api.spotify.com/v1/audio-features/" + dataMap.get("id");
                        fetch(audioFeatureURL,{
                            method: "GET",
                            headers:{
                                "Accept": "application/json",
                                "Content-Type": "application/json",
                                "Authorization": "Bearer " + accessToken
                            }
                        })
                        .then(response => response.json())
                        .then(featureData => {
                            dataMap.set("danceability",     featureData.danceability);
                            dataMap.set("energy",           featureData.energy);
                            dataMap.set("key",              featureData.key);
                            dataMap.set("loudness",         featureData.loudness);
                            dataMap.set("speechiness",      featureData.speechiness);
                            dataMap.set("acousticness",     featureData.acousticness);
                            dataMap.set("instrumentalness", featureData.instrumentalness);
                            dataMap.set("liveness",         featureData.liveness);
                            dataMap.set("valence",          featureData.valence);
                            dataMap.set("tempo",            featureData.tempo);
                        })
                        .catch((error) => {
                            console.error('Error in feature request:', error);
                        });
                        //DYNAMICALLY CREATE TRACK ELEMENTS
                        //createHTML(dataMap);
                    });
                }
            }
        })
        .catch(function(error){
            if (error == "TypeError: Failed to fetch"){
                confirm("Error fetching data.");

            }else{
                confirm("Access Token Expired. Please login again.");
            }
            console.log("Error in track/playlist request: " + error);
        })
    }
    return dataStr;
}
function showTrackAnalysis(){
    let state = document.getElementById("info-card-id").className;
    if (state === "info-card-show"){
        document.getElementById("info-card-id").classList.remove("info-card-show");
        document.getElementById("info-card-id").classList.add("info-card-hide");
    }else{
        document.getElementById("info-card-id").classList.remove("info-card-hide");
        document.getElementById("info-card-id").classList.add("info-card-show");        
    }
}
//IMPORTANT! "parameter" must include the & and the = symbols
function removeHashParameter(parameter, hash){
    let ndx;
    let size = hash.length;

    //erase item search parameter
    if (ndx = hash.search(parameter)){
        for (let i = ndx + 6; i < size; i++){
            //there are more parameters so find where item value ends
            if (hash[i] === "&"){
                let strToDelete = hash.substring(ndx, i);
                hash = hash.replace(strToDelete, "");
                break;
            }
            else{
                //there are no further URL parameters
                if (i == size -1){
                    let strToDelete = hash.substr(ndx);
                    hash = hash.replace(strToDelete, "");
                }
            }
        }
    }
    //hash parameter not found
    if (ndx == -1) {
        confirm("Error: parameter not found");
    }
    return hash;
}
function callHomePg(){
    url = "http://127.0.0.1:5500/mainpage.html";
    userHash = window.location.hash;
    //hash exists
    if (userHash){
        userHash = removeHashParameter(SEARCH_ITEM, userHash);
        userHash = removeHashParameter(SEARCH_OPTION, userHash);
        url = url + "?" + userHash;
    }else{
        console.log("no token: " + userHash);
    }
    location.href = url;
}
async function userDetails(){
    fetch("https://api.spotify.com/v1/me", 
    {
        method: "GET",
        headers:{
            "Authorization": "Bearer " + accessToken
        }
    })
    .then(function(response){
        return response.json();
    })
    .then(function(result){
        console.log(result);
    })
    .catch(function(error){
        if (error == "TypeError: Failed to fetch"){
            confirm("Error fetching data.");
        }else{
            confirm("Access Token Expired. Please login again.");
        }
        console.log("Error: " + error);
    })
}
function menuDropDown(){
    let state = document.getElementById("menu-bars-id").className;
    let contentState = document.getElementById("menu-content-id").className;
    //menu is not showing, show
    if (state === "menu-bars-active"){
        //document.getElementById("menu-content-id").style.display = "inline-block";
        //page just loaded and we do not want to execute animation on content
        if (contentState === "menu-content-hide-first"){
            document.getElementById("menu-content-id").classList.remove("menu-content-hide-first");
        }else{
            document.getElementById("menu-content-id").classList.remove("menu-content-hide");    
        }
        document.getElementById("menu-content-id").classList.add("menu-content-show");
        document.getElementById("menu-bars-id").classList.remove("menu-bars-active");
        document.getElementById("menu-bars-id").classList.add("menu-bars-inactive");
    }

    //menu is showing, hide
    else if (state === "menu-bars-inactive"){
        //document.getElementById("menu-content-id").style.display = "none";
        document.getElementById("menu-content-id").classList.remove("menu-content-show");
        document.getElementById("menu-content-id").classList.add("menu-content-hide");
        document.getElementById("menu-bars-id").classList.remove("menu-bars-inactive");
        document.getElementById("menu-bars-id").classList.add("menu-bars-active");
    }
}