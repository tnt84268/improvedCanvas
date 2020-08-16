const { app, BrowserWindow, Notification, ipcMain } = require('electron')
const https = require('https');

function createWindow () {
// Create the browser window.
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {nodeIntegration: true}
    })
// Load html
    win.loadFile('index.html')
// Disable menu bar at top
    win.setMenu(null)
// dev tools for testing
    win.webContents.openDevTools()
}
// Create window after initialization
app.on('ready', () => {
    createWindow()

    //new Notification("testing", { body: "test" });
});

// TODO: add to settings file
global.token = "";
global.loggedIn = false;

// Request courses json
ipcMain.on("jsonData", (event, arg) => {
    // check if logged in because function is also called during login
    if (!global.loggedIn) {global.token=arg[1]; global.loggedIn=true;}
    requestCanvas(arg[0], function(json) {
        event.reply("jsonData", json);
    });
    
});

function requestCanvas(resource, callback) {
    // request canvas with the api location
    const url = "https://dublinusd.instructure.com/api/v1/"+resource+"?access_token="+global.token;
    https.get(url, (response) => {
        if (response.statusCode==200) {
            console.log("valid request");
            var data = "";
            // data comes in stream
            response.on("data", chunk => {
                data += chunk;
            });
            response.on("end", () => {
                // callback after request is finished
                callback(JSON.parse(data));
            });
        } else {
            console.log("Error "+response.statusCode);
        }
            
    });
  };

app.on("window-all-closed", () => {
    app.quit();
});
