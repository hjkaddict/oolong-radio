$(document).ready(function () {
    $('.aboutNav ol li a').click(function() {
        $('.aboutContainer').css('display', 'flex');
    })

    $('#closeBtn').click(function() {
        $('.aboutContainer').css('display', 'none');
    })
})