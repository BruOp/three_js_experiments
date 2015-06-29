
  var container, stats;

  var camera, scene, renderer, material, mesh;

  var uniforms;

  var counter = 0;

  var soundAnalyser;

  var texture;

  init();
  animate();

  function init() {

    container = document.getElementById( 'container' );

    soundAnalyser = SoundAnalyser();
    soundAnalyser.connectTrack('music/Atoms%20For%20Peace%20-%20Amok.mp3');
    // freqData = soundAnalyser.getFreqData();
    // timeData = soundAnalyser.getTimeData();
    // console.log(freqData.length);

    camera = new THREE.Camera();
    camera.position.z = 1;

    scene = new THREE.Scene();

    var geometry = new THREE.PlaneBufferGeometry( 2, 2 );

    // texture = new THREE.DataTexture(freqData, 512, 1, THREE.LuminanceFormat)

    uniforms = {
      time: { type: "f", value: 1.0 },
      resolution: { type: "v2", value: new THREE.Vector2() },
      iChannel0: { type: 't', value: THREE.ImageUtils.loadTexture( 'simplex.jpg' ) }
      // iChannel0: { type: 't', value: texture}
    };

    material = new THREE.ShaderMaterial( {

      uniforms: uniforms,
      vertexShader: document.getElementById( 'vertexShader' ).textContent,
      fragmentShader: document.getElementById( 'fragmentShader' ).textContent
    } );

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    container.appendChild( renderer.domElement );

    onWindowResize();

    window.addEventListener( 'resize', onWindowResize, false );

  }

  function onWindowResize( event ) {

    renderer.setSize( window.innerWidth, window.innerHeight );

    uniforms.resolution.value.x = renderer.domElement.width;
    uniforms.resolution.value.y = renderer.domElement.height;

  }

  //

  function animate() {

    requestAnimationFrame( animate );

    // counter++;
    // if (counter % 30) {
    // }
    // 
    // texture = new THREE.DataTexture(freqData, 512, 1, THREE.LuminanceFormat);
    // material.uniforms.iChannel0.value = texture;
    render();


  }

  function render() {

    uniforms.time.value += 0.05;

    renderer.render( scene, camera );

  }