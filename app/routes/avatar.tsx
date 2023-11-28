import { ActionFunction, json } from "@remix-run/node";
import { updateUser } from "./lib/api";

// post request profile avatar update

export const action:ActionFunction = async ({request}) => {
    const formData = await request.formData();
    await updateUser(formData.get('id') as string, {"avatar": formData.get("avatar") as string});
    return json({success: true});
  }