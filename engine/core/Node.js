export class Node {

    constructor() {
        this.name = "";
        this.parent = null;
        this.children = [];
        this.components = [];
    }

    addChild(node) {
        node.parent?.removeChild(node);
        this.children.push(node);
        node.parent = this;
    }

    removeChild(node) {
        this.children = this.children.filter(child => child !== node);
        node.parent = null;
    }

    remove() {
        this.parent?.removeChild(this);
    }
    removeChildrenByName(name){
        this.children.map((child) => {if(child.name == name) child.parent = null});
        this.children = this.children.filter(child => child.name !== name);
    }

    traverse(before, after) {
        before?.(this);
        for (const child of this.children) {
            child.traverse(before, after);
        }
        after?.(this);
    }

    linearize() {
        const array = [];
        this.traverse(node => array.push(node));
        return array;
    }

    filter(predicate) {
        return this.linearize().filter(predicate);
    }

    find(predicate) {
        return this.linearize().find(predicate);
    }

    map(transform) {
        return this.linearize().map(transform);
    }

    addComponent(component) {
        this.components.push(component);
    }

    removeComponent(component) {
        this.components = this.components.filter(c => c !== component);
    }

    removeComponentsOfType(type) {
        this.components = this.components.filter(component => !(component instanceof type));
    }

    getComponentOfType(type) {
        return this.components.find(component => component instanceof type);
    }

    getComponentsOfType(type) {
        return this.components.filter(component => component instanceof type);
    }
    destroy(){
        console.log("tukaj smo");
        for (const component of this.components){
            if(component.destroy){
                component.destroy();
            }
        }
        for(const child of this.children){
            child.destroy();
        }
        this.children = [];
        this.components = [];
    }
}
