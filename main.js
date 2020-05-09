const { app, BrowserWindow } = require('electron')
const folderChooser = require("./src/Controller/folderChooser.js");
const transferer = require("./src/Controller/transferer.js");

function initApp(){
  let win = createWindow();
  folderChooser(win);
  transferer(app);
}

function createWindow() {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 800,
    height: 520,
    resizable: false,
    backgroundColor: "#272b30",
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.toggleDevTools();
  // and load the index.html of the app.
  win.loadFile('./src/View/UI/index.html');
  win.setHasShadow(true);
  win.setMenu(null);

  return win;
}

app.whenReady().then(initApp)