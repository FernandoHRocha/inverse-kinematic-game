import { BufferGeometry, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, Raycaster, SphereGeometry, Vector2, Vector3 } from "three"
import GameScene from "./GameScene"
import Segment from "./Segment"
import InverseKinematicArm from "./InverseKinematicArm"


class InverseKinematicMechanics {

    private _movingObject: boolean
    private _gameScene: GameScene
    private _movingPlane: Object3D
    private _arm : InverseKinematicArm

    public _lines: any = []
    public _targets: any = []

    public constructor(gameScene: GameScene) {
        this._gameScene = gameScene
        
        addEventListener("mousedown", this.clickMouse)
        addEventListener("mouseup", this.releaseMouse)

        this.loadObjects()
    }
    
    public loadObjects() {
        
        this._lines = []
        this._targets = []
        
        const movingPlane = new PlaneGeometry(150,100)
        const movingPlaneMaterial = new MeshBasicMaterial({color: 0x7EB2DD})
        const movingPlaneMesh = new Mesh(movingPlane, movingPlaneMaterial)
        movingPlaneMesh.position.set(0,0,0)
        this._gameScene._scene.add(movingPlaneMesh)
        this._movingPlane = movingPlaneMesh

        this._arm = new InverseKinematicArm(4)

        this._arm.segments.forEach(segment => {
            if(segment.targetElement) {
                this._gameScene._scene.add(segment.targetElement)
                this._targets.push(segment.targetElement)
            }
            
            this._gameScene._scene.add(segment.group)
            this._gameScene._scene.add(segment.lineElement)
        })
    }

    private clickMouse = (event) => {
        if(this._movingObject) {
            this._movingObject = false
        }

        const pointer = new Vector2()
        const raycast = new Raycaster()

        pointer.x = (event.clientX / this._gameScene._width) * 2 - 1
        pointer.y = -(event.clientY / this._gameScene._height) * 2 + 1

        raycast.setFromCamera(pointer, this._gameScene._camera)
        const intersects = raycast.intersectObjects(this._targets)
        if(intersects.length > 0) {
            this._movingObject = true
            addEventListener("mousemove", this.moveMouse)
        }
    }

    private moveMouse = (event) => {
        if(!this._movingObject) {
            return
        }

        const pointer = new Vector2()
        const raycast = new Raycaster()

        pointer.x = (event.clientX / this._gameScene._width) * 2 - 1
        pointer.y = -(event.clientY / this._gameScene._height) * 2 + 1

        raycast.setFromCamera(pointer, this._gameScene._camera)
        const intersects = raycast.intersectObject(this._movingPlane)
        if(intersects.length > 0) {
            const targetPoint = intersects[0].point
            this._arm.follow(targetPoint)
        }
    }

    private releaseMouse = () => {
        this._movingObject = false
        removeEventListener("mousemove", this.moveMouse);
    }

    public dispose = () => {
        removeEventListener("mousedown", this.clickMouse);
        removeEventListener("mousemove", this.moveMouse);
        removeEventListener("mouseup", this.releaseMouse);
    }
}

export default InverseKinematicMechanics