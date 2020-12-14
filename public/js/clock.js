function clock() {
    var berlin = moment.tz("Europe/Berlin").format('ll, HH:mm:ss')
    $('#clock').html(berlin + ' Berlin')

    setTimeout( clock, 1000 );
}

$(document).ready(function () {
    clock();
});
