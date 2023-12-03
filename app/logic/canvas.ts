// Path: omokio/app/logic/canvas.ts

import * as BABYLON from 'babylonjs';
import { Socket } from 'socket.io-client';

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

export class Game{
    canvas:HTMLCanvasElement;
    engine:BABYLON.Engine;
    scene:BABYLON.Scene;
    board:string[][];
    constructor(canvas:HTMLCanvasElement, board:string[][]){
        this.canvas = canvas;
        this.board = board;
        this.engine = new BABYLON.Engine(canvas, true);
        
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
        this.scene.ambientColor = new BABYLON.Color3(1, 1, 1);
        this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
        this.scene.fogDensity = 0.01;
        this.scene.fogColor = new BABYLON.Color3(1, 1, 1);
        this.scene.fogStart = 0;
        this.scene.fogEnd = 100;

        const camera = new BABYLON.UniversalCamera('Camera', new BABYLON.Vector3(5, 0, 0), this.scene);
        camera.setTarget(BABYLON.Vector3.Zero());

        const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), this.scene);
        light.intensity = 1;

        const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, this.scene);
        sphere.scaling = new BABYLON.Vector3(1, 0.5, 1);
        sphere.rotation.z = 1

        // draw board
        const board_mesh = BABYLON.MeshBuilder.CreatePlane("board", {width: 15, height: 15}, this.scene);
        board_mesh.rotation.x = Math.PI/2;
        board_mesh.position.x = 7.5;
        board_mesh.position.y = 7.5;
        const board_material = new BABYLON.StandardMaterial("board_material", this.scene);
        board_material.diffuseColor = new BABYLON.Color3(1, 1, 1);
        board_mesh.material = board_material;

        // draw lines
        const lines = [];
        for(let i = 0; i < 15; i++){
            const line = BABYLON.MeshBuilder.CreatePlane("line", {width: 15, height: 0.1}, this.scene);
            line.rotation.x = Math.PI/2;
            line.position.x = 7.5;
            line.position.y = i;
            lines.push(line);
        }
        for(let i = 0; i < 15; i++){
            const line = BABYLON.MeshBuilder.CreatePlane("line", {width: 15, height: 0.1}, this.scene);
            line.rotation.x = Math.PI/2;
            line.position.x = i;
            line.position.y = 7.5;
            lines.push(line);
        }
        const lines_material = new BABYLON.StandardMaterial("lines_material", this.scene);
        lines_material.diffuseColor = new BABYLON.Color3(0, 0, 0);
        lines.forEach(line => {
            line.material = lines_material;
        });

        this.renderBoard(this.board);
        this.runRenderLoop();
    }

    renderBoard(board:string[][]){
        this.board = board;
        this.scene.meshes.forEach(mesh => {
            if(mesh.name === "sphere") mesh.dispose();
        });
        for(let i = 0; i < 15; i++){
            for(let j = 0; j < 15; j++){
                if(this.board[j][i] === "") continue;
                const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, this.scene);
                sphere.scaling = new BABYLON.Vector3(0.8, 0.4, 0.8);
                const sphere_material = new BABYLON.StandardMaterial("sphere_material", this.scene);
                sphere_material.diffuseColor = this.board[j][i] === "black" ? new BABYLON.Color3(0, 0, 0) : new BABYLON.Color3(1, 1, 1);
                sphere.material = sphere_material;
                sphere.position.x = i;
                sphere.position.y = j;
            }
        }
    }

    placeStone(clientX:number, clientY:number, socket:Socket, ownerId:string){
        // use raycast to get the position
        const pickResult = this.scene.pick(clientX, clientY);
        if(pickResult.hit){
            const position = pickResult.pickedPoint as BABYLON.Vector3;
            const x = Math.round(position.x);
            const y = Math.round(position.y);
            if(x < 0 || x > 14 || y < 0 || y > 14) return;
            socket.emit('place', {x, y, ownerId});
        }
    }

    runRenderLoop(){
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    destroy(){
        this.engine.stopRenderLoop();
        this.scene.dispose();
        this.engine.dispose();
    }
}