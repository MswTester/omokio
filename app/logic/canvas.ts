// Path: omokio/app/logic/canvas.ts

import * as BABYLON from 'babylonjs';
import { Socket } from 'socket.io-client';
import { getMaterial } from '~/data/utils';

export const init = (canvas:HTMLCanvasElement, type:string):{engine:BABYLON.Engine} => {
    const engine = new BABYLON.Engine(canvas, true);
    async function createScene():Promise<BABYLON.Scene> {
        const scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
        scene.ambientColor = new BABYLON.Color3(1, 1, 1);
        scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
        scene.fogDensity = 0.01;
        scene.fogColor = new BABYLON.Color3(1, 1, 1);
        scene.fogStart = 0;
        scene.fogEnd = 100;

        switch (type) {
            case "rotate":
                const camera = new BABYLON.UniversalCamera('Camera', new BABYLON.Vector3(5, 0, 0), scene);
                camera.setTarget(BABYLON.Vector3.Zero());
        
                const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
                light.intensity = 1;
        
                const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, scene);
                sphere.scaling = new BABYLON.Vector3(1, 0.5, 1);
                sphere.rotation.z = 1
                break;
        }
        return scene;
    }
    let scene:BABYLON.Scene;
    createScene().then((_s) => scene = _s);
    engine.runRenderLoop(() => {
        scene.render();
        switch (type) {
            case "rotate":
                const sphere = scene.getMeshByName("sphere");
                if (sphere) {
                    sphere.rotation.y += 0.02;
                }
                break;
        }
    });
    return {engine}
}

export const initGame = (canvas:HTMLCanvasElement, board:string[][]):{
    engine:BABYLON.Engine;
    addStone:(x: number, y: number, color: string) => void;
    placeStone:(clientX: number, clientY: number, socket: Socket, ownerId: string) => void;
    posTo:(cx: number, cy: number) => void;
    removeSelection:() => void;
    initialMotion:() => void;
} => {
    const engine = new BABYLON.Engine(canvas, true);
    const createScene = ():BABYLON.Scene => {
        const scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
        scene.ambientColor = new BABYLON.Color3(1, 1, 1);
        scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
        scene.fogDensity = 0.01;
        scene.fogColor = new BABYLON.Color3(1, 1, 1);
        scene.fogStart = 0;
        scene.fogEnd = 100;

        const camera = new BABYLON.ArcRotateCamera('Camera', 0, 0, 0, new BABYLON.Vector3(0, 0, 0), scene);
        camera.radius = 20;
        // set max radius
        camera.lowerRadiusLimit = 20;
        // set min radius
        camera.upperRadiusLimit = 20;
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.attachControl(canvas, true);

        const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);
        light.intensity = 1;

        // draw board
        const board_mesh = BABYLON.MeshBuilder.CreatePlane("board", {width: 15, height: 15}, scene);
        board_mesh.rotation.x = Math.PI/2;
        board_mesh.position.x = 0;
        board_mesh.position.y = 0;
        // const board_material = new BABYLON.StandardMaterial("board_material", scene);
        // board_material.diffuseColor = new BABYLON.Color3(1, 1, 1);
        board_mesh.material = getMaterial("mossy_sandstone", scene as any) as unknown as BABYLON.Nullable<BABYLON.Material>;

        // draw lines
        const lines = [];
        for(let i = 0; i < 15; i++){
            const line = BABYLON.MeshBuilder.CreatePlane("line", {width: 14, height: 0.1}, scene);
            line.rotation.x = Math.PI/2;
            line.position.x = 0;
            line.position.y = 0.1;
            line.position.z = i-7;
            lines.push(line);
        }
        for(let i = 0; i < 15; i++){
            const line = BABYLON.MeshBuilder.CreatePlane("line", {width: 14, height: 0.1}, scene);
            line.rotation.x = Math.PI/2;
            line.rotation.z = Math.PI/2;
            line.position.x = i-7;
            line.position.y = 0.1;
            line.position.z = 0;
            lines.push(line);
        }
        const lines_material = new BABYLON.StandardMaterial("lines_material", scene);
        lines_material.diffuseColor = new BABYLON.Color3(0, 0, 0);
        lines.forEach(line => {
            line.material = lines_material;
        });

        const selection = BABYLON.MeshBuilder.CreateSphere("selection", {diameter: 2, segments: 32}, scene);
        selection.scaling = new BABYLON.Vector3(0.4, 0.2, 0.4);
        const sphere_material = new BABYLON.StandardMaterial("sphere_material", scene);
        sphere_material.diffuseColor = new BABYLON.Color3(0, 255, 255);
        sphere_material.alpha = 0.3;
        selection.material = sphere_material;
        selection.position.set(0, -100, 0);

        return scene
    }

    let scene:BABYLON.Scene = createScene();

    engine.runRenderLoop(() => {
        scene.render();
    });

    const addStone = (x:number, y:number, color:string):void => {
        const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, scene);
        sphere.scaling = new BABYLON.Vector3(0.4, 0.2, 0.4);
        const sphere_material = new BABYLON.StandardMaterial("sphere_material", scene);
        sphere_material.diffuseColor = color === "black" ? new BABYLON.Color3(0, 0, 0) : new BABYLON.Color3(1, 1, 1);
        sphere.material = sphere_material;
        sphere.position.x = x - 7;
        sphere.position.y = 0.2;
        sphere.position.z = y - 7;
    }

    const placeStone = (clientX:number, clientY:number, socket:Socket, ownerId:string):void => {
        // use raycast to get the position
        const pickResult = scene.pick(clientX, clientY);
        if(pickResult.hit){
            const position = pickResult.pickedPoint as BABYLON.Vector3;
            const x = Math.round(position.x) + 7;
            const y = Math.round(position.z) + 7;
            console.log(x, y)
            if(x < 0 || x > 14 || y < 0 || y > 14) return;
            socket.emit('place', {x:x, y:y, ownerId});
        }
    }

    const posTo = (cx:number, cy:number):void => {
        const pickResult = scene.pick(cx, cy);
        const selection = scene.getMeshByName("selection") as BABYLON.Mesh;
        if(pickResult.hit){
            const position = pickResult.pickedPoint as BABYLON.Vector3;
            const x = Math.round(position.x) + 7;
            const y = Math.round(position.z) + 7;
            selection.position.x = x - 7;
            selection.position.y = 0.2;
            selection.position.z = y - 7;
        } else {
            selection.position.set(0, -100, 0);
        }
    }

    const removeSelection = ():void => {
        const selection = scene.getMeshByName("selection") as BABYLON.Mesh;
        selection.position.set(0, -100, 0);
    }

    const initialMotion = ():void => {
        console.log(scene)
        const cam = scene.getCameraByName("Camera") as BABYLON.ArcRotateCamera;
        let t = 0
        const loop = () => {
            t += 0.007;
            let tr = Math.sin((t * Math.PI) / 2);
            cam.alpha = Math.PI * tr;
            cam.beta = 1 - tr;
            if(t < 1){
                requestAnimationFrame(loop);
            }
        }
        loop()
    }

    return {engine, addStone, placeStone, posTo, removeSelection, initialMotion}
}