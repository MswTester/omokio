import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { createUser, deleteUser, getUser, updateUser } from "./lib/api";
import { sha256 } from "~/data/utils";

export const loader:LoaderFunction = async ({params}) => {
  const {id, type, value} = params;
  let res = null;
  if(type === 'name') {
    const search = await getUser('name', value as string);
    if(search) {
      return json({message: 'name already exists'});
    }
  }
  res = await updateUser(id as string, {[type as string]: value as string});
  return json({res});
}
