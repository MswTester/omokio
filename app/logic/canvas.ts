import * as BABYLON from 'babylonjs';

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