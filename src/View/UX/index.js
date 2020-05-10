$(document).ready(function () {
    const ipc = require('electron').ipcRenderer;

    let transferOptiond = {
        srcDir: null,
        createMasterCsv: true,
        destDir: null,
        keepDuplicateCsv: true
    }

    $("#execute").prop('disabled', true);

    $("#srcDir, #buDir").on('click', function (event) {
        ipc.send('open-dir-dialog', causedBy = event.target.id)
    });

    $("#execute").on('click', () => {

        ipc.send('init-Transfer', transferOptiond.srcDir, transferOptiond.destDir);

        window.location = "fileTransfer.html?srcDir="
            + transferOptiond.srcDir.split("\\").pop() + "&destDir="
            + transferOptiond.destDir.split("\\").pop() + "&MasterCsv="
            + transferOptiond.createMasterCsv + "&keepDuplicateCsv="
            + transferOptiond.keepDuplicateCsv;
    });

    //Getting back the information after selecting the file
    ipc.on('selected-dir', function (event, dir, causedBy) {
        $("#" + causedBy + "-Label").html(dir);
        switch ("" + causedBy) {
            case "srcDir":
                transferOptiond.srcDir = dir;
                break;
            case "buDir":
                transferOptiond.destDir = dir;
                break;
            default:
                alert("Something Went Wrong Error Code # 0001");
                break;
        }

        if (transferOptiond.srcDir != null && transferOptiond.destDir != null)
            $("#execute").prop('disabled', false);
    });



});