var v3d = {
    options: {
        width: 400,
        height: 400,
        radius: 5,
        red_intensity: 0.3,
        red_mod: 0.3,
        thetas: [-80, -65, -55, -45, -40, -35, -30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 55, 65, 80]
    },
    callbacks: {},
    objects: {},
    loadBody: function() {
        var manager = new THREE.LoadingManager();
        manager.onProgress = function ( item, loaded, total ) {
            console.log( item, loaded, total );
        };
        var onProgress = function ( xhr ) {
            if ( xhr.lengthComputable ) {
                var percentComplete = xhr.loaded / xhr.total * 100;
                console.log( Math.round(percentComplete, 2) + '% downloaded' );
            }
        };

        var onError = function ( xhr ) {
        };

        var scene = this.scene;

        var loader = new THREE.OBJLoader( manager );
        loader.load( 'malebase.obj', function ( object ) {
            object.traverse( function ( child ) {
                if ( child instanceof THREE.Mesh ) {
                    child.material = new THREE.MeshPhongMaterial(
                    {
                        color: 0xffffff,
                        shininess: 70.0,
                        ambient: 0xff0000,
                        emissive: 0x111111,
                        specular: 0xbbbbbb
                    });
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            } );
            object.rotation.y = Math.PI;
            object.position.y = - 9.02;
            object.position.z = 0.6;
            scene.add( object );

        }, onProgress, onError );
    },
    initObjects: function(scene) {
        var geometry = new THREE.CylinderGeometry( 4, 4, 3, 45 );
        var material = new THREE.MeshLambertMaterial( {color: 0xffffff} );
        var pedestal = new THREE.Mesh( geometry, material );
        pedestal.receiveShadow = true;
        pedestal.position.y = -22.1;
        scene.add( pedestal );

        var sphere_geometry = new THREE.SphereGeometry(0.7, 32, 32);
        this.objects.sphere = new THREE.Mesh(sphere_geometry, new THREE.MeshLambertMaterial(
                    {
                      color: 0xFF5555
                    }));
        scene.add(this.objects.sphere);

        var help_sphere_r = 0.4;
        var help_sphere_material = new THREE.MeshLambertMaterial(
            {
              color: 0x0507ff
            });
        var top_sphere = new THREE.Mesh( new THREE.SphereGeometry(help_sphere_r,16,16), help_sphere_material);
        top_sphere.position.set(0,v3d.options.radius,0);
        top_sphere.castShadow = true;
        scene.add( top_sphere );

        var back_sphere = new THREE.Mesh( new THREE.SphereGeometry(help_sphere_r,16,16), help_sphere_material);
        back_sphere.position.set(0,0,v3d.options.radius);
        back_sphere.castShadow = true;
        scene.add( back_sphere );

        var front_sphere = new THREE.Mesh( new THREE.SphereGeometry(help_sphere_r,16,16), help_sphere_material);
        front_sphere.position.set(0,0,-v3d.options.radius);
        front_sphere.castShadow = true;
        scene.add( front_sphere );

        var left_sphere = new THREE.Mesh( new THREE.SphereGeometry(help_sphere_r,16,16), help_sphere_material);
        left_sphere.position.set(-v3d.options.radius,0,0);
        left_sphere.castShadow = true;
        scene.add( left_sphere );

        var right_sphere = new THREE.Mesh( new THREE.SphereGeometry(help_sphere_r,16,16), help_sphere_material);
        right_sphere.position.set(v3d.options.radius,0,0);
        right_sphere.castShadow = true;
        scene.add( right_sphere );

        var customMaterial = new THREE.ShaderMaterial(
        {
            uniforms:
            {
                "c":   { type: "f", value: 0.05 },
                "p":   { type: "f", value: 4.5 },
                glowColor: { type: "c", value: new THREE.Color(0xff1030) },
                viewVector: { type: "v3", value: this.camera.position }
            },
            vertexShader:   document.getElementById( 'vertexShader'   ).textContent,
            fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
            side: THREE.FrontSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        }   );

        var glow_sphere = new THREE.Mesh( sphere_geometry.clone(), customMaterial.clone() );
        this.objects.glow_sphere = glow_sphere;
        glow_sphere.scale.multiplyScalar(1.2);
        scene.add( glow_sphere );
    },
    initLines: function(scene) {
        //Line
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(-this.options.radius, 0, 0));
        geometry.vertices.push(new THREE.Vector3(this.options.radius, 0, 0));
        var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({color: 0x000000}));
        //scene.add(line);
        var line_material = new THREE.LineBasicMaterial({color: 0x445566, opacity: 0.2, transparent: true });

        //Half circles
        var circle = new THREE.CircleGeometry(this.options.radius,64);
        circle.vertices.shift();
        circle.vertices.splice(circle.vertices.length / 2 + 1);

        var circle_line, delta;
        for(delta = -Math.PI * (0.75); delta <= Math.PI * (0.75 + 0.03125); delta += 1.53125 * Math.PI / 50)
        {
            circle_line = new THREE.Line(circle, line_material);
            circle_line.rotation.x = delta;
            scene.add(circle_line);
        }

        //3/4 circles
        circle = new THREE.CircleGeometry(this.options.radius,64);
        circle.vertices.shift();
        circle.vertices.splice(circle.vertices.length / 4 * 3 + 2);

        //Circles
        for(delta = -0.92; delta <= 0.92; delta += 0.08) {
            circle_line = new THREE.Line(circle, line_material);
            circle_line.scale.x = Math.sqrt(1.0-delta*delta);
            circle_line.scale.y = circle_line.scale.x; //plane
            circle_line.position.x = delta * this.options.radius;
            circle_line.rotation.y = Math.PI * 0.5;
            circle_line.rotation.x = -Math.PI * (0.25);
            scene.add(circle_line);
        }
    },
    initLights: function(scene) {
        var ambient = new THREE.AmbientLight( 0x101010 );
        scene.add( ambient );

        var d = 22;
        this.objects.directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
        var directionalLight = this.objects.directionalLight;
        directionalLight.position.set( 5, 8, 3 );
        directionalLight.castShadow = true;
        directionalLight.shadowDarkness = 0.5;
        directionalLight.shadowCameraNear = 0.01;
        //directionalLight.shadowCameraVisible = true;
        directionalLight.shadowCameraFar = this.camera.far;
        directionalLight.shadowMapWidth = 1024;
        directionalLight.shadowMapHeight = 1024;
        directionalLight.shadowCameraLeft = -d;
        directionalLight.shadowCameraRight = d;
        directionalLight.shadowCameraTop = d;
        directionalLight.shadowCameraBottom = -d;
        scene.add( directionalLight );

        this.objects.redLight = new THREE.DirectionalLight( 0xff0000, 1 );
        var redLight = this.objects.redLight;
        redLight.position.set( 0, 8, 0 );
        redLight.castShadow = true;
        redLight.shadowDarkness = 0.1;
        redLight.shadowMapWidth = 1024;
        redLight.shadowMapHeight = 1024;
        redLight.shadowCameraNear = 0.01;
        redLight.shadowCameraFar = this.camera.far;
        redLight.shadowCameraLeft = -d;
        redLight.shadowCameraRight = d;
        redLight.shadowCameraTop = d;
        redLight.shadowCameraBottom = -d;
        scene.add( redLight );

        var topLight = new THREE.DirectionalLight( 0xffffff, 1 );
        topLight.position.set( 0, 8, 0 );
        topLight.castShadow = true;
        topLight.shadowDarkness = 0.05;
        topLight.intensity = 0.2;
        topLight.shadowMapWidth = 1024;
        topLight.shadowMapHeight = 1024;
        topLight.shadowCameraNear = 0.01;
        topLight.shadowCameraFar = this.camera.far;
        topLight.shadowCameraLeft = -d;
        topLight.shadowCameraRight = d;
        topLight.shadowCameraTop = d;
        topLight.shadowCameraBottom = -d;
        scene.add( topLight );

    },
    init: function(mouse_move, mouse_down) {
        this.callbacks.mouse_move = mouse_move;
        this.callbacks.mouse_down = mouse_down;

        //Convert angles to rad
        this.options.thetas_rad = [];
        for(var i = 0; i < this.options.thetas.length; i++)
        {
            this.options.thetas_rad.push(this.options.thetas[i]/180.0*Math.PI);
        }

        var renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true});
        this.renderer = renderer;
        renderer.shadowMapEnabled = true;
        renderer.shadowMapType = THREE.PCFSoftShadowMap;
        renderer.shadowMapSoft = true;
        renderer.setSize(this.options.width, this.options.height);
        document.body.appendChild(renderer.domElement);

        var scene = new THREE.Scene();
        this.scene = scene;

        var camera = new THREE.PerspectiveCamera(60, this.options.width / this.options.height, 0.1, 1000);
        this.camera = camera;
        camera.position.z = 0.55*10;
        camera.position.y = 0.55*32;
        camera.lookAt({x: 0, y: 0, z: 0});
        scene.add(camera);

        this.loadBody();
        this.initObjects(scene);
        this.initLines(scene);
        this.initLights(scene);

        // add event handling
        renderer.domElement.addEventListener( 'mousemove', this.mouse_move, false );
        renderer.domElement.addEventListener( 'mousedown', this.mouse_down, false );
        renderer.domElement.addEventListener( 'mouseup', this.mouse_up, false );
        renderer.domElement.addEventListener( 'mouseover', this.mouse_over, false);
        renderer.domElement.addEventListener( 'mouseout', this.mouse_out, false);
    },
    render: function() {
        this.renderer.render(this.scene, this.camera);
    },
    animate: function() {
        requestAnimationFrame( v3d.animate );

        v3d.objects.glow_sphere.material.uniforms[ "c" ].value = 0.05 - 0.05 * Math.cos(Math.PI * 0.002 * new Date().getMilliseconds());
        v3d.objects.redLight.intensity = v3d.options.red_intensity * (1.0 + v3d.options.red_mod * Math.cos(Math.PI * 0.002 * new Date().getMilliseconds()));
        v3d.objects.redLight.shadowDarkness = 0.5 * v3d.options.red_intensity * (1.0 + v3d.options.red_mod * Math.cos(Math.PI * 0.002 * new Date().getMilliseconds()));;

        v3d.render();
    },
    spherical_to_hrir: function(s)
    {
        var x = Math.sin(s.alpha) * Math.cos(s.beta);
        var rx = (Math.sqrt(1 - Math.pow(x/1,2.0)));
        var gamma = Math.acos(Math.cos(s.alpha) / rx);
        gamma = Math.sign(s.beta) * gamma;

        //Boundaries
        if(gamma < -Math.PI * 3/4.0) gamma = -Math.PI * 3/4.0;
        if(gamma > Math.PI * (3/4.0+0.03125)) gamma = Math.PI * (3/4.0+0.03125);

        return {
            x: x,
            rx: rx,
            gamma: gamma
        };
    },
    mouse_to_hrir: function(event) {
        var mouseX = ( event.clientX );
        var mouseY = ( event.clientY );
        var dx = mouseX - v3d.options.width / 2;
        var dy = mouseY - v3d.options.height / 2;

        //Spherical coords
        var r = Math.sqrt(dx*dx+dy*dy);
        var beta = Math.atan2(dy,dx);
        var alpha = r/(2*v3d.options.radius*20)*Math.PI;

        //HRIR coords
        return v3d.spherical_to_hrir({r: r, beta: beta, alpha: alpha});
    },
    hrir_index: function(hrir)
    {
        function closest(arr, target) {
            for (var i=1; i < arr.length; i++) {
                if (arr[i] > target) {
                    var p = arr[i-1];
                    var c = arr[i];
                    return Math.abs(p-target) < Math.abs(c-target) ? i-1 : i;
                }
            }
            return arr.length-1;
        }

        return {
            theta: closest(v3d.options.thetas_rad, Math.asin(hrir.x)),
            phi: Math.round(hrir.gamma/((6/4.0+0.03125)*Math.PI)*49)+24
        };
    },
    hrir_to_xyz: function(hrir) {
        return {
            x: v3d.options.radius * hrir.x,
            y: v3d.options.radius * hrir.rx * Math.cos(hrir.gamma),
            z: v3d.options.radius * hrir.rx * Math.sin(hrir.gamma)
        }
    },
    mouse_down: function(event) {
        var source_hrir = v3d.mouse_to_hrir(event);
        v3d.set_hrir_pos(source_hrir);
        if(v3d.callbacks.mouse_down) v3d.callbacks.mouse_down(v3d.hrir_index(source_hrir));
    },
    set_hrir_pos: function(hrir_pos) {
        var source_pos = v3d.hrir_to_xyz(hrir_pos);
        v3d.objects.glow_sphere.position.set(source_pos.x, source_pos.y, source_pos.z);
        v3d.objects.redLight.position.set(source_pos.x, source_pos.y, source_pos.z);
    },
    mouse_up: function(event) {

    },
    mouse_move: function(event) {
        var source_hrir = v3d.mouse_to_hrir(event);
        var source_pos = v3d.hrir_to_xyz(source_hrir);

        v3d.objects.sphere.position.set(source_pos.x, source_pos.y, source_pos.z);
        v3d.objects.directionalLight.position.set(source_pos.x, source_pos.y, source_pos.z);
        if(event.clientX < v3d.options.width) {
            //v3d.camera.position.x = (event.clientX - 0.5*v3d.options.width) * 0.0005;
        }
        if(v3d.callbacks.mouse_move) v3d.callbacks.mouse_move(v3d.hrir_index(source_hrir));
    },
    mouse_over: function(event) {
        v3d.objects.directionalLight.intensity = 1;
        v3d.objects.directionalLight.castShadow = true;
        v3d.objects.sphere.visible = true;
    },
    mouse_out: function(event) {
        v3d.objects.directionalLight.intensity = 0;
        v3d.objects.directionalLight.castShadow = false;
        v3d.objects.sphere.visible = false;
    }
};

var hpl = {
    hrir_l: [],
    hrir_r: [],
    Fs: 44100,
    theta: 0, //Mid
    phi: 10, //Mid
    load_hrir: function(name) {
        this.hrir_loaded = false;
        this.hrir_l = [];
        this.hrir_r = [];
        for(var i = 0; i < 25; i++)
        {
            this.hrir_l.push([]);
            this.hrir_r.push([]);
            for(var j = 0; j < 50; j++)
            {
                this.hrir_l[i].push([]);
                this.hrir_r[i].push([]);
                for(var k = 0; k < 200; k++)
                {
                    this.hrir_l[i][j].push(0);
                    this.hrir_r[i][j].push(0);
                }
            }
        }

        var client_l = new XMLHttpRequest();
        var client_r = new XMLHttpRequest();
        var done_l = false,
            done_r = false;
        client_l.open('GET', 'hrir/' + name + '_l.dat');
        client_r.open('GET', 'hrir/' + name + '_r.dat');
        client_l.onreadystatechange = function() {
            if (client_l.readyState==4 && client_l.status==200)
            {
                var all_data = client_l.responseText.split('\n');
                for(var i = 0; i < 25; i++)
                {
                    var data = all_data[i].split(',');
                    for(var j = 0; j < 50; j++)
                    {
                        for(var k = 0; k < 200; k++)
                        {
                            hpl.hrir_l[i][j][k] = data[j+k*50];
                        }
                    }
                }
                if(done_r) {
                    hpl.hrir_loaded = true;
                    hpl.update_convolver();
                }
                done_l = true;
            }
        }
        client_r.onreadystatechange = function() {
            if (client_r.readyState==4 && client_r.status==200)
            {
                var all_data = client_r.responseText.split('\n');
                for(var i = 0; i < 25; i++)
                {
                    var data = all_data[i].split(',');
                    for(var j = 0; j < 50; j++)
                    {
                        for(var k = 0; k < 200; k++)
                        {
                            hpl.hrir_r[i][j][k] = data[j+k*50];
                        }
                    }
                }
                if(done_l) {
                    hpl.hrir_loaded = true;
                    hpl.update_convolver();
                }
                done_r = true;
            }
        }
        client_l.send();
        client_r.send();
    },
    update_convolver: function() {
        if(!hpl.hrir_loaded) return;
        console.log(hpl.theta + "," + hpl.phi);
        hpl.left = hpl.hrir_buffer.getChannelData(0);
        hpl.right = hpl.hrir_buffer.getChannelData(1);

        //Quick linear interpolation of the HRIR to the sample rate of the AudioContext
        if(hpl.hrir_l && hpl.hrir_r) {
            var q, d, k_p, k_n;
            for (var k = 0; k < this.hrir_length; k++) {
                q = k / (1.0*this.hrir_length) * 200;
                k_p = Math.floor(q);
                k_n = Math.ceil(q);
                d = q - k_p;

                hpl.left[k] = hpl.hrir_l[hpl.theta][hpl.phi][k_p] * (1.0-d) + hpl.hrir_l[hpl.theta][hpl.phi][k_n] * d;
                hpl.right[k] = hpl.hrir_r[hpl.theta][hpl.phi][k_p] * (1.0-d) + hpl.hrir_r[hpl.theta][hpl.phi][k_n] * d;
            }
        }

        console.log("Updated convolver");
    },
    init_convolver: function() {
        this.hrir_length = Math.ceil(200.0 * this.ctx.sampleRate / this.Fs);
        if(!hpl.convolver)
        {
            hpl.convolver = hpl.ctx.createConvolver();

            hpl.hrir_buffer = hpl.ctx.createBuffer(2, this.hrir_length, this.ctx.sampleRate);
            hpl.left = hpl.hrir_buffer.getChannelData(0);
            hpl.right = hpl.hrir_buffer.getChannelData(1);

            // kronecker delta by default
            hpl.left[0] = 1;
            hpl.right[0] = 1;
            for (var i = 1; i < hpl.hrir_buffer.length; i++) {
                hpl.left[i] = 0;
                hpl.right[i] = 0;
            }

            hpl.convolver.buffer = hpl.hrir_buffer;
            hpl.convolver.connect(hpl.gain);
            hpl.gain.connect(hpl.ctx.destination);
        }
    },
    init_source: function(file) {
        var ajaxRequest = new XMLHttpRequest();
        ajaxRequest.open('GET', 'sounds/' + file, true);
        ajaxRequest.responseType = 'arraybuffer';
        ajaxRequest.onload = function() {
            var audioData = ajaxRequest.response;
            hpl.ctx.decodeAudioData(audioData, function(buffer) {
                hpl.source_buffer = buffer;
            }, function(e){"Error decoding audio data" + e.err});
        }
        ajaxRequest.send();
    },
    play_source: function() {
        if(!hpl.source)
        {
            hpl.source = hpl.ctx.createBufferSource();
        }
        else
        {
            hpl.source.stop();
            hpl.source = hpl.ctx.createBufferSource();
        }

        var source = hpl.source;
        source.buffer = hpl.source_buffer;
        source.connect(hpl.convolver);
        hpl.convolver.buffer = hpl.hrir_buffer;
        source.loop = true;
        hpl.convolver.connect(hpl.gain);
        hpl.gain.connect(hpl.ctx.destination);
        hpl.gain.gain.value = 5;

        source.start();
    },
    init: function() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.gain = this.ctx.createGain();
        this.init_convolver();
        this.init_source('razor.ogg'); //Default
        this.load_hrir('21'); //Default
    },
    do_circle: function() {
        hpl.moving = true;

        //Spherical coords
        var delta = Math.PI*0.1;
        var beta = -Math.PI-delta+0.001; //Around the world
        var alpha = Math.PI*0.5;

        function rotate() {
            if(beta > Math.PI) {
                hpl.moving = false;
                hpl.source.stop();
            }
            if(!hpl.moving) return;
            beta += delta;
            var hc = v3d.spherical_to_hrir({beta: beta, alpha: alpha});
            var hi = v3d.hrir_index(hc);
            v3d.set_hrir_pos(hc);

            hpl.theta = hi.theta;
            hpl.phi = hi.phi;
            hpl.update_convolver();
            hpl.play_source();

            setTimeout(rotate, 2000);
        }
        rotate();
    }
}

var mouse_move = function(e) {
    if(!isNaN(e.theta) && !isNaN(e.phi) && (e.theta != hpl.theta || e.phi != hpl.phi)) {
        hpl.theta = e.theta;
        hpl.phi = e.phi;
        hpl.update_convolver();
    }
}

var mouse_down = function(e) {
    hpl.moving = false; //Interrupt automation
    if(!isNaN(e.theta) && !isNaN(e.phi) && (e.theta != hpl.theta || e.phi != hpl.phi)) {
        hpl.theta = e.theta;
        hpl.phi = e.phi;
    }
    hpl.play_source();
}

v3d.init(mouse_move,mouse_down);
v3d.animate();
hpl.init();

document.getElementById('s_hrir').onchange = function()
{
    hpl.load_hrir(document.getElementById('s_hrir').value); //Default
};
document.getElementById('s_sample').onchange = function()
{
    hpl.init_source(document.getElementById('s_sample').value); //Default
};
document.getElementById('b_stop').onclick = function()
{
    hpl.moving = false;
    if(hpl.source) hpl.source.stop();
};
document.getElementById('b_circle').onclick = function()
{
    hpl.do_circle();
};

