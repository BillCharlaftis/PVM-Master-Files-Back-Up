module.exports = (window) => {
    const ipc = require('electron').ipcMain
    const dialog = require('electron').dialog

    ipc.on('open-dir-dialog', function (event, causedBy) {
        console.log(causedBy);
        dialog.showOpenDialog(window, {
            properties: ['openDirectory']
        }).then((dir) => {
            if (!dir.canceled)
                event.sender.send('selected-dir', dir.filePaths[0], causedBy)
        });
    });
}