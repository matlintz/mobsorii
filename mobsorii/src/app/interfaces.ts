
export interface iSystem {
    coords: { x: number, y: number }
    objects: iSystemMember[]
}

export interface iSystemMember {
    type: string,
    name: string,
    coords: { x: number, y: number },
    icoords: { x: number, y: number },
    class: string,
    description?: string,
    population?: number,
    image?: string
}

export interface iImportSystemMember {
    iy : number,
    ix : number,
    owner? : number,
    dcr : string,
    population? :number,
    name : string,
    class : string,
    y : number,
    x : number,
    type : string,
    hp?:number
}

export interface iPlayer {
    
    coords: { x: number, y: number },
    icoords: { x: number, y: number },
    credits: number,
    ship: iShip,
    cargoUsed?:number
}

export interface iShip {
    name: string,
    fuel: number,
    fuelmax: number,
    cargospace: number,
    cargo:iCargo,
    weapons: Array<iWeapon>,
    class: string,
}

export interface iCargo {
    Iron?:number,	
    Nickel?:number,	
    Titanium?:number,	
    Gold?:number,	
    Rare?:number,	
    Alkaline?:number,
}


export interface iWeapon {

}

export interface iOpenOverlay { open: boolean, show: string ,system?:iSystemMember }