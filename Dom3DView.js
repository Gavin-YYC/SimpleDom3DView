
/**
 * @file Dom 3D View
 * @author Gavin
 * @example
 * 
 * var script = document.createElement('script')
 * script.src = 'https://img.youthol.top/Dom3DView.js?ver=' + Math.random();
 * document.body.appendChild(script);
 *
 */

(function() {
    let canvas = null;
    let engine = null;
    let scene = null;
    let boxH = 15;
    let boxMargin = 5;
    let bodyWidth = 0;
    let bodyHeight = 0;

    const purpleToWhiteToPink = [
        [0, 26, 128],   [0, 51, 153],   [0, 77, 179],   [0, 102, 204],  [0, 128, 230],   [0, 153, 255],
        [23, 158, 232], [46, 162, 209], [70, 167, 185], [93, 172, 162], [116, 176, 139], [139, 181, 116],
        [162, 185, 93], [185, 190, 70], [209, 195, 46], [232, 199, 23], [255, 204, 0],   [255, 187, 0],
        [255, 170, 0],  [255, 153, 0],  [255, 136, 0],  [255, 119, 0],  [255, 102, 0],   [255, 119, 0]
    ];

    if (document.readyState === 'complete') {
        loadFramework();
    }
    else {
        window.addEventListener('load', function() {
            loadFramework();
        });
    }

    window.addEventListener("resize", function () {
        engine && engine.resize();
    });

    function loadFramework() {
        const script = document.createElement('script');
        script.src = 'https://cdn.bootcdn.net/ajax/libs/babylonjs/5.0.0-alpha.30/babylon.min.js';
        script.onload = start;
        document.body.append(script);   
    }

    function start() {
        canvas = createCanvas();
        engine = new BABYLON.Engine(canvas, true);
        scene = new BABYLON.Scene(engine);
        createScene(document.body);
        engine.runRenderLoop(function () {
            scene && scene.render();
        });
    }

    function addActions(mesh) {
        mesh.actionManager = new BABYLON.ActionManager(scene);
        // 鼠标离开
        mesh.actionManager.registerAction(
            new BABYLON.SetValueAction(
                BABYLON.ActionManager.OnPointerOutTrigger,
                mesh.material,
                'emissiveColor',
                mesh.material.emissiveColor
            )
        );
        // 鼠标进入
        mesh.actionManager.registerAction(
            new BABYLON.SetValueAction(
                BABYLON.ActionManager.OnPointerOverTrigger,
                mesh.material,
                'emissiveColor',
                BABYLON.Color3.Purple()
            )
        );
        // 点击
        mesh.actionManager.registerAction(
            new BABYLON.InterpolateValueAction(
                BABYLON.ActionManager.OnLeftPickTrigger,
                mesh.material,
                'emissiveColor',
                0,
                300,
                new BABYLON.PredicateCondition(
                    mesh.actionManager,
                    function () {
                        console.log(mesh.element);
                    }
                )        
            )
        );
    }

    function getColor(level) {
        const size = purpleToWhiteToPink.length;
        const block = Math.floor(level / size);
        const reverse = block % 2 === 1;
        let colorIndex = level % size;
        if (reverse) {
            colorIndex = size - colorIndex;
        }

        return purpleToWhiteToPink[colorIndex];
    }

    function createCanvas() {
        const div = document.createElement('div');
        div.style.position = 'fixed';
        div.style.top = 0;
        div.style.left = 0;
        div.style.width = '80%';
        div.style.height = '80%';
        div.style.zIndex = '9999';
        div.id = 'dom-3d-view';
        const canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.touchAction = 'none';
        div.appendChild(canvas);
        document.body.appendChild(div);
        return canvas;
    }

    function createScene(content) {
        const camera = new BABYLON.ArcRotateCamera('Camera', Math.PI / 2, Math.PI / 3, 1000, new BABYLON.Vector3(0, 0, 0), scene);
        camera.lowerBetaLimit = -(Math.PI / 2);
        camera.upperBetaLimit = (Math.PI);
        camera.lowerRadiusLimit = 1500;
        camera.upperRadiusLimit = 5000;
        camera.panningSensibility = 0;
        camera.wheelPrecision = 1.1;
        camera.setPosition(new BABYLON.Vector3(0, 0, 0));
        camera.attachControl(canvas, true, false);

        createBoxForDepth(content, 0);
        return scene;
    }

    function createBoxForDepth(element, depthLevel) {

        if (element.id === 'dom-3d-view') {
            return;
        }

        const rect = element.getBoundingClientRect();
        if (rect.width || rect.height) {
            const width = rect.width;
            const height = rect.height;

            if (bodyWidth === 0 && bodyHeight === 0) {
                bodyWidth = width;
                bodyHeight = height;
            }

            const rgb = getColor(depthLevel);
            const boxMaterial = new BABYLON.StandardMaterial('ground', scene, true);
            boxMaterial.emissiveColor = BABYLON.Color3.FromInts(rgb[0], rgb[1], rgb[2]);
            boxMaterial.alpha = 1;

            const id = element.tagName;
            const x = bodyWidth / 2 - (width / 2 + rect.x);
            const y = bodyHeight / 2 - (height / 2 + rect.y);

            const box = BABYLON.MeshBuilder.CreateBox(id, {
                height: height,
                width: width,
                depth: boxH
            }, scene, true);
            box.element = element;
            box.material = boxMaterial;
            box.position.x = x;
            box.position.y = y;
            box.position.z = (boxH + boxMargin) * depthLevel;

            addActions(box);
        }

        if (element.children && element.children.length > 0) {
            const nd = depthLevel + 1;
            Array.from(element.children).forEach(function (ch) {
                createBoxForDepth(ch, nd);
            });
        }
    }
})();
