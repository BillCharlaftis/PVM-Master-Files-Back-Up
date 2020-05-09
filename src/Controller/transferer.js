module.exports = (app) => {
    const ipc = require('electron').ipcMain;
    const fs = require('fs');

    let pauseTransfer = false;
    let cancelTransfer = false;
    let destDir = "";
    let surcDir = "";
    let srcList = [];
    let totalSrcDiskSize = 0;

    function reset(src, dest) {
        pauseTransfer = false;
        cancelTransfer = false;
        destDir = src;
        surcDir = dest;
        srcList = getDirContent(src);
        totalSrcDiskSize += (srcList.forEach(file => {
            return getFileSizeInBytes(file);
        }) / 1000000.0);
    }

    function getDirContent(dir) {
        fs.readdir(dir, (err, files) => {
            console.log(files);
            return files;
        });
    }

    function getFileSizeInBytes(filename) {
        var stats = fs.statSync(filename)
        var fileSizeInBytes = stats["size"]
        return fileSizeInBytes
    }
    $("#estimated-time").html(updateTransferData.remainTime);
    $("#items-Remaining").html(updateTransferData.remainItems);

    function transfer() {
        let i = 0;
        let transferedSize = 0;

        srcList.forEach(file => {
            let startFileTime = Date.now();
            fs.copyFile(file, destDir + "\\" + file.split("\\").pop(), (err) => {
                i++;
                if (err) throw err;
                let currentFileSize = getFileSizeInBytes(file) / 1000000.0;
                totalSrcDiskSize -= currentFileSize;
                transferedSize += currentFileSize;
                ipc.send('update-data', {
                    perc: ((i * 100) / srcList.size),
                    speed: (totalSrcDiskSize - transferedSize) / (startFileTime -Date.now()),
                    transfFile: file,
                    remainTime:" n/a yet",
                    remainItems: (srcList - i)+" ("+(totalSrcDiskSize - transferedSize)+" MB)"
                });
            });
        });
    }

    ipc.on('transfer-interapt', function (event, causedBy) {
        console.log(causedBy + "  clicked!");

        if (causedBy === "PauseTransfer")
            pauseTransfer = true;
        else
            cancelTransfer = true;

    });
}