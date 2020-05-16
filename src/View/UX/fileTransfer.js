let MasterCsv = false;
let keepDuplicateCsv = false;

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
    function addData(updateTransferData, totalItems) {

        var i;
        for (i = 0; i < updateTransferData.length; i++) {
            chart.data.labels.push(updateTransferData[i].perc);
            chart.data.datasets[0].data.push(updateTransferData[i].speed);

        }
        chart.data.datasets[0].data.sort((a, b) => a.order - b.order);
        chart.update();

        currentItemNum += i;
        i -= 1;

        var perc = ((currentItemNum * 100) / totalItems).toFixed(2)

        $("#NumOfFiles").html(totalItems);
        $("#TransferPerc").html(perc + "%");
        $(".transferPercentage").width(perc + "%");
        $("#currentSpeed").html(updateTransferData[i].speed + "mb/s");
        $("#transfering-file").html(updateTransferData[i].transfFile);
        $("#estimated-time").html(updateTransferData[i].remainTime);
        $("#items-Remaining").html((totalItems-currentItemNum)+" "+updateTransferData[i].remainSize);
        $("#currentSpeed").html(updateTransferData[i].speed + "mb/s");

    }

    init();
}

function init() {
    const ipcSender = require('electron').ipcRenderer;

    let searchParams = new URLSearchParams(window.location.search);
    $("#srcFolder").html(searchParams.get('srcDir'));
    $("#destFolder").html(searchParams.get('destDir'));
    keepDuplicateCsv = searchParams.get('keepDuplicateCsv');
    MasterCsv = searchParams.get('MasterCsv');

    $("#PauseTransfer, #CancelTransfer").on('click', function (event) {
        console.log(event.target.id + "   clicked!!!");
        ipcSender.send('transfer-interapt', causedBy = event.target.id)
    });

    ipcSender.on('update-data', function (event, updateTransferData, totalItems) {
        addData(updateTransferData, totalItems);
    });

    ipcSender.send('start-Transfer');

}
