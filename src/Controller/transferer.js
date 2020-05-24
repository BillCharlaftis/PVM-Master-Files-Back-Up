module.exports = (win) => {
    const ipc = require('electron').ipcMain;
    const fs = require('fs');

    let destDir = "";
    let srcDir = "";
    let srcList = [];
    let totalSrcDiskSize = 0;
    let Cancel = false;

    function init(src, dest) {
        destDir = dest;
        srcDir = src;
        Cancel = false;
        transferedSize = 0;
        totalStartTime = Date.now();
        avgSpeed = 0;
        remaingTransferDiskSize = 0;
        [srcList, totalSrcDiskSize] = getDirContentsAndSize(src);
        fullSize = srcList.length;
        howManyAreDone = 0;
        fileCopyStartData = [];
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

    let transferedSize = 0;
    let totalStartTime = 0;
    let avgSpeed = 0;
    let remaingTransferDiskSize = 0;
    let fullSize = 0;
    let howManyAreDone = 0;
    let fileCopyStartData = [];

    function transfer() {
        let upperLimit = srcList.length > 5 ? 5 : srcList.length;
        let upadteData = [];

        for (let i = 0; i < upperLimit; i++) {
            file = srcList[0];
            fileCopyStartData.push({ srcFile: file, startAt: Date.now() });

            if (fs.existsSync(destDir + "\\" + file.split("\\").pop())) {
                if (fs.readFileSync((srcDir + "\\" + file.split("\\").pop()).equals((fs.readFileSync((destDir + "\\" + file.split("\\").pop()))))))
                    continue;
                else
                    throw new Error('One');
                     
            }

            fs.copyFile(srcDir + "\\" + file.split("\\").pop(), destDir + "\\" + file.split("\\").pop(), () => {
                let args = fileCopyStartData[howManyAreDone];
                howManyAreDone += 1;
                let currentFileSize = getFileSizeInBytes(srcDir + "\\" + args.srcFile.split("\\").pop()) / 1000000.0;

                transferedSize += currentFileSize;
                avgSpeed = (transferedSize / ((Date.now() - totalStartTime) / 1000)).toFixed(2);
                remaingTransferDiskSize = totalSrcDiskSize - transferedSize;

                upadteData.push({
                    speed: (currentFileSize / ((Date.now() - args.startAt) / 1000)).toFixed(2)
                });

                if (upadteData.length == 5 || i == 0) {

                    let currentLength = howManyAreDone;

                    let generalStats = {
                        totalItems: fullSize,
                        perc: ((currentLength * 100) / fullSize).toFixed(2),
                        transfFile: args.srcFile,
                        remainTime: remainingTimeExpectetion(remaingTransferDiskSize, (currentFileSize / ((Date.now() - args.startAt) / 1000)).toFixed(2)),
                        remainSize: (fullSize - currentLength) + " (" + remaingTransferDiskSize.toFixed(2) + " MB)"
                    };

                    console.log(upadteData);
                    console.log(generalStats);
                    console.log("____________________");

                    win.webContents.send('update-data', upadteData, generalStats);
                    if (fullSize >= currentLength) {
                        transfer();
                    }
                }
            });
            srcList.splice(0, 1);
        }
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

    ipc.on('init-Transfer', (event, src, dest) => init(src, dest));
    ipc.on('start-Transfer', (event) => transfer());

}