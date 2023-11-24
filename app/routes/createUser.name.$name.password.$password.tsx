import { LoaderFunction, json } from "@remix-run/node";
import { createUser, deleteUser, getUser, updateUser } from "./lib/api";
import { sha256 } from "~/data/utils";

export const loader:LoaderFunction = async ({params}) => {
    const {name, password} = params;
    let res = null;
    const search = await getUser('name', name as string)
    if(search) return json({res: null});
    const newUser:User = {
        name:name as string,
        password:sha256(password as string),
        avatar: '',
        id: `${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        win: 0,
        lose: 0,
        draw: 0,
        rating: 0,
    }
    res = await createUser(newUser);
    return json({res});
}