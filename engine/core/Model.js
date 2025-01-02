export class Model {

    constructor({
        primitives = [],
    } = {}) {
        this.primitives = primitives;
    }

    destroy(){
        for(const primitve of this.primitives){
            if(primitve.material && primitve.material.base){
                primitve.material.baseTexture.destroy();
            }
        }
    }

}
