import { BufferGeometry, CircleGeometry, Group, Line, LineBasicMaterial, MathUtils, Matrix4, Mesh, MeshBasicMaterial, RingGeometry, SphereGeometry, Vector3 } from "three";

export default class Segment {

    public static get instance() {
        return this
    }

    public targetElement;
    public lineElement;
    public circleElement;

    public origin : Vector3 = new Vector3(0, 0, 0)
    public target : Vector3 = new Vector3(1, 0.6, 0)
    public group

    public drawPoints = []

    public constructor(public len: number = 8, child?: Segment) {
        if(child) {
            this.len = Math.cos((len)) + 0.3 * 50
            this.origin = child.target
            this.target = new Vector3().subVectors(child.target, child.origin).setLength(2)
        }
        this.target = this.target.setLength(2)
        this.target.addVectors(this.origin, this.target)
    }

    public buildTarget() {
        let geometry = new SphereGeometry( 1, 12, 12 ); 
        let material = new MeshBasicMaterial( { color: 0xF93943 } ); 
        let sphere = new Mesh( geometry, material )
        sphere.position.set(this.target.x, this.target.y, this.target.z)
        sphere['segment'] = this
        sphere.name = 'target'
        this.targetElement = sphere
    }
}