$( document ).ready( function() {



    $( 'body' ).on( 'click', '#start-game', function() {
        $( '#start-screen' ).fadeOut( function() {
            $( '#counter').fadeIn();

            var counter = 6;
            var beep = new Audio('mp3/beep-02.mp3');
            id = setInterval(function() {
                counter--;

                beep.play();

                if(counter < 0) {

                    $( '#counter').fadeOut();

                    gameStatus = 'started';
                    ghostActive.traverse( function ( object ) {
                        object.visible = true;
                    });

                    timeout_init();

                    gameMelody.play();

                    clearInterval(id);
                } else {
                    console.log( counter );
                    $( '#counter p').html( counter );
                }
            }, 1000);

        } );
        gameStatus = 'countdown';

    });

});


    var endSound = new Audio('mp3/123222.mp3');
    endSound.addEventListener('ended', function() {
        this.pause();
        this.currentTime = 0;

    }, false);
    var ended = false;

    var gameMelody = new Audio('mp3/8a639f61775a7a66f76675e0df743429.mp3');
    gameMelody.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    }, false);

    var points = 0;
    var timeout;

    function timeout_trigger() {
        points++;
        timeout = setTimeout('timeout_trigger()', 1);
    }

    function timeout_clear() {
        clearTimeout(timeout);
    }

    function timeout_init() {
        timeout = setTimeout('timeout_trigger()', 1);
    }

    // taken from the haar sample file and slightly modified to fit our needs:
    // http://inspirit.github.io/jsfeat/sample_haar_face.html

    var video = document.getElementById('webcam'),
        canvas = document.getElementById('canvas'),
        checkFound = function(){
            requestAnimationFrame(checkFound);

            if(found === true){
                //console.log( 'true' );
            }else{
                //console.log( 'false' );
            }
        },
        t = null,
        widthLimit = 21,// sometimes the face gets detected so we set the pixel limit of the square here, the eyes should be smaller as the head
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

            }, 500);
        }

    }

    $(window).unload(function() {
        video.pause();
        video.src=null;
    });


    var container, stats, ghostActive, ghostPassive;
    var current;

    var camera, scene, renderer;

    var mouseX = 0, mouseY = 0;

    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;

    var mesh;

    var userOpts	= {
        range		: 100,
        duration	: 5000,
        delay		: 0
        };

    var gameStatus = '';

    initStage();
    init();
    animate();

    function initStage() {
        container = document.createElement( 'div' );
        document.body.appendChild( container );

        camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
        camera.position.z = 2000;

        scene = new THREE.Scene();

        var geometry = new THREE.SphereGeometry( window.innerWidth, 60, 40 );
        geometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );

        var material = new THREE.MeshBasicMaterial( {
        map: THREE.ImageUtils.loadTexture( 'img/p5Ec1QV 2.jpg' )
        } );

    mesh = new THREE.Mesh( geometry, material );
    mesh.position.z = window.innerWidth;

    scene.add( mesh );

    var ambient = new THREE.AmbientLight( 0x101030 );
    scene.add( ambient );

    var directionalLight = new THREE.DirectionalLight( 0xffeedd );
    directionalLight.position.set( 0, 0, 1 );
    scene.add( directionalLight );

    var manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {

        console.log( item, loaded, total );

        };

    var loader = new THREE.ImageLoader( manager );

    var textureActive = new THREE.Texture();
    loader.load( 'obj/Supermario_Ghost_Test_state_1.png', function ( image ) {
        textureActive.image = image;
        textureActive.needsUpdate = true;
        });

    var loader = new THREE.OBJLoader( manager );
    loader.load( 'obj/Supermario_Ghost_Test_state_1.obj', function ( object ) {

        var texture =  textureActive;

        object.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
            child.material.map = texture;
        }
    });

    object.position.y = 0;
    scene.add( object );

    ghostActive = object;

    ghostActive.traverse( function ( object ) {
        object.visible = false;
        });
    });

    var texturePassive = new THREE.Texture();
    loader.load( 'obj/Supermario_Ghost_Test_state_2.png', function ( image ) {
        texturePassive.image = image;
        texturePassive.needsUpdate = true;
        });

    var loader = new THREE.OBJLoader( manager );
    loader.load( 'obj/Supermario_Ghost_Test_state_2.obj', function ( object ) {

        var texturePassive =  texturePassive;

        object.traverse( function ( child ) {
        if ( child instanceof THREE.Mesh ) {
        child.material.map = texturePassive;
        }
    });

    object.position.y = 0;
    scene.add( object );

    ghostPassive = object;

    ghostPassive.traverse( function ( object ) {
        object.visible = false;
        });

    });

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    gameStatus = 'loaded';

    }

    function reset() {
        location.reload();
        }

    function end() {

        timeout_clear();

        ghostActive.traverse( function ( object ) {
            object.visible = false;
        });

    ghostPassive.traverse( function ( object ) {
        object.visible = false;
        });

        gameMelody.pause();
        gameMelody.currentTime = 0;

        if( !ended ) {
            endSound.play();
            ended = true;
        }


    $( '#endscreen').fadeIn();
    $( '#points').html( points + ' Points' );

    }

    function init() {

        window.addEventListener( 'resize', onWindowResize, false );

        //window.addEventListener( 'mousedown', onClick, false );

        setupTween();

        }

    function onWindowResize() {

        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

        }

    function onClick() {
        ghostActive.traverse( function ( object ) {
            object.visible = !object.visible;
        });
    ghostPassive.traverse( function ( object ) {
        object.visible = !object.visible;
        });
    }

    function animate() {
        requestAnimationFrame( animate );
        render();
        TWEEN.update();
        }

    function render() {

        camera.lookAt( scene.position );

        ghostActive.lookAt( camera.position );
        ghostPassive.lookAt( camera.position );

        renderer.render( scene, camera );



    if( ghostActive.position.z >= 1600 ) {
        gameStatus = 'finished';
        end();
        }

    }

    function update() {



        if( gameStatus == 'started' ) {

            if( found ) {
                ghostActive.traverse( function ( object ) {
                    object.visible = true;
                });
                ghostPassive.traverse( function ( object ) {
                    object.visible = false;
                });

                ghostActive.position.x = current.x;
                ghostPassive.position.x = current.x;

                ghostActive.position.y = current.y;
                ghostPassive.position.y = current.y;

                ghostActive.position.z += 20;
                ghostPassive.position.z += 20;

            }
            else {
                ghostActive.traverse( function ( object ) {
                    object.visible = false;
                });
                ghostPassive.traverse( function ( object ) {
                    object.visible = true;
                });
            }


        }

        mesh.position.x = current.x / 3;
        mesh.position.y = current.y / 3;

    }

    function setupTween()
            {

                current	= { x: -userOpts.range, y: -userOpts.range };


    // remove previous tweens if needed
    TWEEN.removeAll();

    var tweenHead	= new TWEEN.Tween(current)
    .to({x: +userOpts.range, y: +userOpts.range }, userOpts.duration)
    .delay(userOpts.delay)
    .easing( TWEEN.Easing.Exponential.InOut )
    .onUpdate(update);
    // build the tween to go backward
    var tweenBack	= new TWEEN.Tween(current)
    .to({x: -userOpts.range, y: -userOpts.range}, userOpts.duration)
    .easing( TWEEN.Easing.Exponential.InOut )
    .delay(userOpts.delay)
    .onUpdate(update);

    // after tweenHead do tweenBack
    tweenHead.chain(tweenBack);
    // after tweenBack do tweenHead, so it is cycling
    tweenBack.chain(tweenHead);

    // start the first
    tweenHead.start();
    }



