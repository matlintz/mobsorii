
export interface iSystem {
    coords:{x:number,y:number}
    objects:iSystemMember[]
}

export interface iSystemMember {
    type:string,
    name: string,
    coords: {x:number,y:number},
    icoords: {x:number,y:number},
    class: string,
    description?: string,
    population?:number
}

export interface iPlayer {
    coords: {x:number,y:number},
    icoords: {x:number,y:number},
    credits:number,
    shipnamne:string
}