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
        map: THREE.ImageUtils.loadTexture( 'img/test2.jpg' )
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

    requestHighscore();

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

        if( found == false ) {
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



