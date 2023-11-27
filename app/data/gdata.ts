type stringObj = {[key:string]:string};

export const diffuses:stringObj = {
    "rubber_tiles":"diff_4k.jpg",
    "laminate_floor":"diff_4k.jpg",
    "beige_wall":"diff_4k.jpg",
    "cobblestone":"diff_4k.jpg",
    "corrugated_iron":"diff_4k.jpg",
    "mossy_sandstone":"diff_4k.jpg",
}

export const normals:stringObj = {
    "rubber_tiles":"nor_gl_4k.exr",
    "laminate_floor":"nor_gl_4k.exr",
    "beige_wall":"nor_gl_4k.exr",
    "cobblestone":"nor_gl_4k.exr",
    "corrugated_iron":"nor_gl_4k.exr",
    "mossy_sandstone":"nor_gl_4k.exr",
}

export const roughnesses:stringObj = {
    "rubber_tiles":"rough_4k.exr",
    "laminate_floor":"rough_4k.exr",
    "beige_wall":"rough_4k.jpg",
    "cobblestone":"rough_4k.exr",
    "corrugated_iron":"rough_4k.exr",
    "mossy_sandstone":"rough_4k.exr",
}

export const displays:stringObj = {
    "rubber_tiles":"disp_4k.png",
    "laminate_floor":"disp_4k.png",
    "beige_wall":"disp_4k.png",
    "cobblestone":"disp_4k.png",
    "corrugated_iron":"disp_4k.png",
    "mossy_sandstone":"disp_4k.png",
}

export const shopItems:{[key:string]:{[key:string]:string|number}[]} = {
    "theme":[
        {"name": "bg1", "price": 1000},
        {"name": "bg2", "price": 1000},
    ],
    "board":[
        {"name": "beige_wall", "price": 1000},
        {"name": "laminate_floor", "price": 1000},
        {"name": "rubber_tiles", "price": 1000},
    ],
    "stone":[
        {"name": "cobblestone", "price": 1000},
        {"name": "corrugated_iron", "price": 1000},
        {"name": "mossy_sandstone", "price": 1000},
    ],
}