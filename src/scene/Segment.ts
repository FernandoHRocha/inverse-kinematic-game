import { Vector3 } from "three";

export default class Segment {

    public static get instance() {
        return this
    }

    private origin : Vector3 = new Vector3(0, 0, 10)
    private target : Vector3 = new Vector3(0, 1, 0)
    public segmentLength = 6
    public width = 0

    public drawPoints = []

    public constructor( nailSegments: number, index: number = 0, child?: Segment) {
        const waveLength = 1
        const waveWidth = 6
        const amplitude = 2
        const baseWidth = 1
        const segmentWidth = (Math.abs(1 - Math.sin((index / waveLength))) * amplitude) + ((index <= nailSegments) ? ((baseWidth * waveWidth) * ( 1 - Math.exp(-index*index/(nailSegments+nailSegments)))) : (baseWidth * waveWidth))
        
        // Criação dos vetores origin e target de cada segmento, desloca a origin para a target do segmento anterior
        if(child) {
            this.width = segmentWidth
            this.origin = child.target
            this.target = new Vector3().subVectors(child.target, child.origin)
        }

        this.target = this.target.setLength(this.segmentLength)
        this.target.addVectors(this.origin, this.target)
    }
}