
import React, { Component } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import osg from 'osg-serializer-browser';

class ThreeComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    initThree() {

        var filePath = './Samples/test.osgb';

        // Debug
        const gui = new dat.GUI()

        // Canvas
        const canvas = document.querySelector('canvas.webgl')

        // Scene
        const scene = new THREE.Scene()

        // color: 0xff0000,
        // specular:0x444444,//高光部分的颜色
        // shininess:20,//高光部分的亮度，默认30
        // osgmaterial.color = new THREE.Color(0x00ff00);
        fetch(filePath).then(res => { return res.arrayBuffer() }).then(abuf => {
            var osgeom = new THREE.BufferGeometry();
            var osgObj = osg.readBuffer(abuf, filePath)
            var osgGeometry = osgObj.Children[0].Children[0].Children[0];
            var osgVertexArray = new Float32Array(osgGeometry.VertexArray.flat());
            var osgIndexArray = new Uint16Array(osgGeometry.PrimitiveSetList[0].data.flat());
            var osgTextureImage = osgGeometry.StateSet.TextureAttributeList[0].value.StateAttribute.Image.Data;
            console.log(`PagedLOD`, osgObj);
            console.log(`osgGeometry`, osgGeometry);
            console.log(`osgTextureImage`, osgTextureImage);
            osgeom.attributes.position = new THREE.BufferAttribute(osgVertexArray, 3);
            osgeom.index = new THREE.BufferAttribute(osgIndexArray, 1);
            var uvs = new Float32Array(osgGeometry.TexCoordArray[0].flat());
            osgeom.attributes.uv = new THREE.BufferAttribute(uvs, 2);
            // console.log('uvs', uvs); 
            // osgeom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
            osgeom.computeBoundingBox();
            osgeom.computeBoundingSphere();
            osgeom.computeVertexNormals();

            var osgStateSet = osgGeometry.StateSet;
            var osgImage = osgStateSet.TextureAttributeList[0].value.StateAttribute.Image
            var fileName = osgImage.Name;
            const isJPEG = fileName.search(/\.jpe?g($|\?)/i) > 0
            const isPNG = fileName.search(/\.png($|\?)/i) > 0
            if (!isPNG && !isJPEG) return;

            var mimeType = isPNG ? 'image/png' : 'image/jpeg';
            console.log(mimeType);
            var imageUri = new Blob([osgImage.Data], { type: mimeType });
            console.log('imageUri', imageUri);
            var imageU = URL.createObjectURL(imageUri);
            console.log('imageUri', imageUri);
            var center = osgeom.boundingSphere.center;
            var texture = new THREE.TextureLoader().load(imageU, () => {
                var osgmaterial = new THREE.MeshBasicMaterial({ map: texture, });
                // osgmaterial.map = texture;
                console.log("osgmaterial", osgmaterial);
                texture.needsUpdate = true;
                var osgmesh = new THREE.Mesh(osgeom, osgmaterial);
                osgmesh.position.set(-center.x, -center.y, -center.z);
                scene.add(osgmesh);
            })
        })


        // Objects
        const geometry = new THREE.TorusGeometry(.7, .2, 16, 100);

        // Materials

        const material = new THREE.MeshBasicMaterial()
        material.color = new THREE.Color(0xff0000)

        // Mesh
        const sphere = new THREE.Mesh(geometry, material)
        // scene.add(sphere)
        console.log(sphere);
        // scene.add(osgmesh)

        // Lights

        const pointLight = new THREE.PointLight(0xffffff, 1)
        pointLight.position.x = 2
        pointLight.position.y = 3
        pointLight.position.z = 10
        scene.add(pointLight)

        /**
         * Sizes
         */
        const sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        }

        window.addEventListener('resize', () => {
            // Update sizes
            sizes.width = window.innerWidth
            sizes.height = window.innerHeight

            // Update camera
            camera.aspect = sizes.width / sizes.height
            camera.updateProjectionMatrix()

            // Update renderer
            renderer.setSize(sizes.width, sizes.height)
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        })

        /**
         * Camera
         */
        // Base camera
        const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
        camera.position.x = 0
        camera.position.y = 0
        camera.position.z = 10
        scene.add(camera)

        // Controls
        const controls = new OrbitControls(camera, canvas)
        controls.enableDamping = true

        /**
         * Renderer
         */
        const renderer = new THREE.WebGLRenderer({
            canvas: canvas
        })
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        /**
         * Animate
         */

        const clock = new THREE.Clock()

        const tick = () => {

            const elapsedTime = clock.getElapsedTime()

            // Update objects
            sphere.rotation.y = .5 * elapsedTime

            // Update Orbital Controls
            controls.update()

            // Render
            renderer.render(scene, camera)

            // Call tick again on the next frame
            window.requestAnimationFrame(tick)
        }

        tick()
    }

    /**
     * 开始Three
     *
     * @memberof ThreeComponent
     */
    componentDidMount() {
        this.initThree();
    }
    render() {
        return (
            <canvas class="webgl"></canvas>
        );
    }
}

export default ThreeComponent;