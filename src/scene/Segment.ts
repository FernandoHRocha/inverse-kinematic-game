import { Vector3 } from "three";

export default class Segment {

    public static get instance() {
        return this
    }

    private headPoint : Vector3 = new Vector3(0, 100, 10)
    private tailPoint : Vector3 = new Vector3(0, -1, 0)
    public segmentLength = 12
    public width = 0

    public drawPoints = []

    public constructor( tailSegments: number, lastIndex: number = 0, index: number = 0, public child?: Segment) {
        const waveLength = 1
        const waveWidth = 6
        const amplitude = 2
        const baseWidth = 2
        const waveOffset = 4
        const tailIndex = lastIndex - index - 1
        this.width = (Math.abs(1 - Math.cos((index + waveOffset/ waveLength))) * amplitude) + ((tailIndex <= tailSegments) ? ((baseWidth * waveWidth) * ( 1 - Math.exp(-tailIndex*tailIndex/(tailSegments+tailSegments)))) : (baseWidth * waveWidth))
        console.log(index, (Math.abs(1 - Math.cos((index + waveOffset/ waveLength))) * amplitude), (baseWidth * waveWidth), (tailIndex <= tailSegments) ? ( 1 - Math.exp(-tailIndex*tailIndex/(tailSegments+tailSegments))) : 'a', this.width)
        
        // Criação dos vetores origin e target de cada segmento, desloca a origin para a target do segmento anterior
        if(child) {
            this.headPoint = child.tailPoint
            this.tailPoint = new Vector3().subVectors(child.tailPoint, child.headPoint)
        }

        this.tailPoint = this.tailPoint.setLength(this.segmentLength)
        this.tailPoint.addVectors(this.headPoint, this.tailPoint)
    }

    public originDirection() {
        return new Vector3().subVectors(this.headPoint, this.tailPoint)
    }

    public targetDirection() {
        if(this.child) {
            return new Vector3().subVectors(this.child.headPoint, this.headPoint)
        } else {
            return new Vector3().subVectors(this.headPoint, this.tailPoint)
        }
    }
}