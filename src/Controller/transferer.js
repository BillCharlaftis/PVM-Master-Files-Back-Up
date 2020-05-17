module.exports = (win) => {
    const ipc = require('electron').ipcMain;
    const fs = require('fs');

    let pauseTransfer = false;
    let cancelTransfer = false;
    let destDir = "";
    let srcDir = "";
    let srcList = [];
    let totalSrcDiskSize = 0;

    function init(src, dest) {
        pauseTransfer = false;
        cancelTransfer = false;
        destDir = dest;
        srcDir = src;
        [srcList, totalSrcDiskSize] = getDirContentsAndSize(src);

    }

    function getDirContentsAndSize(dir) {
        let files = fs.readdirSync(dir);
        let totalSize = 0;

        for (let i = 0; i < files.length; i++)
            totalSize += getFileSizeInBytes(dir + "\\" + files[i]);

        return [
            files,
            totalSize / 1000000.0
        ];

    }

    function getFileSizeInBytes(filename) {
        var stats = fs.statSync(filename);
        var fileSizeInBytes = stats["size"];
        return fileSizeInBytes
    }

    function transfer() {
        let transferedSize = 0;
        let totalStartTime = Date.now();
        let avgSpeed = 0;
        let remaingTransferDiskSize = 0;
        let upadteData = [];

        srcList.forEach(file => {
            let roundStartTime = Date.now();
            // console.log(roundStartTime);

            while (pauseTransfer) { console.log("Paused!") }

            if (cancelTransfer) {
                alert("Transfer should be canceled!!!")
            }

            fs.copyFile(srcDir + "\\" + file.split("\\").pop(), destDir + "\\" + file.split("\\").pop(), (roundTime = this.roundStartTime) => {

                console.log("Initial: "+totalStartTime+", outer round: "+roundStartTime+", inner round: "+roundTime+", now: "+ Date.now());

                if (!fs.readFileSync(srcDir + "\\" + file.split("\\").pop()).equals(fs.readFileSync(destDir + "\\" + file.split("\\").pop())))
                    alert("File " + srcDir + "\\" + file.split("\\").pop() + " is not identical to " + destDir + "\\" + file.split("\\").pop());

                let currentFileSize = getFileSizeInBytes(srcDir + "\\" + file.split("\\").pop()) / 1000000.0;

                transferedSize += currentFileSize;
                avgSpeed = (transferedSize / ((Date.now() - totalStartTime) / 1000)).toFixed(2);
                remaingTransferDiskSize = totalSrcDiskSize - transferedSize;

                upadteData.push({
                    speed: (currentFileSize / ((Date.now() - roundStartTime) / 1000)).toFixed(2),
                    transfFile: file,
                    remainTime: remainingTimeExpectetion(remaingTransferDiskSize, avgSpeed),
                    remainSize: " (" + remaingTransferDiskSize.toFixed(2) + " MB)"
                });

                if (upadteData.length == 1 || i == 1 || i == srcList.length) {
                    win.webContents.send('update-data', upadteData, srcList.length);

                    upadteData = [];
                }
            });
        });
    }

    function remainingTimeExpectetion(remaingTransferDiskSize, avgSpeed) {
        let hr, min, sec;
        let expect = parseInt(remaingTransferDiskSize / avgSpeed, 10);

        hr = Math.floor(expect / 3600);
        min = Math.floor(expect / 60) % 60;
        sec = expect % 60;

        return [hr, min, sec]
            .map(v => v < 10 ? "0" + v : v)
            .filter((v, i) => v !== "00" || i > 0)
            .join(":");
    }

    ipc.on('transfer-interapt', function (event, causedBy) {
        if (causedBy === "PauseTransfer")
            pauseTransfer = !pauseTransfer;
        else
            cancelTransfer = true;
    });

    ipc.on('init-Transfer', (event, src, dest) => init(src, dest));
    ipc.on('start-Transfer', (event) => transfer());
}