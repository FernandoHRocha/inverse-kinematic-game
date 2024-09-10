import { BufferGeometry, DoubleSide, Line, LineBasicMaterial, MathUtils, Mesh, MeshBasicMaterial, MeshNormalMaterial, MeshToonMaterial, Object3D, PlaneGeometry, Raycaster, SphereGeometry, Vector2, Vector3 } from "three"
import GameScene from "./GameScene"
import Segment from "./Segment"
import InverseKinematicArm from "./InverseKinematicArm"


class InverseKinematicMechanics {

    private _movingObject: boolean
    private _gameScene: GameScene
    private _movingPlane: Object3D
    private _arm : InverseKinematicArm
    private _armGeometry

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
        
        const movingPlane = new PlaneGeometry(1500,1000)
        const movingPlaneMaterial = new MeshBasicMaterial({color: 0x7EB2DD})
        const movingPlaneMesh = new Mesh(movingPlane, movingPlaneMaterial)
        movingPlaneMesh.position.set(0,0,0)
        this._gameScene._scene.add(movingPlaneMesh)
        this._movingPlane = movingPlaneMesh

        this._arm = new InverseKinematicArm(400)

        this._arm.segments.forEach(segment => {
            if(segment.targetElement) {
                this._gameScene._scene.add(segment.targetElement)
                this._targets.push(segment.targetElement)
            }
        })
        this.buildBody()
    }

    private buildBody() {
        this._armGeometry = new BufferGeometry()
        const armMat = new MeshToonMaterial({color: 0x3333aa, side: DoubleSide})
        
        let faces = this.getBodyPoints()

        this._armGeometry.setFromPoints(faces)
        this._armGeometry.attributes.position.needsUpdate = true
        const armMesh = new Mesh(this._armGeometry, armMat)
        this._gameScene._scene.add(armMesh)
    }

    private getBodyPoints() {
        let points = []
        const axis = new Vector3(0,0,1)

        this._arm.segments.forEach((segment, index) => {
            let originDir = new Vector3().subVectors(segment.target, segment.origin).setLength(segment.len)

            let crossDir = new Vector3().copy(originDir).applyAxisAngle(axis, MathUtils.degToRad(90))

            points.push(new Vector3().addVectors(crossDir, segment.target))
        });

        const segTemp = this._arm.segments[this._arm.segments.length - 1]
        for(let index = 75; index >= -75; index -= 5) {
            let originDir = new Vector3().subVectors(segTemp.target, segTemp.origin).setLength(segTemp.len)
            let crossDir = new Vector3().copy(originDir).applyAxisAngle(axis, MathUtils.degToRad(index))
            points.push(new Vector3().addVectors(crossDir, segTemp.target))
        }

        for (let index = this._arm.segments.length - 1; index >= 0; index--) {
            const segment = this._arm.segments[index]
            let originDir = new Vector3().subVectors(segment.target, segment.origin).setLength(segment.len)

            let crossDir = new Vector3().copy(originDir).applyAxisAngle(axis, MathUtils.degToRad(-90))

            points.push(new Vector3().addVectors(crossDir, segment.target))
        }

        let faces = []
        for (let index = 0; index < points.length - 1; index++) {
            faces.push(points[index]);
            faces.push(points[points.length - 1 - index])
            faces.push(points[index + 1])
        }
        return faces
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

        let points = this.getBodyPoints()
        this._armGeometry.setFromPoints(points)
        this._armGeometry.needsUpdate = true
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