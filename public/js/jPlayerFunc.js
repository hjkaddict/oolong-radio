$(document).ready(function () {

    var stream = {
        // mp3: "https://cloud.oolongradio.com:8443/oolong-rotation"
        mp3: "http://159.65.119.117:8000/oolong-rotation"
    },
        ready = false;

    $("#jquery_jplayer_1").jPlayer({
        ready: function (event) {
            ready = true;
            $(this).jPlayer("setMedia", stream);
        },
        pause: function () {
            $(this).jPlayer("clearMedia");
        },
        error: function (event) {
            if (ready && event.jPlayer.error.type === $.jPlayer.error.URL_NOT_SET) {
                // Setup the media stream again and play it.
                $(this).jPlayer("setMedia", stream).jPlayer("play");
            }
        },

        supplied: "mp3",
        preload: "metadata",

        waiting: function (event) {
            // console.log('start loading stream')
            $('.jp-pause').hide();
            $("#loading").fadeIn(1000);
        },
        playing: function (event) {
            //console.log('stream is successfully loaded')
            $('.jp-pause').show();
            $('#loading').hide();
        }
    });

    $("#jquery_jplayer_1").jPlayer("volume", 0.8);
    $(document).on('input', '#volumeSlider', function () {
        $("#jquery_jplayer_1").jPlayer("volume", $(this).val());
    });
});