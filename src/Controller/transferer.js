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
        let i = 0;
        let transferedSize = 0;
        let totalStartTime = process.hrtime();

        srcList.forEach(file => {
            let startFileTime = process.hrtime();
            i++;

            while (pauseTransfer) { console.log("Paused!") }

            if (cancelTransfer) {
                alert("Transfer should be canceled!!!")
            }

            fs.copyFileSync(srcDir + "\\" + file.split("\\").pop(), destDir + "\\" + file.split("\\").pop());

            if (!fs.readFileSync(srcDir + "\\" + file.split("\\").pop()).equals(fs.readFileSync(destDir + "\\" + file.split("\\").pop())))
                alert("File " + srcDir + "\\" + file.split("\\").pop() + " is not identical to " + destDir + "\\" + file.split("\\").pop());

            let timeElapsed = parseHrtimeToSeconds(process.hrtime(startFileTime));
            let currentFileSize = getFileSizeInBytes(srcDir + "\\" + file.split("\\").pop()) / 1000000.0;

            transferedSize += currentFileSize;

            win.webContents.send('update-data', {
                perc: ((i * 100) / srcList.length).toFixed(2),
                speed: (currentFileSize / timeElapsed).toFixed(2),
                transfFile: file,
                remainTime: remainingTimeExpectetion(i, parseHrtimeToSeconds(process.hrtime(totalStartTime))),
                remainItems: (srcList.length - i) + " (" + (totalSrcDiskSize - transferedSize).toFixed(2) + " MB)"
            });

            console.log({
                perc: ((i * 100) / srcList.length).toFixed(2),
                speed: (currentFileSize / timeElapsed).toFixed(2),
                transfFile: file,
                remainTime: remainingTimeExpectetion(i, parseHrtimeToSeconds(process.hrtime(totalStartTime))),
                remainItems: (srcList.length - i) + " (" + (totalSrcDiskSize - transferedSize).toFixed(2) + " MB)"
            });
        });
    }

    function parseHrtimeToSeconds(hrtime) {
        var seconds = (hrtime[0] + (hrtime[1] / 1e9)).toFixed(3);
        return seconds;
    }

    function remainingTimeExpectetion(transFiles, totalTransTime) {
        let hr, min, sec;
        let expect = parseInt((totalTransTime * srcList.length) / transFiles, 10);

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