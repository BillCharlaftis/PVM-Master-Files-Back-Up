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

    //addData(10, 100, "example.mp4", "0hr 2min 24sec","10 (128MB)")
    function addData(updateTransferData) {
        chart.data.labels.push(updateTransferData.perc);
        chart.data.datasets[0].data.push(updateTransferData.speed);
        chart.update();

        $("#TransferPerc").html(updateTransferData.perc + "%");
        $(".transferPercentage").width(updateTransferData.perc + "%");
        $("#currentSpeed").html(updateTransferData.speed + "mb/s");
        $("#transfering-file").html(updateTransferData.transfFile);
        $("#estimated-time").html(updateTransferData.remainTime);
        $("#items-Remaining").html(updateTransferData.remainItems);
        $("#currentSpeed").html(updateTransferData.speed + "mb/s");

    }

    function removeData() {
        chart.data.labels.pop();
        chart.data.datasets[0].data.pop();
        chart.update();
    }
    init();
}

function init() {
    const ipc = require('electron').ipcRenderer;

    let searchParams = new URLSearchParams(window.location.search);
    $("#srcFolder").html(searchParams.get('srcDir'));
    $("#destFolder").html(searchParams.get('destDir'));
    keepDuplicateCsv = searchParams.get('keepDuplicateCsv');
    MasterCsv = searchParams.get('MasterCsv');

    $("#PauseTransfer, #CancelTransfer").on('click', function (event) {
        console.log(event.target.id+"   clicked!!!");
        ipc.send('transfer-interapt', causedBy = event.target.id)
    });

    ipc.on('update-data', function (event, updateTransferData) {
        addData(updateTransferData);
    });

}
