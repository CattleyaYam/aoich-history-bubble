const container = document.getElementById( 'canvas-container' );

const circleCenterPos = new THREE.Vector2(2600,6700);
const circleRadius = 1100;
const mass = 1;
const viscosity = 0.001016;
const springConst = (viscosity*viscosity) / (4*mass*0.707*0.707);
const r = 30;
const d0 = r*2;
const d1 = d0 * 1.4;
const offset = 100000000000000;

let camera, scene, renderer;
let controls;
let bubbles = [];
let clock;

init();
animate();
onWindowResize();
 
function init() {
    //container size
    const w = container.getBoundingClientRect().width;
    const h = container.getBoundingClientRect().height;

    //camera
    camera = new THREE.PerspectiveCamera( 45, w/h, 1, 1000 );
    camera.position.z = 180;
    
    //scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xFFFFFF );

    //renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( w, h);
    container.appendChild( renderer.domElement );

    //clock
    clock = new THREE.Clock();
    
    //control
    controls = new THREE.TrackballControls( camera, renderer.domElement );
    controls.minDistance = 1;
    controls.maxDistance = 1000;
    controls.noRotate = true;
    controls.addEventListener( 'change', render );
    window.addEventListener( 'resize', onWindowResize, false );

    //Aoi image
    const texture = new THREE.TextureLoader().load("images/aoi.png");
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearFilter;
    const material = new THREE.MeshBasicMaterial( { map: texture, opacity: 1.0, transparent: true } );
    const geometry = new THREE.PlaneBufferGeometry(85,120);
    const mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    //Aoi history
    const req = new XMLHttpRequest();
    req.open("get", "data/aoi_movie.csv", true);
    req.send(null);
    req.onload = function(){
        let result = [];
        let tmp = req.responseText.split("\n");
        let playId = "";
        for(let i=0;i<1;++i){
            result[i] = tmp[i].split(',');
            playId = result[i][1].substr(-11);
            let tmp2 = "https://img.youtube.com/vi/"+playId+"/mqdefault.jpg";
            console.log(tmp2);
        }
    }
}

function forceDownload(blob, filename) {
    var a = document.createElement('a');
    a.download = filename;
    a.href = blob;
    // For Firefox https://stackoverflow.com/a/32226068
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  
  // Current blob size limit is around 500MB for browsers
  function downloadResource(url, filename) {
    if (!filename) filename = url.split('\\').pop().split('/').pop();
    fetch(url, {
        headers: new Headers({
          'Origin': location.origin
        }),
        mode: 'cors'
      })
      .then(response => response.blob())
      .then(blob => {
        let blobUrl = window.URL.createObjectURL(blob);
        forceDownload(blobUrl, filename);
      })
      .catch(e => console.error(e));
  }
  downloadResource("http://img.youtube.com/vi/Nk-9BlTz1mA/mqdefault.jpg");
 
function animate() {
    requestAnimationFrame( animate );
    controls.update();
    render();
}

function render() {
    renderer.render( scene, camera );
}

function onWindowResize() {
    const w = container.getBoundingClientRect().width;
    const h = container.getBoundingClientRect().height;
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
    renderer.setSize(w,h);
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