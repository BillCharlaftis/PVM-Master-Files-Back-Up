let chartData = {
    labels:["0%"],
    datasets: [{
        data:[0],
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
    function addData(perc, speed, transfFile, remainTime, remainItems) {
        chart.data.labels.push(perc);
        chart.data.datasets[0].data.push(speed);
        chart.update();

        $("#TransferPerc").html(perc+"%");
        $(".transferPercentage").width(perc+"%");
        $("#currentSpeed").html(speed+"mb/s");
        $("#transfering-file").html(transfFile);
        $("#estimated-time").html(remainTime);
        $("#items-Remaining").html(remainItems);
        $("#currentSpeed").html(speed+"mb/s");

    }

    function removeData() {
        chart.data.labels.pop();
        chart.data.datasets[0].data.pop();
        chart.update();
    }
}