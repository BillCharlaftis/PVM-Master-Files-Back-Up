const { app, BrowserWindow } = require('electron')

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

  // and load the index.html of the app.
  win.loadFile('./src/View/UI/index.html');
  win.setHasShadow(true);
  win.setMenu(null);
}

app.whenReady().then(createWindow)