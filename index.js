let camera, scene, renderer;
let controls;
let bubbles = [];
let clock;

const circleCenterPos = new THREE.Vector2(2600,6700);
const circleRadius = 1100;
const mass = 1;
const viscosity = 0.001016;
const springConst = (viscosity*viscosity) / (4*mass*0.707*0.707);
const r = 30;
const d0 = r*2;
const d1 = d0 * 1.4;
const offset = 100000000000000;

init();
animate();
onWindowResize();
 
function init() {
    //Init threejs
    camera = new THREE.PerspectiveCamera( 45, document.documentElement.clientWidth / document.documentElement.clientHeight, 1, 45000 );
    camera.position.z = 35000;
    scene = new THREE.Scene();
    clock = new THREE.Clock();
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight);
    document.body.appendChild( renderer.domElement );
    controls = new THREE.TrackballControls( camera, renderer.domElement );
    controls.minDistance = 1;
    controls.maxDistance = 45000;
    controls.noRotate = true;
    controls.addEventListener( 'change', render );
    window.addEventListener( 'resize', onWindowResize, false );

    //Load Background-image
    let texture = new THREE.TextureLoader().load("images/aoi.png");
    let material = new THREE.MeshBasicMaterial( { map: texture, opacity: 0.8, transparent: true } );
    let geometry = new THREE.PlaneBufferGeometry();
    let mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );
}
 
function animate() {
    requestAnimationFrame( animate );
    controls.update();
    render();
}

function render() {
    renderer.render( scene, camera );
}

function onWindowResize() {
    camera.aspect = document.documentElement.clientWidth / document.documentElement.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( document.documentElement.clientWidth, document.documentElement.clientHeight );
    render();
}

function calcBetweenBubbleForce( d ) {
    if(d>=0 && d<=d1) {
        var D = springConst * ( (d0*d0*d0-3*d0*d1*d1+2*d1*d1*d1) / (d0*(d1*d1*d1-d0*d1*d1)) )
        var C = 0;
        var B = D * ( (d0*d0*d0-d1*d1*d1) / (d0*d0*(d1*d1*d1-d0*d1*d1)) );
        var A = D * ( (d1*d1-d0*d0) / (d0*d0*(d1*d1*d1-d0*d1*d1)) );
        return (A*d*d*d + B*d*d + C*d + D);
    }else{
        return 0;
    }
}