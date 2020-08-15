
export interface iSystem {
    coords:{x:number,y:number}
    objects:iSystemMember[]
}

export interface iSystemMember {
    type:string,
    name: string,
    coords: {x:number,y:number},
    class: string,
    description?: string,
    population?:number
}
