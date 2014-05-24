jQuery(function($){
    "use strict";

    var videoCamera = new tracking.VideoCamera({
            onNotFound: function(track){
                found = false;
                console.log("not found")
            }
        }).hide().render().renderVideoCanvas(),
        ctx = videoCamera.canvas.context,
        found = false,
        checkFound = function(){
            requestAnimationFrame(checkFound);

            if(found === true){
                document.querySelector('.alert.alert-success').style.display = 'block';
                document.querySelector('.alert.alert-danger').style.display = 'none';
            }else{
                document.querySelector('.alert.alert-success').style.display = 'none';
                document.querySelector('.alert.alert-danger').style.display = 'block';
            }
        };

    requestAnimationFrame(checkFound);

    var t = null;

    videoCamera.track({
        type: 'human',
        data: 'eye',
        onFound: function(track) {
            var len = track.length;

            if(t == null){
                t = setTimeout(function(){
                    if(len > 0){
                        found = true;
                    }else{
                        found = false;
                    }

                    t = null;
                }, 1000);
            }
        }

    });


});