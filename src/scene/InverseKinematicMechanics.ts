import { BufferAttribute, BufferGeometry, DoubleSide, MathUtils, Mesh, MeshLambertMaterial, MeshStandardMaterial, Object3D, PlaneGeometry, Raycaster, TextureLoader, Vector2, Vector3 } from "three"
import GameScene from "./GameScene"
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
        
        const movingPlane = new PlaneGeometry(1900,1000)
        const movingPlaneMaterial = new MeshLambertMaterial({color: 0x7EB2DD})
        const movingPlaneMesh = new Mesh(movingPlane, movingPlaneMaterial)
        movingPlaneMesh.receiveShadow = true
        movingPlaneMesh.position.set(0,0,0)
        this._gameScene._scene.add(movingPlaneMesh)
        this._movingPlane = movingPlaneMesh

        this._arm = new InverseKinematicArm(40)

        this._arm.segments.forEach(segment => {
            if(segment.targetElement) {
                this._gameScene._scene.add(segment.targetElement)
                this._targets.push(segment.targetElement)
            }
        })
        this.buildBody()
    }

    private buildBody() {
        // Carregamento da textura e criação do material
        let texLoader = new TextureLoader().load("../public/texture.png")
        const armMat = new MeshStandardMaterial({map: texLoader, side: DoubleSide})

        // Criação da geometria e associação dos vértices
        let armGeometry = new BufferGeometry()
        let faces = this.getBodyPoints()
        armGeometry.setFromPoints(faces)

        // Mapeamento UV dos vetores vértices e associação à geometria
        let attPos = armGeometry.attributes.position.array.length
        let attUv = []
        for (let i = 0; i < attPos; i++) {
            if (i % 3 === 0) {
                attUv.push(0, 0);
            } else if (i % 3 === 1) {
                attUv.push(1, 0);
            } else if (i % 3 === 2) {
                attUv.push(0, 1);
            }
        }
        armGeometry.setAttribute('uv', new BufferAttribute(new Float32Array(attUv), 2));
        armGeometry.attributes.position.needsUpdate = true

        // Criação, configuração e adição da Mesh em cena
        const armMesh = new Mesh(armGeometry, armMat)
        armMesh.castShadow = true
        armMat.flatShading = true
        this._gameScene._scene.add(armMesh)
        this._arm['mesh'] = armMesh
    }

    private getBodyPoints() {
        // Limpa a coleção de pontos e cria vetor referencia para movimento no plano XY
        let points = []
        const axis = new Vector3(0,0,1);

        // Cria os vertores para serem vértices do lado esquerdo do corpo
        this._arm.segments.forEach((segment, index) => {
            let originDir = new Vector3().subVectors(segment.target, segment.origin).setLength(segment.width)

            let crossDir = new Vector3().copy(originDir).applyAxisAngle(axis, MathUtils.degToRad(90))

            points.push(new Vector3().addVectors(crossDir, segment.target))
        });

        // Separa o último segmento para criar os vetores dos vértices da cabeça
        const segTemp = this._arm.segments[this._arm.segments.length - 1]
        for(let index = 75; index >= -75; index -= 15) {
            let originDir = new Vector3().subVectors(segTemp.target, segTemp.origin).setLength(segTemp.width)
            let crossDir = new Vector3().copy(originDir).applyAxisAngle(axis, MathUtils.degToRad(index))
            points.push(new Vector3().addVectors(crossDir, segTemp.target))
        }

        // Cria os vetores para serem vértices do lado direito
        for (let index = this._arm.segments.length - 1; index >= 0; index--) {
            const segment = this._arm.segments[index]
            let originDir = new Vector3().subVectors(segment.target, segment.origin).setLength(segment.width)

            let crossDir = new Vector3().copy(originDir).applyAxisAngle(axis, MathUtils.degToRad(-90))

            points.push(new Vector3().addVectors(crossDir, segment.target))
        }

        // Cria a associação de pontos ordenados para criar as faces
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

        // Mapeamento da posição do mouse
        const pointer = new Vector2()
        pointer.x = (event.clientX / this._gameScene._width) * 2 - 1
        pointer.y = -(event.clientY / this._gameScene._height) * 2 + 1
        
        // Criação de raycast em alvo de movimentação e adição de EventListener para atualizar o corpo
        const raycast = new Raycaster()
        raycast.setFromCamera(pointer, this._gameScene._camera)
        const intersects = raycast.intersectObject(this._movingPlane)
        if(intersects.length > 0) {
            this._movingObject = true
            addEventListener("mousemove", this.moveMouse)
        }
    }

    private moveMouse = (event) => {
        if(!this._movingObject) {
            return
        }

        // Mapeamento da posição do mouse
        const pointer = new Vector2()
        pointer.x = (event.clientX / this._gameScene._width) * 2 - 1
        pointer.y = -(event.clientY / this._gameScene._height) * 2 + 1
        
        // Criação de raycast em alvo de movimentação e função de rastreamento
        const raycast = new Raycaster()
        raycast.setFromCamera(pointer, this._gameScene._camera)
        const intersects = raycast.intersectObject(this._movingPlane)
        if(intersects.length > 0) {
            const targetPoint = intersects[0].point
            targetPoint.z = 10
            this._arm.follow(targetPoint)
        }

        // Atualização das posições dos vetores para atualização
        let points = this.getBodyPoints()
        this._arm.mesh.geometry.setFromPoints(points)
        this._arm.mesh.geometry.needsUpdate = true
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