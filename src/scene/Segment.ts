import { BufferGeometry, CircleGeometry, Group, Line, LineBasicMaterial, MathUtils, Matrix4, Mesh, MeshBasicMaterial, RingGeometry, SphereGeometry, Vector3 } from "three";

export default class Segment {

    public static get instance() {
        return this
    }

    public targetElement;
    public lineElement;
    public circleElement;

    public origin : Vector3 = new Vector3(0, 0, 0)
    public target : Vector3 = new Vector3(0, 1, 0)
    public group

    public drawPoints = []

    public constructor(public len: number = 8, child?: Segment) {
        if(child) {
            while(Math.abs(this.len - child.len) >= 2) {
                this.len = MathUtils.randInt(2,8)
            }
            this.origin = child.target
            this.target = new Vector3().subVectors(child.target, child.origin).setLength(this.len)
        }
        this.target = this.target.setLength(this.len)
        this.target.addVectors(this.origin, this.target)
        this.group = new Group()
        this.group.position.set(this.target.x, this.target.y, this.target.z)
        this.buildLine()
        this.buildBody()
    }

    public buildLine() {
        let lineGeometry = new BufferGeometry().setFromPoints( [this.origin, this.target] )
        let lineMaterial = new LineBasicMaterial( { color: 0x1F271B } )
        const line = new Line( lineGeometry, lineMaterial )
        line.name = 'line'
        this.lineElement = line

        let circleGeometry = new RingGeometry(this.len-0.1, this.len, 32)
        let circleMaterial = new MeshBasicMaterial({ color: 0x333333, })
        const circle = new Mesh(circleGeometry, circleMaterial)
        circle.position.set(0,0,0)
        this.circleElement = circle
        this.group.add(circle)

    }

    public buildTarget() {
        let geometry = new SphereGeometry( 1, 12, 12 ); 
        let material = new MeshBasicMaterial( { color: 0xF93943 } ); 
        let sphere = new Mesh( geometry, material )
        sphere.position.set(this.target.x, this.target.y, this.target.z)
        sphere['segment'] = this
        sphere.name = 'target'
        this.targetElement = sphere
        this.group.add(sphere)
    }

    private buildBody() {
        let originDir = new Vector3().subVectors(this.target, this.origin).setLength(this.len)
        const axis = new Vector3(0,0,1)
        let crossDir = new Vector3().copy(originDir).applyAxisAngle(axis, MathUtils.degToRad(90))
        
        let geometry = new SphereGeometry( 0.4, 6, 6 ); 
        let material = new MeshBasicMaterial( { color: 0x003943 } ); 
        let sphere = new Mesh( geometry, material )
        sphere.position.set(crossDir.x, crossDir.y, crossDir.z)
        this.drawPoints.push(sphere)

        let sphere2 = new Mesh(geometry, material)
        crossDir = new Vector3().copy(originDir).applyAxisAngle(axis, MathUtils.degToRad(-90))
        sphere2.position.set(crossDir.x, crossDir.y, crossDir.z)
        this.drawPoints.push(sphere2)
        this.group.add(sphere)
        this.group.add(sphere2)
    }
}