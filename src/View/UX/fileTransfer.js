let MasterCsv = false;
let keepDuplicateCsv = false;
let srcFolder = "";

let chartData = {
    labels: ["0%"],
    datasets: [{
        data: [0],
        borderColor: "#5bc0de",
        backgroundColor: "#5f9ea0",
        pointRadius: 0,
    }]
};

let chart;
if ($("#chLine")) {
    chart = new Chart($("#chLine"), {
        type: 'line',
        data: chartData,
        options: {
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    display: false //this will remove all the x-axis grid lines
                }],
                yAxes: [{
                    display: false,
                    ticks: {
                        beginAtZero: true,
                        display: false //this will remove only the label
                    }
                }]
            },
            legend: {
                display: false
            },
            tooltips: {
                enabled: false
            }
        }
    });

    let currentItemNum = 0;
    function addData(updateTransferData, stats) {

        var i;
        for (i = 0; i < updateTransferData.length; i++) {
            chart.data.labels.push(updateTransferData[i].perc);
            chart.data.datasets[0].data.push(updateTransferData[i].speed);
        }
        chart.update();

        currentItemNum += i;

        $("#TransferPerc").html(stats.perc + "%");
        $(".transferPercentage").width(stats.perc + "%");
        $("#NumOfFiles").html(stats.totalItems);
        $("#currentSpeed").html(updateTransferData[updateTransferData.length - 1].speed + "mb/s");
        $("#transfering-file").html(stats.transfFile);
        $("#estimated-time").html(stats.remainTime);
        $("#items-Remaining").html(stats.remainSize);

        if (stats.remainSize === "0 (0.00 MB)")
            window.location = "index.html?srcDir=" + srcFolder;
    }

    init();
}

function init() {
    const ipcSender = require('electron').ipcRenderer;

    let searchParams = new URLSearchParams(window.location.search);
    srcFolder = searchParams.get('srcDir');
    $("#srcFolder").html(srcFolder.split("\\").pop());
    $("#destFolder").html(searchParams.get('destDir'));
    keepDuplicateCsv = searchParams.get('keepDuplicateCsv');
    MasterCsv = searchParams.get('MasterCsv');

    ipcSender.on('update-data', function (event, updateTransferData, stats) {
        addData(updateTransferData, stats);
    });

    ipcSender.send('start-Transfer');

}
