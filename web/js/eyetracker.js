
"use strict";

// taken from the haar sample file and slightly modified to fit our needs:
// http://inspirit.github.io/jsfeat/sample_haar_face.html

var video = document.getElementById('webcam'),
    canvas = document.getElementById('canvas'),
    checkFound = function(){
        requestAnimationFrame(checkFound);

        if(found === true){
            document.getElementById('area').classList.add('found');
        }else{
            document.getElementById('area').classList.remove('found');
        }
    },
    t = null,
    widthLimit = 41,// sometimes the face gets detected so we set the pixel limit of the square here, the eyes should be smaller as the head
    found = false,
    options,
    ctx,
    canvasWidth,
    canvasHeight,
    img_u8,
    work_canvas,
    work_ctx,
    ii_sum,
    ii_sqsum,
    ii_tilted,
    edg,
    ii_canny,
    classifier = jsfeat.haar.eye,
    demo_opt = function(){
        this.min_scale = 1;
        this.scale_factor = 1.2;
        this.use_canny = false;
        this.edges_density = 0.43;
        this.equalize_histogram = true;
    },
    max_work_size = 160; // set the classifier here

requestAnimationFrame(checkFound);

try {
    compatibility.getUserMedia({video: true}, function(stream) {
        try {
            video.src = compatibility.URL.createObjectURL(stream);
        } catch (error) {
            video.src = stream;
        }
        setTimeout(function() {
            video.play();
            demo_app();

            compatibility.requestAnimationFrame(tick);
        }, 500);
    }, function (error) {
        alert("No webRTC found");
    });
} catch (error) {
    alert("Ohoh... error");
}

function demo_app() {
    canvasWidth  = canvas.width;
    canvasHeight = canvas.height;
    ctx = canvas.getContext('2d');

    ctx.fillStyle = "rgb(0,255,0)";
    ctx.strokeStyle = "rgb(0,255,0)";

    var scale = Math.min(max_work_size/video.videoWidth, max_work_size/video.videoHeight);
    var w = (video.videoWidth*scale)|0;
    var h = (video.videoHeight*scale)|0;

    img_u8 = new jsfeat.matrix_t(w, h, jsfeat.U8_t | jsfeat.C1_t);
    edg = new jsfeat.matrix_t(w, h, jsfeat.U8_t | jsfeat.C1_t);
    work_canvas = document.createElement('canvas');
    work_canvas.width = w;
    work_canvas.height = h;
    work_ctx = work_canvas.getContext('2d');
    ii_sum = new Int32Array((w+1)*(h+1));
    ii_sqsum = new Int32Array((w+1)*(h+1));
    ii_tilted = new Int32Array((w+1)*(h+1));
    ii_canny = new Int32Array((w+1)*(h+1));

    options = new demo_opt();
}

function tick() {
    compatibility.requestAnimationFrame(tick);

    if (video.readyState === video.HAVE_ENOUGH_DATA) {

        ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);

        work_ctx.drawImage(video, 0, 0, work_canvas.width, work_canvas.height);
        var imageData = work_ctx.getImageData(0, 0, work_canvas.width, work_canvas.height);

        jsfeat.imgproc.grayscale(imageData.data, img_u8.data);

        // possible options
        if(options.equalize_histogram) {
            jsfeat.imgproc.equalize_histogram(img_u8, img_u8);
        }

        jsfeat.imgproc.compute_integral_image(img_u8, ii_sum, ii_sqsum, classifier.tilted ? ii_tilted : null);

        if(options.use_canny) {
            jsfeat.imgproc.canny(img_u8, edg, 10, 50);
            jsfeat.imgproc.compute_integral_image(edg, ii_canny, null, null);
        }

        jsfeat.haar.edges_density = options.edges_density;
        var rects = jsfeat.haar.detect_multi_scale(ii_sum, ii_sqsum, ii_tilted, options.use_canny? ii_canny : null, img_u8.cols, img_u8.rows, classifier, options.scale_factor, options.min_scale);
        rects = jsfeat.haar.group_rectangles(rects, 1);

        // draw only most confident one
        draw_faces(ctx, rects, canvasWidth/img_u8.cols, 1);

    }
}

function draw_faces(ctx, rects, sc, max) {

    var on = rects.length,
        lastWidth = 40;

    if(on && max) {
        jsfeat.math.qsort(rects, 0, on-1, function(a,b){return (b.confidence<a.confidence);})
    }

    var n = max || on,
        r = null;

    n = Math.min(n, on);

    for(var i = 0; i < n; ++i) {
        r = rects[i];
        ctx.strokeRect((r.x*sc)|0,(r.y*sc)|0,(r.width*sc)|0,(r.height*sc)|0);
    }

    if(typeof r == 'object' && r !== null){
        lastWidth = r.width;
    }

    if(t == null){
        t = setTimeout(function(){
            if(n > 0 && lastWidth <= widthLimit){
                found = true;
            }else{
                found = false;
            }

            t = null;

        }, 200);
    }

}

$(window).unload(function() {
    video.pause();
    video.src=null;
});
